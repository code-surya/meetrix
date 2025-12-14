# frozen_string_literal: true

# Razorpay configuration
Razorpay.setup(
  ENV['RAZORPAY_KEY_ID'] || Rails.application.credentials.razorpay&.key_id,
  ENV['RAZORPAY_KEY_SECRET'] || Rails.application.credentials.razorpay&.key_secret
) if ENV['RAZORPAY_KEY_ID'].present? && ENV['RAZORPAY_KEY_SECRET'].present?

