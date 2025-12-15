class CreateGroups < ActiveRecord::Migration[8.1]
  def change
    create_table :groups do |t|
      t.string :name, null: false
      t.text :description

      # creator is a User
      t.references :creator, null: false, foreign_key: { to_table: :users }

      t.timestamps
    end

    # IMPORTANT:
    # Do NOT add add_index :groups, :creator_id
    # t.references already creates this index automatically
  end
end
