import { formatDate, formatCurrency } from '@/utils/formatters';
import './TopEventsTable.css';

interface TopEventsTableProps {
  events: Array<{
    id: number;
    title: string;
    status: string;
    created_at: string;
    revenue: number;
    registrations: number;
  }>;
}

const TopEventsTable = ({ events }: TopEventsTableProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'var(--success, #28a745)';
      case 'draft':
        return 'var(--warning, #ffc107)';
      case 'cancelled':
        return 'var(--error, #dc3545)';
      case 'completed':
        return 'var(--info, #17a2b8)';
      default:
        return 'var(--text-secondary, #666)';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published':
        return '🟢';
      case 'draft':
        return '📝';
      case 'cancelled':
        return '❌';
      case 'completed':
        return '✅';
      default:
        return '📅';
    }
  };

  if (events.length === 0) {
    return (
      <div className="no-events">
        <p>No events found in the selected period.</p>
      </div>
    );
  }

  return (
    <div className="top-events-table">
      <div className="table-responsive">
        <table>
          <thead>
            <tr>
              <th>Event</th>
              <th>Status</th>
              <th>Created</th>
              <th>Revenue</th>
              <th>Registrations</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.id}>
                <td className="event-cell">
                  <div className="event-info">
                    <h4 className="event-title">{event.title}</h4>
                  </div>
                </td>
                <td>
                  <div className="status-cell">
                    <span className="status-icon">{getStatusIcon(event.status)}</span>
                    <span
                      className="status-badge"
                      style={{ color: getStatusColor(event.status) }}
                    >
                      {event.status}
                    </span>
                  </div>
                </td>
                <td className="date-cell">
                  {formatDate(event.created_at)}
                </td>
                <td className="revenue-cell">
                  {formatCurrency(event.revenue)}
                </td>
                <td className="registrations-cell">
                  {event.registrations}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TopEventsTable;

