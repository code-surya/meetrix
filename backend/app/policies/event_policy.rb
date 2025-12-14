# frozen_string_literal: true

class EventPolicy < ApplicationPolicy
  def index?
    true # Anyone can view published events
  end

  def show?
    # Anyone can view published events, organizers can view their own drafts
    record.published? || user_owns_event? || admin?
  end

  def create?
    organizer? # Only organizers can create events
  end

  def update?
    user_owns_event? || admin?
  end

  def destroy?
    user_owns_event? || admin?
  end

  def publish?
    user_owns_event? || admin?
  end

  def cancel?
    user_owns_event? || admin?
  end

  def manage_tickets?
    user_owns_event? || admin?
  end

  def view_analytics?
    user_owns_event? || admin?
  end

  class Scope < ApplicationPolicy::Scope
    def resolve
      if user&.organizer? || user&.admin?
        # Organizers see all their events + published events
        scope.where(organizer_id: user.id).or(
          scope.where(status: :published)
        )
      else
        # Regular users only see published events
        scope.where(status: :published)
      end
    end
  end

  private

  def user_owns_event?
    user && record.organizer_id == user.id
  end
end

