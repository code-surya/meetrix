# frozen_string_literal: true

class EventAnalyticsService
  def self.record_check_in(event, booking_item)
    return unless event.present? && booking_item.present?

    analytics = event.event_analytics || event.create_event_analytics

    analytics.update!(
      total_checked_in: event.booking_items.where.not(checked_in_at: nil).count,
      last_check_in_at: booking_item.checked_in_at,
      attendance_rate: calculate_attendance_rate(event)
    )

    # Record check-in by hour
    hour_key = booking_item.checked_in_at.strftime('%H')
    hourly_check_ins = analytics.hourly_check_ins || {}
    hourly_check_ins[hour_key] = (hourly_check_ins[hour_key] || 0) + 1
    analytics.update!(hourly_check_ins: hourly_check_ins)
  end

  def self.record_view(event, user_agent = nil, ip_address = nil)
    return unless event.present?

    analytics = event.event_analytics || event.create_event_analytics

    analytics.update!(
      view_count: analytics.view_count + 1,
      last_viewed_at: Time.current
    )

    # Track unique views (simplified)
    if user_agent.present?
      unique_views = analytics.unique_views || {}
      view_key = Digest::MD5.hexdigest(user_agent + (ip_address || ''))
      unique_views[view_key] = Time.current.to_i unless unique_views[view_key]
      analytics.update!(unique_views: unique_views)
    end
  end

  def self.update_event_metrics(event)
    return unless event.present?

    analytics = event.event_analytics || event.create_event_analytics

    total_registrations = event.bookings.where(status: [:confirmed, :pending]).sum(:total_tickets)
    total_checked_in = event.booking_items.where.not(checked_in_at: nil).count

    analytics.update!(
      total_registrations: total_registrations,
      total_checked_in: total_checked_in,
      attendance_rate: calculate_attendance_rate(event),
      last_updated_at: Time.current
    )
  end

  private

  def self.calculate_attendance_rate(event)
    total_registrations = event.bookings.where(status: [:confirmed, :pending]).sum(:total_tickets)
    total_checked_in = event.booking_items.where.not(checked_in_at: nil).count

    return 0 if total_registrations.zero?

    ((total_checked_in.to_f / total_registrations.to_f) * 100).round(2)
  end
end
