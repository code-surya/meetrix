# frozen_string_literal: true

class JwtService
  SECRET_KEY = Rails.application.credentials.secret_key_base || ENV['SECRET_KEY_BASE']
  ALGORITHM = 'HS256'
  ACCESS_TOKEN_EXPIRY = 15.minutes
  REFRESH_TOKEN_EXPIRY = 7.days

  class << self
    # Encode JWT token with user data
    def encode(payload, expiry = ACCESS_TOKEN_EXPIRY)
      payload[:exp] = expiry.from_now.to_i
      payload[:iat] = Time.current.to_i
      payload[:jti] = SecureRandom.uuid

      JWT.encode(payload, SECRET_KEY, ALGORITHM)
    end

    # Decode and verify JWT token
    def decode(token)
      decoded = JWT.decode(token, SECRET_KEY, true, { algorithm: ALGORITHM })
      decoded[0]
    rescue JWT::DecodeError => e
      Rails.logger.error "JWT Decode Error: #{e.message}"
      nil
    rescue JWT::ExpiredSignature => e
      Rails.logger.error "JWT Expired: #{e.message}"
      nil
    rescue JWT::InvalidJtiError => e
      Rails.logger.error "JWT Invalid JTI: #{e.message}"
      nil
    end

    # Generate access token
    def generate_access_token(user)
      payload = {
        user_id: user.id,
        email: user.email,
        role: user.role,
        type: 'access'
      }
      encode(payload, ACCESS_TOKEN_EXPIRY)
    end

    # Generate refresh token
    def generate_refresh_token(user)
      payload = {
        user_id: user.id,
        type: 'refresh'
      }
      token = encode(payload, REFRESH_TOKEN_EXPIRY)

      # Store refresh token in Redis for revocation
      store_refresh_token(user.id, token)

      token
    end

    # Verify refresh token and return user
    def verify_refresh_token(token)
      decoded = decode(token)
      return nil unless decoded

      return nil unless decoded['type'] == 'refresh'
      return nil unless refresh_token_valid?(decoded['user_id'], token)

      User.find_by(id: decoded['user_id'])
    end

    # Revoke refresh token
    def revoke_refresh_token(user_id, token)
      redis.del(refresh_token_key(user_id, token))
    rescue Redis::BaseError => e
      Rails.logger.error "Redis error revoking refresh token: #{e.message}"
    end

    # Revoke all refresh tokens for a user
    def revoke_all_refresh_tokens(user_id)
      pattern = "refresh_token:#{user_id}:*"
      redis.keys(pattern).each do |key|
        redis.del(key)
      end
    rescue Redis::BaseError => e
      Rails.logger.error "Redis error revoking all refresh tokens: #{e.message}"
    end

    # Check if token is blacklisted
    def token_blacklisted?(jti)
      return false unless jti
      redis.exists?("blacklist:#{jti}")
    rescue Redis::BaseError => e
      Rails.logger.error "Redis error checking blacklist: #{e.message}"
      false # Fail open - allow token if Redis is down
    end

    # Blacklist a token (for logout)
    def blacklist_token(jti, expiry = ACCESS_TOKEN_EXPIRY)
      return unless jti
      redis.setex("blacklist:#{jti}", expiry.to_i, '1')
    rescue Redis::BaseError => e
      Rails.logger.error "Redis error blacklisting token: #{e.message}"
    end

    private

    def redis
      @redis ||= Redis.current
    end

    def store_refresh_token(user_id, token)
      key = refresh_token_key(user_id, token)
      redis.setex(key, REFRESH_TOKEN_EXPIRY.to_i, '1')
    rescue Redis::BaseError => e
      Rails.logger.error "Redis error storing refresh token: #{e.message}"
    end

    def refresh_token_key(user_id, token)
      "refresh_token:#{user_id}:#{Digest::SHA256.hexdigest(token)}"
    end

    def refresh_token_valid?(user_id, token)
      key = refresh_token_key(user_id, token)
      redis.exists?(key)
    rescue Redis::BaseError => e
      Rails.logger.error "Redis error validating refresh token: #{e.message}"
      false
    end
  end
end

