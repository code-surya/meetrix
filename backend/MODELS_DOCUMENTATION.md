# Database Models Documentation

## Overview

This document describes all database models, their relationships, validations, and indexes for the Event Management Platform.

## Model Relationships Diagram

```
User (organizer/attendee)
  ├── organized_events (Event) [1:N]
  ├── bookings (Booking) [1:N]
  ├── reviews (Review) [1:N]
  ├── notifications (Notification) [1:N]
  ├── created_groups (Group) [1:N]
  └── group_memberships (GroupMember) [N:M]

Event
  ├── organizer (User) [N:1]
  ├── ticket_types (TicketType) [1:N]
  ├── bookings (Booking) [1:N]
  ├── reviews (Review) [1:N]
  ├── groups (Group) [1:N]
  └── event_analytics (EventAnalytics) [1:1]

TicketType
  ├── event (Event) [N:1]
  └── booking_items (BookingItem) [1:N]

Booking
  ├── user (User) [N:1]
  ├── event (Event) [N:1]
  ├── group (Group) [N:1, optional]
  ├── booking_items (BookingItem) [1:N]
  └── payment (Payment) [1:1]

BookingItem
  ├── booking (Booking) [N:1]
  └── ticket_type (TicketType) [N:1]

Payment
  └── booking (Booking) [1:1]

Notification
  ├── user (User) [N:1]
  └── notifiable (polymorphic) [N:1]

Review
  ├── user (User) [N:1]
  └── event (Event) [N:1]

Group
  ├── creator (User) [N:1]
  ├── event (Event) [N:1]
  ├── group_members (GroupMember) [1:N]
  └── bookings (Booking) [1:N]

GroupMember
  ├── group (Group) [N:1]
  └── user (User) [N:1]

EventAnalytics
  └── event (Event) [1:1]
```

## Model Details

### User

**Purpose**: Represents both attendees and organizers in the system.

**Fields**:
- `email` (string, required, unique)
- `encrypted_password` (string, required)
- `first_name` (string, required)
- `last_name` (string, required)
- `phone` (string, optional)
- `date_of_birth` (date, optional)
- `bio` (text, optional)
- `avatar_url` (string, optional)
- `city`, `state`, `country` (strings, optional)
- `role` (enum: attendee=0, organizer=1, admin=2)
- `active` (boolean, default: true)
- `email_verified` (boolean, default: false)
- `email_notifications_enabled` (boolean, default: true)
- `push_notifications_enabled` (boolean, default: true)
- `preferred_language` (string, default: 'en')

**Associations**:
- `has_many :organized_events` (as organizer)
- `has_many :bookings` (as attendee)
- `has_many :reviews`
- `has_many :notifications`
- `has_many :created_groups`
- `has_many :group_memberships`

**Validations**:
- Email: presence, uniqueness, format
- First/Last name: presence, max length 50
- Password: minimum 8 characters
- Phone: format validation (if present)

**Indexes**:
- `email` (unique)
- `reset_password_token` (unique)
- `role`
- `active`
- `[email, active]` (composite)

---

### Event

**Purpose**: Represents events that can be organized and attended.

**Fields**:
- `organizer_id` (bigint, required, FK to users)
- `title` (string, required, max 200)
- `description` (text, required, max 5000)
- `category` (enum: music, sports, technology, etc.)
- `image_url`, `banner_url` (strings, optional)
- `start_date`, `end_date` (datetime, required)
- `timezone` (string, default: 'UTC')
- `venue_name` (string, required)
- `venue_address` (text, required)
- `city`, `state`, `country`, `postal_code` (strings)
- `latitude`, `longitude` (decimal, required)
- `location` (PostGIS point, for geospatial queries)
- `status` (enum: draft=0, published=1, cancelled=2, completed=3)
- `featured` (boolean, default: false)
- `max_attendees` (integer, optional)
- `requires_approval` (boolean, default: false)
- `slug` (string, required, unique)
- `meta_title`, `meta_description` (SEO fields)

**Associations**:
- `belongs_to :organizer` (User)
- `has_many :ticket_types`
- `has_many :bookings`
- `has_many :reviews`
- `has_many :groups`
- `has_one :event_analytics`

**Validations**:
- Title, description, venue_name: presence
- Start/end dates: presence, end after start
- Published events: start date in future
- Latitude/longitude: valid ranges
- Location: geocoded from address

