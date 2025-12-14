# frozen_string_literal: true

module Api
  module V1
    class EventsController < BaseController
      before_action :set_event, only: %i[show update destroy publish cancel analytics]

      def index
        PerformanceMonitor.measure_query_time('events_index') do
          events = policy_scope(Event).published
          events = events.includes(:organizer, :venue, :ticket_types)

          # Apply filters with caching
          events = CachingService.fetch_event_list(filters) if use_cache?

          # Apply filters
          events = events.by_category(params[:category]) if params[:category].present?
          events = events.upcoming if params[:upcoming] == 'true'
          events = events.past if params[:past] == 'true'
          events = events.nearby(params[:lat], params[:lng], params[:radius]) if params[:lat].present? && params[:lng].present?
          events = events.search_by_text(params[:search]) if params[:search].present?

          # Pagination
          events = events.page(params[:page] || 1).per(params[:per_page] || 20)

          render_success(
            data: {
              events: events.map { |e| event_serializer(e) },
              pagination: pagination_meta(events)
            }
          )
        end
      end

      def show
        authorize @event

        event_data = CachingService.fetch_event(@event.id) || @event

        render_success(
          data: {
            event: event_serializer(event_data, detailed: true)
          }
        )
      end

      def create
        authorize Event

        event = current_user.organized_events.build(event_params)
        event.status = 'draft'

        if event.save
          # Invalidate cache
          CachingService.invalidate_user(current_user.id)

          render_success(
            data: { event: event_serializer(event) },
            message: 'Event created successfully',
            status: :created
          )
        else
          render_error(errors: event.errors.full_messages)
        end
      end

      def update
        authorize @event

        if @event.update(event_params)
          # Invalidate cache
          CachingService.invalidate_event(@event.id)

          render_success(
            data: { event: event_serializer(@event) },
            message: 'Event updated successfully'
          )
        else
          render_error(errors: @event.errors.full_messages)
        end
      end

      def destroy
        authorize @event

        if @event.destroy
          # Invalidate cache
          CachingService.invalidate_event(@event.id)

          render_success(message: 'Event deleted successfully')
        else
          render_error(message: 'Failed to delete event')
        end
      end

      def publish
        authorize @event

        if @event.update(status: :published, published_at: Time.current)
          # Invalidate cache and notify
          CachingService.invalidate_event(@event.id)

          render_success(
            data: { event: event_serializer(@event) },
            message: 'Event published successfully'
          )
        else
          render_error(errors: @event.errors.full_messages)
        end
      end

      def cancel
        authorize @event

        if @event.update(status: :cancelled, cancelled_at: Time.current)
          # Notify attendees
          EventUpdateNotificationJob.perform_later(@event.id, 'cancelled')

          # Invalidate cache
          CachingService.invalidate_event(@event.id)

          render_success(
            data: { event: event_serializer(@event) },
            message: 'Event cancelled successfully'
          )
        else
          render_error(errors: @event.errors.full_messages)
        end
      end

      def analytics
        authorize @event

        analytics_data = CachingService.fetch_analytics(@event.id) || calculate_event_analytics(@event)

        render_success(data: analytics_data)
      end

      def search
        query = params[:q].to_s.strip
        return render_error(message: 'Search query required') if query.blank?

        PerformanceMonitor.measure_query_time('events_search') do
          results = CachingService.fetch_search_results(query, filters)

          render_success(
            data: {
              events: results.map { |e| event_serializer(e) },
              total: results.size
            }
          )
        end
      end

      private

      def set_event
        @event = Event.find(params[:id])
      rescue ActiveRecord::RecordNotFound
        render_not_found(message: 'Event not found')
      end

      def event_params
        params.require(:event).permit(
          :title,
          :description,
          :start_date,
          :end_date,
          :venue_name,
          :address,
          :city,
          :country,
          :latitude,
          :longitude,
          :category,
          :max_attendees,
          :is_online,
          :online_url,
          ticket_types_attributes: [
            :id,
            :name,
            :description,
            :price,
            :quantity,
            :max_per_booking,
            :sale_start_date,
            :sale_end_date,
            :_destroy
          ]
        )
      end

      def filters
        params.permit(:category, :upcoming, :past, :lat, :lng, :radius, :search, :page, :per_page)
      end

      def use_cache?
        # Use cache for public requests without personalization
        !current_user.present? || (params[:search].blank? && params[:lat].blank?)
      end

      def event_serializer(event, detailed: false)
        data = {
          id: event.id,
          title: event.title,
          description: event.description,
          start_date: event.start_date,
          end_date: event.end_date,
          venue_name: event.venue_name,
          address: event.address,
          city: event.city,
          country: event.country,
          latitude: event.latitude,
          longitude: event.longitude,
          category: event.category,
          status: event.status,
          max_attendees: event.max_attendees,
          is_online: event.is_online,
          online_url: event.online_url,
          organizer: {
            id: event.organizer.id,
            name: event.organizer.full_name
          }
        }

        if detailed
          data.merge!(
            ticket_types: event.ticket_types.map { |tt| ticket_type_serializer(tt) },
            total_bookings: event.bookings.count,
            created_at: event.created_at,
            updated_at: event.updated_at
          )
        end

        data
      end

      def ticket_type_serializer(ticket_type)
        {
          id: ticket_type.id,
          name: ticket_type.name,
          description: ticket_type.description,
          price: ticket_type.price,
          quantity: ticket_type.quantity,
          available_quantity: ticket_type.available_quantity,
          max_per_booking: ticket_type.max_per_booking,
          sale_start_date: ticket_type.sale_start_date,
          sale_end_date: ticket_type.sale_end_date,
          on_sale: ticket_type.on_sale?
        }
      end

      def calculate_event_analytics(event)
        # Calculate analytics for this event
        {
          total_bookings: event.bookings.count,
          total_revenue: event.bookings.joins(:payment).where(payments: { status: 'completed' }).sum('payments.amount'),
          attendance_rate: event.bookings.where(status: [:confirmed, :pending]).count > 0 ?
            (event.bookings.where(status: :confirmed).count.to_f /
             event.bookings.where(status: [:confirmed, :pending]).count.to_f * 100).round(1) : 0,
          ticket_sales_by_type: event.ticket_types.joins(:booking_items)
            .select('ticket_types.name, SUM(booking_items.quantity) as sold')
            .group('ticket_types.id, ticket_types.name')
            .map { |tt| { name: tt.name, sold: tt.sold.to_i } }
        }
      end
    end
  end
end