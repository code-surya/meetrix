import { useState, useEffect } from 'react';
import { useAnalytics } from '@/hooks/useAnalytics';
import { Container } from '@/components/layout/Container/Container';
import { Loading } from '@/components/common/Loading/Loading';
import { ErrorMessage } from '@/components/common/ErrorMessage/ErrorMessage';
import DateRangePicker from '@/components/common/DateRangePicker/DateRangePicker';
import MetricCard from '@/components/analytics/MetricCard/MetricCard';
import RevenueChart from '@/components/analytics/ReveueChart/RevenueChart';
import AttendanceChart from '@/components/analytics/AttendanceChart/AttendanceChart';
import TicketSalesChart from '@/components/analytics/TicketSalesChart/TicketSalesChart';
import EventPerformanceChart from '@/components/analytics/EventPerformanceChart/EventPerformanceChart';
import TopEventsTable from '@/components/analytics/TopEventsTable/TopEventsTable';
import './AnalyticsPage.css';

const AnalyticsPage = () => {
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    end: new Date(),
  });

  const { dashboardData, isLoading, error, refetch } = useAnalytics(dateRange);

  const handleDateRangeChange = (start: Date, end: Date) => {
    setDateRange({ start, end });
  };

  const handleRefresh = () => {
    refetch();
  };

  if (isLoading && !dashboardData) {
    return (
      <Container>
        <div className="analytics-loading">
          <Loading size="large" />
          <p>Loading analytics...</p>
        </div>
      </Container>
    );
  }

  if (error && !dashboardData) {
    return (
      <Container>
        <ErrorMessage
          message="Failed to load analytics data"
          onRetry={handleRefresh}
        />
      </Container>
    );
  }

  const { summary, revenue, attendance, ticket_sales, event_performance, recent_events } = dashboardData || {};

  return (
    <Container>
      <div className="analytics-page">
        <div className="analytics-header">
          <div className="header-content">
            <h1>Analytics Dashboard</h1>
            <p className="header-subtitle">
              Track your event performance and revenue insights
            </p>
          </div>
          <div className="header-actions">
            <DateRangePicker
              startDate={dateRange.start}
              endDate={dateRange.end}
              onChange={handleDateRangeChange}
            />
            <button className="refresh-btn" onClick={handleRefresh} disabled={isLoading}>
              {isLoading ? <Loading size="small" /> : '🔄'} Refresh
            </button>
          </div>
        </div>

        {/* Summary Metrics */}
        {summary && (
          <div className="metrics-grid">
            <MetricCard
              title="Total Events"
              value={summary.total_events}
              change={summary.events_this_month}
              changeLabel="This month"
              icon="📅"
            />
            <MetricCard
              title="Total Registrations"
              value={summary.total_registrations}
              change={summary.tickets_sold_this_month}
              changeLabel="This month"
              icon="👥"
            />
            <MetricCard
              title="Total Revenue"
              value={`$${summary.total_revenue?.toLocaleString() || 0}`}
              change={summary.revenue_this_month}
              changeLabel="This month"
              icon="💰"
            />
            <MetricCard
              title="Avg Attendance Rate"
              value={`${summary.average_attendance_rate || 0}%`}
              change={null}
              changeLabel=""
              icon="📊"
            />
          </div>
        )}

        <div className="charts-grid">
          {/* Revenue Chart */}
          <div className="chart-card">
            <div className="chart-header">
              <h3>Revenue Over Time</h3>
              <span className="chart-period">
                {dateRange.start.toLocaleDateString()} - {dateRange.end.toLocaleDateString()}
              </span>
            </div>
            {revenue?.revenue_over_time && (
              <RevenueChart data={revenue.revenue_over_time} />
            )}
          </div>

          {/* Attendance Chart */}
          <div className="chart-card">
            <div className="chart-header">
              <h3>Attendance Trends</h3>
              <span className="chart-period">
                Check-ins over time
              </span>
            </div>
            {attendance?.check_in_over_time && (
              <AttendanceChart data={attendance.check_in_over_time} />
            )}
          </div>

          {/* Ticket Sales Chart */}
          <div className="chart-card">
            <div className="chart-header">
              <h3>Ticket Sales Over Time</h3>
              <span className="chart-period">
                Sales velocity
              </span>
            </div>
            {ticket_sales?.sales_over_time && (
              <TicketSalesChart data={ticket_sales.sales_over_time} />
            )}
          </div>

          {/* Event Performance Chart */}
          <div className="chart-card">
            <div className="chart-header">
              <h3>Event Performance Comparison</h3>
              <span className="chart-period">
                Revenue vs Attendance
              </span>
            </div>
            {event_performance?.events_comparison && (
              <EventPerformanceChart data={event_performance.events_comparison} />
            )}
          </div>
        </div>

        {/* Recent Events Table */}
        {recent_events && recent_events.length > 0 && (
          <div className="table-card">
            <div className="table-header">
              <h3>Recent Events Performance</h3>
            </div>
            <TopEventsTable events={recent_events} />
          </div>
        )}

        {/* Additional Insights */}
        <div className="insights-grid">
          {/* Payment Methods */}
          {revenue?.payment_methods && revenue.payment_methods.length > 0 && (
            <div className="insight-card">
              <h4>Payment Methods</h4>
              <div className="payment-methods">
                {revenue.payment_methods.map((method: any, index: number) => (
                  <div key={index} className="payment-method">
                    <span className="method-name">{method.method}</span>
                    <span className="method-count">{method.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Ticket Type Distribution */}
          {ticket_sales?.ticket_type_distribution && ticket_sales.ticket_type_distribution.length > 0 && (
            <div className="insight-card">
              <h4>Ticket Types Sold</h4>
              <div className="ticket-types">
                {ticket_sales.ticket_type_distribution.slice(0, 5).map((type: any, index: number) => (
                  <div key={index} className="ticket-type">
                    <span className="type-name">{type.type}</span>
                    <span className="type-quantity">{type.quantity}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Attendance Rate */}
          {attendance && (
            <div className="insight-card">
              <h4>Attendance Overview</h4>
              <div className="attendance-stats">
                <div className="stat-item">
                  <span className="stat-label">Total Attendance</span>
                  <span className="stat-value">{attendance.total_attendance || 0}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Avg Attendance Rate</span>
                  <span className="stat-value">{attendance.attendance_rate?.toFixed(1) || 0}%</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">No-show Rate</span>
                  <span className="stat-value">{attendance.no_show_rate?.toFixed(1) || 0}%</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Container>
  );
};

export default AnalyticsPage;
