# Event Management API Documentation

## Base URL
```
http://localhost:3000/api/v1
```

## Authentication
All endpoints (except public GET requests) require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <access_token>
```

---

## Events API

### 1. Get Events List

**Endpoint:** `GET /api/v1/events`

**Description:** Retrieve a paginated list of events with optional filters.

**Authentication:** Optional (public can view published events, authenticated users see more)

**Query Parameters:**

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `status` | string | Filter by status (draft, published, cancelled, completed) | `status=published` |
| `category` | string | Filter by category | `category=music` |
| `start_date_from` | date | Events starting from this date | `start_date_from=2024-01-01` |
| `start_date_to` | date | Events starting until this date | `start_date_to=2024-12-31` |
| `upcoming` | boolean | Show only upcoming events | `upcoming=true` |
| `past` | boolean | Show only past events | `past=true` |
| `latitude` | float | Location filter - latitude | `latitude=40.7128` |
| `longitude` | float | Location filter - longitude | `longitude=-74.0060` |
| `radius` | float | Location filter - radius in km (default: 10) | `radius=25` |
| `city` | string | Filter by city | `city=new york` |
| `state` | string | Filter by state | `state=ny` |
| `country` | string | Filter by country | `country=usa` |
| `min_price` | float | Minimum ticket price | `min_price=10` |
| `max_price` | float | Maximum ticket price | `max_price=100` |
| `organizer_id` | integer | Filter by organizer ID | `organizer_id=1` |
| `sort_by` | string | Sort field (date, price, created_at, title, popularity) | `sort_by=date` |
| `sort_order` | string | Sort direction (asc, desc) | `sort_order=desc` |
| `page` | integer | Page number (default: 1) | `page=2` |
| `per_page` | integer | Items per page (default: 20, max: 100) | `per_page=50` |

**Example Request:**
```bash
GET /api/v1/events?category=music&upcoming=true&sort_by=date&sort_order=asc&page=1&per_page=20
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "events": [
      {
        "id": 1,
        "title": "Summer Music Festival",
        "description": "A great music festival...",
        "category": "music",
        "status": "published",
        "slug": "summer-music-festival",
        "start_date": "2024-07-15T18:00:00Z",
        "end_date": "2024-07-15T23:00:00Z",
        "timezone": "UTC",
        "venue": {
          "name": "Central Park",
          "address": "123 Park Ave",
          "city": "New York",
          "state": "NY",
          "country": "USA",
          "postal_code": "10001"
        },
        "location": {
          "latitude": 40.7128,
          "longitude": -74.0060
        },
        "image_url": "https://example.com/image.jpg",
        "banner_url": "https://example.com/banner.jpg",
        "featured": true,
        "statistics": {
          "total_tickets_sold": 150,
          "available_tickets": 350,
          "min_price": 25.0,
          "max_price": 150.0,
          "average_rating": 4.5
        },
        "created_at": "2024-01-01T10:00:00Z",
        "updated_at": "2024-01-15T14:30:00Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 5,
      "total_count": 100,
      "per_page": 20,
      "has_next_page": true,
      "has_prev_page": false
    }
  }
}
```

---

### 2. Get Event Details

**Endpoint:** `GET /api/v1/events/:id`

**Description:** Retrieve detailed information about a specific event.

**Authentication:** Optional (public can view published events)

**Path Parameters:**
- `id` (integer, required) - Event ID

**Query Parameters:**
- `include_reviews` (boolean, optional) - Include reviews in response

**Example Request:**
```bash
GET /api/v1/events/1?include_reviews=true
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "event": {
      "id": 1,
      "title": "Summer Music Festival",
      "description": "A great music festival...",
      "category": "music",
      "status": "published",
      "slug": "summer-music-festival",
      "start_date": "2024-07-15T18:00:00Z",
      "end_date": "2024-07-15T23:00:00Z",
      "timezone": "UTC",
      "venue": {
        "name": "Central Park",
        "address": "123 Park Ave",
        "city": "New York",
        "state": "NY",
        "country": "USA",
        "postal_code": "10001"
      },
      "location": {
        "latitude": 40.7128,
        "longitude": -74.0060
      },
      "organizer": {
        "id": 5,
        "name": "John Doe",
        "email": "john@example.com"
      },
      "ticket_types": [
        {
          "id": 1,
          "name": "General Admission",
          "description": "Standard ticket",
          "price": 25.0,
          "quantity": 500,
          "sold_quantity": 150,
          "available_quantity": 350,
          "on_sale": true,
          "sale_start_date": "2024-01-01T00:00:00Z",
          "sale_end_date": "2024-07-15T18:00:00Z"
        },
        {
          "id": 2,
          "name": "VIP",
          "description": "VIP access",
          "price": 150.0,
          "quantity": 50,
          "sold_quantity": 30,
          "available_quantity": 20,
          "on_sale": true,
          "sale_start_date": "2024-01-01T00:00:00Z",
          "sale_end_date": "2024-07-15T18:00:00Z"
        }
      ],
      "statistics": {
        "total_tickets_sold": 180,
        "available_tickets": 370,
        "sold_out": false,
        "average_rating": 4.5,
        "total_reviews": 25,
        "total_revenue": 9750.0
      },
      "is_upcoming": true,
      "is_past": false,
      "reviews": [
        {
          "id": 1,
          "rating": 5,
          "comment": "Amazing event!",
          "user": {
            "id": 10,
            "name": "Jane Smith"
          },
          "created_at": "2024-07-20T10:00:00Z"
        }
      ],
      "created_at": "2024-01-01T10:00:00Z",
      "updated_at": "2024-01-15T14:30:00Z"
    }
  }
}
```

---

### 3. Create Event

**Endpoint:** `POST /api/v1/events`

**Description:** Create a new event (organizer only).

**Authentication:** Required (organizer role)

**Request Body:**
```json
{
  "event": {
    "title": "Summer Music Festival",
    "description": "A great music festival with multiple artists",
    "category": "music",
    "image_url": "https://example.com/image.jpg",
    "banner_url": "https://example.com/banner.jpg",
    "start_date": "2024-07-15T18:00:00Z",
    "end_date": "2024-07-15T23:00:00Z",
    "timezone": "America/New_York",
    "venue_name": "Central Park",
    "venue_address": "123 Park Avenue",
    "city": "New York",
    "state": "NY",
    "country": "USA",
    "postal_code": "10001",
    "latitude": 40.7128,
    "longitude": -74.0060,
    "max_attendees": 500,
    "requires_approval": false,
    "featured": false,
    "meta_title": "Summer Music Festival 2024",
    "meta_description": "Join us for an amazing music festival"
  }
}
```

**Example Response:**
```json
{
  "success": true,
  "message": "Event created successfully",
  "data": {
    "event": {
      "id": 1,
      "title": "Summer Music Festival",
      ...
    }
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "message": "Event creation failed",
    "errors": [
      "Title can't be blank",
      "Start date must be in the future"
    ]
  }
}
```

---

### 4. Update Event

**Endpoint:** `PATCH /api/v1/events/:id` or `PUT /api/v1/events/:id`

**Description:** Update an existing event (organizer who owns the event or admin).

**Authentication:** Required

**Path Parameters:**
- `id` (integer, required) - Event ID

**Request Body:** (same as create, all fields optional)

**Example Request:**
```bash
PATCH /api/v1/events/1
Authorization: Bearer <token>
Content-Type: application/json

