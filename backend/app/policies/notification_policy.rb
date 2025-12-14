# frozen_string_literal: true

class NotificationPolicy < ApplicationPolicy
  def show?
    user_owns_notification?
  end

  def update?
    user_owns_notification?
  end

  def destroy?
    user_owns_notification?
  end

  class Scope < ApplicationPolicy::Scope
    def resolve
      scope.where(user_id: user.id)
    end
  end

  private

  def user_owns_notification?
    user && record.user_id == user.id
  end
end

