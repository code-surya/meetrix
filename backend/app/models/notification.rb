# frozen_string_literal: true

class Notification < ApplicationRecord
  # Enums
  enum notification_type: {
    booking_confirmed: 0,
    booking_cancelled: 1,
    event_reminder: 2,
    event_cancelled: 3,
    event_updated: 4,
    group_invitation: 5,
    payment_failed: 6,
    review_request: 7,
    general: 8
  }

  # Associations
  belongs_to :user
  belongs_to :notifiable, polymorphic: true, optional: true

  # Validations
  validates :user_id, presence: true
  validates :title, presence: true, length: { maximum: 200 }
  validates :message, presence: true, length: { maximum: 1000 }
  validates :notification_type, presence: true

  # Scopes
  scope :unread, -> { where(read: false) }
  scope :read, -> { where(read: true) }
  scope :recent, -> { order(created_at: :desc) }
  scope :by_type, ->(type) { where(notification_type: type) }

  # Callbacks
  after_create :broadcast_notification
  after_update :broadcast_update, if: :saved_change_to_read?

  # Instance methods
  def mark_as_read!
    update!(read: true, read_at: Time.current) unless read?
  end

  def mark_as_unread!
    update!(read: false, read_at: nil) if read?
  end

  private

  def broadcast_notification
    NotificationBroadcastService.broadcast_to_user(user, self)
  end

  def broadcast_update
    NotificationBroadcastService.broadcast_notification_update(user, self)
    NotificationBroadcastService.broadcast_notification_count(user)
  end
end

