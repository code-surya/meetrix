# frozen_string_literal: true

class Group < ApplicationRecord
  # Associations
  belongs_to :creator, class_name: 'User', foreign_key: 'creator_id'
  belongs_to :event
  has_many :group_members, dependent: :destroy
  has_many :members, through: :group_members, source: :user
  has_many :bookings, dependent: :destroy

  # Validations
  validates :name, presence: true, length: { maximum: 100 }
  validates :description, length: { maximum: 500 }
  validates :creator_id, presence: true
  validates :event_id, presence: true
  validates :max_members, presence: true, numericality: { only_integer: true, greater_than: 1 }
  validates :invite_code, presence: true, uniqueness: true
  validate :max_members_not_exceeded
  validate :event_not_past

  # Callbacks
  before_validation :generate_invite_code, on: :create
  after_create :add_creator_as_member

  # Scopes
  scope :active, -> { where(active: true) }
  scope :by_event, ->(event_id) { where(event_id: event_id) }
  scope :by_creator, ->(user_id) { where(creator_id: user_id) }

  # Instance methods
  def member_count
    group_members.count
  end

  def full?
    member_count >= max_members
  end

  def can_add_member?
    !full? && active?
  end

  def add_member!(user)
    return false unless can_add_member?
    return false if members.include?(user)

    group_members.create!(user: user)
  end

  def remove_member!(user)
    return false if user == creator # Cannot remove creator

    group_members.find_by(user: user)&.destroy
  end

  def create_group_booking!(booking_params)
    return false unless can_create_booking?

    transaction do
      bookings.create!(booking_params.merge(user: creator))
    end
  end

  def can_create_booking?
    active? && !full? && event.start_date > Time.current
  end

  private

  def generate_invite_code
    loop do
      self.invite_code = SecureRandom.alphanumeric(8).upcase
      break unless Group.exists?(invite_code: invite_code)
    end
  end

  def add_creator_as_member
    group_members.create!(user: creator, role: :admin)
  end

  def max_members_not_exceeded
    return unless max_members.present? && group_members.any?

    if group_members.count > max_members
      errors.add(:max_members, 'cannot be less than current member count')
    end
  end

  def event_not_past
    return unless event.present?

    errors.add(:event, 'has already ended') if event.end_date < Time.current
  end
end

