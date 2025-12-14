# Backend Folder Structure

```
backend/
├── app/
│   ├── controllers/
│   │   ├── api/
│   │   │   ├── v1/
│   │   │   │   ├── base_controller.rb
│   │   │   │   ├── auth_controller.rb
│   │   │   │   ├── events_controller.rb
│   │   │   │   ├── tickets_controller.rb
│   │   │   │   ├── bookings_controller.rb
│   │   │   │   ├── groups_controller.rb
│   │   │   │   ├── notifications_controller.rb
│   │   │   │   ├── analytics_controller.rb
│   │   │   │   ├── users_controller.rb
│   │   │   │   └── search_controller.rb
│   │   │   │
│   │   │   └── concerns/
│   │   │       ├── authenticatable.rb
│   │   │       ├── paginatable.rb
│   │   │       └── filterable.rb
│   │   │
│   │   └── application_controller.rb
│   │
│   ├── models/
│   │   ├── user.rb
│   │   ├── event.rb
│   │   ├── ticket_type.rb
│   │   ├── booking.rb
│   │   ├── booking_item.rb
│   │   ├── group.rb
│   │   ├── group_member.rb
│   │   ├── notification.rb
│   │   ├── payment.rb
│   │   ├── event_analytics.rb
│   │   └── concerns/
│   │       ├── searchable.rb
│   │       ├── geocodable.rb
│   │       └── trackable.rb
│   │
│   ├── services/                # Business logic layer
│   │   ├── event_service.rb
│   │   ├── booking_service.rb
│   │   ├── payment_service.rb
│   │   ├── notification_service.rb
│   │   ├── group_booking_service.rb
│   │   ├── analytics_service.rb
│   │   ├── search_service.rb
│   │   ├── geocoding_service.rb
│   │   └── ticket_inventory_service.rb
│   │
│   ├── serializers/             # JSON serialization
│   │   ├── user_serializer.rb
│   │   ├── event_serializer.rb
│   │   ├── ticket_serializer.rb
│   │   ├── booking_serializer.rb
│   │   ├── group_serializer.rb
│   │   └── analytics_serializer.rb
│   │
│   ├── policies/                # Pundit authorization
│   │   ├── event_policy.rb
│   │   ├── booking_policy.rb
│   │   ├── group_policy.rb
│   │   └── analytics_policy.rb
│   │
│   ├── validators/              # Custom validators
│   │   ├── ticket_availability_validator.rb
│   │   ├── booking_date_validator.rb
│   │   └── group_size_validator.rb
│   │
│   ├── jobs/                    # Background jobs (Sidekiq)
│   │   ├── notification_job.rb
│   │   ├── email_job.rb
│   │   ├── analytics_job.rb
│   │   ├── search_index_job.rb
│   │   ├── payment_processing_job.rb
│   │   └── event_reminder_job.rb
│   │
│   ├── mailers/                 # Email templates
│   │   ├── user_mailer.rb
│   │   ├── booking_mailer.rb
│   │   ├── event_mailer.rb
│   │   └── notification_mailer.rb
│   │
│   ├── queries/                 # Query objects
│   │   ├── event_search_query.rb
│   │   ├── nearby_events_query.rb
│   │   └── analytics_query.rb
│   │
│   ├── forms/                   # Form objects
│   │   ├── event_form.rb
│   │   ├── booking_form.rb
│   │   └── group_booking_form.rb
│   │
│   ├── decorators/              # View decorators (optional)
│   │   └── event_decorator.rb
│   │
│   └── channels/                # ActionCable (WebSocket)
│       ├── application_cable/
│       │   ├── channel.rb
│       │   └── connection.rb
│       │
│       └── notifications_channel.rb
│
├── config/
│   ├── application.rb
│   ├── routes.rb
│   ├── database.yml
│   ├── environments/
│   │   ├── development.rb
│   │   ├── production.rb
│   │   └── test.rb
│   ├── initializers/
│   │   ├── cors.rb
│   │   ├── sidekiq.rb
│   │   ├── redis.rb
│   │   ├── elasticsearch.rb
│   │   ├── google_maps.rb
│   │   ├── stripe.rb
│   │   └── sendgrid.rb
│   │
│   └── locales/                 # i18n translations
│       └── en.yml
│
├── db/
│   ├── migrate/
│   │   ├── 001_create_users.rb
│   │   ├── 002_create_events.rb
│   │   ├── 003_create_ticket_types.rb
│   │   ├── 004_create_bookings.rb
│   │   ├── 005_create_groups.rb
│   │   ├── 006_create_notifications.rb
│   │   ├── 007_create_payments.rb
│   │   ├── 008_create_event_analytics.rb
│   │   ├── 009_add_indexes.rb
│   │   └── 010_add_full_text_search.rb
│   │
│   ├── seeds.rb
│   ├── schema.rb
│   └── structure.sql
│
├── lib/
│   ├── tasks/                   # Rake tasks
│   │   ├── elasticsearch.rake
│   │   ├── analytics.rake
│   │   └── cleanup.rake
│   │
│   └── modules/                 # Shared modules
│       ├── geocoding.rb
│       ├── payment_processor.rb
│       └── search_indexer.rb
│
├── spec/                        # RSpec tests
│   ├── models/
│   ├── controllers/
│   ├── services/
│   ├── jobs/
│   ├── requests/                # API integration tests
│   ├── factories/               # FactoryBot
│   ├── fixtures/
│   ├── support/
│   │   ├── database_cleaner.rb
│   │   ├── factory_bot.rb
│   │   └── request_helpers.rb
│   └── rails_helper.rb
│
├── .env.example
├── .gitignore
├── Gemfile
├── Gemfile.lock
├── Rakefile
├── config.ru
└── README.md
```

## Key Backend Patterns

### Architecture Patterns
- **Service Objects**: Encapsulate business logic
- **Query Objects**: Complex database queries
- **Form Objects**: Handle complex form submissions
- **Policy Objects**: Authorization logic (Pundit)
- **Serializer Objects**: JSON response formatting

### API Design
- **RESTful**: Standard REST conventions
- **Versioning**: URL-based (v1, v2)
- **Pagination**: Cursor or offset-based
- **Filtering**: Query parameter-based
- **Sorting**: Flexible sort options

### Database Design
- **Normalized Schema**: 3NF for data integrity
- **Indexes**: Strategic indexes for performance
- **Full-text Search**: PostgreSQL tsvector or Elasticsearch
- **Soft Deletes**: Paranoia gem for logical deletes
- **Audit Trail**: PaperTrail for change tracking

### Background Processing
- **Sidekiq**: Async job processing
- **Scheduled Jobs**: Cron-like scheduling
- **Job Priorities**: High/medium/low priority queues
- **Retry Logic**: Exponential backoff for failures

### Caching Strategy
- **Fragment Caching**: View-level caching
- **Query Caching**: Database query results
- **Counter Caching**: Aggregated counts
- **Redis Cache**: Distributed caching

