import { formatCurrency, formatDate } from '@/utils/formatters';
import './EventPerformanceTable.css';

interface EventPerformance {
  event_id: number;
  title: string;
  start_date: string;
  end_date: string;
  booking_count: number;
  tickets_sold: number;
  revenue: number;
  avg_rating: number | null;
  review_count: number;
}

interface EventPerformanceTableProps {
  data: EventPerformance[];
}

const EventPerformanceTable = ({ data }: EventPerformanceTableProps) => {
  if (data.length === 0) {
    return (
      <div className="empty-state">
        <p>No event performance data available</p>
      </div>
    );
  }

  return (
    <div className="event-performance-table">
      <table>
        <thead>
          <tr>
            <th>Event</th>
            <th>Date</th>
            <th>Bookings</th>
            <th>Tickets Sold</th>
            <th>Revenue</th>
            <th>Rating</th>
            <th>Reviews</th>
          </tr>
        </thead>
        <tbody>
          {data.map((event) => (
            <tr key={event.event_id}>
              <td className="event-title">{event.title}</td>
              <td className="event-date">
                {formatDate(event.start_date)}
              </td>
              <td>{event.booking_count}</td>
              <td>{event.tickets_sold}</td>
              <td className="revenue-cell">{formatCurrency(event.revenue)}</td>
              <td className="rating-cell">
                {event.avg_rating ? (
                  <>
                    <span className="rating-value">{event.avg_rating}</span>
                    <span className="rating-stars">⭐</span>
                  </>
                ) : (
                  <span className="no-rating">—</span>
                )}
              </td>
              <td>{event.review_count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EventPerformanceTable;