{
  "event": {
    "title": "Updated Event Title",
    "description": "Updated description"
  }
}
```

**Example Response:**
```json
{
  "success": true,
  "message": "Event updated successfully",
  "data": {
    "event": { ... }
  }
}
```

---

### 5. Delete Event

**Endpoint:** `DELETE /api/v1/events/:id`

**Description:** Delete an event (organizer who owns the event or admin).

**Authentication:** Required

**Path Parameters:**
- `id` (integer, required) - Event ID

**Example Request:**
```bash
DELETE /api/v1/events/1
Authorization: Bearer <token>
```

**Example Response:**
```json
{
  "success": true,
  "message": "Event deleted successfully"
}
```

---

### 6. Publish Event

**Endpoint:** `PATCH /api/v1/events/:id/publish`

**Description:** Publish a draft event (make it visible to public).

**Authentication:** Required (organizer who owns the event)

**Path Parameters:**
- `id` (integer, required) - Event ID

**Example Request:**
```bash
PATCH /api/v1/events/1/publish
Authorization: Bearer <token>
```

**Example Response:**
```json
{
  "success": true,
  "message": "Event published successfully",
  "data": {
    "event": { ... }
  }
}
```

**Error Response (if event cannot be published):**
```json
{
  "success": false,
  "error": {
    "message": "Event cannot be published. Please check required fields.",
    "errors": [
      "Ticket types must have at least one ticket type",
      "Start date must be in the future"
    ]
  }
}
```

---

### 7. Cancel Event

**Endpoint:** `PATCH /api/v1/events/:id/cancel`

**Description:** Cancel a published or draft event.

**Authentication:** Required (organizer who owns the event)

**Path Parameters:**
- `id` (integer, required) - Event ID

**Example Request:**
```bash
PATCH /api/v1/events/1/cancel
Authorization: Bearer <token>
```

**Example Response:**
```json
{
  "success": true,
  "message": "Event cancelled successfully",
  "data": {
    "event": { ... }
  }
}
```

---

### 8. Search Events

**Endpoint:** `GET /api/v1/events/search`

**Description:** Full-text search for events by keywords.

**Authentication:** Optional

**Query Parameters:**

| Parameter | Type | Description | Required |
|-----------|------|-------------|----------|
| `q` | string | Search query | Yes |
| `category` | string | Filter by category | No |
| `lat` | float | Location filter - latitude | No |
| `lng` | float | Location filter - longitude | No |
| `radius` | float | Location filter - radius in km | No |
| `page` | integer | Page number | No |
| `per_page` | integer | Items per page | No |

**Example Request:**
```bash
GET /api/v1/events/search?q=music festival&category=music&page=1&per_page=20
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "query": "music festival",
    "events": [ ... ],
    "pagination": {
      "current_page": 1,
      "total_pages": 3,
      "total_count": 45,
      "per_page": 20,
      "has_next_page": true,
      "has_prev_page": false
    }
  }
}
```

---

### 9. Get Event Analytics

**Endpoint:** `GET /api/v1/events/:id/analytics`

**Description:** Get analytics for an event (organizer who owns the event or admin).

**Authentication:** Required

**Path Parameters:**
- `id` (integer, required) - Event ID

**Example Request:**
```bash
GET /api/v1/events/1/analytics
Authorization: Bearer <token>
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "analytics": {
      "views_count": 1250,
      "bookings_count": 180,
      "revenue": 9750.0,
      "conversion_rate": 14.4,
      "average_revenue_per_booking": 54.17,
      "total_tickets_sold": 180,
      "available_tickets": 370,
      "average_rating": 4.5,
      "total_reviews": 25
    }
  }
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": {
    "message": "Search query is required"
  }
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": {
    "message": "Unauthorized"
  }
}
```

### 403 Forbidden
```json
{
  "success": false,
  "error": {
    "message": "You can only manage your own events"
  }
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": {
    "message": "Event not found"
  }
}
```

### 422 Unprocessable Entity
```json
{
  "success": false,
  "error": {
    "message": "Event creation failed",
    "errors": [
      "Title can't be blank",
      "Start date must be in the future"
    ]
  }
}
```

---

## Filter Examples

### Filter by Date Range
```
GET /api/v1/events?start_date_from=2024-01-01&start_date_to=2024-12-31
```

### Filter by Location (Radius)
```
GET /api/v1/events?latitude=40.7128&longitude=-74.0060&radius=25
```

### Filter by Price Range
```
GET /api/v1/events?min_price=10&max_price=100
```

### Filter by Category and Sort
```
GET /api/v1/events?category=music&sort_by=date&sort_order=desc
```

### Combined Filters
```
GET /api/v1/events?category=music&upcoming=true&latitude=40.7128&longitude=-74.0060&radius=10&min_price=20&max_price=150&sort_by=popularity&sort_order=desc&page=1&per_page=20
```

---

## Pagination

All list endpoints support pagination:

- `page`: Page number (default: 1)
- `per_page`: Items per page (default: 20, max: 100)

Pagination metadata is included in the response:
```json
{
  "pagination": {
    "current_page": 1,
    "total_pages": 5,
    "total_count": 100,
    "per_page": 20,
    "has_next_page": true,
    "has_prev_page": false
  }
}
```

---

## Rate Limiting

- Public endpoints: 100 requests/minute
- Authenticated endpoints: 1000 requests/minute
- Search endpoints: 50 requests/minute

