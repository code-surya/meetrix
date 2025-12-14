# frozen_string_literal: true

module Api
  module V1
    class BookingsController < BaseController
      before_action :authenticate_user!
      before_action :set_booking, only: [:show, :update, :cancel, :confirm, :verify_qr]

      # GET /api/v1/bookings
      def index
        bookings = policy_scope(Booking)
        bookings = bookings.recent.page(params[:page] || 1).per(params[:per_page] || 20)

        render_success(
          data: {
            bookings: bookings.map { |b| booking_serializer(b) },
            pagination: pagination_meta(bookings)
          }
        )
      end

      # GET /api/v1/bookings/:id
      def show
        authorize @booking
        render_success(
          data: {
            booking: booking_serializer(@booking, detailed: true)
          }
        )
      end

      # POST /api/v1/bookings
      # Request body:
      # {
      #   "event_id": 1,
      #   "ticket_requests": [
      #     { "ticket_type_id": 1, "quantity": 2 },
      #     { "ticket_type_id": 2, "quantity": 1 }
      #   ],
      #   "group_id": 5 (optional)
      # }
      def create
        authorize Booking, :create?

        event = Event.find(params[:event_id])
        
        # Check if this is a group booking
        if params[:group_id].present?
          group = Group.find(params[:group_id])
          
          # Verify user is a member of the group
          unless group.members.include?(current_user)
            return render_error(
              message: 'You are not a member of this group',
              status: :forbidden
            )
          end

          # Use group booking service
          service = GroupBookingService.new(group, params[:ticket_requests])
          
          if service.create
            render_success(
              data: {
                bookings: service.bookings.map { |b| booking_serializer(b) },
                group: {
                  id: group.id,
                  name: group.name,
                  discount_applied: group.discount_applied,
                  total_amount: group.total_amount
                }
              },
              message: 'Group booking created successfully',
              status: :created
            )
          else
            render_error(
              message: 'Group booking creation failed',
              errors: service.errors
            )
          end
        else
          # Single booking
          service = BookingService.new(current_user, event, params[:ticket_requests])
          
          if service.create
            render_success(
              data: {
                booking: booking_serializer(service.booking, detailed: true)
              },
              message: 'Booking created successfully',
              status: :created
            )
          else
            render_error(
              message: 'Booking creation failed',
              errors: service.errors
            )
          end
        end
      end

      # POST /api/v1/bookings/:id/confirm
      def confirm
        authorize @booking

        service = BookingService.new(current_user, @booking.event, [])
        service.instance_variable_set(:@booking, @booking)

        if service.confirm
          render_success(
            data: {
              booking: booking_serializer(@booking.reload, detailed: true)
            },
            message: 'Booking confirmed successfully'
          )
        else
          render_error(
            message: 'Booking confirmation failed',
            errors: service.errors
          )
        end
      end

      # PATCH /api/v1/bookings/:id/cancel
      def cancel
        authorize @booking, :cancel?

        service = BookingService.new(current_user, @booking.event, [])
        service.instance_variable_set(:@booking, @booking)

        if service.cancel
          render_success(
            message: 'Booking cancelled successfully'
          )
        else
          render_error(
            message: 'Booking cancellation failed',
            errors: service.errors
          )
        end
      end

      # GET /api/v1/bookings/:id/availability
      def check_availability
        event = Event.find(params[:event_id])
        ticket_requests = params[:ticket_requests] || []

        service = TicketAvailabilityService.new(event)

        if ticket_requests.any?
          result = service.check_bulk_availability(ticket_requests)
        else
          result = service.check_all_availability
        end

        render_success(data: result)
      end

      # POST /api/v1/bookings/verify_qr
      # Request body: { "qr_data": "..." }
      def verify_qr
        qr_data = params[:qr_data]

        unless qr_data.present?
          return render_error(
            message: 'QR code data is required',
            status: :bad_request
          )
        end

        result = QrCodeService.verify(qr_data)

        if result[:valid]
          render_success(
            data: {
              valid: true,
              booking: booking_serializer(result[:booking]),
              ticket_type: {
                id: result[:ticket_type].id,
                name: result[:ticket_type].name
              },
              user: {
                id: result[:user].id,
                name: result[:user].full_name
              },
              event: {
                id: result[:event].id,
                title: result[:event].title
              }
            }
          )
        else
          render_error(
            message: result[:error] || 'Invalid QR code',
            status: :unprocessable_entity
          )
        end
      end

      private

      def set_booking
        @booking = Booking.find(params[:id])
      rescue ActiveRecord::RecordNotFound
        render_not_found(message: 'Booking not found')
      end

      def booking_serializer(booking, detailed: false)
        data = {
          id: booking.id,
          booking_reference: booking.booking_reference,
          status: booking.status,
          total_amount: booking.total_amount.to_f,
          discount_amount: booking.discount_amount&.to_f || 0.0,
          discount_percentage: booking.discount_percentage&.to_f || 0.0,
          total_tickets: booking.total_tickets,
          event: {
            id: booking.event.id,
            title: booking.event.title,
            start_date: booking.event.start_date,
            end_date: booking.event.end_date,
            venue_name: booking.event.venue_name
          },
          created_at: booking.created_at,
          confirmed_at: booking.confirmed_at,
          cancelled_at: booking.cancelled_at
        }

        if detailed
          data.merge!(
            user: {
              id: booking.user.id,
              name: booking.user.full_name,
              email: booking.user.email
            },
            booking_items: booking.booking_items.map do |item|
              item_data = {
                id: item.id,
                ticket_type: {
                  id: item.ticket_type.id,
                  name: item.ticket_type.name,
                  price: item.unit_price.to_f
                },
                quantity: item.quantity,
                subtotal: item.subtotal.to_f
              }

              # Include QR codes if available
              if item.qr_codes.present?
                item_data[:qr_codes] = item.qr_codes.map do |qr|
                  {
                    data: qr['data'],
                    image_url: qr['image_url'],
                    generated_at: qr['generated_at']
                  }
                end
              end

              item_data
            end,
            payment: booking.payment ? {
              id: booking.payment.id,
              status: booking.payment.status,
              amount: booking.payment.amount.to_f,
              currency: booking.payment.currency
            } : nil,
            group: booking.group ? {
              id: booking.group.id,
              name: booking.group.name
            } : nil
          )
        end

        data
      end

      def pagination_meta(collection)
        {
          current_page: collection.current_page,
          total_pages: collection.total_pages,
          total_count: collection.total_count,
          per_page: collection.limit_value,
          has_next_page: collection.next_page.present?,
          has_prev_page: collection.prev_page.present?
        }
      end
    end
  end
end
