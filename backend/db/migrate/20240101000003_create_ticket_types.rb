class CreateTicketTypes < ActiveRecord::Migration[8.1]
  def change
    create_table :ticket_types do |t|
      t.references :event, null: false, foreign_key: true
      t.string :name, null: false
      t.decimal :price, precision: 10, scale: 2
      t.integer :quantity

      t.timestamps
    end

    # IMPORTANT:
    # Do NOT add add_index :ticket_types, :event_id
    # t.references already creates the index automatically
  end
end
