# API Communication Flow

## Overview
This document describes the API communication patterns, request/response flows, and integration points between the React frontend and Rails backend.

## Authentication Flow

```
┌─────────┐                    ┌─────────┐                    ┌─────────┐
│ Browser │                    │  Rails  │                    │  Redis  │
│ (React) │                    │   API   │                    │         │
└────┬────┘                    └────┬────┘                    └────┬────┘
     │                               │                               │
     │ 1. POST /api/v1/auth/login    │                               │
     │    { email, password }         │                               │
     │──────────────────────────────>│                               │
     │                               │                               │
     │                               │ 2. Validate credentials       │
     │                               │    (Database query)           │
     │                               │                               │
     │                               │ 3. Generate JWT token         │
     │                               │                               │
     │                               │ 4. Store refresh token        │
     │                               │──────────────────────────────>│
     │                               │                               │
     │ 5. Response:                   │                               │
     │    {                           │                               │
     │      access_token: "jwt...",   │                               │
     │      refresh_token: "rt...",   │                               │
     │      user: { ... }             │                               │
     │    }                           │                               │
     │<──────────────────────────────│                               │
     │                               │                               │
     │ 6. Store tokens in            │                               │
     │    localStorage/Redux         │                               │
     │                               │                               │
     │ 7. Add Authorization header    │                               │
     │    to all subsequent requests │                               │
     │                               │                               │
```

## Event Discovery Flow

```
┌─────────┐                    ┌─────────┐                    ┌─────────────┐
│ Browser │                    │  Rails  │                    │ Elasticsearch│
│ (React) │                    │   API   │                    │             │
└────┬────┘                    └────┬────┘                    └────┬────────┘
     │                               │                               │
     │ 1. GET /api/v1/events         │                               │
     │    ?search=music              │                               │
     │    &location=NYC              │                               │
     │    &date=2024-12-01           │                               │
     │    &page=1&per_page=20        │                               │
     │──────────────────────────────>│                               │
     │                               │                               │
     │                               │ 2. Check Redis cache         │
     │                               │                               │
     │                               │ 3. If cache miss:             │
     │                               │    Query Elasticsearch        │
     │                               │──────────────────────────────>│
     │                               │                               │
     │                               │ 4. Elasticsearch results      │
     │                               │<──────────────────────────────│
     │                               │                               │
     │                               │ 5. Enrich with PostgreSQL    │
     │                               │    (full event details)       │
     │                               │                               │
     │                               │ 6. Cache results in Redis     │
     │                               │                               │
     │ 7. Response:                   │                               │
     │    {                           │                               │
     │      events: [...],            │                               │
     │      pagination: {             │                               │
     │        current_page: 1,        │                               │
     │        total_pages: 10,        │                               │
     │        total_count: 200        │                               │
     │      }                          │                               │
     │    }                           │                               │
     │<──────────────────────────────│                               │
     │                               │                               │
     │ 8. Render events in UI        │                               │
     │                               │                               │
```

## Ticket Booking Flow

```
┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
│ Browser │    │  Rails  │    │PostgreSQL│    │ Stripe  │    │ Sidekiq │
│ (React) │    │   API   │    │          │    │         │    │         │
└────┬────┘    └────┬────┘    └────┬────┘    └────┬────┘    └────┬────┘
     │              │              │              │              │
     │ 1. POST /api/v1/bookings    │              │              │
     │    {                        │              │              │
     │      event_id: 123,         │              │              │
     │      ticket_types: [        │              │              │
     │        { id: 1, qty: 2 },   │              │              │
     │        { id: 2, qty: 1 }    │              │              │
     │      ],                      │              │              │
     │      payment_method: "card"  │              │              │
     │    }                         │              │              │
     │─────────────>│              │              │              │
     │              │              │              │              │
     │              │ 2. Validate booking         │              │
     │              │    (availability check)     │              │
     │              │─────────────>│              │              │
     │              │              │              │              │
     │              │ 3. Reserve tickets          │              │
     │              │    (lock inventory)         │              │
     │              │─────────────>│              │              │
     │              │              │              │              │
     │              │ 4. Create payment intent    │              │
     │              │────────────────────────────>│              │
     │              │              │              │              │
     │              │ 5. Payment intent created   │              │
     │              │<────────────────────────────│              │
     │              │              │              │              │
     │ 6. Response:                 │              │              │
     │    {                         │              │              │
     │      booking_id: 456,        │              │              │
     │      client_secret: "pi_..." │              │              │
     │    }                         │              │              │
     │<─────────────│              │              │              │
     │              │              │              │              │
     │ 7. Confirm payment           │              │              │
     │    (Stripe.js)               │              │              │
     │──────────────────────────────>│              │              │
     │              │              │              │              │
     │              │ 8. POST /api/v1/bookings/456/confirm       │
     │              │    { payment_intent_id }    │              │
     │─────────────>│              │              │              │
     │              │              │              │              │
     │              │ 9. Verify payment           │              │
     │              │────────────────────────────>│              │
     │              │              │              │              │
     │              │ 10. Payment confirmed       │              │
     │              │<────────────────────────────│              │
     │              │              │              │              │
     │              │ 11. Create booking record   │              │
     │              │─────────────>│              │              │
     │              │              │              │              │
     │              │ 12. Enqueue notification job               │
     │              │────────────────────────────────────────────>│
     │              │              │              │              │
     │ 13. Response:                │              │              │
     │     {                        │              │              │
     │       booking: { ... },      │              │              │
     │       tickets: [...]         │              │              │
     │     }                        │              │              │
     │<─────────────│              │              │              │
     │              │              │              │              │
     │              │ 14. Send confirmation email │              │
     │              │<────────────────────────────────────────────│
     │              │              │              │              │
```

