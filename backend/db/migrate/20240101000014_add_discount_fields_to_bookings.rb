# frozen_string_literal: true

class AddDiscountFieldsToBookings < ActiveRecord::Migration[7.0]
  def change
    add_column :bookings, :discount_amount, :decimal, precision: 10, scale: 2, default: 0.0
    add_column :bookings, :discount_percentage, :decimal, precision: 5, scale: 2, default: 0.0
    add_column :bookings, :published_at, :datetime
  end
end

