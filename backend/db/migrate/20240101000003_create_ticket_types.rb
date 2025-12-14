# frozen_string_literal: true

class CreateTicketTypes < ActiveRecord::Migration[7.0]
  def change
    create_table :ticket_types do |t|
      t.references :event, null: false, foreign_key: true
      t.string :name, null: false
      t.text :description
      t.decimal :price, precision: 10, scale: 2, null: false
      t.integer :quantity, null: false
      t.integer :sold_quantity, default: 0, null: false
      t.datetime :sale_start_date, null: false
      t.datetime :sale_end_date, null: false
      t.boolean :active, default: true, null: false
      t.integer :sort_order, default: 0

      t.timestamps
    end

    add_index :ticket_types, :event_id
    add_index :ticket_types, [:event_id, :active]
    add_index :ticket_types, :sale_start_date
    add_index :ticket_types, :sale_end_date
    add_index :ticket_types, [:sale_start_date, :sale_end_date, :active]
  end
end

