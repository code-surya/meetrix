# frozen_string_literal: true

class WarmCacheJob < ApplicationJob
  queue_as :low_priority

  def perform
    Rails.logger.info('Starting cache warming job')

    begin
      # Warm popular event caches
      warm_event_caches

      # Warm user profile caches
      warm_user_caches

      # Warm search caches
      warm_search_caches

      Rails.logger.info('Cache warming completed successfully')
    rescue => e
      Rails.logger.error("Cache warming failed: #{e.message}")
      # Don't retry cache warming failures as they're not critical
    end
  end

  private

  def warm_event_caches
    # Cache popular events
    popular_events = Event.published
      .includes(:organizer, :venue, :ticket_types)
      .order(total_bookings: :desc)
      .limit(20)

    popular_events.each do |event|
      CachingService.fetch_event(event.id)
    end

    # Cache upcoming events
    upcoming_events = Event.published
      .upcoming
      .includes(:organizer, :venue)
      .limit(10)

    upcoming_events.each do |event|
      CachingService.fetch_event(event.id)
    end
  end

  def warm_user_caches
    # Cache active organizer profiles
    active_organizers = User.organizer
      .joins(:organized_events)
      .where('events.created_at > ?', 30.days.ago)
      .distinct
      .limit(10)

    active_organizers.each do |organizer|
      CachingService.fetch_user_profile(organizer.id)
    end
  end

  def warm_search_caches
    # Cache common search terms
    common_searches = [
      'conference', 'workshop', 'music', 'sports',
      'technology', 'business', 'art', 'food'
    ]

    common_searches.each do |term|
      CachingService.fetch_search_results(term)
    end

    # Cache popular categories
    popular_categories = Event.group(:category)
      .count
      .sort_by { |_, count| -count }
      .first(5)
      .map(&:first)

    popular_categories.each do |category|
      CachingService.fetch_event_list(category: category, limit: 10)
    end
  end
end
