# frozen_string_literal: true

class CreateGroupMembers < ActiveRecord::Migration[7.0]
  def change
    create_table :group_members do |t|
      t.references :group, null: false, foreign_key: true
      t.references :user, null: false, foreign_key: true
      t.integer :role, default: 0, null: false # 0: member, 1: admin
      t.datetime :joined_at, null: false

      t.timestamps
    end

    add_index :group_members, :group_id
    add_index :group_members, :user_id
    add_index :group_members, [:group_id, :user_id], unique: true
    add_index :group_members, :role
  end
end

