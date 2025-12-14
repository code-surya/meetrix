// Mock data for development and demo purposes

export interface MockEvent {
  id: number;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  category: string;
  venueName: string;
  address: string;
  city: string;
  country: string;
  maxAttendees: number;
  currentAttendees: number;
  organizer: string;
  status: 'published' | 'draft' | 'completed' | 'cancelled';
  ticketTypes: MockTicketType[];
  tags: string[];
}

export interface MockTicketType {
  id: number;
  name: string;
  price: number;
  quantity: number;
  sold: number;
  maxPerBooking: number;
}

export interface MockUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: 'attendee' | 'organizer' | 'admin';
  avatar?: string;
}

export interface MockBooking {
  id: number;
  userId: number;
  eventId: number;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  totalAmount: number;
  totalTickets: number;
  bookingDate: string;
  bookingItems: MockBookingItem[];
}

export interface MockBookingItem {
  id: number;
  bookingId: number;
  ticketTypeId: number;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  qrCodes: string[];
}

// Mock Events Data
export const mockEvents: MockEvent[] = [
  {
    id: 1,
    title: 'Tech Conference 2024',
    description: 'Join us for the most anticipated technology conference of the year! Featuring keynote speakers from leading tech companies, hands-on workshops, and networking opportunities with industry professionals.',
    startDate: '2024-01-15T09:00:00Z',
    endDate: '2024-01-15T18:00:00Z',
    category: 'Technology',
    venueName: 'Convention Center',
    address: '123 Tech Street',
    city: 'San Francisco',
    country: 'USA',
    maxAttendees: 500,
    currentAttendees: 245,
    organizer: 'Tech Events Inc.',
    status: 'published',
    ticketTypes: [
      { id: 1, name: 'Early Bird', price: 50, quantity: 50, sold: 45, maxPerBooking: 4 },
      { id: 2, name: 'Regular', price: 75, quantity: 100, sold: 89, maxPerBooking: 4 },
      { id: 3, name: 'VIP', price: 150, quantity: 25, sold: 25, maxPerBooking: 2 },
      { id: 4, name: 'Student', price: 25, quantity: 30, sold: 12, maxPerBooking: 4 },
    ],
    tags: ['Technology', 'Conference', 'Networking'],
  },
  {
    id: 2,
    title: 'Music Festival Summer',
    description: 'Three-day outdoor music festival with multiple stages and international artists. Experience live performances from top musicians and enjoy food, drinks, and entertainment for the whole family.',
    startDate: '2024-01-20T14:00:00Z',
    endDate: '2024-01-22T23:00:00Z',
    category: 'Music',
    venueName: 'Central Park',
    address: '456 Music Ave',
    city: 'New York',
    country: 'USA',
    maxAttendees: 1000,
    currentAttendees: 450,
    organizer: 'Festival Productions',
    status: 'published',
    ticketTypes: [
      { id: 5, name: '3-Day Pass', price: 120, quantity: 200, sold: 180, maxPerBooking: 6 },
      { id: 6, name: 'VIP Weekend', price: 250, quantity: 50, sold: 45, maxPerBooking: 4 },
      { id: 7, name: 'Single Day', price: 45, quantity: 100, sold: 25, maxPerBooking: 4 },
    ],
    tags: ['Music', 'Festival', 'Outdoor', 'Entertainment'],
  },
  {
    id: 3,
    title: 'Business Leadership Summit',
    description: 'Exclusive summit for business leaders focusing on innovation and growth strategies. Network with industry leaders and learn from successful entrepreneurs.',
    startDate: '2024-01-10T08:00:00Z',
    endDate: '2024-01-10T17:00:00Z',
    category: 'Business',
    venueName: 'Grand Hotel Ballroom',
    address: '789 Business Blvd',
    city: 'Chicago',
    country: 'USA',
    maxAttendees: 200,
    currentAttendees: 180,
    organizer: 'Business Leaders Network',
    status: 'completed',
    ticketTypes: [
      { id: 8, name: 'Premium', price: 150, quantity: 50, sold: 50, maxPerBooking: 2 },
      { id: 9, name: 'Standard', price: 100, quantity: 100, sold: 100, maxPerBooking: 4 },
      { id: 10, name: 'Student', price: 50, quantity: 50, sold: 30, maxPerBooking: 2 },
    ],
    tags: ['Business', 'Leadership', 'Networking', 'Innovation'],
  },
  {
    id: 4,
    title: 'Art & Design Exhibition',
    description: 'Contemporary art exhibition featuring works from emerging and established artists. Explore various mediums including paintings, sculptures, and digital art installations.',
    startDate: '2024-01-25T10:00:00Z',
    endDate: '2024-01-27T18:00:00Z',
    category: 'Arts',
    venueName: 'Modern Art Museum',
    address: '321 Creative Lane',
    city: 'Los Angeles',
    country: 'USA',
    maxAttendees: 300,
    currentAttendees: 95,
    organizer: 'Art Collective LA',
    status: 'published',
    ticketTypes: [
      { id: 11, name: 'General Admission', price: 20, quantity: 150, sold: 45, maxPerBooking: 6 },
      { id: 12, name: 'VIP Tour', price: 50, quantity: 50, sold: 35, maxPerBooking: 4 },
      { id: 13, name: 'Student', price: 10, quantity: 100, sold: 15, maxPerBooking: 4 },
    ],
    tags: ['Art', 'Design', 'Exhibition', 'Culture'],
  },
  {
    id: 5,
    title: 'Startup Pitch Competition',
    description: 'Pitch competition for early-stage startups seeking investment and mentorship. Connect with investors, industry experts, and fellow entrepreneurs.',
    startDate: '2024-01-30T13:00:00Z',
    endDate: '2024-01-30T20:00:00Z',
    category: 'Business',
    venueName: 'Innovation Hub',
    address: '654 Startup Drive',
    city: 'Austin',
    country: 'USA',
    maxAttendees: 150,
    currentAttendees: 75,
    organizer: 'Startup Austin',
    status: 'draft',
    ticketTypes: [
      { id: 14, name: 'Attendee', price: 25, quantity: 100, sold: 0, maxPerBooking: 4 },
      { id: 15, name: 'VIP Networking', price: 75, quantity: 30, sold: 0, maxPerBooking: 2 },
      { id: 16, name: 'Pitch Participant', price: 50, quantity: 20, sold: 0, maxPerBooking: 1 },
    ],
    tags: ['Startup', 'Pitch', 'Investment', 'Networking'],
  },
];

