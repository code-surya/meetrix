# frozen_string_literal: true

class AddPasswordDigestToUsers < ActiveRecord::Migration[7.0]
  def change
    # Add password_digest for has_secure_password
    add_column :users, :password_digest, :string, null: false

    # Migrate existing encrypted_password to password_digest if needed
    # This is a one-time migration for existing data
    # User.find_each do |user|
    #   user.update_column(:password_digest, user.encrypted_password) if user.encrypted_password.present?
    # end

    # Remove encrypted_password column (optional, can be kept for backward compatibility)
    # remove_column :users, :encrypted_password, :string
  end
end

