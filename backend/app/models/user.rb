# frozen_string_literal: true

class User < ApplicationRecord
  # Password encryption
  has_secure_password

  # Enums
  enum role: { attendee: 0, organizer: 1, admin: 2 }

  # Associations
  # As organizer
  has_many :organized_events, class_name: 'Event', foreign_key: 'organizer_id', dependent: :destroy

  # As attendee
  has_many :bookings, dependent: :destroy
  has_many :attended_events, through: :bookings, source: :event
  has_many :reviews, dependent: :destroy
  has_many :notifications, dependent: :destroy

  # Group memberships
  has_many :group_memberships, class_name: 'GroupMember', dependent: :destroy
  has_many :groups, through: :group_memberships
  has_many :created_groups, class_name: 'Group', foreign_key: 'creator_id', dependent: :destroy

  # Validations
  validates :email, presence: true, uniqueness: { case_sensitive: false }
  validates :email, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :first_name, presence: true, length: { maximum: 50 }
  validates :last_name, presence: true, length: { maximum: 50 }
  validates :role, presence: true
  validates :password, length: { minimum: 8 }, if: -> { new_record? || !password.nil? }
  validates :phone, format: { with: /\A\+?[\d\s\-()]+\z/ }, allow_blank: true

  # Devise (if using Devise for authentication)
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  # devise :database_authenticatable, :registerable,
  #        :recoverable, :rememberable, :validatable

  # Callbacks
  before_save :normalize_email
  before_save :normalize_phone, if: :phone?

  # Scopes
  scope :organizers, -> { where(role: :organizer) }
  scope :attendees, -> { where(role: :attendee) }
  scope :active, -> { where(active: true) }

  # Instance methods
  def full_name
    "#{first_name} #{last_name}".strip
  end

  def organizer?
    role == 'organizer' || role == 'admin'
  end

  def can_manage_event?(event)
    admin? || (organizer? && event.organizer_id == id)
  end

  private

  def normalize_email
    self.email = email.downcase.strip if email.present?
  end

  def normalize_phone
    self.phone = phone.gsub(/\D/, '') if phone.present?
  end
end

