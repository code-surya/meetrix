# frozen_string_literal: true

module Authenticatable
  extend ActiveSupport::Concern

  included do
    # This concern can be included in controllers that need authentication
    # The actual authentication logic is in BaseController
  end

  private

  def current_user
    @current_user ||= begin
      token = extract_token_from_header
      return nil unless token

      decoded = JwtService.decode(token)
      return nil unless decoded

      # Check if token is blacklisted
      return nil if JwtService.token_blacklisted?(decoded['jti'])

      User.find_by(id: decoded['user_id'])
    end
  end

  def extract_token_from_header
    auth_header = request.headers['Authorization']
    return nil unless auth_header

    auth_header.split(' ').last if auth_header.start_with?('Bearer ')
  end
end

