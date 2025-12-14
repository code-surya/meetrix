# frozen_string_literal: true

class GroupPolicy < ApplicationPolicy
  def show?
    user_is_member? || admin? || organizer_owns_event?
  end

  def create?
    attendee? || organizer? # Anyone authenticated can create groups
  end

  def update?
    user_is_creator? || user_is_admin_member? || admin?
  end

  def destroy?
    user_is_creator? || admin?
  end

  def add_member?
    user_is_member? && !record.full?
  end

  def remove_member?
    user_is_creator? || user_is_admin_member? || admin?
  end

  def create_booking?
    user_is_member? && record.active?
  end

  class Scope < ApplicationPolicy::Scope
    def resolve
      if user&.admin?
        scope.all
      else
        # Users see groups they're members of or groups for events they organize
        scope.joins(:group_members)
             .where(group_members: { user_id: user.id })
             .or(
               scope.joins(:event)
                    .where(events: { organizer_id: user.id })
             )
      end
    end
  end

  private

  def user_is_member?
    user && record.members.include?(user)
  end

  def user_is_creator?
    user && record.creator_id == user.id
  end

  def user_is_admin_member?
    user && record.group_members.find_by(user: user)&.admin?
  end

  def organizer_owns_event?
    user && user.organizer? && record.event.organizer_id == user.id
  end
end

