class AddDiscountFieldsToBookings < ActiveRecord::Migration[8.1]
  def change
    add_column :bookings, :discount_code, :string
    add_column :bookings, :discount_percentage, :integer, default: 0

    add_index :bookings, :discount_code
  end
end
