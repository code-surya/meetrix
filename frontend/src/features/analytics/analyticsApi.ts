import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_ENDPOINTS } from '@/services/api/endpoints';

export interface DashboardSummary {
  total_registrations: number;
  total_revenue: number;
  attendance_rate: number;
  total_events: number;
  active_events: number;
  upcoming_events: number;
}

export interface RevenueData {
  total_revenue: number;
  revenue_by_event: Array<{
    event_id: number;
    event_title: string;
    revenue: number;
    payment_count: number;
  }>;
  revenue_trends: Array<{
    period: string;
    revenue: number;
    payment_count: number;
  }>;
}

export interface RegistrationsData {
  total_registrations: number;
  ticket_sales_over_time: Array<{
    period: string;
    tickets_sold: number;
    revenue: number;
  }>;
  attendance_rate: number;
}

export interface EventPerformance {
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

export const analyticsApi = createApi({
  reducerPath: 'analyticsApi',
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
  tagTypes: ['Analytics'],
  endpoints: (builder) => ({
    getDashboard: builder.query<
      {
        summary: DashboardSummary;
        top_events: any[];
        recent_activity: any[];
      },
      { start_date?: string; end_date?: string }
    >({
      query: (params) => ({
        url: API_ENDPOINTS.ANALYTICS.DASHBOARD,
        params,
      }),
      providesTags: ['Analytics'],
    }),

    getRevenue: builder.query<
      RevenueData,
      { start_date?: string; end_date?: string; period?: string }
    >({
      query: (params) => ({
        url: API_ENDPOINTS.ANALYTICS.REVENUE,
        params,
      }),
      providesTags: ['Analytics'],
    }),

    getRegistrations: builder.query<
      RegistrationsData,
      { start_date?: string; end_date?: string; period?: string }
    >({
      query: (params) => ({
        url: API_ENDPOINTS.ANALYTICS.REGISTRATIONS,
        params,
      }),
      providesTags: ['Analytics'],
    }),

    getEventPerformance: builder.query<
      {
        event_performance: EventPerformance[];
        top_events: any[];
      },
      { start_date?: string; end_date?: string; limit?: number }
    >({
      query: (params) => ({
        url: API_ENDPOINTS.ANALYTICS.EVENTS,
        params,
      }),
      providesTags: ['Analytics'],
    }),

    getEventAnalytics: builder.query<
      { analytics: any },
      number | string
    >({
      query: (eventId) => API_ENDPOINTS.ANALYTICS.EVENT(eventId),
      providesTags: (result, error, eventId) => [
        { type: 'Analytics', id: eventId },
      ],
    }),

    getTicketTypePerformance: builder.query<
      { ticket_type_performance: any[] },
      { event_id?: number; start_date?: string; end_date?: string }
    >({
      query: (params) => ({
        url: API_ENDPOINTS.ANALYTICS.TICKET_TYPES,
        params,
      }),
      providesTags: ['Analytics'],
    }),
  }),
});

export const {
  useGetDashboardQuery,
  useGetRevenueQuery,
  useGetRegistrationsQuery,
  useGetEventPerformanceQuery,
  useGetEventAnalyticsQuery,
  useGetTicketTypePerformanceQuery,
} = analyticsApi;

