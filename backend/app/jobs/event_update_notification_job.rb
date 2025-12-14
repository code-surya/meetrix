# frozen_string_literal: true

class EventUpdateNotificationJob < ApplicationJob
  queue_as :default

  def perform(event_id, update_type)
    event = Event.find_by(id: event_id)
    return unless event

    # Get all users who have bookings for this event
    users = event.bookings.confirmed.includes(:user).map(&:user).uniq

    users.each do |user|
      Notification.create!(
        user: user,
        notification_type: notification_type_for_update(update_type),
        title: build_title(update_type, event),
        message: build_message(update_type, event),
        notifiable: event,
        action_url: "/events/#{event.id}"
      )
    end
  end

  private

  def notification_type_for_update(update_type)
    case update_type.to_s
    when 'cancelled'
      :event_cancelled
    when 'updated'
      :event_updated
    when 'reminder'
      :event_reminder
    else
      :general
    end
  end

  def build_title(update_type, event)
    case update_type.to_s
    when 'cancelled'
      'Event Cancelled'
    when 'updated'
      'Event Updated'
    else
      'Event Notification'
    end
  end

  def build_message(update_type, event)
    case update_type.to_s
    when 'cancelled'
      "#{event.title} has been cancelled. Your booking will be refunded."
    when 'updated'
      "#{event.title} has been updated. Please check the new details."
    else
      "Update regarding #{event.title}"
    end
  end
end

