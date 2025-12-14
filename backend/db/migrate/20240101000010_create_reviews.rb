# frozen_string_literal: true

class CreateReviews < ActiveRecord::Migration[7.0]
  def change
    create_table :reviews do |t|
      t.references :user, null: false, foreign_key: true
      t.references :event, null: false, foreign_key: true
      t.integer :rating, null: false # 1-5 stars
      t.text :comment
      t.boolean :approved, default: false, null: false
      t.datetime :approved_at
      t.integer :helpful_count, default: 0, null: false

      t.timestamps
    end

    add_index :reviews, :user_id
    add_index :reviews, :event_id
    add_index :reviews, [:user_id, :event_id], unique: true # One review per user per event
    add_index :reviews, :rating
    add_index :reviews, :approved
    add_index :reviews, [:event_id, :approved]
    add_index :reviews, :created_at
  end
end

