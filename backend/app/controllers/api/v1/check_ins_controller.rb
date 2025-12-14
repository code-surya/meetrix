# frozen_string_literal: true

module Api
  module V1
    class CheckInsController < BaseController
      before_action :authenticate_user!
      before_action :require_organizer
      before_action :set_event
      before_action :set_booking_item, only: [:verify_qr, :check_in]

      def verify_qr
        qr_data = params[:qr_data]

        if QrCodeService.verify_qr_data(qr_data)
          parsed_data = JSON.parse(qr_data)
          booking_item = BookingItem.find(parsed_data['booking_item_id'])

          render_success(
            data: {
              valid: true,
              attendee: {
                name: booking_item.booking.user.full_name,
                email: booking_item.booking.user.email,
                ticket_type: booking_item.ticket_type.name,
                booking_reference: booking_item.booking.booking_reference,
                ticket_number: parsed_data['ticket_number']
              },
              booking_item: {
                id: booking_item.id,
                checked_in: booking_item.checked_in?
              }
            }
          )
        else
          render_error(
            message: 'Invalid or expired QR code',
            status: :unprocessable_entity
          )
        end
      end

      def check_in
        if @booking_item.checked_in?
          render_error(
            message: 'This ticket has already been checked in',
            status: :conflict
          )
          return
        end

        qr_data = params[:qr_data]
        parsed_data = JSON.parse(qr_data)

        if QrCodeService.mark_token_used(parsed_data['token'], @booking_item.id)
          if @booking_item.check_in!(current_user.id)
            # Broadcast real-time update
            CheckInBroadcastService.broadcast_check_in(@event, @booking_item)

            # Update event analytics
            EventAnalyticsService.record_check_in(@event, @booking_item)

            render_success(
              data: {
                message: 'Check-in successful',
                attendee: {
                  name: @booking_item.booking.user.full_name,
                  ticket_type: @booking_item.ticket_type.name
                },
                checked_in_at: @booking_item.checked_in_at,
                checked_in_by: current_user.full_name
              }
            )
          else
            render_error(message: 'Failed to check in attendee')
          end
        else
          render_error(
            message: 'QR code token has already been used or is invalid',
            status: :unprocessable_entity
          )
        end
      end

      def event_attendance
        attendance_data = {
          total_registrations: @event.bookings.where(status: [:confirmed, :pending]).count,
          total_checked_in: @event.booking_items.where.not(checked_in_at: nil).count,
          attendance_rate: calculate_attendance_rate,
          recent_check_ins: recent_check_ins,
          check_in_trends: check_in_trends
        }

        render_success(data: attendance_data)
      end

      def bulk_check_in
        booking_references = params[:booking_references] || []
        check_in_method = params[:check_in_method] || 'manual'

        results = []
        success_count = 0

        booking_references.each do |reference|
          booking = @event.bookings.find_by(booking_reference: reference)
          next unless booking

          booking.booking_items.each do |item|
            next if item.checked_in?

            if item.update(
              checked_in_at: Time.current,
              checked_in_by: current_user.id,
              check_in_method: check_in_method
            )
              success_count += 1
              CheckInBroadcastService.broadcast_check_in(@event, item)
            end
          end

          results << {
            booking_reference: reference,
            status: booking.booking_items.all?(&:checked_in?) ? 'success' : 'partial'
          }
        end

        render_success(
          data: {
            message: "Successfully checked in #{success_count} attendees",
            results: results
          }
        )
      end

      private

      def require_organizer
        render_forbidden(message: 'Access denied. Organizer role required.') unless current_user.organizer?
      end

      def set_event
        @event = current_user.organized_events.find_by(id: params[:event_id])
        render_not_found(message: 'Event not found') unless @event
      end

      def set_booking_item
        @booking_item = @event.booking_items.find_by(id: params[:booking_item_id])
        render_not_found(message: 'Booking item not found') unless @booking_item
      end

      def calculate_attendance_rate
        total_registrations = @event.bookings.where(status: [:confirmed, :pending]).sum(:total_tickets)
        total_checked_in = @event.booking_items.where.not(checked_in_at: nil).sum(:quantity)

        return 0 if total_registrations.zero?

        ((total_checked_in.to_f / total_registrations.to_f) * 100).round(1)
      end

      def recent_check_ins
        @event.booking_items
          .where.not(checked_in_at: nil)
          .includes(booking: :user, ticket_type: [])
          .order(checked_in_at: :desc)
          .limit(10)
          .map do |item|
            {
              id: item.id,
              attendee_name: item.booking.user.full_name,
              ticket_type: item.ticket_type.name,
              checked_in_at: item.checked_in_at,
              checked_in_by: User.find_by(id: item.checked_in_by)&.full_name
            }
          end
      end

      def check_in_trends
        @event.booking_items
          .where.not(checked_in_at: nil)
          .where('checked_in_at >= ?', 1.hour.ago)
          .group("DATE_FORMAT(checked_in_at, '%H')")
          .order("DATE_FORMAT(checked_in_at, '%H')")
          .count
          .map { |hour, count| { hour: hour.to_i, check_ins: count } }
      end
    end
  end
end
