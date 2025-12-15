class CreatePayments < ActiveRecord::Migration[8.1]
  def change
    create_table :payments do |t|
      t.references :booking, null: false, foreign_key: true, index: { unique: true }

      t.string  :provider
      t.string  :provider_payment_id
      t.integer :amount
      t.string  :status

      t.timestamps
    end
  end
end
