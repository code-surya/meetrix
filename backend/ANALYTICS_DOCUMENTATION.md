# Analytics Dashboard Documentation

## Overview

Comprehensive analytics dashboard for organizers to track event performance, revenue, registrations, and attendance metrics.

## Backend Implementation

### AnalyticsService

**Location:** `app/services/analytics_service.rb`

**Key Methods:**

1. **total_registrations** - Total ticket registrations across all events
2. **total_revenue** - Total revenue from completed payments
3. **revenue_by_event** - Revenue breakdown by event
4. **attendance_rate** - Percentage of confirmed bookings
5. **ticket_sales_over_time** - Time-series data for ticket sales
6. **event_performance_comparison** - Compare multiple events
7. **revenue_trends** - Revenue over time
8. **ticket_type_performance** - Performance by ticket type
9. **top_events_by_revenue** - Top performing events
10. **event_analytics** - Detailed analytics for a specific event

### SQL Queries

**Total Registrations:**
```sql
SELECT SUM(bookings.total_tickets)
FROM bookings
INNER JOIN events ON events.id = bookings.event_id
WHERE events.organizer_id = ?
  AND bookings.created_at BETWEEN ? AND ?
  AND bookings.status = 2 -- confirmed
```

**Total Revenue:**
```sql
SELECT SUM(payments.amount)
FROM payments
INNER JOIN bookings ON bookings.id = payments.booking_id
INNER JOIN events ON events.id = bookings.event_id
WHERE events.organizer_id = ?
  AND payments.created_at BETWEEN ? AND ?
  AND payments.status = 'completed'
```

**Ticket Sales Over Time:**
```sql
SELECT 
  DATE_TRUNC('day', bookings.created_at) as period,
  SUM(bookings.total_tickets) as tickets_sold,
  SUM(bookings.total_amount) as revenue
FROM bookings
INNER JOIN events ON events.id = bookings.event_id
WHERE events.organizer_id = ?
  AND bookings.created_at BETWEEN ? AND ?
  AND bookings.status = 2
GROUP BY DATE_TRUNC('day', bookings.created_at)
ORDER BY period ASC
```

**Event Performance:**
```sql
SELECT 
  events.id,
  events.title,
  events.start_date,
  COUNT(DISTINCT bookings.id) as booking_count,
  SUM(CASE WHEN bookings.status = 2 THEN bookings.total_tickets ELSE 0 END) as tickets_sold,
  COALESCE(SUM(CASE WHEN bookings.status = 2 THEN bookings.total_amount ELSE 0 END), 0) as revenue,
  AVG(CASE WHEN reviews.id IS NOT NULL THEN reviews.rating ELSE NULL END) as avg_rating,
  COUNT(DISTINCT reviews.id) as review_count
FROM events
LEFT JOIN bookings ON bookings.event_id = events.id
LEFT JOIN reviews ON reviews.event_id = events.id
WHERE events.organizer_id = ?
  AND events.start_date >= ?
GROUP BY events.id, events.title, events.start_date
ORDER BY revenue DESC
LIMIT 10
```

### API Endpoints

**GET /api/v1/analytics/dashboard**
- Returns summary metrics and top events
- Query params: `start_date`, `end_date`

**GET /api/v1/analytics/revenue**
- Returns revenue data and trends
- Query params: `start_date`, `end_date`, `period` (day/week/month)

**GET /api/v1/analytics/registrations**
- Returns registration data and ticket sales over time
- Query params: `start_date`, `end_date`, `period`

**GET /api/v1/analytics/events**
- Returns event performance comparison
- Query params: `start_date`, `end_date`, `limit`

**GET /api/v1/analytics/events/:event_id**
- Returns detailed analytics for a specific event

**GET /api/v1/analytics/ticket-types**
- Returns ticket type performance
- Query params: `event_id`, `start_date`, `end_date`

## Frontend Implementation

### Components

1. **AnalyticsPage** - Main dashboard page
2. **MetricCard** - Display individual metrics
3. **RevenueChart** - Line chart for revenue trends
4. **TicketSalesChart** - Area chart for ticket sales
5. **EventPerformanceTable** - Table comparing events
6. **DateRangePicker** - Date range and period selector

### Charts

Using **Recharts** library:
- Line charts for revenue trends
- Area charts for ticket sales
- Responsive and interactive

### State Management

- RTK Query for API calls
- Automatic caching and refetching
- Optimistic updates

## Metrics Explained

### Total Registrations
Total number of tickets sold across all events in the selected date range.

### Total Revenue
Sum of all completed payments for bookings in the selected date range.

### Attendance Rate
Percentage of bookings that are confirmed vs total bookings.

### Ticket Sales Over Time
Time-series data showing ticket sales and revenue trends.

### Event Performance Comparison
Side-by-side comparison of events including:
- Booking count
- Tickets sold
- Revenue
- Average rating
- Review count

## Performance Considerations

1. **Database Indexing:**
   - Index on `bookings.event_id`
   - Index on `bookings.created_at`
   - Index on `payments.booking_id`
   - Index on `events.organizer_id`

2. **Query Optimization:**
   - Use `LEFT JOIN` for optional relationships
   - Aggregate at database level
   - Limit result sets

3. **Caching:**
   - Cache dashboard summary (5 minutes)
   - Cache top events (10 minutes)
   - Invalidate on new bookings/payments

## Usage Example

```typescript
// Fetch dashboard data
const { data, isLoading } = useGetDashboardQuery({
  start_date: '2024-01-01',
  end_date: '2024-01-31'
});

// Fetch revenue trends
const { data: revenueData } = useGetRevenueQuery({
  start_date: '2024-01-01',
  end_date: '2024-01-31',
  period: 'day'
});
```

## Future Enhancements

1. Export to CSV/PDF
2. Email reports
3. Custom date ranges
4. More chart types (bar, pie)
5. Real-time updates
6. Comparison with previous periods
7. Forecasting

