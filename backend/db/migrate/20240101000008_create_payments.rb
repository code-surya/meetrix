# frozen_string_literal: true

class CreatePayments < ActiveRecord::Migration[7.0]
  def change
    create_table :payments do |t|
      t.references :booking, null: false, foreign_key: true
      t.decimal :amount, precision: 10, scale: 2, null: false
      t.string :currency, limit: 3, null: false, default: 'USD'
      t.integer :status, default: 0, null: false # 0: pending, 1: processing, 2: completed, 3: failed, 4: refunded
      t.integer :payment_method, null: false # 0: credit_card, 1: debit_card, 2: bank_transfer, 3: wallet
      t.string :transaction_id
      t.string :payment_intent_id # Stripe payment intent ID
      t.text :payment_method_details # JSON field for payment details
      t.text :failure_reason
      t.decimal :refunded_amount, precision: 10, scale: 2, default: 0.0
      t.datetime :processed_at
      t.datetime :refunded_at

      t.timestamps
    end

    add_index :payments, :booking_id, unique: true # One payment per booking
    add_index :payments, :status
    add_index :payments, :transaction_id
    add_index :payments, :payment_intent_id
    add_index :payments, :created_at
    add_index :payments, [:status, :created_at]
  end
end

