# frozen_string_literal: true

class CreateEventAnalytics < ActiveRecord::Migration[7.0]
  def change
    create_table :event_analytics do |t|
      t.references :event, null: false, foreign_key: true
      t.integer :views_count, default: 0, null: false
      t.integer :bookings_count, default: 0, null: false
      t.decimal :revenue, precision: 10, scale: 2, default: 0.0, null: false
      t.integer :unique_visitors, default: 0, null: false
      t.decimal :average_session_duration, precision: 10, scale: 2, default: 0.0
      t.jsonb :demographics # Age groups, locations, etc.
      t.jsonb :traffic_sources # Referrers, campaigns, etc.
      t.datetime :last_updated_at

      t.timestamps
    end

    add_index :event_analytics, :event_id, unique: true
    add_index :event_analytics, :revenue
    add_index :event_analytics, :views_count
  end
end

