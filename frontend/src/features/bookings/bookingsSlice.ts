import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface BookingsState {
  currentBooking: any | null;
  bookingStep: 'tickets' | 'group' | 'review' | 'payment' | 'confirming';
}

const initialState: BookingsState = {
  currentBooking: null,
  bookingStep: 'tickets',
};

const bookingsSlice = createSlice({
  name: 'bookings',
  initialState,
  reducers: {
    setCurrentBooking: (state, action: PayloadAction<any | null>) => {
      state.currentBooking = action.payload;
    },
    setBookingStep: (state, action: PayloadAction<BookingsState['bookingStep']>) => {
      state.bookingStep = action.payload;
    },
    clearBooking: (state) => {
      state.currentBooking = null;
      state.bookingStep = 'tickets';
    },
  },
});

export const { setCurrentBooking, setBookingStep, clearBooking } = bookingsSlice.actions;
export default bookingsSlice.reducer;

