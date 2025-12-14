import { useCallback } from 'react';
import {
  useCreateBookingMutation,
  useGetBookingQuery,
  useConfirmBookingMutation,
  useCancelBookingMutation,
} from '@/features/bookings/bookingsApi';

export const useBooking = (bookingId: string | null | undefined) => {
  const {
    data: bookingData,
    isLoading,
    error,
    refetch,
  } = useGetBookingQuery(bookingId!, { skip: !bookingId });

  const [confirmMutation] = useConfirmBookingMutation();
  const [cancelMutation] = useCancelBookingMutation();

  const confirmBooking = useCallback(
    async (id: string) => {
      try {
        const result = await confirmMutation(id).unwrap();
        return { success: true, booking: result.data?.booking };
      } catch (error: any) {
        return {
          success: false,
          error: error.data?.error?.message || 'Failed to confirm booking',
        };
      }
    },
    [confirmMutation]
  );

  const cancelBooking = useCallback(
    async (id: string) => {
      try {
        const result = await cancelMutation(id).unwrap();
        return { success: true, booking: result.data?.booking };
      } catch (error: any) {
        return {
          success: false,
          error: error.data?.error?.message || 'Failed to cancel booking',
        };
      }
    },
    [cancelMutation]
  );

  return {
    booking: bookingData?.data?.booking,
    isLoading,
    error,
    refetch,
    confirmBooking,
    cancelBooking,
  };
};

export const useBookings = () => {
  const [createBookingMutation, { isLoading: isCreating }] = useCreateBookingMutation();
  const [createGroupBookingMutation, { isLoading: isCreatingGroup }] = useCreateBookingMutation();

  const createBooking = useCallback(
    async (bookingData: { eventId: number; ticketRequests: any[] }) => {
      try {
        const result = await createBookingMutation({
          event_id: bookingData.eventId,
          ticket_requests: bookingData.ticketRequests,
        }).unwrap();

        return {
          success: true,
          booking: result.data?.booking || result.data?.bookings?.[0],
        };
      } catch (error: any) {
        return {
          success: false,
          error: error.data?.error?.message || 'Failed to create booking',
          errors: error.data?.error?.errors || [],
        };
      }
    },
    [createBookingMutation]
  );

  const createGroupBooking = useCallback(
    async (bookingData: {
      groupId: number;
      eventId: number;
      ticketRequests: any[];
    }) => {
      try {
        const result = await createBookingMutation({
          event_id: bookingData.eventId,
          group_id: bookingData.groupId,
          ticket_requests: bookingData.ticketRequests,
        }).unwrap();

        return {
          success: true,
          bookings: result.data?.bookings || [],
          booking: result.data?.bookings?.[0] || result.data?.booking,
          group: result.data?.group,
        };
      } catch (error: any) {
        return {
          success: false,
          error: error.data?.error?.message || 'Failed to create group booking',
          errors: error.data?.error?.errors || [],
        };
      }
    },
    [createBookingMutation]
  );

  return {
    createBooking,
    createGroupBooking,
    isLoading: isCreating,
    error: null,
  };
};

