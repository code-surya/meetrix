import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Event, EventFilters } from './eventsTypes';
import { eventsApi } from './eventsApi';

interface EventsState {
  selectedEvent: Event | null;
  filters: EventFilters;
  searchQuery: string;
  currentPage: number;
  favorites: number[]; // Event IDs
}

const initialState: EventsState = {
  selectedEvent: null,
  filters: {
    category: '',
    status: 'published',
    upcoming: true,
    page: 1,
    per_page: 20,
  },
  searchQuery: '',
  currentPage: 1,
  favorites: [],
};

const eventsSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    setSelectedEvent: (state, action: PayloadAction<Event | null>) => {
      state.selectedEvent = action.payload;
    },
    setFilters: (state, action: PayloadAction<Partial<EventFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
      state.filters.page = action.payload;
    },
    toggleFavorite: (state, action: PayloadAction<number>) => {
      const eventId = action.payload;
      const index = state.favorites.indexOf(eventId);
      if (index > -1) {
        state.favorites.splice(index, 1);
      } else {
        state.favorites.push(eventId);
      }
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
      state.searchQuery = '';
      state.currentPage = 1;
    },
  },
  extraReducers: (builder) => {
    // Handle API responses
    builder.addMatcher(
      eventsApi.endpoints.getEvent.matchFulfilled,
      (state, action) => {
        state.selectedEvent = action.payload;
      }
    );
  },
});

export const {
  setSelectedEvent,
  setFilters,
  setSearchQuery,
  setCurrentPage,
  toggleFavorite,
  clearFilters,
} = eventsSlice.actions;

export default eventsSlice.reducer;

