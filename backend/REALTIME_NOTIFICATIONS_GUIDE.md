# Real-time Notifications Implementation Guide

## Overview

Real-time notifications using ActionCable (WebSockets) for instant updates on event changes, booking confirmations, and event reminders.

## Backend Implementation

### 1. ActionCable Setup

**Connection Authentication:**
- JWT token-based authentication
- Token extracted from WebSocket connection params or headers
- User verification before allowing connection

**Channel:**
- `NotificationsChannel` - User-specific channel
- Streams to individual users
- Handles mark as read operations

### 2. Notification Broadcasting

**Service:** `NotificationBroadcastService`
- Broadcasts new notifications
- Updates notification counts
- Sends push notifications (optional)

**Usage:**
```ruby
NotificationBroadcastService.broadcast_to_user(user, notification)
NotificationBroadcastService.broadcast_notification_count(user)
```

### 3. Background Jobs

**EventReminderJob:**
- Sends reminders 24 hours, 1 hour, and 30 minutes before event
- Scheduled via cron or Sidekiq

**EventUpdateNotificationJob:**
- Notifies users when events are cancelled or updated
- Triggered on event status changes

**BookingConfirmationNotificationJob:**
- Sends confirmation when booking is confirmed
- Notifies group members for group bookings

### 4. Notification Types

- `booking_confirmed` - Booking confirmed
- `booking_cancelled` - Booking cancelled
- `event_reminder` - Event starting soon
- `event_cancelled` - Event cancelled
- `event_updated` - Event details updated
- `group_invitation` - Invited to group
- `payment_failed` - Payment failed
- `review_request` - Request to review event
- `general` - General notifications

## Frontend Implementation

### 1. WebSocket Client

**Location:** `src/services/websocket/websocketClient.ts`

**Features:**
- Auto-reconnection with exponential backoff
- ActionCable protocol support
- Event listeners
- Connection management

**Usage:**
```typescript
import websocketClient from '@/services/websocket';

websocketClient.connect();
websocketClient.on('new_notification', (notification) => {
  // Handle new notification
});
```

### 2. Notification Context

**Location:** `src/context/NotificationContext.tsx`

**Features:**
- Global notification state
- WebSocket integration
- API synchronization
- Browser notifications

**Usage:**
```typescript
const { notifications, unreadCount, markAsRead } = useNotifications();
```

### 3. Components

**NotificationBell:**
- Notification icon with badge
- Dropdown notification list
- Click outside to close

**NotificationList:**
- Unread/read sections
- Mark all as read
- View all link

**NotificationItem:**
- Notification display
- Type-specific icons
- Click to navigate
- Auto-mark as read

## WebSocket Connection Flow

```
1. User authenticates → Get JWT token
2. Connect to WebSocket → /cable?token=<jwt>
3. Subscribe to NotificationsChannel
4. Receive real-time updates
5. Auto-reconnect on disconnect
```

## Notification Flow

### Booking Confirmation
```
1. Payment succeeds
2. Booking confirmed
3. BookingConfirmationNotificationJob enqueued
4. Notification created
5. Broadcasted via ActionCable
6. Frontend receives update
7. Notification displayed
```

### Event Reminder
```
1. Scheduled job runs (24h, 1h, 30min before event)
2. EventReminderJob processes
3. Notifications created for all attendees
4. Broadcasted via ActionCable
5. Frontend receives updates
```

### Event Update
```
1. Organizer updates/cancels event
2. EventUpdateNotificationJob enqueued
3. Notifications created for all attendees
4. Broadcasted via ActionCable
5. Frontend receives updates
```

## Configuration

### Backend (Rails)

**config/cable.yml:**
```yaml
development:
  adapter: redis
  url: redis://localhost:6379/1
```

**Environment Variables:**
```bash
REDIS_URL=redis://localhost:6379/1
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

### Frontend

**Environment Variables:**
```bash
VITE_WS_URL=ws://localhost:3000/cable
VITE_API_URL=http://localhost:3000/api/v1
```

## Testing

### Backend
```ruby
# Test notification broadcasting
user = User.first
notification = Notification.create!(...)
NotificationBroadcastService.broadcast_to_user(user, notification)
```

### Frontend
```typescript
// Test WebSocket connection
websocketClient.connect().then(() => {
  console.log('Connected');
});
```

## Performance Considerations

1. **Connection Pooling**: Limit concurrent connections
2. **Message Batching**: Batch multiple notifications
3. **Rate Limiting**: Prevent notification spam
4. **Caching**: Cache notification counts
5. **Background Processing**: Use jobs for heavy operations

## Security

1. **Authentication**: JWT token verification
2. **Authorization**: User can only see their notifications
3. **CORS**: Configure allowed origins
4. **Rate Limiting**: Prevent abuse
5. **Input Validation**: Sanitize notification content

## Monitoring

- Connection count
- Message throughput
- Error rates
- Reconnection attempts
- Notification delivery success rate

