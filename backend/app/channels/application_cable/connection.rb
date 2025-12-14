# frozen_string_literal: true

module ApplicationCable
  class Connection < ActionCable::Connection::Base
    identified_by :current_user

    def connect
      self.current_user = find_verified_user
      reject_unauthorized_connection unless current_user
    end

    private

    def find_verified_user
      # Try to get token from query string (WebSocket connection)
      token = request.params[:token] || extract_token_from_headers

      return nil unless token

      decoded = JwtService.decode(token)
      return nil unless decoded

      User.find_by(id: decoded['user_id'], active: true)
    end

    def extract_token_from_headers
      # Check Authorization header
      auth_header = request.headers['Authorization'] ||
                    request.headers['authorization']

      return nil unless auth_header

      auth_header.split(' ').last if auth_header.start_with?('Bearer ')
    end
  end
end

