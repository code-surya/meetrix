# frozen_string_literal: true

# ActionCable configuration
Rails.application.config.action_cable.mount_path = '/cable'
Rails.application.config.action_cable.allowed_request_origins = [
  /http:\/\/localhost.*/,
  /https:\/\/.*\.yourdomain\.com/
]

# Add allowed origins from environment
if ENV['ALLOWED_ORIGINS'].present?
  ENV['ALLOWED_ORIGINS'].split(',').each do |origin|
    Rails.application.config.action_cable.allowed_request_origins << origin.strip
  end
end

