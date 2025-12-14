# frozen_string_literal: true

class AnalyticsQueries
  def initialize(user)
    @user = user
  end

  # Revenue queries
  def total_revenue(start_date: nil, end_date: nil)
    query = @user.organized_events
      .joins(bookings: :payment)
      .where(payments: { status: 'completed' })

    add_date_filter(query, start_date, end_date, 'bookings.created_at')
      .sum('payments.amount')
  end

  def revenue_over_time(start_date: nil, end_date: nil, group_by: 'day')
    start_date ||= 30.days.ago.to_date
    end_date ||= Date.current

    query = @user.organized_events
      .joins(bookings: :payment)
      .where(payments: { status: 'completed' })
      .where(bookings: { created_at: start_date..end_date })

    group_column = case group_by
                   when 'month' then "DATE_FORMAT(bookings.created_at, '%Y-%m')"
                   when 'week' then "YEARWEEK(bookings.created_at)"
                   else "DATE(bookings.created_at)"
                   end

    query
      .group(group_column)
      .order(group_column)
      .sum('payments.amount')
  end

  def revenue_by_event_type(start_date: nil, end_date: nil)
    query = @user.organized_events
      .joins(bookings: :payment)
      .where(payments: { status: 'completed' })
      .select('events.category, SUM(payments.amount) as revenue')
      .group('events.category')

    add_date_filter(query, start_date, end_date, 'bookings.created_at')
      .order('revenue DESC')
  end

  # Attendance queries
  def attendance_rate_over_time(start_date: nil, end_date: nil)
    start_date ||= 30.days.ago.to_date
    end_date ||= Date.current

    @user.organized_events
      .joins(:bookings)
      .where(bookings: { created_at: start_date..end_date })
      .select(
        "DATE(bookings.created_at) as date",
        "COUNT(CASE WHEN bookings.status = 'confirmed' THEN 1 END) as confirmed",
        "COUNT(*) as total_registrations"
      )
      .group("DATE(bookings.created_at)")
      .order("DATE(bookings.created_at)")
  end

  def event_attendance_details(event_id)
    event = @user.organized_events.find_by(id: event_id)
    return {} unless event

    total_registrations = event.bookings.where(status: [:confirmed, :pending]).count
    confirmed_attendance = event.bookings.where(status: :confirmed).count
    no_shows = total_registrations - confirmed_attendance

    {
      total_registrations: total_registrations,
      confirmed_attendance: confirmed_attendance,
      no_shows: no_shows,
      attendance_rate: total_registrations > 0 ? ((confirmed_attendance.to_f / total_registrations.to_f) * 100).round(2) : 0
    }
  end

  # Ticket sales queries
  def ticket_sales_velocity(start_date: nil, end_date: nil)
    start_date ||= 7.days.ago.to_date
    end_date ||= Date.current

    @user.organized_events
      .joins(bookings: :booking_items)
      .where(bookings: { status: [:confirmed, :pending], created_at: start_date..end_date })
      .select(
        "DATE(bookings.created_at) as date",
        "SUM(booking_items.quantity) as tickets_sold",
        "COUNT(DISTINCT bookings.id) as orders_count"
      )
      .group("DATE(bookings.created_at)")
      .order("DATE(bookings.created_at)")
  end

  def ticket_type_performance(start_date: nil, end_date: nil)
    @user.organized_events
      .joins(bookings: { booking_items: :ticket_type })
      .where(bookings: { status: [:confirmed, :pending] })
      .select(
        'ticket_types.name',
        'ticket_types.price',
        'SUM(booking_items.quantity) as tickets_sold',
        'SUM(booking_items.subtotal) as revenue'
      )
      .group('ticket_types.id, ticket_types.name, ticket_types.price')

    add_date_filter(query, start_date, end_date, 'bookings.created_at')
      .order('tickets_sold DESC')
  end

  # Event performance queries
  def event_roi_analysis
    @user.organized_events
      .includes(:ticket_types, :bookings)
      .map do |event|
        revenue = event.bookings.joins(:payment).where(payments: { status: 'completed' }).sum('payments.amount')
        total_tickets = event.ticket_types.sum(:quantity)
        sold_tickets = event.bookings.joins(:booking_items).where(status: [:confirmed, :pending]).sum('booking_items.quantity')

        # Calculate costs (simplified - in real app, you'd have actual costs)
        ticket_cost_per_unit = 0.5 # Example cost
        marketing_cost = 50 # Example marketing cost
        platform_fee = revenue * 0.05 # Example 5% platform fee

        total_costs = (sold_tickets * ticket_cost_per_unit) + marketing_cost + platform_fee
        profit = revenue - total_costs
        roi = total_costs > 0 ? ((profit / total_costs) * 100).round(2) : 0

        {
          event_id: event.id,
          event_title: event.title,
          revenue: revenue.to_f,
          costs: total_costs.to_f,
          profit: profit.to_f,
          roi_percentage: roi,
          tickets_sold: sold_tickets,
          total_tickets: total_tickets,
          fill_rate: total_tickets > 0 ? ((sold_tickets.to_f / total_tickets.to_f) * 100).round(2) : 0
        }
      end
  end

  def geographic_performance(start_date: nil, end_date: nil)
    query = @user.organized_events
      .joins(bookings: :user)
      .where(bookings: { status: [:confirmed, :pending] })
      .select(
        'users.city',
        'users.country',
        'COUNT(bookings.id) as bookings_count',
        'SUM(bookings.total_amount) as revenue'
      )
      .group('users.city, users.country')

    add_date_filter(query, start_date, end_date, 'bookings.created_at')
      .order('bookings_count DESC')
      .limit(20)
  end

  # Demographic analysis
  def attendee_demographics
    @user.organized_events
      .joins(bookings: :user)
      .where(bookings: { status: [:confirmed, :pending] })
      .select(
        "CASE
          WHEN users.date_of_birth IS NOT NULL THEN
            CASE
              WHEN TIMESTAMPDIFF(YEAR, users.date_of_birth, CURDATE()) BETWEEN 18 AND 24 THEN '18-24'
              WHEN TIMESTAMPDIFF(YEAR, users.date_of_birth, CURDATE()) BETWEEN 25 AND 34 THEN '25-34'
              WHEN TIMESTAMPDIFF(YEAR, users.date_of_birth, CURDATE()) BETWEEN 35 AND 44 THEN '35-44'
              WHEN TIMESTAMPDIFF(YEAR, users.date_of_birth, CURDATE()) BETWEEN 45 AND 54 THEN '45-54'
              WHEN TIMESTAMPDIFF(YEAR, users.date_of_birth, CURDATE()) >= 55 THEN '55+'
              ELSE 'Unknown'
            END
          ELSE 'Unknown'
        END as age_group",
        'COUNT(*) as count'
      )
      .group('age_group')
      .order('count DESC')
  end

  def booking_conversion_funnel(start_date: nil, end_date: nil)
    start_date ||= 30.days.ago.to_date
    end_date ||= Date.current

    # Get events created in the date range
    events = @user.organized_events.where(created_at: start_date..end_date)

    # Views (simplified - would need event_analytics table)
    event_views = events.joins(:event_analytics).sum('event_analytics.view_count')

    # Interested (bookmarks or saved events - simplified)
    interested = 0 # Would need additional tracking

    # Bookings started (bookings created)
    bookings_started = events.joins(:bookings).where(bookings: { created_at: start_date..end_date }).count

    # Bookings completed (confirmed or pending)
    bookings_completed = events.joins(:bookings).where(bookings: { status: [:confirmed, :pending], created_at: start_date..end_date }).count

    # Attendance (confirmed bookings)
    attendance = events.joins(:bookings).where(bookings: { status: :confirmed, created_at: start_date..end_date }).count

    {
      views: event_views,
      interested: interested,
      bookings_started: bookings_started,
      bookings_completed: bookings_completed,
      attendance: attendance,
      view_to_booking_rate: event_views > 0 ? ((bookings_started.to_f / event_views.to_f) * 100).round(2) : 0,
      booking_completion_rate: bookings_started > 0 ? ((bookings_completed.to_f / bookings_started.to_f) * 100).round(2) : 0,
      attendance_rate: bookings_completed > 0 ? ((attendance.to_f / bookings_completed.to_f) * 100).round(2) : 0
    }
  end

  private

  def add_date_filter(query, start_date, end_date, date_column)
    return query unless start_date && end_date
    query.where("#{date_column} >= ? AND #{date_column} <= ?", start_date, end_date)
  end
end

