class CreateBookings < ActiveRecord::Migration[8.1]
  def change
    create_table :bookings do |t|
      t.references :user, null: false, foreign_key: true
      t.references :event, null: false, foreign_key: true

      t.string  :status, default: "pending"
      t.integer :total_amount
      t.integer :discount_amount, default: 0

      t.timestamps
    end
  end
end
