# frozen_string_literal: true

# Redis configuration for JWT token storage
# if Rails.env.production?
#   Redis.current = Redis.new(
#     url: ENV['REDIS_URL'] || 'redis://localhost:6379/0',
#     ssl_params: { verify_mode: OpenSSL::SSL::VERIFY_NONE }
#   )
# else
#   Redis.current = Redis.new(
#     url: ENV['REDIS_URL'] || 'redis://localhost:6379/0'
#   )
# end

# # Test Redis connection
# begin
#   Redis.current.ping
# rescue Redis::CannotConnectError => e
#   Rails.logger.error "Redis connection failed: #{e.message}"
#   Rails.logger.warn "JWT token revocation will not work without Redis"
# end

