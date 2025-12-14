import { useState, useEffect } from 'react';
import apiClient from '@/services/api/client';
import { API_ENDPOINTS } from '@/services/api/endpoints';

interface AnalyticsData {
  summary: any;
  revenue: any;
  attendance: any;
  ticket_sales: any;
  event_performance: any;
  recent_events: any[];
}

export const useAnalytics = (dateRange?: { start: Date; end: Date }) => {
  const [dashboardData, setDashboardData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = dateRange ? {
        start_date: dateRange.start.toISOString().split('T')[0],
        end_date: dateRange.end.toISOString().split('T')[0],
      } : {};

      const response = await apiClient.get(API_ENDPOINTS.ANALYTICS.DASHBOARD, { params });

      if (response.data.success) {
        setDashboardData(response.data.data);
      } else {
        setError('Failed to fetch analytics data');
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'An error occurred');
      console.error('Analytics fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [dateRange?.start, dateRange?.end]);

  const refetch = () => {
    fetchDashboardData();
  };

  return {
    dashboardData,
    isLoading,
    error,
    refetch,
  };
};

export const useRevenueAnalytics = (dateRange?: { start: Date; end: Date }) => {
  const [revenueData, setRevenueData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRevenueData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = dateRange ? {
        start_date: dateRange.start.toISOString().split('T')[0],
        end_date: dateRange.end.toISOString().split('T')[0],
      } : {};

      const response = await apiClient.get(API_ENDPOINTS.ANALYTICS.REVENUE, { params });

      if (response.data.success) {
        setRevenueData(response.data.data);
      } else {
        setError('Failed to fetch revenue data');
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'An error occurred');
      console.error('Revenue analytics error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRevenueData();
  }, [dateRange?.start, dateRange?.end]);

  return {
    revenueData,
    isLoading,
    error,
    refetch: fetchRevenueData,
  };
};

export const useAttendanceAnalytics = (dateRange?: { start: Date; end: Date }) => {
  const [attendanceData, setAttendanceData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAttendanceData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = dateRange ? {
        start_date: dateRange.start.toISOString().split('T')[0],
        end_date: dateRange.end.toISOString().split('T')[0],
      } : {};

      const response = await apiClient.get(API_ENDPOINTS.ANALYTICS.ATTENDANCE, { params });

      if (response.data.success) {
        setAttendanceData(response.data.data);
      } else {
        setError('Failed to fetch attendance data');
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'An error occurred');
      console.error('Attendance analytics error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceData();
  }, [dateRange?.start, dateRange?.end]);

  return {
    attendanceData,
    isLoading,
    error,
    refetch: fetchAttendanceData,
  };
};

export const useTicketSalesAnalytics = (dateRange?: { start: Date; end: Date }) => {
  const [ticketSalesData, setTicketSalesData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTicketSalesData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = dateRange ? {
        start_date: dateRange.start.toISOString().split('T')[0],
        end_date: dateRange.end.toISOString().split('T')[0],
      } : {};

      const response = await apiClient.get(API_ENDPOINTS.ANALYTICS.TICKET_SALES, { params });

      if (response.data.success) {
        setTicketSalesData(response.data.data);
      } else {
        setError('Failed to fetch ticket sales data');
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'An error occurred');
      console.error('Ticket sales analytics error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTicketSalesData();
  }, [dateRange?.start, dateRange?.end]);

  return {
    ticketSalesData,
    isLoading,
    error,
    refetch: fetchTicketSalesData,
  };
};

