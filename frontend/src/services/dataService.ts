// Centralized data service for localStorage persistence
import { mockEvents, mockBookings, mockUsers, type MockEvent, type MockBooking } from './mockData';

class DataService {
  private readonly EVENTS_KEY = 'meetrix_events';
  private readonly BOOKINGS_KEY = 'meetrix_bookings';
  private readonly USERS_KEY = 'meetrix_users';

  // Events
  getEvents(): MockEvent[] {
    const stored = localStorage.getItem(this.EVENTS_KEY);
    return stored ? JSON.parse(stored) : mockEvents;
  }

  saveEvents(events: MockEvent[]): void {
    localStorage.setItem(this.EVENTS_KEY, JSON.stringify(events));
  }

  getEventById(id: number): MockEvent | undefined {
    return this.getEvents().find(event => event.id === id);
  }

  createEvent(event: Omit<MockEvent, 'id'>): MockEvent {
    const events = this.getEvents();
    const newEvent = {
      ...event,
      id: Date.now(),
      status: 'draft' as const,
    };
    events.push(newEvent);
    this.saveEvents(events);
    return newEvent;
  }

  updateEvent(id: number, updates: Partial<MockEvent>): MockEvent | null {
    const events = this.getEvents();
    const index = events.findIndex(event => event.id === id);
    if (index !== -1) {
      events[index] = { ...events[index], ...updates };
      this.saveEvents(events);
      return events[index];
    }
    return null;
  }

  deleteEvent(id: number): boolean {
    const events = this.getEvents();
    const filtered = events.filter(event => event.id !== id);
    if (filtered.length !== events.length) {
      this.saveEvents(filtered);
      return true;
    }
    return false;
  }

  // Bookings
  getBookings(): MockBooking[] {
    const stored = localStorage.getItem(this.BOOKINGS_KEY);
    return stored ? JSON.parse(stored) : mockBookings;
  }

  saveBookings(bookings: MockBooking[]): void {
    localStorage.setItem(this.BOOKINGS_KEY, JSON.stringify(bookings));
  }

  getBookingsByUser(userId: number): MockBooking[] {
    return this.getBookings().filter(booking => booking.userId === userId);
  }

  getBookingById(id: number): MockBooking | undefined {
    return this.getBookings().find(booking => booking.id === id);
  }

  createBooking(booking: Omit<MockBooking, 'id' | 'bookingDate'>): MockBooking {
    const bookings = this.getBookings();
    const newBooking = {
      ...booking,
      id: Date.now(),
      bookingDate: new Date().toISOString().split('T')[0],
    };
    bookings.push(newBooking);
    this.saveBookings(bookings);
    return newBooking;
  }

  updateBooking(id: number, updates: Partial<MockBooking>): MockBooking | null {
    const bookings = this.getBookings();
    const index = bookings.findIndex(booking => booking.id === id);
    if (index !== -1) {
      bookings[index] = { ...bookings[index], ...updates };
      this.saveBookings(bookings);
      return bookings[index];
    }
    return null;
  }

  // Analytics helpers
  getOrganizerEvents(organizerId: number): MockEvent[] {
    return this.getEvents().filter(event => event.organizer === mockUsers.find(u => u.id === organizerId)?.email);
  }

  getEventBookings(eventId: number): MockBooking[] {
    return this.getBookings().filter(booking => booking.eventId === eventId);
  }

  getOrganizerStats(organizerId: number) {
    const events = this.getOrganizerEvents(organizerId);
    const allBookings = events.flatMap(event => this.getEventBookings(event.id));

    return {
      totalEvents: events.length,
      totalBookings: allBookings.length,
      totalRevenue: allBookings.reduce((sum, booking) => sum + booking.totalAmount, 0),
      confirmedBookings: allBookings.filter(b => b.status === 'confirmed').length,
    };
  }
}

export const dataService = new DataService();

