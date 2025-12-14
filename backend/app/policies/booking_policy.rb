# frozen_string_literal: true

class BookingPolicy < ApplicationPolicy
  def index?
    user.present? # Authenticated users can view their bookings
  end

  def show?
    user_owns_booking? || admin? || organizer_owns_event?
  end

  def create?
    attendee? || organizer? # Anyone authenticated can book
  end

  def update?
    user_owns_booking? || admin?
  end

  def cancel?
    user_owns_booking? || admin? || organizer_owns_event?
  end

  def refund?
    admin? || organizer_owns_event?
  end

  class Scope < ApplicationPolicy::Scope
    def resolve
      if user&.admin?
        scope.all
      elsif user&.organizer?
        # Organizers see bookings for their events
        scope.joins(:event).where(events: { organizer_id: user.id })
      else
        # Users see only their own bookings
        scope.where(user_id: user.id)
      end
    end
  end

  private

  def user_owns_booking?
    user && record.user_id == user.id
  end

  def organizer_owns_event?
    user && user.organizer? && record.event.organizer_id == user.id
  end
end

