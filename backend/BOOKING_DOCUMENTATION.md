# Booking and Ticketing API Documentation

## Overview

This document describes the booking and ticketing system with support for single bookings, group bookings with discounts, seat availability checks, QR code generation, and booking status tracking.

## Service Objects

### 1. BookingService

Handles single ticket bookings with the following features:
- Ticket availability validation
- Ticket reservation (with rollback on failure)
- Booking creation
- Payment record creation
- QR code generation
- Notification sending

**Usage:**
```ruby
service = BookingService.new(user, event, ticket_requests)
if service.create
  booking = service.booking
  # Booking created successfully
else
  errors = service.errors
  # Handle errors
end
```

### 2. GroupBookingService

Handles group bookings with automatic discount calculation:
- Discount tiers:
  - 5-9 people: 5% discount
  - 10-19 people: 10% discount
  - 20-49 people: 15% discount
  - 50+ people: 20% discount
- Creates individual bookings for each group member
- Applies discount to each booking

**Usage:**
```ruby
service = GroupBookingService.new(group, ticket_requests)
if service.create
  bookings = service.bookings
  # All group bookings created
else
  errors = service.errors
  # Handle errors
end
```

### 3. TicketAvailabilityService

Checks ticket availability:
- Single ticket type availability
- Bulk availability check
- Real-time availability status

**Usage:**
```ruby
service = TicketAvailabilityService.new(event)

# Check single ticket type
result = service.check_availability(ticket_type_id, quantity)

# Check all ticket types
result = service.check_all_availability

# Check bulk availability
result = service.check_bulk_availability(ticket_requests)
```

### 4. QrCodeService

Generates and verifies QR codes for tickets:
- Generates QR code with booking and ticket information
- Returns base64 encoded image
- Verifies QR codes for ticket validation

**Usage:**
```ruby
# Generate QR code
qr_data = {
  booking_reference: "ABC123",
  ticket_type_id: 1,
  ticket_number: "ABC123-1-1",
  event_id: 1,
  user_id: 1
}
qr_code = QrCodeService.generate(qr_data)

# Verify QR code
result = QrCodeService.verify(qr_data_string)
if result[:valid]
  # QR code is valid
end
```

## API Endpoints

### 1. Create Booking

**Endpoint:** `POST /api/v1/bookings`

**Description:** Create a single ticket booking or group booking.

**Authentication:** Required

**Request Body (Single Booking):**
```json
{
  "event_id": 1,
  "ticket_requests": [
    {
      "ticket_type_id": 1,
      "quantity": 2
    },
    {
      "ticket_type_id": 2,
      "quantity": 1
    }
  ]
}
```

**Request Body (Group Booking):**
```json
{
  "event_id": 1,
  "group_id": 5,
  "ticket_requests": [
    {
      "ticket_type_id": 1,
      "quantity": 2
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Booking created successfully",
  "data": {
    "booking": {
      "id": 1,
      "booking_reference": "ABC123XYZ",
      "status": "pending",
      "total_amount": 75.0,
      "discount_amount": 0.0,
      "discount_percentage": 0.0,
      "total_tickets": 3,
      "event": {
        "id": 1,
        "title": "Summer Music Festival",
        "start_date": "2024-07-15T18:00:00Z",
        "end_date": "2024-07-15T23:00:00Z",
        "venue_name": "Central Park"
      },
      "booking_items": [
        {
          "id": 1,
          "ticket_type": {
            "id": 1,
            "name": "General Admission",
            "price": 25.0
          },
          "quantity": 2,
          "subtotal": 50.0,
          "qr_codes": [
            {
              "data": "{\"booking_reference\":\"ABC123XYZ\",...}",
              "image_url": "https://meetrix.app/tickets/verify/ABC123XYZ-1-1.png",
              "generated_at": "2024-01-15T10:00:00Z"
            }
          ]
        }
      ],
      "payment": {
        "id": 1,
        "status": "pending",
        "amount": 75.0,
        "currency": "USD"
      },
      "created_at": "2024-01-15T10:00:00Z"
    }
  }
}
```

### 2. Check Availability

**Endpoint:** `GET /api/v1/bookings/availability`

**Description:** Check ticket availability for an event.

**Authentication:** Optional

**Query Parameters:**
- `event_id` (required) - Event ID
- `ticket_requests` (optional) - Array of ticket requests to check

