# frozen_string_literal: true

class WebhookLog < ApplicationRecord
  # Validations
  validates :gateway, presence: true, inclusion: { in: %w[stripe razorpay] }
  validates :event_type, presence: true
  validates :payload, presence: true

  # Scopes
  scope :processed, -> { where(processed: true) }
  scope :unprocessed, -> { where(processed: false) }
  scope :by_gateway, ->(gateway) { where(gateway: gateway) }
  scope :recent, -> { order(created_at: :desc) }
end

