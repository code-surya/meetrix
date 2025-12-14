# frozen_string_literal: true

class ApplicationController < ActionController::API
  include Pundit::Authorization
  include Authenticatable

  # Handle exceptions
  rescue_from Pundit::NotAuthorizedError, with: :pundit_not_authorized

  private

  def pundit_user
    current_user
  end

  def pundit_not_authorized(exception)
    render json: {
      success: false,
      error: {
        message: exception.message || 'Not authorized',
        policy: exception.policy&.class&.name,
        query: exception.query
      }
    }, status: :forbidden
  end
end

