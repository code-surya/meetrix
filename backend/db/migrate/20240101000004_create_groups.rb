# frozen_string_literal: true

class CreateGroups < ActiveRecord::Migration[7.0]
  def change
    create_table :groups do |t|
      t.references :creator, null: false, foreign_key: { to_table: :users }
      t.references :event, null: false, foreign_key: true
      t.string :name, null: false
      t.text :description
      t.integer :max_members, null: false
      t.string :invite_code, null: false
      t.boolean :active, default: true, null: false

      t.timestamps
    end

    add_index :groups, :creator_id
    add_index :groups, :event_id
    add_index :groups, :invite_code, unique: true
    add_index :groups, :active
    add_index :groups, [:event_id, :active]
  end
end

