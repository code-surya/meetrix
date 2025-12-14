import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import {
  setFilters,
  setSearchQuery,
  setCurrentPage,
  toggleFavorite,
  clearFilters,
  setSelectedEvent,
} from '@/features/events/eventsSlice';
import {
  useGetEventsQuery,
  useGetEventQuery,
  useSearchEventsQuery,
} from '@/features/events/eventsApi';
import { EventFilters } from '@/features/events/eventsTypes';

export const useEvents = () => {
  const dispatch = useAppDispatch();
  const { filters, searchQuery, currentPage, favorites, selectedEvent } = useAppSelector(
    (state) => state.events
  );

  // Fetch events with current filters
  const {
    data: eventsData,
    isLoading: isLoadingEvents,
    error: eventsError,
    refetch: refetchEvents,
  } = useGetEventsQuery(filters, { skip: !!searchQuery });

  // Search events
  const {
    data: searchData,
    isLoading: isLoadingSearch,
    error: searchError,
  } = useSearchEventsQuery(
    { q: searchQuery, ...filters },
    { skip: !searchQuery }
  );

  // Get current events (from search or regular query)
  const events = searchQuery 
    ? (searchData?.data?.events || [])
    : (eventsData?.data?.events || []);
  const pagination = searchQuery 
    ? searchData?.data?.pagination 
    : eventsData?.data?.pagination;
  const isLoading = isLoadingEvents || isLoadingSearch;
  const error = eventsError || searchError;

  // Actions
  const updateFilters = useCallback(
    (newFilters: Partial<EventFilters>) => {
      dispatch(setFilters(newFilters));
    },
    [dispatch]
  );

  const updateSearchQuery = useCallback(
    (query: string) => {
      dispatch(setSearchQuery(query));
    },
    [dispatch]
  );

  const changePage = useCallback(
    (page: number) => {
      dispatch(setCurrentPage(page));
      // Update filters with new page
      dispatch(setFilters({ ...filters, page }));
    },
    [dispatch, filters]
  );

  const addToFavorites = useCallback(
    (eventId: number) => {
      dispatch(toggleFavorite(eventId));
    },
    [dispatch]
  );

  const resetFilters = useCallback(() => {
    dispatch(clearFilters());
  }, [dispatch]);

  const selectEvent = useCallback(
    (event: any) => {
      dispatch(setSelectedEvent(event));
    },
    [dispatch]
  );

  return {
    // Data
    events,
    pagination,
    filters,
    searchQuery,
    currentPage,
    favorites,
    selectedEvent,
    isLoading,
    error,

    // Actions
    updateFilters,
    updateSearchQuery,
    changePage,
    addToFavorites,
    resetFilters,
    selectEvent,
    refetchEvents,
  };
};

export const useEvent = (eventId: number | string | null) => {
  const {
    data: eventData,
    isLoading,
    error,
    refetch,
  } = useGetEventQuery(eventId!, { skip: !eventId });

  return {
    event: eventData?.data?.event,
    isLoading,
    error,
    refetch,
  };
};

