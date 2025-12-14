# React Frontend Architecture

## Folder Structure

```
frontend/
├── public/
│   ├── index.html
│   ├── favicon.ico
│   ├── manifest.json
│   └── assets/
│       ├── images/
│       └── fonts/
│
├── src/
│   ├── components/              # Reusable UI components
│   │   ├── common/              # Shared components
│   │   │   ├── Button/
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Button.test.tsx
│   │   │   │   └── index.ts
│   │   │   ├── Input/
│   │   │   ├── Card/
│   │   │   ├── Modal/
│   │   │   ├── Loading/
│   │   │   ├── ErrorBoundary/
│   │   │   ├── Pagination/
│   │   │   ├── Toast/
│   │   │   ├── Badge/
│   │   │   └── Avatar/
│   │   │
│   │   ├── layout/              # Layout components
│   │   │   ├── Header/
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── Navbar.tsx
│   │   │   │   └── index.ts
│   │   │   ├── Footer/
│   │   │   ├── Sidebar/
│   │   │   ├── Container/
│   │   │   └── Layout.tsx
│   │   │
│   │   ├── events/              # Event-specific components
│   │   │   ├── EventCard/
│   │   │   │   ├── EventCard.tsx
│   │   │   │   ├── EventCard.test.tsx
│   │   │   │   └── index.ts
│   │   │   ├── EventList/
│   │   │   ├── EventFilters/
│   │   │   ├── EventMap/
│   │   │   ├── EventSearch/
│   │   │   └── EventCategoryFilter/
│   │   │
│   │   ├── booking/              # Booking components
│   │   │   ├── TicketSelector/
│   │   │   ├── BookingSummary/
│   │   │   ├── PaymentForm/
│   │   │   ├── QRCodeDisplay/
│   │   │   └── BookingSteps/
│   │   │
│   │   ├── dashboard/            # Dashboard components
│   │   │   ├── StatsCard/
│   │   │   ├── RevenueChart/
│   │   │   ├── EventTable/
│   │   │   └── AnalyticsWidget/
│   │   │
│   │   └── auth/                 # Auth components
│   │       ├── LoginForm/
│   │       ├── RegisterForm/
│   │       └── ProtectedRoute/
│   │
│   ├── pages/                    # Page components
│   │   ├── Home/
│   │   │   ├── HomePage.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── Events/
│   │   │   ├── EventDiscoveryPage.tsx
│   │   │   ├── EventDetailPage.tsx
│   │   │   ├── EventCreatePage.tsx
│   │   │   └── EventEditPage.tsx
│   │   │
│   │   ├── Booking/
│   │   │   ├── BookingPage.tsx
│   │   │   ├── BookingConfirmationPage.tsx
│   │   │   ├── MyBookingsPage.tsx
│   │   │   └── BookingDetailPage.tsx
│   │   │
│   │   ├── Dashboard/
│   │   │   ├── OrganizerDashboard.tsx
│   │   │   ├── AnalyticsPage.tsx
│   │   │   ├── EventManagementPage.tsx
│   │   │   └── RevenuePage.tsx
│   │   │
│   │   ├── Auth/
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   └── ForgotPasswordPage.tsx
│   │   │
│   │   └── Profile/
│   │       ├── UserProfilePage.tsx
│   │       └── SettingsPage.tsx
│   │
│   ├── features/                 # Feature-based modules (Redux slices)
│   │   ├── auth/
│   │   │   ├── authSlice.ts
│   │   │   ├── authApi.ts
│   │   │   ├── authTypes.ts
│   │   │   └── authSelectors.ts
│   │   │
│   │   ├── events/
│   │   │   ├── eventsSlice.ts
│   │   │   ├── eventsApi.ts
│   │   │   ├── eventsTypes.ts
│   │   │   └── eventsSelectors.ts
│   │   │
│   │   ├── bookings/
│   │   │   ├── bookingsSlice.ts
│   │   │   ├── bookingsApi.ts
│   │   │   ├── bookingsTypes.ts
│   │   │   └── bookingsSelectors.ts
│   │   │
│   │   ├── payments/
│   │   │   ├── paymentsSlice.ts
│   │   │   ├── paymentsApi.ts
│   │   │   └── paymentsTypes.ts
│   │   │
│   │   ├── notifications/
│   │   │   ├── notificationsSlice.ts
│   │   │   ├── notificationsApi.ts
│   │   │   └── notificationsTypes.ts
│   │   │
│   │   └── groups/
│   │       ├── groupsSlice.ts
│   │       ├── groupsApi.ts
│   │       └── groupsTypes.ts
│   │
│   ├── services/                 # API and external services
│   │   ├── api/
│   │   │   ├── client.ts         # Axios instance
│   │   │   ├── endpoints.ts      # API endpoints
│   │   │   ├── interceptors.ts   # Request/response interceptors
│   │   │   └── types.ts          # API types
│   │   │
│   │   ├── websocket/
│   │   │   └── websocketClient.ts
│   │   │
│   │   ├── maps/
│   │   │   └── googleMapsService.ts
│   │   │
│   │   └── storage/
│   │       ├── localStorage.ts
│   │       └── sessionStorage.ts
│   │
│   ├── hooks/                    # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useEvents.ts
│   │   ├── useBookings.ts
│   │   ├── useNotifications.ts
│   │   ├── useDebounce.ts
│   │   ├── useGeolocation.ts
│   │   ├── useWebSocket.ts
│   │   ├── usePagination.ts
│   │   └── useLocalStorage.ts
│   │
│   ├── context/                  # React Context providers
│   │   ├── AuthContext.tsx
│   │   ├── ThemeContext.tsx
│   │   └── NotificationContext.tsx
│   │
│   ├── store/                    # Redux store
│   │   ├── index.ts              # Store configuration
│   │   ├── rootReducer.ts
│   │   └── middleware.ts
│   │
│   ├── utils/                    # Utility functions
│   │   ├── formatters.ts         # Date, currency formatters
│   │   ├── validators.ts         # Form validation
│   │   ├── constants.ts          # App constants
│   │   ├── helpers.ts           # General helpers
│   │   └── errors.ts            # Error handling
│   │
│   ├── types/                    # TypeScript types
│   │   ├── index.ts
│   │   ├── event.ts
│   │   ├── user.ts
│   │   ├── booking.ts
│   │   └── api.ts
│   │
│   ├── routes/                   # Route configuration
│   │   ├── index.tsx
│   │   ├── PrivateRoute.tsx
│   │   └── PublicRoute.tsx
│   │
│   ├── styles/                   # Global styles
│   │   ├── theme.ts              # Theme configuration
│   │   ├── globals.css
│   │   └── variables.css
│   │
│   ├── App.tsx                   # Root component
│   ├── main.tsx                  # Entry point
│   └── vite-env.d.ts
│
├── tests/                        # Test files
│   ├── setup.ts
│   ├── mocks/
│   └── utils/
│
├── .env.example
├── .env.local
├── .gitignore
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── README.md
```

