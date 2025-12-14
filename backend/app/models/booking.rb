# frozen_string_literal: true

class Booking < ApplicationRecord
  # Enums
  enum status: { pending: 0, confirmed: 1, cancelled: 2, refunded: 3 }

  # Associations
  belongs_to :user
  belongs_to :event
  has_many :booking_items, dependent: :destroy
  has_many :ticket_types, through: :booking_items
  has_one :payment, dependent: :destroy
  belongs_to :group, optional: true

  # Additional fields for group bookings
  # discount_amount: decimal - discount applied for group bookings
  # discount_percentage: decimal - discount percentage applied

  # Validations
  validates :user_id, presence: true
  validates :event_id, presence: true
  validates :total_amount, presence: true, numericality: { greater_than_or_equal_to: 0 }
  validates :status, presence: true
  validates :booking_reference, presence: true, uniqueness: true
  validates :discount_amount, numericality: { greater_than_or_equal_to: 0 }, allow_nil: true
  validates :discount_percentage, numericality: { greater_than_or_equal_to: 0, less_than_or_equal_to: 1 }, allow_nil: true
  validate :event_not_cancelled
  validate :event_not_past

  # Callbacks
  before_validation :generate_booking_reference, on: :create
  before_validation :calculate_total_amount, if: -> { booking_items.any? }
  after_create :send_confirmation_email
  after_update :handle_status_change, if: :saved_change_to_status?

  # Scopes
  scope :completed, -> { where(status: [:confirmed, :refunded]) }
  scope :active, -> { where(status: [:pending, :confirmed]) }
  scope :recent, -> { order(created_at: :desc) }
  scope :by_event, ->(event_id) { where(event_id: event_id) }
  scope :by_user, ->(user_id) { where(user_id: user_id) }

  # Instance methods
  def total_tickets
    booking_items.sum(:quantity)
  end

  def can_be_cancelled?
    confirmed? && event.start_date > Time.current
  end

  def cancel!
    return false unless can_be_cancelled?

    transaction do
      update!(status: :cancelled)
      booking_items.each do |item|
        item.ticket_type.decrement_sold_quantity!(item.quantity)
      end
      payment&.refund! if payment&.completed?
    end
  end

  def confirm!
    return false unless pending?

    transaction do
      update!(status: :confirmed, confirmed_at: Time.current)
      booking_items.each do |item|
        item.ticket_type.increment_sold_quantity!(item.quantity)
        # Generate QR codes for each booking item
        QrCodeService.generate_for_booking_item(item)
      end

      # Send confirmation notification
      BookingConfirmationNotificationJob.perform_later(id)
    end
  end

  private

  def generate_booking_reference
    loop do
      self.booking_reference = SecureRandom.alphanumeric(10).upcase
      break unless Booking.exists?(booking_reference: booking_reference)
    end
  end

  def calculate_total_amount
    self.total_amount = booking_items.sum { |item| item.quantity * item.unit_price }
  end

  def event_not_cancelled
    return unless event.present?

    errors.add(:event, 'is cancelled') if event.cancelled?
  end

  def event_not_past
    return unless event.present?

    errors.add(:event, 'has already ended') if event.end_date < Time.current
  end

  def send_confirmation_email
    BookingMailer.confirmation(self).deliver_later if confirmed?
  end

  def handle_status_change
    case status
    when 'confirmed'
      send_confirmation_email
    when 'cancelled'
      BookingMailer.cancellation(self).deliver_later
    end
  end
end

