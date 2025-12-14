# frozen_string_literal: true

class EventReminderJob < ApplicationJob
  queue_as :default

  def perform(event_id, reminder_type = '24_hours')
    event = Event.find_by(id: event_id)
    return unless event&.published?

    # Get all confirmed bookings for the event
    bookings = event.bookings.confirmed.includes(:user)

    bookings.find_each do |booking|
      # Calculate reminder time based on type
      reminder_time = calculate_reminder_time(event.start_date, reminder_type)
      
      # Schedule notification if within reminder window
      if should_send_reminder?(reminder_time)
        Notification.create!(
          user: booking.user,
          notification_type: :event_reminder,
          title: 'Event Reminder',
          message: build_reminder_message(event, reminder_type),
          notifiable: event,
          action_url: "/events/#{event.id}"
        )
      end
    end
  end

  private

  def calculate_reminder_time(event_start, reminder_type)
    case reminder_type
    when '24_hours'
      event_start - 24.hours
    when '1_hour'
      event_start - 1.hour
    when '30_minutes'
      event_start - 30.minutes
    else
      event_start - 24.hours
    end
  end

  def should_send_reminder?(reminder_time)
    # Send if reminder time is within the next 5 minutes
    Time.current.between?(reminder_time - 5.minutes, reminder_time + 5.minutes)
  end

  def build_reminder_message(event, reminder_type)
    time_until = case reminder_type
                 when '24_hours'
                   '24 hours'
                 when '1_hour'
                   '1 hour'
                 when '30_minutes'
                   '30 minutes'
                 else
                   'soon'
                 end

    "#{event.title} starts in #{time_until}. Don't forget to attend!"
  end
end