## Architecture Explanation

### 1. Component Organization

#### Common Components (`components/common/`)
Reusable UI components used across the application:
- **Button**: Standardized button component with variants
- **Input**: Form input with validation
- **Card**: Container component for content
- **Modal**: Dialog/modal component
- **Loading**: Loading spinner/skeleton
- **ErrorBoundary**: Error handling component
- **Pagination**: Pagination controls
- **Toast**: Notification toasts

#### Feature Components (`components/events/`, `components/booking/`, etc.)
Feature-specific components:
- **Events**: EventCard, EventList, EventFilters, EventMap
- **Booking**: TicketSelector, BookingSummary, PaymentForm
- **Dashboard**: StatsCard, RevenueChart, AnalyticsWidget

### 2. Pages (`pages/`)

Top-level page components that compose features:
- **HomePage**: Landing page with featured events
- **EventDiscoveryPage**: Event listing with filters
- **EventDetailPage**: Single event view
- **BookingPage**: Booking flow
- **OrganizerDashboard**: Organizer management interface

### 3. Features (`features/`)

Feature-based Redux slices following Redux Toolkit pattern:
- Each feature has its own slice, API, types, and selectors
- Co-located with related logic
- Easy to find and maintain

### 4. Services (`services/`)

API and external service integrations:
- **api/**: Axios client, endpoints, interceptors
- **websocket/**: WebSocket client for real-time updates
- **maps/**: Google Maps integration
- **storage/**: LocalStorage/SessionStorage utilities

### 5. Hooks (`hooks/`)

Custom React hooks for reusable logic:
- **useAuth**: Authentication state and actions
- **useEvents**: Event data fetching and management
- **useBookings**: Booking operations
- **useNotifications**: Real-time notifications
- **useDebounce**: Debounce utility
- **useGeolocation**: Location services

### 6. Context (`context/`)

React Context providers for global state:
- **AuthContext**: Authentication state (alternative to Redux)
- **ThemeContext**: Theme/UI preferences
- **NotificationContext**: Notification management

### 7. Store (`store/`)

Redux store configuration:
- **index.ts**: Store setup with middleware
- **rootReducer.ts**: Combined reducers
- **middleware.ts**: Custom middleware (logging, etc.)

### 8. Utils (`utils/`)

Utility functions:
- **formatters.ts**: Date, currency, number formatting
- **validators.ts**: Form validation functions
- **constants.ts**: App-wide constants
- **helpers.ts**: General helper functions
- **errors.ts**: Error handling utilities

### 9. Types (`types/`)

TypeScript type definitions:
- Shared types across the application
- API response types
- Domain model types

### 10. Routes (`routes/`)

Route configuration:
- Route definitions
- Protected route wrapper
- Public route wrapper

## Key Patterns

### 1. Feature-Based Organization

Each feature is self-contained:
```
features/events/
  ├── eventsSlice.ts      # Redux state
  ├── eventsApi.ts        # API calls
  ├── eventsTypes.ts      # TypeScript types
  └── eventsSelectors.ts  # Redux selectors
```

### 2. Component Co-location

Components include their tests and exports:
```
components/common/Button/
  ├── Button.tsx
  ├── Button.test.tsx
  └── index.ts
```

### 3. API Service Layer

Centralized API client with interceptors:
```typescript
// services/api/client.ts
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Add interceptors for auth, errors, etc.
```

### 4. Custom Hooks for Business Logic

Encapsulate complex logic in hooks:
```typescript
// hooks/useEvents.ts
export const useEvents = () => {
  const dispatch = useAppDispatch();
  const events = useAppSelector(selectEvents);
  
  const fetchEvents = useCallback((filters) => {
    dispatch(fetchEventsAsync(filters));
  }, [dispatch]);
  
  return { events, fetchEvents, loading, error };
};
```

## State Management Strategy

### Redux Toolkit (Recommended)
- **Use for**: Server state, complex global state
- **Features**: Events, Bookings, Payments, Notifications
- **Benefits**: DevTools, time-travel debugging, predictable updates

### React Context
- **Use for**: Simple global state, theme, auth (optional)
- **Benefits**: Less boilerplate, built-in React

### Local State (useState)
- **Use for**: Component-specific state, form inputs
- **Benefits**: Simple, no overhead

## File Naming Conventions

- **Components**: PascalCase (e.g., `EventCard.tsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `useAuth.ts`)
- **Utils**: camelCase (e.g., `formatters.ts`)
- **Types**: camelCase (e.g., `eventTypes.ts`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_ENDPOINTS`)

## Import Organization

```typescript
// 1. React imports
import { useState, useEffect } from 'react';

// 2. Third-party imports
import { useDispatch } from 'react-redux';
import axios from 'axios';

// 3. Internal imports - absolute paths
import { Button } from '@/components/common/Button';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/services/api/client';

// 4. Relative imports
import './styles.css';
```

## Testing Strategy

- **Unit Tests**: Components, hooks, utils
- **Integration Tests**: Feature workflows
- **E2E Tests**: Critical user flows (Cypress/Playwright)

## Performance Optimizations

1. **Code Splitting**: Route-based lazy loading
2. **Memoization**: React.memo, useMemo, useCallback
3. **Virtual Scrolling**: For long lists
4. **Image Optimization**: Lazy loading, WebP format
5. **Bundle Analysis**: Regular bundle size monitoring

