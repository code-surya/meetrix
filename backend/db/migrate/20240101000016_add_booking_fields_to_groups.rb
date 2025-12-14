# frozen_string_literal: true

class AddBookingFieldsToGroups < ActiveRecord::Migration[7.0]
  def change
    add_column :groups, :total_bookings, :integer, default: 0
    add_column :groups, :total_amount, :decimal, precision: 10, scale: 2, default: 0.0
    add_column :groups, :discount_applied, :decimal, precision: 5, scale: 2, default: 0.0
  end
end

