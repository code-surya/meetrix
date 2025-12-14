# frozen_string_literal: true

class Rack::Attack
  # Throttle requests by IP
  throttle('req/ip', limit: 300, period: 5.minutes) do |req|
    req.ip unless req.path.start_with?('/assets/')
  end

  # Throttle API requests more strictly
  throttle('api/ip', limit: 100, period: 1.minute) do |req|
    req.ip if req.path.start_with?('/api/')
  end

  # Throttle authentication attempts
  throttle('auth/ip', limit: 5, period: 20.seconds) do |req|
    req.ip if req.path =~ /\A\/api\/v1\/auth\/(login|register)\z/
  end

  # Throttle QR verification (expensive operation)
  throttle('qr_verify/ip', limit: 50, period: 1.minute) do |req|
    req.ip if req.path =~ /check_ins\/verify_qr/
  end

  # Throttle check-in attempts
  throttle('check_in/ip', limit: 30, period: 1.minute) do |req|
    req.ip if req.path =~ /check_ins\/\d+\/check_in/
  end

  # Block suspicious requests
  blocklist('block_suspicious') do |req|
    # Block common attack patterns
    req.path.include?('../') ||
    req.path.include?('wp-admin') ||
    req.path.include?('wp-login') ||
    req.path.include?('.php') ||
    req.env['HTTP_USER_AGENT']&.include?('sqlmap') ||
    req.env['HTTP_USER_AGENT']&.include?('nikto')
  end

  # Safelist internal requests
  safelist('allow_localhost') do |req|
    ['127.0.0.1', '::1', 'localhost'].include?(req.ip)
  end

  # Custom response for throttled requests
  self.throttled_response = lambda do |env|
    retry_after = (env['rack.attack.match_data'] || {})[:period]
    [
      429,
      { 'Content-Type' => 'application/json',
        'Retry-After' => retry_after.to_s },
      [{ error: 'Rate limit exceeded', retry_after: retry_after }.to_json]
    ]
  end

  # Log throttled requests
  ActiveSupport::Notifications.subscribe('rack.attack') do |name, start, finish, request_id, payload|
    req = payload[:request]
    Rails.logger.warn("Rate limited request: #{req.env['REQUEST_METHOD']} #{req.env['PATH_INFO']} from #{req.ip}")
  end
end
