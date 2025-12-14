# Authentication & Authorization Guide

## Overview

This Rails API implements JWT-based authentication with role-based access control (RBAC) using Pundit.

## Architecture

### Components

1. **JWT Service** (`app/services/jwt_service.rb`)
   - Token encoding/decoding
   - Access token (15 minutes expiry)
   - Refresh token (7 days expiry)
   - Token blacklisting via Redis

2. **Authentication Controller** (`app/controllers/api/v1/auth_controller.rb`)
   - User registration
   - Login/logout
   - Token refresh
   - Password reset

3. **Base Controller** (`app/controllers/api/v1/base_controller.rb`)
   - Current user extraction from JWT
   - Authorization helpers
   - Error handling

4. **Pundit Policies** (`app/policies/`)
   - Role-based authorization
   - Resource-level permissions

## Authentication Flow

### 1. Registration

```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "user": {
    "email": "user@example.com",
    "password": "securepassword123",
    "password_confirmation": "securepassword123",
    "first_name": "John",
    "last_name": "Doe"
  },
  "role": "attendee"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "role": "attendee"
    },
    "access_token": "eyJhbGciOiJIUzI1NiJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiJ9..."
  }
}
```

### 2. Login

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "auth": {
    "email": "user@example.com",
    "password": "securepassword123"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { ... },
    "access_token": "eyJhbGciOiJIUzI1NiJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiJ9..."
  }
}
```

### 3. Authenticated Requests

Include the access token in the Authorization header:

```http
GET /api/v1/events
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
```

### 4. Token Refresh

When access token expires (15 minutes):

```http
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refresh_token": "eyJhbGciOiJIUzI1NiJ9..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "access_token": "new_access_token...",
    "refresh_token": "new_refresh_token..."
  }
}
```

### 5. Logout

```http
DELETE /api/v1/auth/logout
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
Content-Type: application/json

{
  "refresh_token": "eyJhbGciOiJIUzI1NiJ9..."
}
```

## Authorization

### Role-Based Access Control

Three roles are supported:

1. **Attendee** (default)
   - Can view published events
   - Can create bookings
   - Can create reviews
   - Can create/join groups

2. **Organizer**
   - All attendee permissions
   - Can create/manage events
   - Can view event analytics
   - Can manage bookings for their events

3. **Admin**
   - All permissions
   - Can manage all resources
   - Can view all analytics

### Using Authorization in Controllers

#### Method 1: Base Controller Helpers

```ruby
class EventsController < BaseController
  before_action :authenticate_user!
  before_action :authorize_organizer!, only: [:create, :update, :destroy]
  before_action :authorize_admin!, only: [:destroy_all]
end
```

#### Method 2: Pundit Policies

```ruby
class EventsController < BaseController
  before_action :authenticate_user!
  
  def create
    authorize Event
    # Create event logic
  end
  
  def update
    authorize @event
    # Update event logic
  end
end
```

### Policy Examples

#### Event Policy

```ruby
# app/policies/event_policy.rb
class EventPolicy < ApplicationPolicy
  def create?
    organizer? # Only organizers can create
  end
  
  def update?
    user_owns_event? || admin?
  end
  
  def view_analytics?
    user_owns_event? || admin?
  end
end
```

#### Booking Policy

```ruby
# app/policies/booking_policy.rb
class BookingPolicy < ApplicationPolicy
  def create?
    attendee? || organizer?
  end
  
  def cancel?
    user_owns_booking? || admin? || organizer_owns_event?
  end
end
```

## Security Features

### Password Security

- Uses `bcrypt` for password hashing
- Minimum 8 characters required
- Passwords are never stored in plain text
- `has_secure_password` handles encryption

### JWT Security

- **Access Token**: Short-lived (15 minutes)
- **Refresh Token**: Longer-lived (7 days), stored in Redis
- **Token Blacklisting**: Revoked tokens stored in Redis
- **JTI (JWT ID)**: Unique identifier for each token
- **Expiration**: Automatic token expiry

### Token Blacklisting

When a user logs out, their access token is blacklisted:

```ruby
JwtService.blacklist_token(decoded['jti'])
```

Blacklisted tokens are checked on every request and rejected.

### Refresh Token Management

- Stored in Redis with expiry
- Can be revoked individually or all at once
- Automatically rotated on refresh

## API Routes

### Authentication Routes

```
POST   /api/v1/auth/register          # Register new user
POST   /api/v1/auth/login              # Login
POST   /api/v1/auth/refresh            # Refresh tokens
DELETE /api/v1/auth/logout             # Logout
DELETE /api/v1/auth/logout_all         # Logout from all devices
GET    /api/v1/auth/me                 # Get current user
POST   /api/v1/auth/forgot_password    # Request password reset
POST   /api/v1/auth/reset_password     # Reset password
PATCH  /api/v1/auth/change_password     # Change password (authenticated)
```

### Protected Routes

All routes except registration, login, and public event viewing require authentication.

## Error Responses

### Unauthorized (401)

```json
{
  "success": false,
  "error": {
    "message": "Unauthorized"
  }
}
```

### Forbidden (403)

```json
{
  "success": false,
  "error": {
    "message": "Insufficient permissions"
  }
}
```

### Validation Errors (422)

```json
{
  "success": false,
  "error": {
    "message": "Validation failed",
    "errors": [
      "Email has already been taken",
      "Password is too short"
    ]
  }
}
```

## Environment Variables

Required environment variables:

```bash
# Secret key for JWT signing
SECRET_KEY_BASE=your_secret_key_here

# Redis URL for token storage
REDIS_URL=redis://localhost:6379/0

# CORS allowed origins
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

## Testing Authentication

### Using cURL

```bash
# Register
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "user": {
      "email": "test@example.com",
      "password": "password123",
      "password_confirmation": "password123",
      "first_name": "Test",
      "last_name": "User"
    }
  }'

# Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "auth": {
      "email": "test@example.com",
      "password": "password123"
    }
  }'

# Authenticated request
curl -X GET http://localhost:3000/api/v1/events \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Using Postman

1. Create a new request
2. Set method to POST
3. URL: `http://localhost:3000/api/v1/auth/login`
4. Headers: `Content-Type: application/json`
5. Body (raw JSON):
```json
{
  "auth": {
    "email": "user@example.com",
    "password": "password123"
  }
}
```
6. Copy the `access_token` from response
7. For subsequent requests, add header:
   - Key: `Authorization`
   - Value: `Bearer YOUR_ACCESS_TOKEN`

## Best Practices

1. **Always use HTTPS in production**
2. **Store tokens securely** (httpOnly cookies or secure storage)
3. **Implement rate limiting** on authentication endpoints
4. **Log authentication failures** for security monitoring
5. **Use refresh tokens** for better security
6. **Implement token rotation** on refresh
7. **Monitor Redis** for token storage health
8. **Set appropriate token expiry times**

## Troubleshooting

### Token Expired

If you get "Token expired" error:
1. Use the refresh token to get a new access token
2. Update your stored access token

### Invalid Token

- Check that token is included in Authorization header
- Verify token format: `Bearer <token>`
- Ensure token hasn't been blacklisted

### Redis Connection Issues

If Redis is unavailable:
- JWT encoding/decoding still works
- Token blacklisting won't work
- Refresh token revocation won't work
- Consider using database fallback for production

