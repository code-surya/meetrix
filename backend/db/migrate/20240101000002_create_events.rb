class CreateEvents < ActiveRecord::Migration[8.1]
  def change
    create_table :events do |t|
      t.string  :title, null: false
      t.text    :description
      t.string  :category
      t.datetime :start_time
      t.datetime :end_time
      t.string  :venue_name

      # Location (PostGIS removed – hackathon-safe)
      t.float :latitude
      t.float :longitude

      t.decimal :base_price, precision: 10, scale: 2
      t.integer :capacity
      t.boolean :published, default: false

      t.timestamps
    end

    add_index :events, :category
    add_index :events, :start_time
  end
end
