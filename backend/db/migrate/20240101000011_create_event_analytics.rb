class CreateEventAnalytics < ActiveRecord::Migration[8.1]
  def change
    create_table :event_analytics do |t|
      t.references :event, null: false, foreign_key: true

      t.integer :views,        default: 0
      t.integer :bookings,     default: 0
      t.integer :revenue,      default: 0

      t.timestamps
    end
  end
end