## Real-time Notifications Flow

```
┌─────────┐                    ┌─────────┐                    ┌─────────┐
│ Browser │                    │ActionCable│                   │  Redis  │
│ (React) │                    │ (Rails)  │                    │         │
└────┬────┘                    └────┬────┘                    └────┬────┘
     │                               │                               │
     │ 1. WebSocket connection       │                               │
     │    (wss://api.example.com/cable)                              │
     │──────────────────────────────>│                               │
     │                               │                               │
     │                               │ 2. Authenticate connection    │
     │                               │    (JWT token)                │
     │                               │                               │
     │ 3. Subscribe to channel       │                               │
     │    { channel: "Notifications",│                               │
     │      user_id: 123 }           │                               │
     │──────────────────────────────>│                               │
     │                               │                               │
     │                               │ 4. Register subscription      │
     │                               │──────────────────────────────>│
     │                               │                               │
     │ 5. Subscription confirmed      │                               │
     │<──────────────────────────────│                               │
     │                               │                               │
     │                               │ 6. New notification created   │
     │                               │    (Sidekiq job)              │
     │                               │<──────────────────────────────│
     │                               │                               │
     │                               │ 7. Broadcast to channel      │
     │                               │                               │
     │ 8. Receive notification       │                               │
     │    {                          │                               │
     │      type: "booking_confirmed",│                               │
     │      message: "...",          │                               │
     │      data: { ... }            │                               │
     │    }                          │                               │
     │<──────────────────────────────│                               │
     │                               │                               │
     │ 9. Update UI (Redux store)    │                               │
     │    Show notification badge    │                               │
     │                               │                               │
```

## Google Maps Integration Flow

```
┌─────────┐                    ┌─────────┐                    ┌─────────────┐
│ Browser │                    │  Rails  │                    │ Google Maps │
│ (React) │                    │   API   │                    │     API     │
└────┬────┘                    └────┬────┘                    └────┬────────┘
     │                               │                               │
     │ 1. User searches location     │                               │
     │    "Times Square, NYC"        │                               │
     │                               │                               │
     │ 2. Direct API call to Google  │                               │
     │    (client-side, API key)     │                               │
     │──────────────────────────────────────────────────────────────>│
     │                               │                               │
     │ 3. Geocoding results          │                               │
     │<──────────────────────────────────────────────────────────────│
     │                               │                               │
     │ 4. POST /api/v1/events/search │                               │
     │    {                          │                               │
     │      latitude: 40.7580,       │                               │
     │      longitude: -73.9855,     │                               │
     │      radius: 10 (km)          │                               │
     │    }                          │                               │
     │─────────────>│                │                               │
     │                               │                               │
     │                               │ 5. Query nearby events        │
     │                               │    (PostGIS/geospatial query) │
     │                               │                               │
     │ 6. Response:                  │                               │
     │    {                          │                               │
     │      events: [...],           │                               │
     │      center: { lat, lng },    │                               │
     │      bounds: { ... }          │                               │
     │    }                          │                               │
     │<─────────────│                │                               │
     │                               │                               │
     │ 7. Render events on map       │                               │
     │    (Google Maps React)        │                               │
     │                               │                               │
```

## Group Booking Flow

