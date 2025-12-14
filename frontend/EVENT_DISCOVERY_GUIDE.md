# Event Discovery Page - Implementation Guide

## Overview

The Event Discovery Page provides a comprehensive interface for users to search, filter, and browse events with both list and map views.

## Components

### 1. EventDiscoveryPage (Main Component)

**Location:** `src/pages/Events/EventDiscoveryPage.tsx`

**Features:**
- Search bar integration
- Filter panel (collapsible)
- List/Map view toggle
- URL parameter synchronization
- Geolocation integration
- Infinite scroll support

**State Management:**
- Uses `useEvents` hook for data fetching
- Redux for global state
- URL params for shareable filters

### 2. EventSearch Component

**Location:** `src/components/events/EventSearch/EventSearch.tsx`

**Features:**
- Debounced search (500ms delay)
- Clear button
- Accessible input
- Real-time search updates

**Props:**
```typescript
interface EventSearchProps {
  onSearch: (query: string) => void;
  initialValue?: string;
  placeholder?: string;
}
```

### 3. EventFilters Component

**Location:** `src/components/events/EventFilters/EventFilters.tsx`

**Features:**
- Category filter (dropdown)
- Date range (from/to)
- Price range (min/max)
- Location filter (coordinates + radius)
- "Use My Location" button
- Upcoming/Past toggle

**Props:**
```typescript
interface EventFiltersProps {
  filters: any;
  onChange: (filters: any) => void;
  userLocation?: { latitude: number; longitude: number } | null;
  locationError?: GeolocationPositionError | null;
}
```

### 4. EventCard Component

**Location:** `src/components/events/EventCard/EventCard.tsx`

**Features:**
- Event image with fallback
- Featured/Cancelled badges
- Category and rating display
- Date, location, price information
- Ticket availability stats
- Hover effects
- Responsive design

**Props:**
```typescript
interface EventCardProps {
  event: Event;
}
```

### 5. EventList Component

**Location:** `src/components/events/EventList/EventList.tsx`

**Features:**
- Grid layout (responsive)
- Infinite scroll (Intersection Observer)
- Load more button (alternative)
- Empty state
- Loading states
- Pagination info

**Props:**
```typescript
interface EventListProps {
  events: Event[];
  isLoading: boolean;
  pagination?: PaginationInfo;
  onLoadMore: () => void;
  hasMore: boolean;
}
```

### 6. EventMap Component

**Location:** `src/components/events/EventMap/EventMap.tsx`

**Features:**
- Google Maps integration
- Event markers
- Info windows
- Radius circle (when location filter active)
- Auto-fit bounds
- Selected event card

**Props:**
```typescript
interface EventMapProps {
  events: Event[];
  center?: { lat: number; lng: number };
  filters?: any;
  zoom?: number;
}
```

## State Management

### Redux Slice (eventsSlice.ts)

```typescript
interface EventsState {
  selectedEvent: Event | null;
  filters: EventFilters;
  searchQuery: string;
  currentPage: number;
  favorites: number[];
}
```

### Actions

- `setSelectedEvent`: Set currently viewed event
- `setFilters`: Update filter values
- `setSearchQuery`: Update search query
- `setCurrentPage`: Change pagination page
- `toggleFavorite`: Add/remove from favorites
- `clearFilters`: Reset all filters

### RTK Query API

**Endpoints:**
- `getEvents`: Fetch events with filters
- `getEvent`: Fetch single event
- `searchEvents`: Full-text search

**Caching:**
- Automatic cache invalidation
- Tag-based cache management
- Optimistic updates

## API Integration

### Filter Parameters

```typescript
{
  category?: string;
  start_date_from?: string;
  start_date_to?: string;
  latitude?: number;
  longitude?: number;
  radius?: number; // in km
  min_price?: number;
  max_price?: number;
  sort_by?: 'date' | 'price' | 'popularity';
  sort_order?: 'asc' | 'desc';
  page?: number;
  per_page?: number;
}
```

### Response Format

```typescript
{
  success: true,
  data: {
    events: Event[],
    pagination: {
      current_page: number;
      total_pages: number;
      total_count: number;
      per_page: number;
      has_next_page: boolean;
      has_prev_page: boolean;
    }
  }
}
```

## Custom Hooks

### useEvents

**Location:** `src/hooks/useEvents.ts`

**Returns:**
```typescript
{
  events: Event[];
  pagination: PaginationInfo;
  filters: EventFilters;
  searchQuery: string;
  isLoading: boolean;
  error: any;
  updateFilters: (filters: Partial<EventFilters>) => void;
  updateSearchQuery: (query: string) => void;
  changePage: (page: number) => void;
  addToFavorites: (eventId: number) => void;
  resetFilters: () => void;
  refetchEvents: () => void;
}
```

### useDebounce

**Location:** `src/hooks/useDebounce.ts`

Delays value updates to prevent excessive API calls.

### useGeolocation

**Location:** `src/hooks/useGeolocation.ts`

Gets user's current location for location-based filtering.

## Infinite Scroll Implementation

### Intersection Observer

```typescript
const lastEventElementRef = useCallback((node) => {
  if (isLoading) return;
  
  if (observerRef.current) {
    observerRef.current.disconnect();
  }
  
  observerRef.current = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && hasMore) {
      onLoadMore();
    }
  });
  
  if (node) observerRef.current.observe(node);
}, [isLoading, hasMore, onLoadMore]);
```

### Load More Button

Alternative to infinite scroll for better UX control.

## Google Maps Integration

### Setup

1. Add Google Maps API key to `.env`:
```bash
VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
```

2. Script loads dynamically:
```typescript
const script = document.createElement('script');
script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places`;
```

### Features

- **Markers**: One per event
- **Info Windows**: Click marker to see event details
- **Radius Circle**: Shows search radius when location filter active
- **Auto-fit**: Adjusts bounds to show all markers
- **Custom Icons**: Optional custom marker icons

## URL Parameter Synchronization

Filters are synced with URL params for:
- Shareable links
- Browser back/forward
- Bookmarking filtered views

**Example URL:**
```
/events?category=music&date_from=2024-01-01&lat=40.7128&lng=-74.0060&radius=10
```

## Performance Optimizations

1. **Debounced Search**: 500ms delay prevents excessive API calls
2. **Lazy Loading**: Images load on scroll
3. **Code Splitting**: Route-based code splitting
4. **Memoization**: React.memo for EventCard
5. **Virtual Scrolling**: For very long lists (optional)

## Accessibility

- Semantic HTML
- ARIA labels
- Keyboard navigation
- Screen reader support
- Focus management

## Responsive Design

- **Mobile**: Single column, stacked filters
- **Tablet**: 2 columns, side-by-side filters
- **Desktop**: 3-4 columns, expanded filters

## Testing Considerations

1. **Unit Tests**: Component rendering, hooks
2. **Integration Tests**: Filter interactions, search
3. **E2E Tests**: Complete discovery flow
4. **Map Tests**: Marker rendering, interactions

## Future Enhancements

1. **Saved Searches**: Save filter combinations
2. **Event Recommendations**: Based on user history
3. **Advanced Filters**: More granular options
4. **Map Clustering**: Group nearby events
5. **Export Results**: Share event lists

