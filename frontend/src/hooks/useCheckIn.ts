import { useState, useCallback } from 'react';
import apiClient from '@/services/api/client';
import { API_ENDPOINTS } from '@/services/api/endpoints';

interface AttendeeInfo {
  name: string;
  email: string;
  ticket_type: string;
  booking_reference: string;
  ticket_number: number;
}

interface CheckInResult {
  success: boolean;
  message: string;
  attendee?: AttendeeInfo;
  checked_in_at?: string;
  checked_in_by?: string;
}

export const useCheckIn = (eventId: number | string) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [lastResult, setLastResult] = useState<CheckInResult | null>(null);

  const verifyQrCode = useCallback(async (qrData: string) => {
    setIsVerifying(true);
    setLastResult(null);

    try {
      const response = await apiClient.post(
        `/events/${eventId}/check_ins/verify_qr`,
        { qr_data: qrData }
      );

      if (response.data.success) {
        const result: CheckInResult = {
          success: true,
          message: 'QR code verified successfully',
          attendee: response.data.data.attendee,
        };
        setLastResult(result);
        return result;
      } else {
        const result: CheckInResult = {
          success: false,
          message: response.data.error?.message || 'Invalid QR code',
        };
        setLastResult(result);
        return result;
      }
    } catch (error: any) {
      const result: CheckInResult = {
        success: false,
        message: error.response?.data?.error?.message || 'Failed to verify QR code',
      };
      setLastResult(result);
      return result;
    } finally {
      setIsVerifying(false);
    }
  }, [eventId]);

  const checkInAttendee = useCallback(async (bookingItemId: number, qrData: string) => {
    setIsCheckingIn(true);

    try {
      const response = await apiClient.post(
        `/events/${eventId}/check_ins/${bookingItemId}/check_in`,
        { qr_data: qrData }
      );

      if (response.data.success) {
        const result: CheckInResult = {
          success: true,
          message: response.data.data.message,
          attendee: response.data.data.attendee,
          checked_in_at: response.data.data.checked_in_at,
          checked_in_by: response.data.data.checked_in_by,
        };
        setLastResult(result);
        return result;
      } else {
        const result: CheckInResult = {
          success: false,
          message: response.data.error?.message || 'Check-in failed',
        };
        setLastResult(result);
        return result;
      }
    } catch (error: any) {
      const result: CheckInResult = {
        success: false,
        message: error.response?.data?.error?.message || 'Check-in failed',
      };
      setLastResult(result);
      return result;
    } finally {
      setIsCheckingIn(false);
    }
  }, [eventId]);

  const bulkCheckIn = useCallback(async (bookingReferences: string[], checkInMethod = 'manual') => {
    try {
      const response = await apiClient.post(
        `/events/${eventId}/check_ins/bulk_check_in`,
        {
          booking_references: bookingReferences,
          check_in_method: checkInMethod,
        }
      );

      return {
        success: true,
        message: response.data.data.message,
        results: response.data.data.results,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.error?.message || 'Bulk check-in failed',
      };
    }
  }, [eventId]);

  const clearResult = useCallback(() => {
    setLastResult(null);
  }, []);

  return {
    verifyQrCode,
    checkInAttendee,
    bulkCheckIn,
    clearResult,
    isVerifying,
    isCheckingIn,
    lastResult,
  };
};

