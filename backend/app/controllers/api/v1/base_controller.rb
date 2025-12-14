# frozen_string_literal: true

module Api
  module V1
    class BaseController < ApplicationController
      include Authenticatable
      include Pundit::Authorization
      include RateLimitable
      include SecurityHeaders
      include InputSanitizer

      rescue_from ActiveRecord::RecordNotFound, with: :render_not_found
      rescue_from ActiveRecord::RecordInvalid, with: :render_unprocessable_entity
      rescue_from Pundit::NotAuthorizedError, with: :render_forbidden
      rescue_from JWT::DecodeError, with: :render_unauthorized
      rescue_from JWT::ExpiredSignature, with: :render_unauthorized
      rescue_from StandardError, with: :render_internal_error

      private

      def render_success(data: nil, message: nil, status: :ok)
        response = { success: true }
        response[:data] = data if data.present?
        response[:message] = message if message.present?
        response[:timestamp] = Time.current.to_i

        render json: response, status: status
      end

      def render_error(message: 'An error occurred', errors: nil, status: :unprocessable_entity)
        response = {
          success: false,
          error: {
            message: message,
            timestamp: Time.current.to_i
          }
        }
        response[:error][:errors] = errors if errors.present?

        render json: response, status: status
      end

      def render_not_found(message: 'Resource not found')
        render_error(message: message, status: :not_found)
      end

      def render_forbidden(message: 'Access denied')
        render_error(message: message, status: :forbidden)
      end

      def render_unauthorized(message: 'Unauthorized')
        render_error(message: message, status: :unauthorized)
      end

      def render_unprocessable_entity(exception)
        errors = exception.record&.errors&.full_messages || [exception.message]
        render_error(
          message: 'Validation failed',
          errors: errors,
          status: :unprocessable_entity
        )
      end

      def render_internal_error(exception)
        # Log the error for monitoring
        Rails.logger.error("Internal server error: #{exception.message}")
        Rails.logger.error(exception.backtrace.join("\n")) unless Rails.env.production?

        # Don't expose internal details in production
        message = Rails.env.production? ? 'Internal server error' : exception.message
        render_error(message: message, status: :internal_server_error)
      end

      def pagination_meta(collection)
        {
          current_page: collection.current_page,
          total_pages: collection.total_pages,
          total_count: collection.total_count,
          per_page: collection.limit_value,
          has_next_page: collection.next_page.present?,
          has_prev_page: collection.prev_page.present?
        }
      end
    end
  end
end