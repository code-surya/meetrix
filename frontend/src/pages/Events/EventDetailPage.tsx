import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Container } from '@/components/layout/Container';
import { dataService } from '@/services/dataService';
import { useAppSelector } from '@/store';
import type { MockEvent } from '@/services/mockData';

const EventDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [event, setEvent] = useState<MockEvent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load event from data service
    const loadEvent = async () => {
      if (!id) return;

      setLoading(true);
      try {
        const eventData = dataService.getEventById(parseInt(id));
        if (eventData) {
          setEvent(eventData);
        }
      } catch (error) {
        console.error('Failed to load event:', error);
      } finally {
        setLoading(false);
      }
    };

    loadEvent();
  }, [id]);

  const handleBookTickets = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (event) {
      navigate(`/events/${event.id}/book`);
    }
  };

  if (loading) {
    return (
      <Container>
        <div className="py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2 mb-8"></div>
            <div className="h-64 bg-gray-300 rounded mb-8"></div>
            <div className="h-4 bg-gray-300 rounded mb-4"></div>
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
          </div>
        </div>
      </Container>
    );
  }

  if (!event) {
    return (
      <Container>
        <div className="py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Event Not Found</h1>
            <p className="text-gray-600 mb-8">The event you're looking for doesn't exist.</p>
            <Link
              to="/events"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
            >
              Browse Events
            </Link>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="py-12">
        {/* Event Header */}
        <div className="card mb-12 fade-in">
          <div className="relative">
            <div className="h-80 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-t-2xl flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="text-center text-white z-10">
                <h1 className="text-5xl font-bold mb-3">{event.title}</h1>
                <p className="text-2xl opacity-90 font-medium">{event.category}</p>
              </div>
              <div className="absolute top-6 right-6">
                <div className={`inline-flex px-4 py-2 text-sm font-semibold rounded-full backdrop-blur-sm ${
                  event.status === 'published' ? 'bg-green-500/90 text-white' :
                  event.status === 'draft' ? 'bg-yellow-500/90 text-white' :
                  'bg-blue-500/90 text-white'
                }`}>
                  {event.status}
                </div>
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              <div className="mb-4 md:mb-0">
                <div className="flex items-center text-gray-600 mb-2">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {new Date(event.startDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
                <div className="flex items-center text-gray-600">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {event.venueName} - {event.address}
                </div>
              </div>

              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {event.currentAttendees}/{event.maxAttendees}
                </div>
                <div className="text-sm text-gray-600">Attendees</div>
                <div className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-2 ${
                  event.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {event.status}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleBookTickets}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium text-center transition-colors duration-200"
              >
                {isAuthenticated ? 'Book Tickets' : 'Login to Book'}
              </button>
              <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-900 px-6 py-3 rounded-lg font-medium transition-colors duration-200">
                Share Event
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Event</h2>
              <p className="text-gray-700 leading-relaxed">{event.description}</p>

              {/* Tags */}
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {event.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Organizer Info */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Organizer</h2>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center text-lg font-bold text-gray-600 mr-4">
                  {event.organizer[0]}
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{event.organizer}</h3>
                  <p className="text-gray-600">Event Organizer</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Ticket Types */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Tickets</h2>
              <div className="space-y-4">
                {event.ticketTypes.map((ticket) => (
                  <div key={ticket.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-gray-900">{ticket.name}</h3>
                      <span className="text-lg font-bold text-gray-900">${ticket.price}</span>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      {ticket.quantity - ticket.sold} of {ticket.quantity} remaining
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${(ticket.sold / ticket.quantity) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>

              <Link
                to={`/events/${event.id}/book`}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium text-center block mt-4 transition-colors duration-200"
              >
                Book Now
              </Link>
            </div>

            {/* Event Stats */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Event Stats</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Capacity</span>
                  <span className="font-medium">{event.maxAttendees}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Current Attendees</span>
                  <span className="font-medium">{event.currentAttendees}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tickets Sold</span>
                  <span className="font-medium">
                    {event.ticketTypes.reduce((sum, ticket) => sum + ticket.sold, 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Availability</span>
                  <span className="font-medium text-green-600">
                    {Math.round(((event.maxAttendees - event.currentAttendees) / event.maxAttendees) * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default EventDetailPage;
