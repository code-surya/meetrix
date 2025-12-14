# frozen_string_literal: true

class TicketType < ApplicationRecord
  # Associations
  belongs_to :event
  has_many :booking_items, dependent: :restrict_with_error

  # Validations
  validates :name, presence: true, length: { maximum: 100 }
  validates :description, length: { maximum: 500 }
  validates :price, presence: true, numericality: { greater_than_or_equal_to: 0 }
  validates :quantity, presence: true, numericality: { only_integer: true, greater_than: 0 }
  validates :sale_start_date, presence: true
  validates :sale_end_date, presence: true
  validates :event_id, presence: true
  validate :sale_end_after_sale_start
  validate :sale_dates_within_event_dates
  validate :quantity_not_exceeded

  # Scopes
  scope :available, -> { where('quantity > sold_quantity AND sale_start_date <= ? AND sale_end_date >= ?', Time.current, Time.current) }
  scope :on_sale, -> { where('sale_start_date <= ? AND sale_end_date >= ?', Time.current, Time.current) }

  # Callbacks
  before_validation :set_default_sale_dates, if: -> { sale_start_date.blank? || sale_end_date.blank? }

  # Instance methods
  def available_quantity
    quantity - sold_quantity
  end

  def sold_out?
    available_quantity <= 0
  end

  def on_sale?
    Time.current.between?(sale_start_date, sale_end_date) && !sold_out?
  end

  def revenue
    sold_quantity * price
  end

  def can_purchase?(requested_quantity)
    on_sale? && available_quantity >= requested_quantity
  end

  def increment_sold_quantity!(amount)
    increment!(:sold_quantity, amount)
  end

  def decrement_sold_quantity!(amount)
    decrement!(:sold_quantity, amount)
  end

  private

  def sale_end_after_sale_start
    return unless sale_start_date.present? && sale_end_date.present?

    errors.add(:sale_end_date, 'must be after sale start date') if sale_end_date <= sale_start_date
  end

  def sale_dates_within_event_dates
    return unless event.present? && sale_start_date.present? && sale_end_date.present?

    if sale_start_date < event.start_date
      errors.add(:sale_start_date, 'must be on or after event start date')
    end

    if sale_end_date > event.end_date
      errors.add(:sale_end_date, 'must be on or before event end date')
    end
  end

  def quantity_not_exceeded
    return unless quantity.present? && sold_quantity.present?

    errors.add(:sold_quantity, 'cannot exceed total quantity') if sold_quantity > quantity
  end

  def set_default_sale_dates
    return unless event.present?

    self.sale_start_date ||= Time.current
    self.sale_end_date ||= event.start_date
  end
end