**Indexes**:
- `organizer_id`
- `status`
- `category`
- `start_date`, `end_date`
- `slug` (unique)
- `location` (GIST index for PostGIS)
- Full-text search index on title + description
- Composite indexes for common queries

---

### TicketType

**Purpose**: Defines different ticket types for an event (e.g., VIP, General Admission).

**Fields**:
- `event_id` (bigint, required, FK to events)
- `name` (string, required, max 100)
- `description` (text, optional, max 500)
- `price` (decimal, required, >= 0)
- `quantity` (integer, required, > 0)
- `sold_quantity` (integer, default: 0)
- `sale_start_date`, `sale_end_date` (datetime, required)
- `active` (boolean, default: true)
- `sort_order` (integer, default: 0)

**Associations**:
- `belongs_to :event`
- `has_many :booking_items`

**Validations**:
- Name, price, quantity: presence
- Sale dates: end after start, within event dates
- Sold quantity: cannot exceed total quantity

**Indexes**:
- `event_id`
- `[event_id, active]`
- `sale_start_date`, `sale_end_date`
- Composite index for availability queries

---

### Booking

**Purpose**: Represents a user's ticket purchase for an event.

**Fields**:
- `user_id` (bigint, required, FK to users)
- `event_id` (bigint, required, FK to events)
- `group_id` (bigint, optional, FK to groups)
- `booking_reference` (string, required, unique)
- `total_amount` (decimal, required, >= 0)
- `status` (enum: pending=0, confirmed=1, cancelled=2, refunded=3)
- `notes` (text, optional)
- `confirmed_at`, `cancelled_at` (datetime, optional)

**Associations**:
- `belongs_to :user`
- `belongs_to :event`
- `belongs_to :group` (optional)
- `has_many :booking_items`
- `has_one :payment`

**Validations**:
- User, event: presence
- Booking reference: presence, uniqueness
- Event not cancelled
- Event not past

**Indexes**:
- `user_id`
- `event_id`
- `group_id`
- `booking_reference` (unique)
- `status`
- `created_at`
- Composite indexes for user/event queries

---

### BookingItem

**Purpose**: Represents individual ticket purchases within a booking.

**Fields**:
- `booking_id` (bigint, required, FK to bookings)
- `ticket_type_id` (bigint, required, FK to ticket_types)
- `quantity` (integer, required, > 0)
- `unit_price` (decimal, required, >= 0)

**Associations**:
- `belongs_to :booking`
- `belongs_to :ticket_type`

**Validations**:
- Booking, ticket_type: presence
- Quantity: positive integer
- Ticket type available for requested quantity
- Ticket type belongs to booking's event

**Indexes**:
- `booking_id`
- `ticket_type_id`
- `[booking_id, ticket_type_id]`

---

### Payment

**Purpose**: Tracks payment transactions for bookings.

**Fields**:
- `booking_id` (bigint, required, FK to bookings, unique)
- `amount` (decimal, required, > 0)
- `currency` (string, limit 3, default: 'USD')
- `status` (enum: pending=0, processing=1, completed=2, failed=3, refunded=4)
- `payment_method` (enum: credit_card=0, debit_card=1, bank_transfer=2, wallet=3)
- `transaction_id` (string, unique, optional)
- `payment_intent_id` (string, optional, for Stripe)
- `payment_method_details` (text, JSON, optional)
- `failure_reason` (text, optional)
- `refunded_amount` (decimal, default: 0.0)
- `processed_at`, `refunded_at` (datetime, optional)

**Associations**:
- `belongs_to :booking` (1:1 relationship)

**Validations**:
- Booking: presence
- Amount: positive, matches booking total
- Currency: 3 characters

**Indexes**:
- `booking_id` (unique)
- `status`
- `transaction_id`
- `payment_intent_id`
- `created_at`

---

### Notification

**Purpose**: Stores user notifications for real-time updates.

**Fields**:
- `user_id` (bigint, required, FK to users)
- `notifiable_type`, `notifiable_id` (polymorphic, optional)
- `title` (string, required, max 200)
- `message` (text, required, max 1000)
- `notification_type` (enum: booking_confirmed, event_reminder, etc.)
- `read` (boolean, default: false)
- `read_at` (datetime, optional)
- `action_url` (text, optional)
- `metadata` (jsonb, optional)

**Associations**:
- `belongs_to :user`
- `belongs_to :notifiable` (polymorphic)

**Validations**:
- User, title, message: presence
- Notification type: presence

