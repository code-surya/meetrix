import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import authReducer from '@/features/auth/authSlice';
import eventsReducer from '@/features/events/eventsSlice';
import bookingsReducer from '@/features/bookings/bookingsSlice';
import notificationsReducer from '@/features/notifications/notificationsSlice';
import { eventsApi } from '@/features/events/eventsApi';
import { authApi } from '@/features/auth/authApi';
import { bookingsApi } from '@/features/bookings/bookingsApi';
import { analyticsApi } from '@/features/analytics/analyticsApi';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    events: eventsReducer,
    bookings: bookingsReducer,
    notifications: notificationsReducer,
    // RTK Query APIs
    [eventsApi.reducerPath]: eventsApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
    [bookingsApi.reducerPath]: bookingsApi.reducer,
    [analyticsApi.reducerPath]: analyticsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    })
      .concat(eventsApi.middleware)
      .concat(authApi.middleware)
      .concat(bookingsApi.middleware)
      .concat(analyticsApi.middleware),
});

// Enable refetchOnFocus and refetchOnReconnect
setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