**Example Request:**
```bash
GET /api/v1/bookings/availability?event_id=1&ticket_requests[][ticket_type_id]=1&ticket_requests[][quantity]=2
```

**Response:**
```json
{
  "success": true,
  "data": {
    "all_available": true,
    "can_proceed": true,
    "results": [
      {
        "ticket_type_id": 1,
        "requested_quantity": 2,
        "available": true,
        "ticket_type": {
          "id": 1,
          "name": "General Admission",
          "price": 25.0,
          "total_quantity": 500,
          "sold_quantity": 150,
          "available_quantity": 350,
          "on_sale": true,
          "sold_out": false
        },
        "errors": []
      }
    ]
  }
}
```

### 3. Confirm Booking

**Endpoint:** `POST /api/v1/bookings/:id/confirm`

**Description:** Confirm a pending booking (after payment).

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "message": "Booking confirmed successfully",
  "data": {
    "booking": {
      "id": 1,
      "status": "confirmed",
      "confirmed_at": "2024-01-15T10:05:00Z",
      ...
    }
  }
}
```

### 4. Cancel Booking

**Endpoint:** `PATCH /api/v1/bookings/:id/cancel`

**Description:** Cancel a confirmed booking.

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "message": "Booking cancelled successfully"
}
```

### 5. Verify QR Code

**Endpoint:** `POST /api/v1/bookings/verify_qr`

**Description:** Verify a ticket QR code for entry.

**Authentication:** Optional (for event staff)

**Request Body:**
```json
{
  "qr_data": "{\"booking_reference\":\"ABC123XYZ\",\"ticket_type_id\":1,...}"
}
```

**Response (Valid):**
```json
{
  "success": true,
  "data": {
    "valid": true,
    "booking": {
      "id": 1,
      "booking_reference": "ABC123XYZ",
      "status": "confirmed"
    },
    "ticket_type": {
      "id": 1,
      "name": "General Admission"
    },
    "user": {
      "id": 5,
      "name": "John Doe"
    },
    "event": {
      "id": 1,
      "title": "Summer Music Festival"
    }
  }
}
```

**Response (Invalid):**
```json
{
  "success": false,
  "error": {
    "message": "Invalid QR code"
  }
}
```

## Booking Status Flow

```
pending → confirmed → cancelled
   ↓
refunded (if payment was processed)
```

### Status Descriptions

- **pending**: Booking created, awaiting payment confirmation
- **confirmed**: Payment confirmed, tickets issued
- **cancelled**: Booking cancelled, tickets released
- **refunded**: Payment refunded after cancellation

## Group Booking Discounts

Discounts are automatically applied based on total group size:

| Group Size | Discount |
|------------|----------|
| 5-9 people | 5% |
| 10-19 people | 10% |
| 20-49 people | 15% |
| 50+ people | 20% |

Example:
- Group of 12 people
- Each ticket: $25
- Discount: 10%
- Price per ticket: $22.50
- Total savings: $30 (12 × $2.50)

## QR Code Structure

QR codes contain the following information:
```json
{
  "booking_reference": "ABC123XYZ",
  "ticket_type_id": 1,
  "ticket_number": "ABC123XYZ-1-1",
  "event_id": 1,
  "user_id": 5,
  "timestamp": 1705315200
}
```

## Error Handling

### Insufficient Tickets
```json
{
  "success": false,
  "error": {
    "message": "Booking creation failed",
    "errors": [
      "Insufficient tickets available for General Admission"
    ]
  }
}
```

### Event Not Available
```json
{
  "success": false,
  "error": {
    "message": "Booking creation failed",
    "errors": [
      "Event is not available for booking"
    ]
  }
}
```

### Invalid Group
```json
{
  "success": false,
  "error": {
    "message": "You are not a member of this group"
  }
}
```

## Best Practices

1. **Always check availability before creating booking**
   - Use the availability endpoint
   - Handle race conditions with database locks

2. **Handle booking confirmation**
   - Confirm booking after payment success
   - Update ticket counts atomically

3. **QR Code Security**
   - Verify QR codes server-side
   - Check booking status and event dates
   - Consider adding signature verification

4. **Group Bookings**
   - Ensure all group members can complete booking
   - Apply discounts consistently
   - Notify all members of booking status

5. **Error Recovery**
   - Rollback ticket reservations on failure
   - Release reserved tickets if booking not confirmed
   - Handle partial failures in group bookings

