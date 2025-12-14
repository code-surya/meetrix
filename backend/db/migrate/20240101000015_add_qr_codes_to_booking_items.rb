# frozen_string_literal: true

class AddQrCodesToBookingItems < ActiveRecord::Migration[7.0]
  def change
    add_column :booking_items, :qr_codes, :jsonb, default: []
    add_index :booking_items, :qr_codes, using: :gin
  end
end

