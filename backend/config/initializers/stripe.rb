# frozen_string_literal: true

# Stripe configuration
if Rails.env.production?
  Stripe.api_key = ENV['STRIPE_SECRET_KEY'] || Rails.application.credentials.stripe&.secret_key
else
  # Use test keys in development
  Stripe.api_key = ENV['STRIPE_SECRET_KEY'] || Rails.application.credentials.stripe&.test_secret_key
end

# Set API version (optional, but recommended)
Stripe.api_version = '2023-10-16'

