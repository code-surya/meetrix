# frozen_string_literal: true

class CheckInBroadcastService
  def self.broadcast_check_in(event, booking_item)
    return unless event.present? && booking_item.present?

    attendee_data = {
      booking_item_id: booking_item.id,
      attendee_name: booking_item.booking.user.full_name,
      ticket_type: booking_item.ticket_type.name,
      checked_in_at: booking_item.checked_in_at,
      checked_in_by: User.find_by(id: booking_item.checked_in_by)&.full_name
    }

    # Broadcast to event organizers
    event.organizer.notifications.create!(
      title: 'Attendee Checked In',
      message: "#{attendee_data[:attendee_name]} checked in for #{event.title}",
      notification_type: :attendee_check_in,
      notifiable: booking_item,
      action_url: "/events/#{event.id}/check-ins"
    )

    # Broadcast real-time updates via ActionCable
    broadcast_channel = "event_#{event.id}_check_ins"
    ActionCable.server.broadcast(
      broadcast_channel,
      {
        type: 'attendee_checked_in',
        attendee: attendee_data,
        attendance_count: event.booking_items.where.not(checked_in_at: nil).count,
        total_registrations: event.bookings.where(status: [:confirmed, :pending]).sum(:total_tickets),
        timestamp: Time.current.to_i
      }
    )
  end

  def self.broadcast_attendance_update(event)
    return unless event.present?

    attendance_data = {
      total_registrations: event.bookings.where(status: [:confirmed, :pending]).sum(:total_tickets),
      total_checked_in: event.booking_items.where.not(checked_in_at: nil).count,
      attendance_rate: calculate_attendance_rate(event),
      last_updated: Time.current.to_i
    }

    broadcast_channel = "event_#{event.id}_attendance"
    ActionCable.server.broadcast(
      broadcast_channel,
      {
        type: 'attendance_update',
        attendance: attendance_data
      }
    )
  end

  def self.broadcast_bulk_check_in(event, checked_in_count)
    return unless event.present?

    ActionCable.server.broadcast(
      "event_#{event.id}_check_ins",
      {
        type: 'bulk_check_in',
        checked_in_count: checked_in_count,
        timestamp: Time.current.to_i
      }
    )
  end

  private

  def self.calculate_attendance_rate(event)
    total_registrations = event.bookings.where(status: [:confirmed, :pending]).sum(:total_tickets)
    total_checked_in = event.booking_items.where.not(checked_in_at: nil).count

    return 0 if total_registrations.zero?

    ((total_checked_in.to_f / total_registrations.to_f) * 100).round(1)
  end
end
