# frozen_string_literal: true

class CreateUsers < ActiveRecord::Migration[7.0]
  def change
    create_table :users do |t|
      # Authentication
      t.string :email, null: false
      t.string :password_digest, null: false
      t.string :reset_password_token
      t.datetime :reset_password_sent_at
      t.datetime :remember_created_at

      # Profile
      t.string :first_name, null: false
      t.string :last_name, null: false
      t.string :phone
      t.date :date_of_birth
      t.text :bio
      t.string :avatar_url
      t.string :city
      t.string :state
      t.string :country

      # Role & Status
      t.integer :role, default: 0, null: false # 0: attendee, 1: organizer, 2: admin
      t.boolean :active, default: true, null: false
      t.boolean :email_verified, default: false, null: false
      t.datetime :email_verified_at

      # Preferences
      t.boolean :email_notifications_enabled, default: true, null: false
      t.boolean :push_notifications_enabled, default: true, null: false
      t.string :preferred_language, default: 'en'

      # Timestamps
      t.timestamps
    end

    add_index :users, :email, unique: true
    add_index :users, :reset_password_token, unique: true
    add_index :users, :role
    add_index :users, :active
    add_index :users, [:email, :active]
  end
end

