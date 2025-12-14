# frozen_string_literal: true

class AddAdditionalIndexes < ActiveRecord::Migration[7.0]
  def change
    # Composite indexes for common query patterns
    
    # Events - common search patterns
    add_index :events, [:status, :start_date, :category], name: 'index_events_on_status_start_category'
    add_index :events, [:organizer_id, :status], name: 'index_events_on_organizer_status'
    
    # Bookings - user activity queries
    add_index :bookings, [:user_id, :status, :created_at], name: 'index_bookings_on_user_status_created'
    add_index :bookings, [:event_id, :status, :created_at], name: 'index_bookings_on_event_status_created'
    
    # Ticket Types - availability queries
    add_index :ticket_types, [:event_id, :active, :sale_start_date, :sale_end_date], 
              name: 'index_ticket_types_on_availability'
    
    # Notifications - unread notifications
    add_index :notifications, [:user_id, :read, :created_at], 
              name: 'index_notifications_on_user_read_created'
    
    # Reviews - event rating queries
    add_index :reviews, [:event_id, :approved, :rating], 
              name: 'index_reviews_on_event_approved_rating'
    
    # Groups - active groups for events
    add_index :groups, [:event_id, :active, :max_members], 
              name: 'index_groups_on_event_active_max'
  end
end