**Indexes**:
- `user_id`
- `[notifiable_type, notifiable_id]`
- `read`
- `notification_type`
- `[user_id, read]`
- `[user_id, created_at]`

---

### Review

**Purpose**: User reviews and ratings for events.

**Fields**:
- `user_id` (bigint, required, FK to users)
- `event_id` (bigint, required, FK to events)
- `rating` (integer, required, 1-5)
- `comment` (text, optional, max 2000)
- `approved` (boolean, default: false)
- `approved_at` (datetime, optional)
- `helpful_count` (integer, default: 0)

**Associations**:
- `belongs_to :user`
- `belongs_to :event`

**Validations**:
- User, event: presence
- Rating: 1-5, integer
- One review per user per event (unique constraint)
- User must have attended event
- Event must be completed

**Indexes**:
- `user_id`
- `event_id`
- `[user_id, event_id]` (unique)
- `rating`
- `approved`
- `[event_id, approved]`
- `[event_id, approved, rating]`

---

### Group

**Purpose**: Represents booking groups for collaborative ticket purchases.

**Fields**:
- `creator_id` (bigint, required, FK to users)
- `event_id` (bigint, required, FK to events)
- `name` (string, required, max 100)
- `description` (text, optional, max 500)
- `max_members` (integer, required, > 1)
- `invite_code` (string, required, unique)
- `active` (boolean, default: true)

**Associations**:
- `belongs_to :creator` (User)
- `belongs_to :event`
- `has_many :group_members`
- `has_many :members` (through group_members)
- `has_many :bookings`

**Validations**:
- Name, creator, event: presence
- Max members: > 1
- Invite code: presence, uniqueness
- Event not past

**Indexes**:
- `creator_id`
- `event_id`
- `invite_code` (unique)
- `active`
- `[event_id, active]`

---

### GroupMember

**Purpose**: Join table for users in groups.

**Fields**:
- `group_id` (bigint, required, FK to groups)
- `user_id` (bigint, required, FK to users)
- `role` (enum: member=0, admin=1)
- `joined_at` (datetime, required)

**Associations**:
- `belongs_to :group`
- `belongs_to :user`

**Validations**:
- Group, user: presence
- One membership per user per group (unique constraint)

**Indexes**:
- `group_id`
- `user_id`
- `[group_id, user_id]` (unique)
- `role`

---

### EventAnalytics

**Purpose**: Stores analytics and metrics for events.

**Fields**:
- `event_id` (bigint, required, FK to events, unique)
- `views_count` (integer, default: 0)
- `bookings_count` (integer, default: 0)
- `revenue` (decimal, default: 0.0)
- `unique_visitors` (integer, default: 0)
- `average_session_duration` (decimal, default: 0.0)
- `demographics` (jsonb, optional)
- `traffic_sources` (jsonb, optional)
- `last_updated_at` (datetime, optional)

**Associations**:
- `belongs_to :event` (1:1 relationship)

**Validations**:
- Event: presence, uniqueness
- Counts: >= 0

**Indexes**:
- `event_id` (unique)
- `revenue`
- `views_count`

---

## Performance Considerations

### Index Strategy

1. **Primary Keys**: All tables have auto-incrementing primary keys
2. **Foreign Keys**: Indexed for join performance
3. **Unique Constraints**: Email, booking_reference, invite_code, etc.
4. **Composite Indexes**: For common query patterns (user + status, event + status)
5. **Full-Text Search**: GIN index on events for PostgreSQL full-text search
6. **Geospatial**: GIST index on event location for PostGIS queries

### Query Optimization

- Use `includes`/`joins` to prevent N+1 queries
- Leverage composite indexes for filtered queries
- Use counter caches for aggregated data (e.g., sold_quantity)
- Materialized views for complex analytics (future enhancement)

### Database Extensions

- **PostGIS**: For geospatial queries on event locations
- **pg_trgm**: For fuzzy text search (optional)
- **uuid-ossp**: For UUID generation (if needed)

## Migration Order

Migrations should be run in this order:
1. Users (no dependencies)
2. Events (depends on Users)
3. TicketTypes (depends on Events)
4. Groups (depends on Users, Events)
5. GroupMembers (depends on Groups, Users)
6. Bookings (depends on Users, Events, Groups)
7. BookingItems (depends on Bookings, TicketTypes)
8. Payments (depends on Bookings)
9. Notifications (depends on Users)
10. Reviews (depends on Users, Events)
11. EventAnalytics (depends on Events)
12. Additional indexes

