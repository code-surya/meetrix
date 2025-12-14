# frozen_string_literal: true

module RateLimitable
  extend ActiveSupport::Concern

  included do
    before_action :check_rate_limit
  end

  private

  def check_rate_limit
    client_ip = request.remote_ip
    endpoint = "#{controller_name}##{action_name}"

    # Skip rate limiting for certain actions
    return if skip_rate_limit?

    # Get rate limit configuration
    limit, window = rate_limit_config(endpoint)

    # Check if rate limit exceeded
    if rate_limit_exceeded?(client_ip, endpoint, limit, window)
      render_rate_limit_exceeded
      return
    end

    # Track the request
    track_request(client_ip, endpoint)
  end

  def skip_rate_limit?
    # Skip rate limiting for authenticated admin users
    current_user&.admin? ||
    # Skip for health checks
    controller_name == 'health' ||
    # Skip for certain low-risk endpoints
    (controller_name == 'users' && action_name == 'show')
  end

  def rate_limit_config(endpoint)
    case endpoint
    when /auth#/
      [5, 300]  # 5 requests per 5 minutes for auth
    when /check_ins#verify_qr/
      [100, 60] # 100 QR verifications per minute
    when /check_ins#check_in/
      [50, 60]  # 50 check-ins per minute
    when /analytics#/
      [30, 60]  # 30 analytics requests per minute
    when /events#search/
      [20, 60]  # 20 searches per minute
    else
      [100, 60] # 100 requests per minute default
    end
  end

  def rate_limit_exceeded?(client_ip, endpoint, limit, window)
    cache_key = "rate_limit:#{client_ip}:#{endpoint}"
    current_count = Rails.cache.read(cache_key).to_i

    current_count >= limit
  end

  def track_request(client_ip, endpoint)
    cache_key = "rate_limit:#{client_ip}:#{endpoint}"
    limit, window = rate_limit_config(endpoint)

    current_count = Rails.cache.read(cache_key).to_i
    Rails.cache.write(cache_key, current_count + 1, expires_in: window.seconds)
  end

  def render_rate_limit_exceeded
    response.headers['X-RateLimit-Reset'] = (Time.current + 60.seconds).to_i
    render json: {
      error: 'Rate limit exceeded',
      message: 'Too many requests. Please try again later.',
      retry_after: 60
    }, status: :too_many_requests
  end
end

