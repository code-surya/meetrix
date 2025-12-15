class CreateBookingItems < ActiveRecord::Migration[8.1]
  def change
    create_table :booking_items do |t|
      t.references :booking, null: false, foreign_key: true
      t.references :ticket_type, null: false, foreign_key: true

      t.integer :quantity, null: false, default: 1
      t.integer :price, null: false

      t.timestamps
    end
  end
end
