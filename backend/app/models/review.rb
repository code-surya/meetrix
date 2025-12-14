# frozen_string_literal: true

class Review < ApplicationRecord
  # Associations
  belongs_to :user
  belongs_to :event

  # Validations
  validates :user_id, presence: true
  validates :event_id, presence: true
  validates :rating, presence: true, numericality: { only_integer: true, greater_than: 0, less_than_or_equal_to: 5 }
  validates :comment, length: { maximum: 2000 }
  validates :user_id, uniqueness: { scope: :event_id, message: 'has already reviewed this event' }
  validate :user_attended_event
  validate :event_completed

  # Scopes
  scope :approved, -> { where(approved: true) }
  scope :pending, -> { where(approved: false) }
  scope :by_rating, ->(rating) { where(rating: rating) }
  scope :recent, -> { order(created_at: :desc) }

  # Callbacks
  after_create :update_event_rating
  after_update :update_event_rating, if: :saved_change_to_rating?
  after_destroy :update_event_rating

  # Instance methods
  def approve!
    update!(approved: true, approved_at: Time.current)
  end

  def reject!
    update!(approved: false, approved_at: nil)
  end

  private

  def user_attended_event
    return unless user.present? && event.present?

    unless user.bookings.where(event: event, status: :confirmed).exists?
      errors.add(:user, 'must have attended the event to review it')
    end
  end

  def event_completed
    return unless event.present?

    if event.end_date > Time.current
      errors.add(:event, 'must be completed before it can be reviewed')
    end
  end

  def update_event_rating
    # This would typically be done via a background job for performance
    # EventRatingUpdateJob.perform_later(event_id)
    event.update_rating_cache if event.present?
  end
end