```
┌─────────┐                    ┌─────────┐                    ┌─────────┐
│ Browser │                    │  Rails  │                    │ Sidekiq  │
│ (React) │                    │   API   │                    │          │
└────┬────┘                    └────┬────┘                    └────┬─────┘
     │                               │                               │
     │ 1. POST /api/v1/groups        │                               │
     │    {                          │                               │
     │      event_id: 123,           │                               │
     │      name: "Friends Group",   │                               │
     │      max_members: 10          │                               │
     │    }                          │                               │
     │─────────────>│                │                               │
     │                               │                               │
     │                               │ 2. Create group record        │
     │                               │                               │
     │ 3. Response:                   │                               │
     │    {                          │                               │
     │      group: { id: 789, ... },  │                               │
     │      invite_code: "ABC123"     │                               │
     │    }                           │                               │
     │<─────────────│                │                               │
     │                               │                               │
     │ 4. Share invite code          │                               │
     │                               │                               │
     │ 5. POST /api/v1/groups/789/join│                               │
     │    { invite_code: "ABC123" }  │                               │
     │─────────────>│                │                               │
     │                               │                               │
     │                               │ 6. Add member to group        │
     │                               │                               │
     │                               │ 7. Enqueue notification       │                               │
     │                               │──────────────────────────────>│
     │                               │                               │
     │ 8. Response:                   │                               │
     │    { group: { members: [...] }│                               │
     │<─────────────│                │                               │
     │                               │                               │
     │ 9. POST /api/v1/groups/789/book│                               │
     │    { ticket_types: [...] }    │                               │
     │─────────────>│                │                               │
     │                               │                               │
     │                               │ 10. Create group booking      │
     │                               │     (all members)             │
     │                               │                               │
     │                               │ 11. Process payments          │
     │                               │                               │
     │ 12. Response:                  │                               │
     │     { bookings: [...] }        │                               │
     │<─────────────│                │                               │
     │                               │                               │
```

## API Endpoints Summary

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh` - Refresh access token
- `DELETE /api/v1/auth/logout` - User logout

### Events
- `GET /api/v1/events` - List events (with filters)
- `GET /api/v1/events/:id` - Event details
- `POST /api/v1/events` - Create event (organizer)
- `PATCH /api/v1/events/:id` - Update event (organizer)
- `DELETE /api/v1/events/:id` - Delete event (organizer)
- `GET /api/v1/events/nearby` - Nearby events (location-based)

### Tickets
- `GET /api/v1/events/:event_id/tickets` - List ticket types
- `POST /api/v1/events/:event_id/tickets` - Create ticket type (organizer)
- `PATCH /api/v1/tickets/:id` - Update ticket type
- `DELETE /api/v1/tickets/:id` - Delete ticket type

### Bookings
- `POST /api/v1/bookings` - Create booking
- `GET /api/v1/bookings` - User's bookings
- `GET /api/v1/bookings/:id` - Booking details
- `POST /api/v1/bookings/:id/confirm` - Confirm payment
- `DELETE /api/v1/bookings/:id` - Cancel booking

### Groups
- `POST /api/v1/groups` - Create group
- `GET /api/v1/groups/:id` - Group details
- `POST /api/v1/groups/:id/join` - Join group
- `POST /api/v1/groups/:id/book` - Group booking
- `DELETE /api/v1/groups/:id/members/:member_id` - Remove member

### Notifications
- `GET /api/v1/notifications` - List notifications
- `PATCH /api/v1/notifications/:id/read` - Mark as read
- `DELETE /api/v1/notifications/:id` - Delete notification

### Analytics
- `GET /api/v1/events/:id/analytics` - Event analytics (organizer)
- `GET /api/v1/dashboard/overview` - Dashboard overview
- `GET /api/v1/analytics/revenue` - Revenue analytics

### Search
- `GET /api/v1/search/events` - Full-text event search
- `GET /api/v1/search/suggestions` - Search suggestions

## Error Handling

### Standard Error Response Format
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input parameters",
    "details": {
      "email": ["is required"],
      "password": ["must be at least 8 characters"]
    }
  }
}
```

### HTTP Status Codes
- `200 OK` - Successful request
- `201 Created` - Resource created
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `422 Unprocessable Entity` - Validation errors
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error

## Rate Limiting

- **Public endpoints**: 100 requests/minute
- **Authenticated endpoints**: 1000 requests/minute
- **Search endpoints**: 50 requests/minute
- **Payment endpoints**: 10 requests/minute

## CORS Configuration

- **Allowed origins**: Configured per environment
- **Allowed methods**: GET, POST, PATCH, DELETE, OPTIONS
- **Allowed headers**: Authorization, Content-Type
- **Credentials**: Supported for authenticated requests