// Mock Users Data
export const mockUsers: MockUser[] = [
  {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    role: 'attendee',
  },
  {
    id: 2,
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@example.com',
    role: 'organizer',
  },
  {
    id: 3,
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@meetrix.com',
    role: 'admin',
  },
];

// Mock Bookings Data
export const mockBookings: MockBooking[] = [
  {
    id: 1,
    userId: 1,
    eventId: 1,
    status: 'confirmed',
    totalAmount: 75,
    totalTickets: 1,
    bookingDate: '2024-01-10',
    bookingItems: [
      {
        id: 1,
        bookingId: 1,
        ticketTypeId: 2,
        quantity: 1,
        unitPrice: 75,
        subtotal: 75,
        qrCodes: ['QR-CODE-1'],
      },
    ],
  },
  {
    id: 2,
    userId: 1,
    eventId: 2,
    status: 'pending',
    totalAmount: 240,
    totalTickets: 2,
    bookingDate: '2024-01-12',
    bookingItems: [
      {
        id: 2,
        bookingId: 2,
        ticketTypeId: 5,
        quantity: 2,
        unitPrice: 120,
        subtotal: 240,
        qrCodes: ['QR-CODE-2A', 'QR-CODE-2B'],
      },
    ],
  },
];

// Utility functions
export const getEventById = (id: number): MockEvent | undefined => {
  return mockEvents.find(event => event.id === id);
};

export const getEventsByFilters = (filters: any) => {
  let filteredEvents = [...mockEvents];

  if (filters.category) {
    filteredEvents = filteredEvents.filter(event =>
      event.category.toLowerCase().includes(filters.category.toLowerCase())
    );
  }

  if (filters.search) {
    filteredEvents = filteredEvents.filter(event =>
      event.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      event.description.toLowerCase().includes(filters.search.toLowerCase())
    );
  }

  if (filters.status) {
    filteredEvents = filteredEvents.filter(event => event.status === filters.status);
  }

  // Simple pagination
  const page = filters.page || 1;
  const limit = filters.limit || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedEvents = filteredEvents.slice(startIndex, endIndex);

  return {
    data: paginatedEvents,
    pagination: {
      page,
      limit,
      total: filteredEvents.length,
      pages: Math.ceil(filteredEvents.length / limit),
    },
  };
};

export const getUserBookings = (userId: number) => {
  return mockBookings.filter(booking => booking.userId === userId);
};

export const getBookingById = (id: number) => {
  return mockBookings.find(booking => booking.id === id);
};

