# frozen_string_literal: true

class CreateEvents < ActiveRecord::Migration[7.0]
  def change
    create_table :events do |t|
      # Basic Information
      t.references :organizer, null: false, foreign_key: { to_table: :users }
      t.string :title, null: false
      t.text :description, null: false
      t.integer :category, null: false
      t.string :image_url
      t.string :banner_url

      # Date & Time
      t.datetime :start_date, null: false
      t.datetime :end_date, null: false
      t.string :timezone, default: 'UTC'

      # Location
      t.string :venue_name, null: false
      t.text :venue_address, null: false
      t.string :city, null: false
      t.string :state
      t.string :country, null: false
      t.string :postal_code
      t.decimal :latitude, precision: 10, scale: 7, null: false
      t.decimal :longitude, precision: 10, scale: 7, null: false
      t.st_point :location, geographic: true # PostGIS point for geospatial queries

      # Status & Settings
      t.integer :status, default: 0, null: false # 0: draft, 1: published, 2: cancelled, 3: completed
      t.boolean :featured, default: false, null: false
      t.integer :max_attendees
      t.boolean :requires_approval, default: false, null: false

      # SEO & Metadata
      t.string :slug, null: false
      t.string :meta_title
      t.text :meta_description

      # Timestamps
      t.timestamps
    end

    add_index :events, :organizer_id
    add_index :events, :status
    add_index :events, :category
    add_index :events, :start_date
    add_index :events, :end_date
    add_index :events, :slug, unique: true
    add_index :events, :featured
    add_index :events, [:status, :start_date]
    add_index :events, [:category, :status]
    add_index :events, :location, using: :gist # GIST index for PostGIS
    add_index :events, 'to_tsvector(\'english\', title || \' \' || COALESCE(description, \'\'))', using: :gin, name: 'index_events_on_search_vector'
  end
end

