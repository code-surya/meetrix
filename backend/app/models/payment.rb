# frozen_string_literal: true

class Payment < ApplicationRecord
  # Enums
  enum status: { pending: 0, processing: 1, completed: 2, failed: 3, refunded: 4 }
  enum payment_method: { credit_card: 0, debit_card: 1, bank_transfer: 2, wallet: 3 }

  # Associations
  belongs_to :booking

  # Validations
  validates :booking_id, presence: true
  validates :amount, presence: true, numericality: { greater_than: 0 }
  validates :currency, presence: true, length: { is: 3 }
  validates :status, presence: true
  validates :payment_method, presence: true
  validates :transaction_id, uniqueness: true, allow_nil: true
  validate :amount_matches_booking_total

  # Callbacks
  before_validation :set_currency, if: -> { currency.blank? }
  after_update :update_booking_status, if: :saved_change_to_status?

  # Scopes
  scope :successful, -> { where(status: [:completed, :refunded]) }
  scope :failed, -> { where(status: :failed) }
  scope :by_date_range, ->(start_date, end_date) { where(created_at: start_date..end_date) }

  # Instance methods
  def process!
    return false unless pending?

    transaction do
      update!(status: :processing)
      # Integrate with payment gateway (Stripe)
      # result = StripeService.charge(amount, payment_method_details)
      # if result.success?
      #   update!(status: :completed, transaction_id: result.transaction_id)
      #   booking.confirm!
      # else
      #   update!(status: :failed, failure_reason: result.error_message)
      # end
    end
  end

  def refund!(refund_amount = nil)
    return false unless completed?

    refund_amount ||= amount
    return false if refund_amount > amount

    transaction do
      # Integrate with payment gateway refund
      # result = StripeService.refund(transaction_id, refund_amount)
      # if result.success?
      #   update!(status: :refunded, refunded_amount: refund_amount)
      #   booking.update!(status: :refunded)
      # end
    end
  end

  def successful?
    completed? || refunded?
  end

  private

  def set_currency
    self.currency = 'USD' # Default currency, can be made configurable
  end

  def amount_matches_booking_total
    return unless booking.present? && amount.present?

    unless amount == booking.total_amount
      errors.add(:amount, 'must match booking total amount')
    end
  end

  def update_booking_status
    case status
    when 'completed'
      booking.confirm! if booking.pending?
    when 'failed'
      booking.update!(status: :pending) # Keep booking pending for retry
    end
  end
end

