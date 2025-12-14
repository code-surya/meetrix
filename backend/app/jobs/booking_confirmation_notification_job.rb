# frozen_string_literal: true

class BookingConfirmationNotificationJob < ApplicationJob
  queue_as :default

  def perform(booking_id)
    booking = Booking.find_by(id: booking_id)
    return unless booking

    # Create notification for user
    Notification.create!(
      user: booking.user,
      notification_type: :booking_confirmed,
      title: 'Booking Confirmed',
      message: "Your booking #{booking.booking_reference} for #{booking.event.title} has been confirmed.",
      notifiable: booking,
      action_url: "/bookings/#{booking.id}"
    )

    # If group booking, notify group members
    if booking.group.present?
      booking.group.members.each do |member|
        next if member.id == booking.user_id

        Notification.create!(
          user: member,
          notification_type: :general,
          title: 'Group Booking Update',
          message: "#{booking.user.full_name} has confirmed their booking for #{booking.event.title}.",
          notifiable: booking.group,
          action_url: "/groups/#{booking.group.id}"
        )
      end
    end
  end
end

