# frozen_string_literal: true

module Api
  module V1
    class AnalyticsController < BaseController
      before_action :authenticate_user!
      before_action :require_organizer
      before_action :set_date_range, only: [:dashboard, :revenue, :attendance]

      def dashboard
        dashboard_data = {
          summary: summary_metrics,
          revenue: revenue_over_time,
          attendance: attendance_metrics,
          ticket_sales: ticket_sales_over_time,
          event_performance: event_performance_comparison,
          recent_events: recent_events_performance
        }

        render_success(data: dashboard_data)
      end

      def revenue
        revenue_data = {
          total_revenue: total_revenue(@start_date, @end_date),
          revenue_by_event: revenue_by_event(@start_date, @end_date),
          revenue_over_time: revenue_over_time(@start_date, @end_date),
          payment_methods: payment_methods_distribution(@start_date, @end_date)
        }

        render_success(data: revenue_data)
      end

      def attendance
        attendance_data = {
          total_attendance: total_attendance(@start_date, @end_date),
          attendance_rate: attendance_rate(@start_date, @end_date),
          check_in_over_time: check_in_over_time(@start_date, @end_date),
          no_show_rate: no_show_rate(@start_date, @end_date)
        }

        render_success(data: attendance_data)
      end

      def ticket_sales
        sales_data = {
          total_tickets_sold: total_tickets_sold(@start_date, @end_date),
          tickets_by_event: tickets_by_event(@start_date, @end_date),
          sales_over_time: sales_over_time(@start_date, @end_date),
          ticket_type_distribution: ticket_type_distribution(@start_date, @end_date)
        }

        render_success(data: sales_data)
      end

      def event_performance
        performance_data = {
          events_comparison: event_performance_comparison,
          top_performing_events: top_performing_events,
          event_categories: event_categories_distribution,
          event_status: event_status_distribution
        }

        render_success(data: performance_data)
      end

      private

      def require_organizer
        render_forbidden(message: 'Access denied. Organizer role required.') unless current_user.organizer?
      end

      def set_date_range
        @start_date = params[:start_date]&.to_date || 30.days.ago.to_date
        @end_date = params[:end_date]&.to_date || Date.current
      end

      # Summary metrics
      def summary_metrics
        {
          total_events: current_user.organized_events.count,
          total_registrations: total_registrations,
          total_revenue: total_revenue(nil, nil),
          average_attendance_rate: average_attendance_rate,
          events_this_month: events_this_month,
          revenue_this_month: revenue_this_month,
          tickets_sold_this_month: tickets_sold_this_month
        }
      end

      def total_registrations
        current_user.organized_events.joins(:bookings).where(bookings: { status: [:confirmed, :pending] }).count
      end

      def average_attendance_rate
        events = current_user.organized_events.joins(:bookings).group('events.id')
        return 0 if events.empty?

        total_rate = 0
        event_count = 0

        events.each do |event|
          confirmed = event.bookings.confirmed.count
          total = event.bookings.where(status: [:confirmed, :pending]).count
          next if total.zero?

          total_rate += (confirmed.to_f / total.to_f) * 100
          event_count += 1
        end

        event_count > 0 ? (total_rate / event_count).round(2) : 0
      end

      def events_this_month
        current_user.organized_events.where(created_at: Time.current.beginning_of_month..Time.current.end_of_month).count
      end

      def revenue_this_month
        current_user.organized_events.joins(bookings: :payment)
          .where(payments: { status: 'completed' })
          .where(bookings: { created_at: Time.current.beginning_of_month..Time.current.end_of_month })
          .sum('payments.amount')
      end

      def tickets_sold_this_month
        current_user.organized_events.joins(:bookings)
          .where(bookings: { status: [:confirmed, :pending], created_at: Time.current.beginning_of_month..Time.current.end_of_month })
          .count
      end

      # Revenue analytics
      def total_revenue(start_date = nil, end_date = nil)
        PerformanceMonitor.measure_query_time('analytics_total_revenue') do
          query = current_user.organized_events.joins(bookings: :payment).where(payments: { status: 'completed' })
          query = query.where(bookings: { created_at: start_date..end_date }) if start_date && end_date
          query.sum('payments.amount')
        end
      end

      def revenue_by_event(start_date = nil, end_date = nil)
        query = current_user.organized_events.joins(bookings: :payment)
          .where(payments: { status: 'completed' })
          .select('events.title, events.id, SUM(payments.amount) as revenue')
          .group('events.id, events.title')
          .order('revenue DESC')

        query = query.where(bookings: { created_at: start_date..end_date }) if start_date && end_date
        query.limit(10).map { |event| { name: event.title, value: event.revenue.to_f } }
      end

      def revenue_over_time(start_date = nil, end_date = nil)
        start_date ||= 30.days.ago.to_date
        end_date ||= Date.current

        current_user.organized_events.joins(bookings: :payment)
          .where(payments: { status: 'completed' })
          .where(bookings: { created_at: start_date..end_date })
          .group("DATE(bookings.created_at)")
          .order("DATE(bookings.created_at)")
          .sum('payments.amount')
          .map { |date, amount| { date: date, revenue: amount.to_f } }
      end

      def payment_methods_distribution(start_date = nil, end_date = nil)
        query = current_user.organized_events.joins(bookings: :payment)
          .where(payments: { status: 'completed' })
          .group('payments.method')
          .count

        query = query.where(bookings: { created_at: start_date..end_date }) if start_date && end_date

        query.map { |method, count| { method: method, count: count } }
      end

      # Attendance analytics
      def total_attendance(start_date = nil, end_date = nil)
        query = current_user.organized_events.joins(:bookings)
          .where(bookings: { status: 'confirmed' })

        query = query.where(bookings: { created_at: start_date..end_date }) if start_date && end_date
        query.count
      end

      def attendance_rate(start_date = nil, end_date = nil)
        events = current_user.organized_events.includes(:bookings)
        events = events.where(created_at: start_date..end_date) if start_date && end_date

        rates = events.map do |event|
          total_bookings = event.bookings.where(status: [:confirmed, :pending]).count
          confirmed_attendance = event.bookings.where(status: :confirmed).count

          {
            event_title: event.title,
            total_registrations: total_bookings,
            confirmed_attendance: confirmed_attendance,
            attendance_rate: total_bookings > 0 ? ((confirmed_attendance.to_f / total_bookings.to_f) * 100).round(2) : 0
          }
        end

        rates.sort_by { |r| r[:attendance_rate] }.reverse
      end

      def check_in_over_time(start_date = nil, end_date = nil)
        current_user.organized_events.joins(:bookings)
          .where(bookings: { status: 'confirmed' })
          .where(bookings: { confirmed_at: start_date..end_date })
          .group("DATE(bookings.confirmed_at)")
          .order("DATE(bookings.confirmed_at)")
          .count
          .map { |date, count| { date: date, check_ins: count } }
      end

      def no_show_rate(start_date = nil, end_date = nil)
        events = current_user.organized_events.includes(:bookings)
        events = events.where(created_at: start_date..end_date) if start_date && end_date

        total_no_shows = 0
        total_registrations = 0

        events.each do |event|
          registrations = event.bookings.where(status: [:confirmed, :pending]).count
          confirmed = event.bookings.where(status: :confirmed).count

          total_registrations += registrations
          total_no_shows += registrations - confirmed
        end

        total_registrations > 0 ? ((total_no_shows.to_f / total_registrations.to_f) * 100).round(2) : 0
      end

      # Ticket sales analytics
      def total_tickets_sold(start_date = nil, end_date = nil)
        query = current_user.organized_events.joins(bookings: :booking_items)
        query = query.where(bookings: { created_at: start_date..end_date }) if start_date && end_date
        query.sum('booking_items.quantity')
      end

      def tickets_by_event(start_date = nil, end_date = nil)
        current_user.organized_events.joins(bookings: :booking_items)
          .where(bookings: { status: [:confirmed, :pending] })
          .where(bookings: { created_at: start_date..end_date })
          .select('events.title, SUM(booking_items.quantity) as tickets_sold')
          .group('events.id, events.title')
          .order('tickets_sold DESC')
          .limit(10)
          .map { |event| { name: event.title, tickets: event.tickets_sold.to_i } }
      end

      def sales_over_time(start_date = nil, end_date = nil)
        current_user.organized_events.joins(bookings: :booking_items)
          .where(bookings: { status: [:confirmed, :pending] })
          .where(bookings: { created_at: start_date..end_date })
          .group("DATE(bookings.created_at)")
          .order("DATE(bookings.created_at)")
          .sum('booking_items.quantity')
          .map { |date, quantity| { date: date, tickets: quantity.to_i } }
      end

      def ticket_type_distribution(start_date = nil, end_date = nil)
        current_user.organized_events.joins(bookings: { booking_items: :ticket_type })
          .where(bookings: { status: [:confirmed, :pending] })
          .where(bookings: { created_at: start_date..end_date })
          .select('ticket_types.name, SUM(booking_items.quantity) as quantity')
          .group('ticket_types.id, ticket_types.name')
          .order('quantity DESC')
          .map { |type| { type: type.name, quantity: type.quantity.to_i } }
      end

      # Event performance analytics
      def event_performance_comparison
        current_user.organized_events.includes(:bookings, :ticket_types)
          .map do |event|
            revenue = event.bookings.joins(:payment).where(payments: { status: 'completed' }).sum('payments.amount')
            registrations = event.bookings.where(status: [:confirmed, :pending]).count
            attendance = event.bookings.where(status: :confirmed).count
            attendance_rate = registrations > 0 ? ((attendance.to_f / registrations.to_f) * 100).round(2) : 0

            {
              id: event.id,
              title: event.title,
              status: event.status,
              start_date: event.start_date,
              revenue: revenue.to_f,
              registrations: registrations,
              attendance: attendance,
              attendance_rate: attendance_rate,
              ticket_types_count: event.ticket_types.count
            }
          end
          .sort_by { |event| event[:revenue] }
          .reverse
      end

      def top_performing_events
        current_user.organized_events.joins(bookings: :payment)
          .where(payments: { status: 'completed' })
          .select('events.*, SUM(payments.amount) as total_revenue')
          .group('events.id')
          .order('total_revenue DESC')
          .limit(5)
          .map do |event|
            {
              id: event.id,
              title: event.title,
              revenue: event.total_revenue.to_f,
              bookings_count: event.bookings.count
            }
          end
      end

      def event_categories_distribution
        current_user.organized_events.group(:category).count
          .map { |category, count| { category: category, count: count } }
      end

      def event_status_distribution
        current_user.organized_events.group(:status).count
          .map { |status, count| { status: status, count: count } }
      end

      def recent_events_performance
        current_user.organized_events.includes(:bookings)
          .order(created_at: :desc)
          .limit(5)
          .map do |event|
            revenue = event.bookings.joins(:payment).where(payments: { status: 'completed' }).sum('payments.amount')
            registrations = event.bookings.where(status: [:confirmed, :pending]).count

            {
              id: event.id,
              title: event.title.truncate(30),
              status: event.status,
              created_at: event.created_at,
              revenue: revenue.to_f,
              registrations: registrations
            }
          end
      end
    end
  end
end
