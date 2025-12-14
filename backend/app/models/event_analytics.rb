# frozen_string_literal: true

class EventAnalytics < ApplicationRecord
  # Associations
  belongs_to :event

  # Validations
  validates :event_id, presence: true, uniqueness: true
  validates :views_count, numericality: { only_integer: true, greater_than_or_equal_to: 0 }
  validates :bookings_count, numericality: { only_integer: true, greater_than_or_equal_to: 0 }
  validates :revenue, numericality: { greater_than_or_equal_to: 0 }

  # Callbacks
  after_update :update_event_cache, if: :saved_change_to_revenue?

  # Instance methods
  def increment_views!
    increment!(:views_count)
  end

  def increment_bookings!
    increment!(:bookings_count)
  end

  def add_revenue!(amount)
    increment!(:revenue, amount)
  end

  def conversion_rate
    return 0.0 if views_count.zero?

    (bookings_count.to_f / views_count * 100).round(2)
  end

  def average_revenue_per_booking
    return 0.0 if bookings_count.zero?

    (revenue / bookings_count).round(2)
  end

  private

  def update_event_cache
    # Update any cached analytics on the event model
    event.touch if event.present?
  end
end

