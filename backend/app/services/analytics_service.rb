# frozen_string_literal: true

class AnalyticsService
  def initialize(organizer, date_range: nil)
    @organizer = organizer
    @date_range = date_range || default_date_range
  end

  # Total registrations across all events
  def total_registrations
    Booking
      .joins(:event)
      .where(events: { organizer_id: @organizer.id })
      .where(created_at: @date_range)
      .confirmed
      .sum('bookings.total_tickets')
  end

  # Total revenue
  def total_revenue
    Payment
      .joins(booking: :event)
      .where(events: { organizer_id: @organizer.id })
      .where(created_at: @date_range)
      .completed
      .sum(:amount)
  end

  # Revenue by event
  def revenue_by_event(limit: 10)
    Payment
      .joins(booking: :event)
      .where(events: { organizer_id: @organizer.id })
      .where(payments: { created_at: @date_range })
      .completed
      .group('events.id', 'events.title')
      .select('events.id, events.title, SUM(payments.amount) as revenue, COUNT(DISTINCT payments.id) as payment_count')
      .order('revenue DESC')
      .limit(limit)
      .map do |result|
        {
          event_id: result.id,
          event_title: result.title,
          revenue: result.revenue.to_f,
          payment_count: result.payment_count
        }
      end
  end

  # Attendance rate (confirmed bookings / total bookings)
  def attendance_rate
    total_bookings = Booking
      .joins(:event)
      .where(events: { organizer_id: @organizer.id })
      .where(created_at: @date_range)
      .count

    return 0.0 if total_bookings.zero?

    confirmed_bookings = Booking
      .joins(:event)
      .where(events: { organizer_id: @organizer.id })
      .where(created_at: @date_range)
      .confirmed
      .count

    (confirmed_bookings.to_f / total_bookings * 100).round(2)
  end

  # Ticket sales over time
  def ticket_sales_over_time(period: 'day')
    bookings = Booking
      .joins(:event)
      .where(events: { organizer_id: @organizer.id })
      .where(created_at: @date_range)
      .confirmed
      .select(
        "DATE_TRUNC('#{period}', bookings.created_at) as period",
        'SUM(bookings.total_tickets) as tickets_sold',
        'SUM(bookings.total_amount) as revenue'
      )
      .group("DATE_TRUNC('#{period}', bookings.created_at)")
      .order('period ASC')

    bookings.map do |booking|
      {
        period: booking.period,
        tickets_sold: booking.tickets_sold.to_i,
        revenue: booking.revenue.to_f
      }
    end
  end

  # Event performance comparison
  def event_performance_comparison(limit: 10)
    events = Event
      .where(organizer_id: @organizer.id)
      .where('start_date >= ?', @date_range.first)
      .left_joins(:bookings)
      .group('events.id', 'events.title', 'events.start_date', 'events.end_date')
      .select(
        'events.id',
        'events.title',
        'events.start_date',
        'events.end_date',
        'COUNT(DISTINCT bookings.id) as booking_count',
        'SUM(CASE WHEN bookings.status = 2 THEN bookings.total_tickets ELSE 0 END) as tickets_sold',
        'COALESCE(SUM(CASE WHEN bookings.status = 2 THEN bookings.total_amount ELSE 0 END), 0) as revenue',
        'AVG(CASE WHEN reviews.id IS NOT NULL THEN reviews.rating ELSE NULL END) as avg_rating',
        'COUNT(DISTINCT reviews.id) as review_count'
      )
      .left_joins(bookings: :reviews)
      .order('revenue DESC')
      .limit(limit)

    events.map do |event|
      {
        event_id: event.id,
        title: event.title,
        start_date: event.start_date,
        end_date: event.end_date,
        booking_count: event.booking_count.to_i,
        tickets_sold: event.tickets_sold.to_i,
        revenue: event.revenue.to_f,
        avg_rating: event.avg_rating&.to_f&.round(2),
        review_count: event.review_count.to_i
      }
    end
  end

  # Revenue trends
  def revenue_trends(period: 'day')
    payments = Payment
      .joins(booking: :event)
      .where(events: { organizer_id: @organizer.id })
      .where(payments: { created_at: @date_range })
      .completed
      .select(
        "DATE_TRUNC('#{period}', payments.created_at) as period",
        'SUM(payments.amount) as revenue',
        'COUNT(DISTINCT payments.id) as payment_count'
      )
      .group("DATE_TRUNC('#{period}', payments.created_at)")
      .order('period ASC')

    payments.map do |payment|
      {
        period: payment.period,
        revenue: payment.revenue.to_f,
        payment_count: payment.payment_count.to_i
      }
    end
  end

  # Ticket type performance
  def ticket_type_performance(event_id: nil)
    scope = TicketType
      .joins(event: :bookings)
      .joins('LEFT JOIN booking_items ON booking_items.ticket_type_id = ticket_types.id')
      .joins('LEFT JOIN bookings ON bookings.id = booking_items.booking_id')
      .where(events: { organizer_id: @organizer.id })
      .where('bookings.created_at' => @date_range)
      .where('bookings.status = ?', Booking.statuses[:confirmed])

    scope = scope.where(events: { id: event_id }) if event_id

    scope
      .group('ticket_types.id', 'ticket_types.name', 'ticket_types.price')
      .select(
        'ticket_types.id',
        'ticket_types.name',
        'ticket_types.price',
        'SUM(booking_items.quantity) as quantity_sold',
        'SUM(booking_items.subtotal) as revenue'
      )
      .order('revenue DESC')
      .map do |ticket_type|
        {
          ticket_type_id: ticket_type.id,
          name: ticket_type.name,
          price: ticket_type.price.to_f,
          quantity_sold: ticket_type.quantity_sold.to_i,
          revenue: ticket_type.revenue.to_f
        }
      end
  end

  # Top events by revenue
  def top_events_by_revenue(limit: 5)
    Event
      .where(organizer_id: @organizer.id)
      .joins(:bookings)
      .joins('INNER JOIN payments ON payments.booking_id = bookings.id')
      .where(payments: { status: :completed, created_at: @date_range })
      .where(bookings: { status: :confirmed })
      .group('events.id', 'events.title', 'events.start_date')
      .select(
        'events.id',
        'events.title',
        'events.start_date',
        'SUM(payments.amount) as total_revenue',
        'SUM(bookings.total_tickets) as total_tickets'
      )
      .order('total_revenue DESC')
      .limit(limit)
      .map do |event|
        {
          event_id: event.id,
          title: event.title,
          start_date: event.start_date,
          revenue: event.total_revenue.to_f,
          tickets_sold: event.total_tickets.to_i
        }
      end
  end

  # Conversion rate (bookings / event views)
  def conversion_rate
    # This would require event_analytics table
    # For now, return a placeholder
    total_views = EventAnalytics
      .joins(:event)
      .where(events: { organizer_id: @organizer.id })
      .where(created_at: @date_range)
      .sum(:views_count)

    return 0.0 if total_views.zero?

    total_bookings = Booking
      .joins(:event)
      .where(events: { organizer_id: @organizer.id })
      .where(created_at: @date_range)
      .count

    (total_bookings.to_f / total_views * 100).round(2)
  end

  # Dashboard summary
  def dashboard_summary
    {
      total_registrations: total_registrations,
      total_revenue: total_revenue,
      attendance_rate: attendance_rate,
      total_events: total_events,
      active_events: active_events,
      upcoming_events: upcoming_events
    }
  end

  # Get analytics for specific event
  def event_analytics(event_id)
    event = Event.find_by(id: event_id, organizer_id: @organizer.id)
    return nil unless event

    {
      event_id: event.id,
      title: event.title,
      total_bookings: event.bookings.count,
      confirmed_bookings: event.bookings.confirmed.count,
      total_revenue: event.bookings.confirmed.joins(:payment).where(payments: { status: :completed }).sum('payments.amount'),
      tickets_sold: event.bookings.confirmed.sum(:total_tickets),
      attendance_rate: calculate_event_attendance_rate(event),
      avg_rating: event.reviews.average(:rating)&.round(2),
      review_count: event.reviews.count
    }
  end

  private

  def default_date_range
    30.days.ago..Time.current
  end

  def total_events
    Event.where(organizer_id: @organizer.id).count
  end

  def active_events
    Event
      .where(organizer_id: @organizer.id)
      .where('start_date <= ? AND end_date >= ?', Time.current, Time.current)
      .count
  end

  def upcoming_events
    Event
      .where(organizer_id: @organizer.id)
      .where('start_date > ?', Time.current)
      .count
  end

  def calculate_event_attendance_rate(event)
    total = event.bookings.count
    return 0.0 if total.zero?

    confirmed = event.bookings.confirmed.count
    (confirmed.to_f / total * 100).round(2)
  end
end

