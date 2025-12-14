import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { apiClient } from '@/services/api/client';
import { API_ENDPOINTS } from '@/services/api/endpoints';
import { Event, EventFilters, PaginatedResponse } from './eventsTypes';
import { dataService } from '@/services/dataService';

// Mock base query for development
const mockBaseQuery = async (args: any) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));

  try {
    if (typeof args === 'string') {
      // GET /events/:id
      if (args.includes('/events/') && !args.includes('/search') && args.method !== 'DELETE') {
        const eventId = parseInt(args.split('/events/')[1]);
        const event = dataService.getEventById(eventId);
        if (event) {
          return { data: event };
        }
        return { error: { status: 404, data: { message: 'Event not found' } } };
      }
    } else if (args.url) {
      // GET /events (list)
      if ((args.url === API_ENDPOINTS.EVENTS.LIST || args.url.includes('/events')) && args.method !== 'POST') {
        const filters = args.params || {};
        const events = dataService.getEvents();

        // Apply filters
        let filteredEvents = events;
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

        // Pagination
        const page = filters.page || 1;
        const limit = filters.limit || 10;
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedEvents = filteredEvents.slice(startIndex, endIndex);

        return {
          data: {
            data: paginatedEvents,
            pagination: {
              page,
              limit,
              total: filteredEvents.length,
              pages: Math.ceil(filteredEvents.length / limit),
            }
          }
        };
      }

      // POST /events (create)
      if (args.url === API_ENDPOINTS.EVENTS.CREATE && args.method === 'POST') {
        const newEvent = dataService.createEvent(args.body);
        return { data: newEvent };
      }

      // PUT/PATCH /events/:id (update)
      if (args.url.includes('/events/') && (args.method === 'PUT' || args.method === 'PATCH')) {
        const eventId = parseInt(args.url.split('/events/')[1]);
        const updatedEvent = dataService.updateEvent(eventId, args.body);
        if (updatedEvent) {
          return { data: updatedEvent };
        }
        return { error: { status: 404, data: { message: 'Event not found' } } };
      }

      // DELETE /events/:id
      if (args.url.includes('/events/') && args.method === 'DELETE') {
        const eventId = parseInt(args.url.split('/events/')[1]);
        const deleted = dataService.deleteEvent(eventId);
        if (deleted) {
          return { data: { success: true } };
        }
        return { error: { status: 404, data: { message: 'Event not found' } } };
      }
    }

    // Fallback
    return { data: dataService.getEvents().slice(0, 10) };
  } catch (error) {
    return { error: { status: 500, data: { message: 'Internal server error' } } };
  }
};

// RTK Query API for events
export const eventsApi = createApi({
  reducerPath: 'eventsApi',
  baseQuery: process.env.NODE_ENV === 'development' ? mockBaseQuery : fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1',
    prepareHeaders: (headers, { getState }) => {
      const token = localStorage.getItem('access_token');
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Event', 'Events'],
  endpoints: (builder) => ({
    // Get events list with filters
    getEvents: builder.query<PaginatedResponse<Event>, EventFilters>({
      query: (filters) => ({
        url: API_ENDPOINTS.EVENTS.LIST,
        params: filters,
      }),
      providesTags: ['Events'],
      // Merge paginated results for infinite scroll
      serializeQueryArgs: ({ endpointName, queryArgs }) => {
        // Create unique key excluding page number for caching
        const { page, ...rest } = queryArgs as any;
        return JSON.stringify({ endpointName, ...rest });
      },
      merge: (currentCache, newItems, { arg }) => {
        const currentPage = (arg as any)?.page || 1;
        
        if (currentPage === 1) {
          return newItems;
        }
        
        return {
          ...newItems,
          data: {
            ...newItems.data,
            events: [...(currentCache?.data?.events || []), ...(newItems.data?.events || [])],
            pagination: newItems.data?.pagination || newItems.data.pagination,
          },
        };
      },
      forceRefetch: ({ currentArg, previousArg }) => {
        // Refetch if filters change (not just page)
        const { page: currentPage, ...currentRest } = (currentArg as any) || {};
        const { page: prevPage, ...prevRest } = (previousArg as any) || {};
        return JSON.stringify(currentRest) !== JSON.stringify(prevRest);
      },
    }),

    // Get event details
    getEvent: builder.query<Event, number | string>({
      query: (id) => API_ENDPOINTS.EVENTS.DETAIL(id),
      providesTags: (result, error, id) => [{ type: 'Event', id }],
    }),

    // Search events
    searchEvents: builder.query<PaginatedResponse<Event>, { q: string; [key: string]: any }>({
      query: (params) => ({
        url: API_ENDPOINTS.EVENTS.SEARCH,
        params,
      }),
      // Merge paginated results for infinite scroll
      serializeQueryArgs: ({ endpointName, queryArgs }) => {
        const { page, ...rest } = queryArgs as any;
        return JSON.stringify({ endpointName, ...rest });
      },
      merge: (currentCache, newItems, { arg }) => {
        const currentPage = (arg as any)?.page || 1;
        
        if (currentPage === 1) {
          return newItems;
        }
        
        return {
          ...newItems,
          data: {
            ...newItems.data,
            events: [...(currentCache?.data?.events || []), ...(newItems.data?.events || [])],
            pagination: newItems.data?.pagination || newItems.data.pagination,
          },
        };
      },
      forceRefetch: ({ currentArg, previousArg }) => {
        const { page: currentPage, ...currentRest } = (currentArg as any) || {};
        const { page: prevPage, ...prevRest } = (previousArg as any) || {};
        return JSON.stringify(currentRest) !== JSON.stringify(prevRest);
      },
    }),

    // Create event (organizer only)
    createEvent: builder.mutation<Event, Partial<Event>>({
      query: (eventData) => ({
        url: API_ENDPOINTS.EVENTS.CREATE,
        method: 'POST',
        body: { event: eventData },
      }),
      invalidatesTags: ['Events'],
    }),

    // Update event
    updateEvent: builder.mutation<Event, { id: number | string; data: Partial<Event> }>({
      query: ({ id, data }) => ({
        url: API_ENDPOINTS.EVENTS.UPDATE(id),
        method: 'PATCH',
        body: { event: data },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Event', id },
        'Events',
      ],
    }),

    // Delete event
    deleteEvent: builder.mutation<void, number | string>({
      query: (id) => ({
        url: API_ENDPOINTS.EVENTS.DELETE(id),
        method: 'DELETE',
      }),
      invalidatesTags: ['Events'],
    }),

    // Publish event
    publishEvent: builder.mutation<Event, number | string>({
      query: (id) => ({
        url: API_ENDPOINTS.EVENTS.PUBLISH(id),
        method: 'PATCH',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Event', id },
        'Events',
      ],
    }),

    // Get event analytics
    getEventAnalytics: builder.query<any, number | string>({
      query: (id) => API_ENDPOINTS.EVENTS.ANALYTICS(id),
    }),
  }),
});

export const {
  useGetEventsQuery,
  useGetEventQuery,
  useSearchEventsQuery,
  useCreateEventMutation,
  useUpdateEventMutation,
  useDeleteEventMutation,
  usePublishEventMutation,
  useGetEventAnalyticsQuery,
} = eventsApi;

