# frozen_string_literal: true

module PunditAuthorization
  extend ActiveSupport::Concern

  included do
    include Pundit::Authorization
    after_action :verify_authorized, except: [:index]
    after_action :verify_policy_scoped, only: [:index]
  end

  private

  def pundit_user
    current_user
  end
end

