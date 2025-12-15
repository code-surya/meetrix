# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2024_01_01_000017) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "booking_items", force: :cascade do |t|
    t.bigint "booking_id", null: false
    t.datetime "created_at", null: false
    t.integer "price", null: false
    t.jsonb "qr_codes", default: []
    t.integer "quantity", default: 1, null: false
    t.bigint "ticket_type_id", null: false
    t.datetime "updated_at", null: false
    t.index ["booking_id"], name: "index_booking_items_on_booking_id"
    t.index ["qr_codes"], name: "index_booking_items_on_qr_codes", using: :gin
    t.index ["ticket_type_id"], name: "index_booking_items_on_ticket_type_id"
  end

  create_table "bookings", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.integer "discount_amount", default: 0
    t.string "discount_code"
    t.integer "discount_percentage", default: 0
    t.bigint "event_id", null: false
    t.string "status", default: "pending"
    t.integer "total_amount"
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.index ["discount_code"], name: "index_bookings_on_discount_code"
    t.index ["event_id"], name: "index_bookings_on_event_id"
    t.index ["user_id"], name: "index_bookings_on_user_id"
  end

  create_table "event_analytics", force: :cascade do |t|
    t.integer "bookings", default: 0
    t.datetime "created_at", null: false
    t.bigint "event_id", null: false
    t.integer "revenue", default: 0
    t.datetime "updated_at", null: false
    t.integer "views", default: 0
    t.index ["event_id"], name: "index_event_analytics_on_event_id"
  end

  create_table "events", force: :cascade do |t|
    t.decimal "base_price", precision: 10, scale: 2
    t.integer "capacity"
    t.string "category"
    t.datetime "created_at", null: false
    t.text "description"
    t.datetime "end_time"
    t.float "latitude"
    t.float "longitude"
    t.boolean "published", default: false
    t.datetime "start_time"
    t.string "title", null: false
    t.datetime "updated_at", null: false
    t.string "venue_name"
    t.index ["category"], name: "index_events_on_category"
    t.index ["start_time", "category"], name: "index_events_on_start_time_and_category"
    t.index ["start_time"], name: "index_events_on_start_time"
  end

  create_table "group_members", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.bigint "group_id", null: false
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.index ["group_id"], name: "index_group_members_on_group_id"
    t.index ["user_id"], name: "index_group_members_on_user_id"
  end

  create_table "groups", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.bigint "creator_id", null: false
    t.text "description"
    t.decimal "discount_applied", precision: 5, scale: 2, default: "0.0"
    t.string "name", null: false
    t.decimal "total_amount", precision: 10, scale: 2, default: "0.0"
    t.integer "total_bookings", default: 0
    t.datetime "updated_at", null: false
    t.index ["creator_id"], name: "index_groups_on_creator_id"
  end

  create_table "notifications", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.text "message"
    t.boolean "read", default: false
    t.string "title"
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.index ["user_id"], name: "index_notifications_on_user_id"
  end

  create_table "payments", force: :cascade do |t|
    t.integer "amount"
    t.bigint "booking_id", null: false
    t.datetime "created_at", null: false
    t.string "provider"
    t.string "provider_payment_id"
    t.string "status"
    t.datetime "updated_at", null: false
    t.index ["booking_id"], name: "index_payments_on_booking_id", unique: true
  end

  create_table "reviews", force: :cascade do |t|
    t.text "comment"
    t.datetime "created_at", null: false
    t.bigint "event_id", null: false
    t.integer "rating", null: false
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.index ["event_id"], name: "index_reviews_on_event_id"
    t.index ["user_id", "event_id"], name: "index_reviews_on_user_id_and_event_id", unique: true
    t.index ["user_id"], name: "index_reviews_on_user_id"
  end

  create_table "ticket_types", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.bigint "event_id", null: false
    t.string "name", null: false
    t.decimal "price", precision: 10, scale: 2
    t.integer "quantity"
    t.datetime "updated_at", null: false
    t.index ["event_id"], name: "index_ticket_types_on_event_id"
  end

  create_table "users", force: :cascade do |t|
    t.boolean "active", default: true, null: false
    t.string "avatar_url"
    t.text "bio"
    t.string "city"
    t.string "country"
    t.datetime "created_at", null: false
    t.date "date_of_birth"
    t.string "email", null: false
    t.boolean "email_notifications_enabled", default: true, null: false
    t.boolean "email_verified", default: false, null: false
    t.datetime "email_verified_at"
    t.string "first_name", null: false
    t.string "last_name", null: false
    t.string "password_digest", null: false
    t.string "phone"
    t.string "preferred_language", default: "en"
    t.boolean "push_notifications_enabled", default: true, null: false
    t.datetime "remember_created_at"
    t.datetime "reset_password_sent_at"
    t.string "reset_password_token"
    t.integer "role", default: 0, null: false
    t.string "state"
    t.datetime "updated_at", null: false
    t.index ["active"], name: "index_users_on_active"
    t.index ["email", "active"], name: "index_users_on_email_and_active"
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
    t.index ["role"], name: "index_users_on_role"
  end

  create_table "webhook_logs", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.text "error_message"
    t.string "event_id"
    t.string "event_type", null: false
    t.string "gateway", null: false
    t.jsonb "payload", null: false
    t.boolean "processed", default: false, null: false
    t.integer "retry_count", default: 0
    t.datetime "updated_at", null: false
    t.index ["created_at"], name: "index_webhook_logs_on_created_at"
    t.index ["event_id"], name: "index_webhook_logs_on_event_id"
    t.index ["gateway", "event_type"], name: "index_webhook_logs_on_gateway_and_event_type"
    t.index ["processed"], name: "index_webhook_logs_on_processed"
  end

  add_foreign_key "booking_items", "bookings"
  add_foreign_key "booking_items", "ticket_types"
  add_foreign_key "bookings", "events"
  add_foreign_key "bookings", "users"
  add_foreign_key "event_analytics", "events"
  add_foreign_key "group_members", "groups"
  add_foreign_key "group_members", "users"
  add_foreign_key "groups", "users", column: "creator_id"
  add_foreign_key "notifications", "users"
  add_foreign_key "payments", "bookings"
  add_foreign_key "reviews", "events"
  add_foreign_key "reviews", "users"
  add_foreign_key "ticket_types", "events"
end
