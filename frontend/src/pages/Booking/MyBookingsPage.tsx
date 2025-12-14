import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container } from '@/components/layout/Container';
import { useAppSelector } from '@/store';
import { dataService } from '@/services/dataService';
import type { MockBooking, MockEvent } from '@/services/mockData';

const MyBookingsPage = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [filter, setFilter] = useState('all');
  const [bookings, setBookings] = useState<MockBooking[]>([]);
  const [events, setEvents] = useState<Record<number, MockEvent>>({});

  useEffect(() => {
    if (user) {
      // Load user's bookings
      const userBookings = dataService.getBookingsByUser(user.id);
      setBookings(userBookings);

      // Load event details for each booking
      const eventMap: Record<number, MockEvent> = {};
      userBookings.forEach(booking => {
        const event = dataService.getEventById(booking.eventId);
        if (event) {
          eventMap[booking.eventId] = event;
        }
      });
      setEvents(eventMap);
    }
  }, [user]);

  const filteredBookings = bookings.filter(booking => {
    if (filter === 'all') return true;
    return booking.status === filter;
  });

  const getStatusBadge = (status: string) => {
    const styles = {
      confirmed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-red-100 text-red-800',
      completed: 'bg-blue-100 text-blue-800',
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Container>
      <div className="py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
          <p className="text-gray-600 mt-2">Manage your event bookings and tickets</p>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <div className="flex space-x-2">
            {['all', 'confirmed', 'pending', 'completed'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                  filter === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Bookings List */}
        <div className="space-y-6">
          {filteredBookings.map((booking) => {
            const event = events[booking.eventId];
            if (!event) return null;

            return (
              <div key={booking.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="flex-1 mb-4 md:mb-0">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {event.title}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Event Date:</span> {new Date(event.startDate).toLocaleDateString()}
                      </div>
                      <div>
                        <span className="font-medium">Booking Date:</span> {booking.bookingDate}
                      </div>
                      <div>
                        <span className="font-medium">Tickets:</span> {booking.totalTickets}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row md:items-center md:space-x-4">
                    <div className="text-right mb-4 md:mb-0">
                      <div className="text-2xl font-bold text-gray-900">
                        ${booking.totalAmount}
                      </div>
                      <div className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-1 ${
                        getStatusBadge(booking.status)
                      }`}>
                        {booking.status}
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Link
                        to={`/bookings/${booking.id}`}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200"
                      >
                        View Details
                      </Link>
                      {booking.status === 'confirmed' && (
                        <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors duration-200">
                          Download QR
                        </button>
                      )}
                    </div>
                  </div>
                </div>

              {/* QR Code Preview (for confirmed bookings) */}
              {booking.status === 'confirmed' && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Digital Ticket</h4>
                      <p className="text-sm text-gray-600">Show this QR code at the event entrance</p>
                    </div>
                    <div className="w-20 h-20 bg-gray-100 border-2 border-gray-300 rounded-lg flex items-center justify-center">
                      <span className="text-xs text-gray-500">QR Code</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {filteredBookings.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500">
                <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
                <p className="text-sm mb-4">You haven't booked any events yet.</p>
                <Link
                  to="/events"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200"
                >
                  Browse Events
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </Container>
  );
};

export default MyBookingsPage;
