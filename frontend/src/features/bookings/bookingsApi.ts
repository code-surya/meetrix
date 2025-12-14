import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_ENDPOINTS } from '@/services/api/endpoints';

export const bookingsApi = createApi({
  reducerPath: 'bookingsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('access_token');
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Booking', 'Bookings'],
  endpoints: (builder) => ({
    getBookings: builder.query<any, { page?: number; per_page?: number }>({
      query: (params) => ({
        url: API_ENDPOINTS.BOOKINGS.LIST,
        params,
      }),
      providesTags: ['Bookings'],
    }),

    getBooking: builder.query<any, number | string>({
      query: (id) => API_ENDPOINTS.BOOKINGS.DETAIL(id),
      providesTags: (result, error, id) => [{ type: 'Booking', id }],
    }),

    createBooking: builder.mutation<any, any>({
      query: (bookingData) => ({
        url: API_ENDPOINTS.BOOKINGS.CREATE,
        method: 'POST',
        body: bookingData,
      }),
      invalidatesTags: ['Bookings'],
    }),

    confirmBooking: builder.mutation<any, number | string>({
      query: (id) => ({
        url: API_ENDPOINTS.BOOKINGS.CONFIRM(id),
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Booking', id }, 'Bookings'],
    }),

    cancelBooking: builder.mutation<any, number | string>({
      query: (id) => ({
        url: API_ENDPOINTS.BOOKINGS.CANCEL(id),
        method: 'PATCH',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Booking', id }, 'Bookings'],
    }),
  }),
});

export const {
  useGetBookingsQuery,
  useGetBookingQuery,
  useCreateBookingMutation,
  useConfirmBookingMutation,
  useCancelBookingMutation,
} = bookingsApi;

