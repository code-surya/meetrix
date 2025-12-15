import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dataService } from '@/services/dataService';
import { Container } from '@/components/layout/Container';
import type { MockEvent } from '@/services/mockData';

const EventDiscoveryPage = () => {
  const [events, setEvents] = useState<MockEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<MockEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'price'>('date');

  const categories = ['All', 'Technology', 'Music', 'Business', 'Arts', 'Sports', 'Education'];

  useEffect(() => {
    // Load events from data service
    const loadEvents = async () => {
      setIsLoading(true);
      try {
        const eventData = dataService.getEvents();
        setEvents(eventData);
        setFilteredEvents(eventData);
      } catch (error) {
        console.error('Failed to load events:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadEvents();
  }, []);

  useEffect(() => {
    // Filter and sort events
    let filtered = events.filter(event => {
      const matchesSearch = !searchQuery ||
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = !selectedCategory || selectedCategory === 'All' ||
        event.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });

    // Sort events
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.title.localeCompare(b.title);
        case 'price':
          const aMinPrice = Math.min(...a.ticketTypes.map(t => t.price));
          const bMinPrice = Math.min(...b.ticketTypes.map(t => t.price));
          return aMinPrice - bMinPrice;
        case 'date':
        default:
          return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
      }
    });

    setFilteredEvents(filtered);
  }, [events, searchQuery, selectedCategory, sortBy]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category === 'All' ? '' : category);
  };

  return (
    <Container>
      <div className="py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Discover Events</h1>
          <p className="text-gray-600 mt-2">Find amazing events happening around you</p>
        </div>

        {/* Search and Filters */}
        <div className="card mb-12 fade-in">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-2">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search events..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="form-input pl-12"
                />
              </div>
            </div>

            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a.997.997 0 01-1.414 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="form-select pl-12"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                </div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'date' | 'name' | 'price')}
                  className="form-select pl-12"
                >
                  <option value="date">Sort by Date</option>
                  <option value="name">Sort by Name</option>
                  <option value="price">Sort by Price</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Events Grid */}
        {isLoading ? (
          <div className="grid-cards">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="skeleton-card rounded-t-2xl"></div>
                <div className="p-6">
                  <div className="skeleton-title mb-3"></div>
                  <div className="skeleton-text mb-2"></div>
                  <div className="skeleton-text mb-4 w-3/4"></div>
                  <div className="flex justify-between mb-6">
                    <div className="skeleton-text w-16 h-8"></div>
                    <div className="skeleton-text w-20 h-6"></div>
                  </div>
                  <div className="skeleton-text w-full h-12 rounded-xl"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="mb-6 flex items-center justify-between">
              <div className="text-gray-600 font-medium">
                Found <span className="text-blue-600 font-semibold">{filteredEvents.length}</span> event{filteredEvents.length !== 1 ? 's' : ''}
              </div>
            </div>

            {filteredEvents.length === 0 ? (
              <div className="card text-center py-16">
                <div className="max-w-md mx-auto">
                  <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">No events found</h3>
                  <p className="text-gray-600 mb-6">Try adjusting your search criteria or browse all events.</p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('');
                    }}
                    className="btn btn-secondary"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map((event, index) => {
                  const minPrice = Math.min(...event.ticketTypes.map(t => t.price));
                  const maxPrice = Math.max(...event.ticketTypes.map(t => t.price));
                  const priceRange = minPrice === maxPrice ? `$${minPrice}` : `$${minPrice} - $${maxPrice}`;

                  return (
                    <div
                      key={event.id}
                      className="card hover-lift fade-in-up"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="relative">
                        <div className="h-48 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-t-2xl flex items-center justify-center relative overflow-hidden">
                          <div className="absolute inset-0 bg-black/10"></div>
                          <div className="text-center text-white z-10">
                            <div className="text-4xl font-bold mb-1">{event.title.charAt(0)}</div>
                            <div className="text-sm opacity-90 font-medium">{event.category}</div>
                          </div>
                          <div className="absolute top-4 right-4">
                            <div className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full backdrop-blur-sm ${
                              event.status === 'published' ? 'bg-green-500/90 text-white' :
                              event.status === 'draft' ? 'bg-yellow-500/90 text-white' :
                              'bg-blue-500/90 text-white'
                            }`}>
                              {event.status}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 hover:text-blue-600 transition-colors">
                          {event.title}
                        </h3>

                        <div className="space-y-3 mb-6">
                          <div className="flex items-center text-gray-600">
                            <div className="w-5 h-5 mr-3 text-blue-500">
                              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <span className="text-sm font-medium">
                              {new Date(event.startDate).toLocaleDateString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </span>
                          </div>

                          <div className="flex items-center text-gray-600">
                            <div className="w-5 h-5 mr-3 text-purple-500">
                              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                            </div>
                            <span className="text-sm font-medium">{event.city}, {event.country}</span>
                          </div>

                          <div className="flex items-center text-gray-600">
                            <div className="w-5 h-5 mr-3 text-green-500">
                              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                              </svg>
                            </div>
                            <span className="text-sm font-medium">{event.currentAttendees}/{event.maxAttendees} attending</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mb-6">
                          <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            {priceRange}
                          </div>
                        </div>

                        <Link
                          to={`/events/${event.id}`}
                          className="w-full btn btn-primary text-center block group"
                        >
                          <span className="flex items-center justify-center">
                            View Details
                            <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </span>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </Container>
  );
};

export default EventDiscoveryPage;

