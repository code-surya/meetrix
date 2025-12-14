# frozen_string_literal: true

class Event < ApplicationRecord
  # Enums
  enum status: { draft: 0, published: 1, cancelled: 2, completed: 3 }
  enum category: {
    music: 0,
    sports: 1,
    technology: 2,
    business: 3,
    arts: 4,
    food: 5,
    education: 6,
    health: 7,
    other: 8
  }

  # Associations
  belongs_to :organizer, class_name: 'User', foreign_key: 'organizer_id'
  has_many :ticket_types, dependent: :destroy
  has_many :bookings, dependent: :destroy
  has_many :booking_items, through: :bookings
  has_many :attendees, through: :bookings, source: :user
  has_many :reviews, dependent: :destroy
  has_many :event_analytics, dependent: :destroy

  # Validations
  validates :title, presence: true, length: { maximum: 200 }
  validates :description, presence: true, length: { maximum: 5000 }
  validates :start_date, presence: true
  validates :end_date, presence: true
  validates :venue_name, presence: true, length: { maximum: 200 }
  validates :venue_address, presence: true, length: { maximum: 500 }
  validates :city, presence: true, length: { maximum: 100 }
  validates :state, length: { maximum: 100 }
  validates :country, presence: true, length: { maximum: 100 }
  validates :postal_code, length: { maximum: 20 }
  validates :latitude, presence: true, numericality: { greater_than_or_equal_to: -90, less_than_or_equal_to: 90 }
  validates :longitude, presence: true, numericality: { greater_than_or_equal_to: -180, less_than_or_equal_to: 180 }
  validates :status, presence: true
  validates :category, presence: true
  validates :organizer_id, presence: true
  validate :end_date_after_start_date
  validate :start_date_in_future, if: -> { published? }

  # Scopes
  scope :upcoming, -> { where('start_date > ?', Time.current) }
  scope :past, -> { where('end_date < ?', Time.current) }
  scope :published, -> { where(status: :published) }
  scope :by_category, ->(cat) { where(category: cat) }
  scope :nearby, ->(lat, lng, radius_km = 10) {
    where(
      "ST_DWithin(
        location::geography,
        ST_MakePoint(?, ?)::geography,
        ?
      )", lng, lat, radius_km * 1000
    )
  }
  scope :search_by_text, ->(query) {
    where(
      "to_tsvector('english', title || ' ' || COALESCE(description, '')) @@ plainto_tsquery('english', ?)",
      query
    )
  }

  # Callbacks
  before_validation :geocode_address, if: -> { venue_address_changed? || city_changed? }
  after_create :create_initial_analytics

  # Instance methods
  def total_tickets_sold
    booking_items.sum(:quantity)
  end

  def total_revenue
    bookings.completed.sum(:total_amount)
  end

  def available_tickets
    ticket_types.sum(&:available_quantity)
  end

  def sold_out?
    ticket_types.all?(&:sold_out?)
  end

  def average_rating
    reviews.average(:rating)&.round(2) || 0.0
  end

  def total_reviews
    reviews.count
  end

  def is_upcoming?
    start_date > Time.current
  end

  def is_past?
    end_date < Time.current
  end

  def valid_for_publishing?
    errors.clear
    errors.add(:ticket_types, 'must have at least one ticket type') if ticket_types.empty?
    errors.add(:start_date, 'must be in the future') if start_date <= Time.current
    errors.add(:end_date, 'must be after start date') if end_date <= start_date
    errors.none?
  end

  def update_rating_cache
    # This would typically be done via a background job for performance
    # For now, it's a placeholder - consider using counter_cache or background job
    # The average_rating method already calculates this dynamically
    touch # Update updated_at timestamp
  end

  private

  def end_date_after_start_date
    return unless start_date.present? && end_date.present?

    errors.add(:end_date, 'must be after start date') if end_date <= start_date
  end

  def start_date_in_future
    return unless start_date.present?

    errors.add(:start_date, 'must be in the future for published events') if start_date <= Time.current
  end

  def geocode_address
    # This would typically call a geocoding service (Google Maps API)
    # For now, it's a placeholder - implement with Geocoder gem or custom service
    # Geocoder.coordinates("#{venue_address}, #{city}, #{state} #{postal_code}, #{country}")
  end

  def create_initial_analytics
    event_analytics.create!(
      views_count: 0,
      bookings_count: 0,
      revenue: 0.0
    )
  end
end

