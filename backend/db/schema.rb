# This file is auto-generated from the current database state. Although
# this file is based on the actual database schema, it should not be
# directly edited. If you need to modify the schema, create a new migration.

ActiveRecord::Schema[7.0].define(version: 20240101000012) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"
  enable_extension "postgis"

  create_table "booking_items", force: :cascade do |t|
    t.bigint "booking_id", null: false
    t.bigint "ticket_type_id", null: false
    t.integer "quantity", null: false
    t.decimal "unit_price", precision: 10, scale: 2, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["booking_id"], name: "index_booking_items_on_booking_id"
    t.index ["booking_id", "ticket_type_id"], name: "index_booking_items_on_booking_id_and_ticket_type_id"
    t.index ["ticket_type_id"], name: "index_booking_items_on_ticket_type_id"
  end

  create_table "bookings", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.bigint "event_id", null: false
    t.bigint "group_id"
    t.string "booking_reference", null: false
    t.decimal "total_amount", precision: 10, scale: 2, null: false
    t.integer "status", default: 0, null: false
    t.text "notes"
    t.datetime "confirmed_at"
    t.datetime "cancelled_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["booking_reference"], name: "index_bookings_on_booking_reference", unique: true
    t.index ["event_id"], name: "index_bookings_on_event_id"
    t.index ["event_id", "status", "created_at"], name: "index_bookings_on_event_status_created"
    t.index ["event_id", "status"], name: "index_bookings_on_event_status"
    t.index ["group_id"], name: "index_bookings_on_group_id"
    t.index ["status", "created_at"], name: "index_bookings_on_status_created"
    t.index ["status"], name: "index_bookings_on_status"
    t.index ["user_id"], name: "index_bookings_on_user_id"
    t.index ["user_id", "status", "created_at"], name: "index_bookings_on_user_status_created"
    t.index ["user_id", "status"], name: "index_bookings_on_user_status"
  end

  create_table "event_analytics", force: :cascade do |t|
    t.bigint "event_id", null: false
    t.integer "views_count", default: 0, null: false
    t.integer "bookings_count", default: 0, null: false
    t.decimal "revenue", precision: 10, scale: 2, default: "0.0", null: false
    t.integer "unique_visitors", default: 0, null: false
    t.decimal "average_session_duration", precision: 10, scale: 2, default: "0.0"
    t.jsonb "demographics"
    t.jsonb "traffic_sources"
    t.datetime "last_updated_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["event_id"], name: "index_event_analytics_on_event_id", unique: true
    t.index ["revenue"], name: "index_event_analytics_on_revenue"
    t.index ["views_count"], name: "index_event_analytics_on_views_count"
  end

  create_table "events", force: :cascade do |t|
    t.bigint "organizer_id", null: false
    t.string "title", null: false
    t.text "description", null: false
    t.integer "category", null: false
    t.string "image_url"
    t.string "banner_url"
    t.datetime "start_date", null: false
    t.datetime "end_date", null: false
    t.string "timezone", default: "UTC"
    t.string "venue_name", null: false
    t.text "venue_address", null: false
    t.string "city", null: false
    t.string "state"
    t.string "country", null: false
    t.string "postal_code"
    t.decimal "latitude", precision: 10, scale: 7, null: false
    t.decimal "longitude", precision: 10, scale: 7, null: false
    t.st_point "location", geographic: true
    t.integer "status", default: 0, null: false
    t.boolean "featured", default: false, null: false
    t.integer "max_attendees"
    t.boolean "requires_approval", default: false, null: false
    t.string "slug", null: false
    t.string "meta_title"
    t.text "meta_description"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["category", "status"], name: "index_events_on_category_and_status"
    t.index ["category"], name: "index_events_on_category"
    t.index ["end_date"], name: "index_events_on_end_date"
    t.index ["featured"], name: "index_events_on_featured"
    t.index ["location"], name: "index_events_on_location", using: :gist
    t.index ["organizer_id"], name: "index_events_on_organizer_id"
    t.index ["organizer_id", "status"], name: "index_events_on_organizer_status"
    t.index ["slug"], name: "index_events_on_slug", unique: true
    t.index ["start_date"], name: "index_events_on_start_date"
    t.index ["status", "start_date", "category"], name: "index_events_on_status_start_category"
    t.index ["status"], name: "index_events_on_status"
  end

  create_table "group_members", force: :cascade do |t|
    t.bigint "group_id", null: false
    t.bigint "user_id", null: false
    t.integer "role", default: 0, null: false
    t.datetime "joined_at", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["group_id", "user_id"], name: "index_group_members_on_group_id_and_user_id", unique: true
    t.index ["group_id"], name: "index_group_members_on_group_id"
    t.index ["role"], name: "index_group_members_on_role"
    t.index ["user_id"], name: "index_group_members_on_group_members_user_id"
  end

  create_table "groups", force: :cascade do |t|
    t.bigint "creator_id", null: false
    t.bigint "event_id", null: false
    t.string "name", null: false
    t.text "description"
    t.integer "max_members", null: false
    t.string "invite_code", null: false
    t.boolean "active", default: true, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["active"], name: "index_groups_on_active"
    t.index ["creator_id"], name: "index_groups_on_creator_id"
    t.index ["event_id", "active"], name: "index_groups_on_event_id_and_active"
    t.index ["event_id", "active", "max_members"], name: "index_groups_on_event_active_max"
    t.index ["event_id"], name: "index_groups_on_event_id"
    t.index ["invite_code"], name: "index_groups_on_invite_code", unique: true
  end

  create_table "notifications", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.string "notifiable_type"
    t.bigint "notifiable_id"
    t.string "title", null: false
    t.text "message", null: false
    t.integer "notification_type", null: false
    t.boolean "read", default: false, null: false
    t.datetime "read_at"
    t.text "action_url"
    t.jsonb "metadata"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["created_at"], name: "index_notifications_on_created_at"
    t.index ["notifiable_type", "notifiable_id"], name: "index_notifications_on_notifiable"
    t.index ["notification_type"], name: "index_notifications_on_notification_type"
    t.index ["read"], name: "index_notifications_on_read"
    t.index ["user_id", "created_at"], name: "index_notifications_on_user_id_and_created_at"
    t.index ["user_id", "read"], name: "index_notifications_on_user_read"
    t.index ["user_id", "read", "created_at"], name: "index_notifications_on_user_read_created"
    t.index ["user_id"], name: "index_notifications_on_user_id"
  end

  create_table "payments", force: :cascade do |t|
    t.bigint "booking_id", null: false
    t.decimal "amount", precision: 10, scale: 2, null: false
    t.string "currency", limit: 3, null: false, default: "USD"
    t.integer "status", default: 0, null: false
    t.integer "payment_method", null: false
    t.string "transaction_id"
    t.string "payment_intent_id"
    t.text "payment_method_details"
    t.text "failure_reason"
    t.decimal "refunded_amount", precision: 10, scale: 2, default: "0.0"
    t.datetime "processed_at"
    t.datetime "refunded_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["booking_id"], name: "index_payments_on_booking_id", unique: true
    t.index ["created_at"], name: "index_payments_on_created_at"
    t.index ["payment_intent_id"], name: "index_payments_on_payment_intent_id"
    t.index ["status", "created_at"], name: "index_payments_on_status_created"
    t.index ["status"], name: "index_payments_on_status"
    t.index ["transaction_id"], name: "index_payments_on_transaction_id"
  end

  create_table "reviews", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.bigint "event_id", null: false
    t.integer "rating", null: false
    t.text "comment"
    t.boolean "approved", default: false, null: false
    t.datetime "approved_at"
    t.integer "helpful_count", default: 0, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["approved"], name: "index_reviews_on_approved"
    t.index ["created_at"], name: "index_reviews_on_created_at"
    t.index ["event_id", "approved"], name: "index_reviews_on_event_id_and_approved"
    t.index ["event_id", "approved", "rating"], name: "index_reviews_on_event_approved_rating"
    t.index ["event_id"], name: "index_reviews_on_event_id"
    t.index ["rating"], name: "index_reviews_on_rating"
    t.index ["user_id", "event_id"], name: "index_reviews_on_user_id_and_event_id", unique: true
    t.index ["user_id"], name: "index_reviews_on_user_id"
  end

  create_table "ticket_types", force: :cascade do |t|
    t.bigint "event_id", null: false
    t.string "name", null: false
    t.text "description"
    t.decimal "price", precision: 10, scale: 2, null: false
    t.integer "quantity", null: false
    t.integer "sold_quantity", default: 0, null: false
    t.datetime "sale_start_date", null: false
    t.datetime "sale_end_date", null: false
    t.boolean "active", default: true, null: false
    t.integer "sort_order", default: 0
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["event_id", "active", "sale_start_date", "sale_end_date"], name: "index_ticket_types_on_availability"
    t.index ["event_id", "active"], name: "index_ticket_types_on_event_id_and_active"
    t.index ["event_id"], name: "index_ticket_types_on_event_id"
    t.index ["sale_end_date"], name: "index_ticket_types_on_sale_end_date"
    t.index ["sale_start_date", "sale_end_date", "active"], name: "index_ticket_types_on_sale_start_date_and_sale_end_date_and_active"
    t.index ["sale_start_date"], name: "index_ticket_types_on_sale_start_date"
  end

  create_table "users", force: :cascade do |t|
    t.string "email", null: false
    t.string "encrypted_password", null: false
    t.string "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.string "first_name", null: false
    t.string "last_name", null: false
    t.string "phone"
    t.date "date_of_birth"
    t.text "bio"
    t.string "avatar_url"
    t.string "city"
    t.string "state"
    t.string "country"
    t.integer "role", default: 0, null: false
    t.boolean "active", default: true, null: false
    t.boolean "email_verified", default: false, null: false
    t.datetime "email_verified_at"
    t.boolean "email_notifications_enabled", default: true, null: false
    t.boolean "push_notifications_enabled", default: true, null: false
    t.string "preferred_language", default: "en"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["email", "active"], name: "index_users_on_email_and_active"
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
    t.index ["role"], name: "index_users_on_role"
    t.index ["active"], name: "index_users_on_active"
  end

  add_foreign_key "booking_items", "bookings"
  add_foreign_key "booking_items", "ticket_types"
  add_foreign_key "bookings", "events"
  add_foreign_key "bookings", "groups"
  add_foreign_key "bookings", "users"
  add_foreign_key "event_analytics", "events"
  add_foreign_key "events", "users", column: "organizer_id"
  add_foreign_key "group_members", "groups"
  add_foreign_key "group_members", "users"
  add_foreign_key "groups", "events"
  add_foreign_key "groups", "users", column: "creator_id"
  add_foreign_key "notifications", "users"
  add_foreign_key "payments", "bookings"
  add_foreign_key "reviews", "events"
  add_foreign_key "reviews", "users"
  add_foreign_key "ticket_types", "events"
end

