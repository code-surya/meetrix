# frozen_string_literal: true

class CreateBookings < ActiveRecord::Migration[7.0]
  def change
    create_table :bookings do |t|
      t.references :user, null: false, foreign_key: true
      t.references :event, null: false, foreign_key: true
      t.references :group, null: true, foreign_key: true
      t.string :booking_reference, null: false
      t.decimal :total_amount, precision: 10, scale: 2, null: false
      t.integer :status, default: 0, null: false # 0: pending, 1: confirmed, 2: cancelled, 3: refunded
      t.text :notes
      t.datetime :confirmed_at
      t.datetime :cancelled_at

      t.timestamps
    end

    add_index :bookings, :user_id
    add_index :bookings, :event_id
    add_index :bookings, :group_id
    add_index :bookings, :booking_reference, unique: true
    add_index :bookings, :status
    add_index :bookings, [:user_id, :status]
    add_index :bookings, [:event_id, :status]
    add_index :bookings, :created_at
    add_index :bookings, [:status, :created_at]
  end
end

