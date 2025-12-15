class AddAdditionalIndexes < ActiveRecord::Migration[8.1]
  def change
    add_index :events, [:start_time, :category],
              name: "index_events_on_start_time_and_category"
  end
end
