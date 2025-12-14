# frozen_string_literal: true

class CreateWebhookLogs < ActiveRecord::Migration[7.0]
  def change
    create_table :webhook_logs do |t|
      t.string :gateway, null: false # 'stripe' or 'razorpay'
      t.string :event_type, null: false
      t.string :event_id
      t.jsonb :payload, null: false
      t.boolean :processed, default: false, null: false
      t.text :error_message
      t.integer :retry_count, default: 0

      t.timestamps
    end

    add_index :webhook_logs, [:gateway, :event_type]
    add_index :webhook_logs, :event_id
    add_index :webhook_logs, :processed
    add_index :webhook_logs, :created_at
  end
end

