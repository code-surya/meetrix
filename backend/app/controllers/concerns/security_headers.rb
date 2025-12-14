# frozen_string_literal: true

module SecurityHeaders
  extend ActiveSupport::Concern

  included do
    after_action :set_security_headers
  end

  private

  def set_security_headers
    # Prevent clickjacking
    response.headers['X-Frame-Options'] = 'DENY'

    # Prevent MIME type sniffing
    response.headers['X-Content-Type-Options'] = 'nosniff'

    # XSS protection
    response.headers['X-XSS-Protection'] = '1; mode=block'

    # HSTS for HTTPS
    if Rails.env.production? && request.ssl?
      response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
    end

    # Referrer policy
    response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'

    # Content Security Policy
    csp_directives = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://checkout.stripe.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https: blob:",
      "connect-src 'self' wss: https: ws:",
      "frame-src 'self' https://js.stripe.com https://checkout.stripe.com https://hooks.stripe.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'"
    ]

    response.headers['Content-Security-Policy'] = csp_directives.join('; ')

    # Prevent caching of sensitive data
    if sensitive_action?
      response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
      response.headers['Pragma'] = 'no-cache'
      response.headers['Expires'] = '0'
    end
  end

  def sensitive_action?
    # Actions that return sensitive data
    (controller_name == 'auth') ||
    (controller_name == 'users' && action_name == 'show') ||
    (controller_name == 'bookings' && action_name.in?(['show', 'index']))
  end
end

