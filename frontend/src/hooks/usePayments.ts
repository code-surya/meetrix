import { useState, useCallback } from 'react';
import apiClient from '@/services/api/client';
import { API_ENDPOINTS } from '@/services/api/endpoints';

export const usePayment = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPaymentIntent = useCallback(
    async (paymentData: { bookingId: number; gateway: string }) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await apiClient.post(API_ENDPOINTS.PAYMENTS.CREATE, {
          booking_id: paymentData.bookingId,
          gateway: paymentData.gateway,
        });

        if (response.data.success) {
          return {
            success: true,
            payment_intent: response.data.data?.payment_intent,
            payment: response.data.data?.payment,
          };
        }

        return { success: false, error: 'Failed to create payment intent' };
      } catch (err: any) {
        const errorMsg = err.response?.data?.error?.message || 'Failed to create payment intent';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const confirmPayment = useCallback(
    async (paymentId: number, paymentData: { payment_intent_id?: string; payment_id?: string; gateway: string }) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await apiClient.post(API_ENDPOINTS.PAYMENTS.CONFIRM(paymentId), paymentData);

        if (response.data.success) {
          return { success: true, payment: response.data.data?.payment };
        }

        return { success: false, error: 'Failed to confirm payment' };
      } catch (err: any) {
        const errorMsg = err.response?.data?.error?.message || 'Failed to confirm payment';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return {
    createPaymentIntent,
    confirmPayment,
    isLoading,
    error,
  };
};

