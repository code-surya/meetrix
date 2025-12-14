# React Architecture Explanation

## Overview

This React application follows a **feature-based architecture** with clear separation of concerns, making it scalable and maintainable.

## Key Architectural Decisions

### 1. Feature-Based Organization

Each feature (events, bookings, auth) is self-contained with:
- **Slice**: Redux state management
- **API**: RTK Query API definitions
- **Types**: TypeScript type definitions
- **Selectors**: Redux selectors for derived state

**Benefits:**
- Easy to locate feature code
- Clear boundaries between features
- Simplified testing
- Better code splitting

### 2. Component Organization

#### Atomic Design Principles
- **Common**: Reusable UI primitives (Button, Input, Card)
- **Feature Components**: Domain-specific components (EventCard, TicketSelector)
- **Pages**: Top-level route components

**Benefits:**
- Reusability
- Consistent UI
- Easy to maintain

### 3. State Management Strategy

#### Redux Toolkit (RTK) + RTK Query
- **Redux**: Global application state
- **RTK Query**: Server state and caching
- **Local State**: Component-specific state (useState)

**When to use what:**
- **Redux**: Complex global state, cross-component communication
- **RTK Query**: All API calls, automatic caching, refetching
- **useState**: Form inputs, UI state, component-specific data

### 4. API Service Layer

Centralized API client with:
- **Axios instance**: Base configuration
- **Interceptors**: Auth token injection, error handling
- **Endpoints**: Centralized endpoint definitions
- **Type safety**: TypeScript types for all API calls

**Benefits:**
- Consistent error handling
- Automatic token refresh
- Single source of truth for API calls

### 5. Custom Hooks

Encapsulate business logic in reusable hooks:
- `useAuth`: Authentication state and actions
- `useEvents`: Event data management
- `useBookings`: Booking operations
- `useNotifications`: Real-time notifications

**Benefits:**
- Reusable logic
- Clean component code
- Easy to test

## Data Flow

### 1. Event Discovery Flow

```
User Action (Filter Events)
  ↓
useEvents Hook
  ↓
Redux Action (setFilters)
  ↓
RTK Query (useGetEventsQuery)
  ↓
API Call (apiClient)
  ↓
Redux State Update
  ↓
Component Re-render
```

### 2. Booking Flow

```
User Selects Tickets
  ↓
BookingPage Component
  ↓
useBookings Hook
  ↓
RTK Query Mutation (createBooking)
  ↓
API Call
  ↓
Payment Integration
  ↓
Booking Confirmation
```

### 3. Authentication Flow

```
User Logs In
  ↓
useAuth Hook (login)
  ↓
RTK Query Mutation (login)
  ↓
API Call
  ↓
Store Tokens (localStorage)
  ↓
Update Redux State
  ↓
Redirect to Dashboard
```

## File Structure Rationale

### Why Feature-Based?

```
features/events/
  ├── eventsSlice.ts      # State logic
  ├── eventsApi.ts        # API calls
  ├── eventsTypes.ts      # Types
  └── eventsSelectors.ts  # Selectors
```

**Advantages:**
1. **Co-location**: Related code is together
2. **Scalability**: Easy to add new features
3. **Maintainability**: Clear ownership
4. **Testing**: Feature-level testing

### Why Separate Services?

```
services/
  ├── api/          # API client
  ├── websocket/    # WebSocket
  ├── maps/         # Maps integration
  └── storage/      # Storage utilities
```

**Advantages:**
1. **Reusability**: Services used across features
2. **Testability**: Easy to mock
3. **Separation**: Business logic separate from UI

### Why Custom Hooks?

```
hooks/
  ├── useAuth.ts
  ├── useEvents.ts
  └── useBookings.ts
```

**Advantages:**
1. **Abstraction**: Hide complexity from components
2. **Reusability**: Use across multiple components
3. **Testing**: Test logic independently

## Component Patterns

### 1. Container/Presentational Pattern

```typescript
// Container (Smart Component)
const EventDiscoveryPage = () => {
  const { events, filters, updateFilters } = useEvents();
  
  return <EventList events={events} filters={filters} onFilterChange={updateFilters} />;
};

// Presentational (Dumb Component)
const EventList = ({ events, filters, onFilterChange }) => {
  return (
    <div>
      {events.map(event => <EventCard key={event.id} event={event} />)}
    </div>
  );
};
```

### 2. Compound Components

```typescript
// BookingSteps compound component
<BookingSteps>
  <BookingSteps.Step title="Select Tickets" />
  <BookingSteps.Step title="Payment" />
  <BookingSteps.Step title="Confirmation" />
</BookingSteps>
```

### 3. Render Props (when needed)

```typescript
<DataFetcher
  url="/api/events"
  render={({ data, loading, error }) => (
    loading ? <Loading /> : <EventList events={data} />
  )}
/>
```

## Performance Optimizations

### 1. Code Splitting
- Route-based lazy loading
- Component-level code splitting
- Dynamic imports

### 2. Memoization
- `React.memo` for expensive components
- `useMemo` for computed values
- `useCallback` for function references

### 3. Virtual Scrolling
- For long lists (EventList, BookingList)
- Use `react-window` or `react-virtualized`

### 4. Image Optimization
- Lazy loading images
- WebP format
- Responsive images

## Testing Strategy

### Unit Tests
- Components: React Testing Library
- Hooks: `@testing-library/react-hooks`
- Utils: Jest

### Integration Tests
- Feature workflows
- API integration
- Redux state management

### E2E Tests
- Critical user flows
- Cypress or Playwright

## Best Practices

### 1. TypeScript
- Strict mode enabled
- No `any` types
- Proper type definitions

### 2. Error Handling
- Error boundaries
- API error handling
- User-friendly error messages

### 3. Accessibility
- Semantic HTML
- ARIA labels
- Keyboard navigation

### 4. Code Quality
- ESLint configuration
- Prettier formatting
- Pre-commit hooks

## Migration Path

### From Class Components
1. Convert to functional components
2. Replace lifecycle methods with hooks
3. Migrate Redux connect to hooks

### From Context to Redux
1. Keep Context for simple state
2. Use Redux for complex state
3. Gradual migration

### Adding New Features
1. Create feature folder
2. Add slice, API, types
3. Create components
4. Add routes
5. Update navigation

## Conclusion

This architecture provides:
- ✅ Scalability
- ✅ Maintainability
- ✅ Testability
- ✅ Developer Experience
- ✅ Performance

The structure is flexible and can evolve as the application grows.

