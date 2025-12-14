import { Link } from 'react-router-dom';
import { Container } from '@/components/layout/Container';
import { MetricCard } from '@/components/analytics/MetricCard';
import { useAppSelector } from '@/store';
import { dataService } from '@/services/dataService';

const OrganizerDashboard = () => {
  const { user } = useAppSelector((state) => state.auth);

  // Get real data from dataService
  const organizerEvents = user ? dataService.getOrganizerEvents(user.id) : [];
  const stats = user ? dataService.getOrganizerStats(user.id) : {
    totalEvents: 0,
    totalBookings: 0,
    totalRevenue: 0,
  };

  const recentEvents = organizerEvents.slice(0, 5).map(event => ({
    id: event.id,
    title: event.title,
    date: new Date(event.startDate).toLocaleDateString(),
    status: new Date(event.startDate) > new Date() ? 'upcoming' : 'completed',
    bookings: dataService.getEventBookings(event.id).length,
  }));

  return (
    <Container>
      <div className="py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Organizer Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your events and track performance</p>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-4">
            <Link
              to="/events/create"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
            >
              Create New Event
            </Link>
            <Link
              to="/dashboard/events"
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
            >
              Manage Events
            </Link>
            <Link
              to="/dashboard/analytics"
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
            >
              View Analytics
            </Link>
            <Link
              to="/dashboard/checkin"
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
            >
              QR Check-in
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total Events"
            value={stats.totalEvents}
            icon="📅"
            trend={{ value: 12, isPositive: true }}
          />
          <MetricCard
            title="Total Bookings"
            value={stats.totalBookings}
            icon="🎫"
            trend={{ value: 8, isPositive: true }}
          />
          <MetricCard
            title="Revenue"
            value={`$${stats.totalRevenue.toLocaleString()}`}
            icon="💰"
            trend={{ value: 15, isPositive: true }}
          />
          <MetricCard
            title="Total Attendees"
            value={stats.totalAttendees}
            icon="👥"
            trend={{ value: 5, isPositive: true }}
          />
        </div>

        {/* Recent Events */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Recent Events</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bookings
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentEvents.map((event) => (
                  <tr key={event.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{event.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{event.date}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        event.status === 'upcoming'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {event.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {event.bookings}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Link
                          to={`/events/${event.id}/edit`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Edit
                        </Link>
                        <Link
                          to={`/events/${event.id}`}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          View
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default OrganizerDashboard;
