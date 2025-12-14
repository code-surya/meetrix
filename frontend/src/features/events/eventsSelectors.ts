import { RootState } from '@/store';

export const selectEvents = (state: RootState) => state.events;
export const selectSelectedEvent = (state: RootState) => state.events.selectedEvent;
export const selectEventFilters = (state: RootState) => state.events.filters;
export const selectSearchQuery = (state: RootState) => state.events.searchQuery;
export const selectFavorites = (state: RootState) => state.events.favorites;
export const selectIsFavorite = (state: RootState, eventId: number) =>
  state.events.favorites.includes(eventId);

