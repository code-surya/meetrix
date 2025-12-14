# frozen_string_literal: true

class CachingService
  CACHE_EXPIRY = {
    event: 5.minutes,
    event_list: 1.minute,
    user_profile: 10.minutes,
    analytics: 30.seconds,
    qr_validation: 1.hour,
    search_results: 5.minutes
  }.freeze

  class << self
    def fetch_event(event_id)
      Rails.cache.fetch("event:#{event_id}", expires_in: CACHE_EXPIRY[:event]) do
        Event.includes(:ticket_types, :venue).find_by(id: event_id)
      end
    end

    def fetch_event_list(filters = {})
      cache_key = generate_event_list_key(filters)
      Rails.cache.fetch(cache_key, expires_in: CACHE_EXPIRY[:event_list]) do
        events = Event.published.includes(:organizer, :venue)

        # Apply filters
        events = apply_filters(events, filters)

        # Paginate
        events.page(filters[:page] || 1).per(filters[:per_page] || 20)
      end
    end

    def fetch_user_profile(user_id)
      Rails.cache.fetch("user_profile:#{user_id}", expires_in: CACHE_EXPIRY[:user_profile]) do
        User.includes(bookings: [:event, :booking_items]).find_by(id: user_id)
      end
    end

    def fetch_analytics(event_id, date_range = nil)
      cache_key = "analytics:#{event_id}:#{date_range&.sort&.join('-')}"
      Rails.cache.fetch(cache_key, expires_in: CACHE_EXPIRY[:analytics]) do
        AnalyticsQueries.new(event.organizer).event_performance(event_id, date_range)
      end
    end

    def fetch_search_results(query, filters = {})
      return [] if query.blank? || query.length < 2

      cache_key = "search:#{Digest::MD5.hexdigest(query)}:#{filters.to_json}"
      Rails.cache.fetch(cache_key, expires_in: CACHE_EXPIRY[:search_results]) do
        # Use Elasticsearch or PostgreSQL full-text search
        perform_search(query, filters)
      end
    end

    def invalidate_event(event_id)
      Rails.cache.delete("event:#{event_id}")
      Rails.cache.delete_matched("event_list:*")
      Rails.cache.delete_matched("analytics:#{event_id}:*")
    end

    def invalidate_user(user_id)
      Rails.cache.delete("user_profile:#{user_id}")
      Rails.cache.delete_matched("event_list:*") # User might be organizer
    end

    def invalidate_search
      Rails.cache.delete_matched("search:*")
    end

    def warm_cache
      # Pre-warm popular event caches
      popular_events = Event.published.order(total_bookings: :desc).limit(10)

      popular_events.each do |event|
        fetch_event(event.id)
      end

      # Pre-warm search suggestions
      common_searches = ['conference', 'workshop', 'music', 'sports']
      common_searches.each do |term|
        fetch_search_results(term)
      end
    end

    private

    def generate_event_list_key(filters)
      # Create deterministic cache key from filters
      sorted_filters = filters.sort.to_h
      "event_list:#{Digest::MD5.hexdigest(sorted_filters.to_json)}"
    end

    def apply_filters(events, filters)
      events = events.by_category(filters[:category]) if filters[:category].present?
      events = events.upcoming if filters[:upcoming] == 'true'
      events = events.nearby(filters[:lat], filters[:lng], filters[:radius]) if filters[:lat].present?
      events = events.where('price >= ?', filters[:min_price]) if filters[:min_price].present?
      events = events.where('price <= ?', filters[:max_price]) if filters[:max_price].present?
      events = events.search_by_text(filters[:search]) if filters[:search].present?

      events
    end

    def perform_search(query, filters)
      # Use Elasticsearch if available, otherwise PostgreSQL
      if defined?(Elasticsearch::Model)
        Event.__elasticsearch__.search(query).records
      else
        Event.where('title ILIKE ? OR description ILIKE ?',
                   "%#{query}%", "%#{query}%").limit(50)
      end
    end
  end
end

