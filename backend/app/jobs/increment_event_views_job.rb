# frozen_string_literal: true

class IncrementEventViewsJob < ApplicationJob
  queue_as :default

  def perform(event_id)
    event = Event.find_by(id: event_id)
    return unless event

    analytics = event.event_analytics || event.create_event_analytics
    analytics.increment_views!
  end
end

