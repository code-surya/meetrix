# frozen_string_literal: true

class CreateBookingItems < ActiveRecord::Migration[7.0]
  def change
    create_table :booking_items do |t|
      t.references :booking, null: false, foreign_key: true
      t.references :ticket_type, null: false, foreign_key: true
      t.integer :quantity, null: false
      t.decimal :unit_price, precision: 10, scale: 2, null: false

      t.timestamps
    end

    add_index :booking_items, :booking_id
    add_index :booking_items, :ticket_type_id
    add_index :booking_items, [:booking_id, :ticket_type_id]
  end
end

