# frozen_string_literal: true

class CreateNotifications < ActiveRecord::Migration[7.0]
  def change
    create_table :notifications do |t|
      t.references :user, null: false, foreign_key: true
      t.references :notifiable, polymorphic: true, null: true
      t.string :title, null: false
      t.text :message, null: false
      t.integer :notification_type, null: false
      t.boolean :read, default: false, null: false
      t.datetime :read_at
      t.text :action_url
      t.jsonb :metadata # Additional data for the notification

      t.timestamps
    end

    add_index :notifications, :user_id
    add_index :notifications, [:notifiable_type, :notifiable_id]
    add_index :notifications, :read
    add_index :notifications, :notification_type
    add_index :notifications, [:user_id, :read]
    add_index :notifications, [:user_id, :created_at]
    add_index :notifications, :created_at
  end
end

