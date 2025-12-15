class AddPasswordDigestToUsers < ActiveRecord::Migration[8.1]
  def change
    unless column_exists?(:users, :password_digest)
      add_column :users, :password_digest, :string
      add_index  :users, :password_digest
    end
  end
end
