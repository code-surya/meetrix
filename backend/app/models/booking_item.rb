# frozen_string_literal: true

class BookingItem < ApplicationRecord
  # Associations
  belongs_to :booking
  belongs_to :ticket_type

  # QR codes stored as JSONB in PostgreSQL (no serialization needed)
  # For other databases, Rails will handle serialization automatically

  # Validations
  validates :booking_id, presence: true
  validates :ticket_type_id, presence: true
  validates :quantity, presence: true, numericality: { only_integer: true, greater_than: 0 }
  validates :unit_price, presence: true, numericality: { greater_than_or_equal_to: 0 }
  validate :ticket_type_available
  validate :ticket_type_belongs_to_event

  # Callbacks
  before_validation :set_unit_price, if: -> { ticket_type.present? && unit_price.blank? }

  # Scopes
  scope :by_ticket_type, ->(ticket_type_id) { where(ticket_type_id: ticket_type_id) }

  # Instance methods
  def subtotal
    quantity * unit_price
  end

  private

  def set_unit_price
    self.unit_price = ticket_type.price
  end

  def ticket_type_available
    return unless ticket_type.present? && quantity.present?

    unless ticket_type.can_purchase?(quantity)
      errors.add(:quantity, "exceeds available tickets for #{ticket_type.name}")
    end
  end

  def ticket_type_belongs_to_event
    return unless booking.present? && ticket_type.present?

    unless ticket_type.event_id == booking.event_id
      errors.add(:ticket_type, 'does not belong to the event')
    end
  end
end

