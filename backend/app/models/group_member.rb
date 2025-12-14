# frozen_string_literal: true

class GroupMember < ApplicationRecord
  # Enums
  enum role: { member: 0, admin: 1 }

  # Associations
  belongs_to :group
  belongs_to :user

  # Validations
  validates :group_id, presence: true
  validates :user_id, presence: true
  validates :user_id, uniqueness: { scope: :group_id, message: 'is already a member of this group' }
  validates :role, presence: true

  # Callbacks
  after_create :send_notification
  after_destroy :notify_group

  # Scopes
  scope :admins, -> { where(role: :admin) }
  scope :regular_members, -> { where(role: :member) }

  private

  def send_notification
    Notification.create!(
      user: user,
      notification_type: :group_invitation,
      title: "You've been added to a group",
      message: "You've been added to the group '#{group.name}' for #{group.event.title}",
      notifiable: group
    )
  end

  def notify_group
    # Notify remaining members when someone leaves
    group.members.each do |member|
      next if member == user

      Notification.create!(
        user: member,
        notification_type: :general,
        title: 'Group member left',
        message: "#{user.full_name} left the group '#{group.name}'",
        notifiable: group
      )
    end
  end
end

