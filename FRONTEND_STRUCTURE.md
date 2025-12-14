# Frontend Folder Structure

```
frontend/
├── public/
│   ├── index.html
│   ├── favicon.ico
│   └── manifest.json
│
├── src/
│   ├── components/              # Reusable UI components
│   │   ├── common/
│   │   │   ├── Button/
│   │   │   ├── Input/
│   │   │   ├── Card/
│   │   │   ├── Modal/
│   │   │   ├── Loading/
│   │   │   ├── ErrorBoundary/
│   │   │   └── Pagination/
│   │   │
│   │   ├── layout/
│   │   │   ├── Header/
│   │   │   ├── Footer/
│   │   │   ├── Sidebar/
│   │   │   ├── Navbar/
│   │   │   └── Layout.tsx
│   │   │
│   │   ├── events/
│   │   │   ├── EventCard/
│   │   │   ├── EventList/
│   │   │   ├── EventDetail/
│   │   │   ├── EventForm/
│   │   │   ├── EventFilters/
│   │   │   └── EventMap/
│   │   │
│   │   ├── tickets/
│   │   │   ├── TicketSelector/
│   │   │   ├── TicketCard/
│   │   │   ├── BookingForm/
│   │   │   └── BookingSummary/
│   │   │
│   │   ├── groups/
│   │   │   ├── GroupBookingForm/
│   │   │   ├── GroupMemberList/
│   │   │   └── GroupInvite/
│   │   │
│   │   ├── maps/
│   │   │   ├── MapView/
│   │   │   ├── LocationSearch/
│   │   │   ├── EventMarker/
│   │   │   └── DistanceCalculator/
│   │   │
│   │   └── notifications/
│   │       ├── NotificationBell/
│   │       ├── NotificationList/
│   │       └── NotificationItem/
│   │
│   ├── pages/                   # Page components
│   │   ├── Home/
│   │   │   └── HomePage.tsx
│   │   │
│   │   ├── Events/
│   │   │   ├── EventDiscoveryPage.tsx
│   │   │   ├── EventDetailPage.tsx
│   │   │   ├── EventCreatePage.tsx
│   │   │   └── EventEditPage.tsx
│   │   │
│   │   ├── Tickets/
│   │   │   ├── TicketPurchasePage.tsx
│   │   │   ├── BookingConfirmationPage.tsx
│   │   │   └── MyBookingsPage.tsx
│   │   │
│   │   ├── Dashboard/
│   │   │   ├── OrganizerDashboard.tsx
│   │   │   ├── AnalyticsPage.tsx
│   │   │   └── EventManagementPage.tsx
│   │   │
│   │   ├── Groups/
│   │   │   ├── GroupBookingPage.tsx
│   │   │   └── GroupManagementPage.tsx
│   │   │
│   │   ├── Profile/
│   │   │   ├── UserProfilePage.tsx
│   │   │   └── SettingsPage.tsx
│   │   │
│   │   └── Auth/
│   │       ├── LoginPage.tsx
│   │       ├── RegisterPage.tsx
│   │       └── ForgotPasswordPage.tsx
│   │
│   ├── features/                # Feature-based modules (Redux slices)
│   │   ├── auth/
│   │   │   ├── authSlice.ts
│   │   │   ├── authApi.ts
│   │   │   └── authTypes.ts
│   │   │
│   │   ├── events/
│   │   │   ├── eventsSlice.ts
│   │   │   ├── eventsApi.ts
│   │   │   └── eventsTypes.ts
│   │   │
│   │   ├── tickets/
│   │   │   ├── ticketsSlice.ts
│   │   │   ├── ticketsApi.ts
│   │   │   └── ticketsTypes.ts
│   │   │
│   │   ├── bookings/
│   │   │   ├── bookingsSlice.ts
│   │   │   ├── bookingsApi.ts
│   │   │   └── bookingsTypes.ts
│   │   │
│   │   ├── groups/
│   │   │   ├── groupsSlice.ts
│   │   │   ├── groupsApi.ts
│   │   │   └── groupsTypes.ts
│   │   │
│   │   ├── notifications/
│   │   │   ├── notificationsSlice.ts
│   │   │   ├── notificationsApi.ts
│   │   │   └── notificationsTypes.ts
│   │   │
│   │   ├── analytics/
│   │   │   ├── analyticsSlice.ts
│   │   │   ├── analyticsApi.ts
│   │   │   └── analyticsTypes.ts
│   │   │
│   │   └── maps/
│   │       ├── mapsSlice.ts
│   │       └── mapsTypes.ts
│   │
│   ├── services/                # API and external services
│   │   ├── api/
│   │   │   ├── client.ts         # Axios instance with interceptors
│   │   │   ├── endpoints.ts      # API endpoint constants
│   │   │   └── types.ts          # API response types
│   │   │
│   │   ├── websocket/
│   │   │   └── websocketClient.ts
│   │   │
│   │   ├── maps/
│   │   │   └── googleMapsService.ts
│   │   │
│   │   └── storage/
│   │       └── localStorage.ts
│   │
│   ├── hooks/                   # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useEvents.ts
│   │   ├── useBookings.ts
│   │   ├── useNotifications.ts
│   │   ├── useDebounce.ts
│   │   ├── useGeolocation.ts
│   │   └── useWebSocket.ts
│   │
│   ├── utils/                   # Utility functions
│   │   ├── formatters.ts        # Date, currency formatters
│   │   ├── validators.ts        # Form validation
│   │   ├── constants.ts          # App constants
│   │   ├── helpers.ts           # General helpers
│   │   └── errors.ts            # Error handling
│   │
│   ├── store/                   # Redux store configuration
│   │   ├── index.ts             # Store setup
│   │   ├── rootReducer.ts
│   │   └── middleware.ts
│   │
│   ├── routes/                  # Route configuration
│   │   ├── index.tsx            # Route definitions
│   │   ├── PrivateRoute.tsx     # Protected routes
│   │   └── PublicRoute.tsx      # Public routes
│   │
│   ├── styles/                  # Global styles
│   │   ├── theme.ts             # Material-UI theme or Tailwind config
│   │   ├── globals.css
│   │   └── variables.css
│   │
│   ├── types/                   # TypeScript type definitions
│   │   ├── index.ts
│   │   ├── event.ts
│   │   ├── user.ts
│   │   ├── booking.ts
│   │   └── api.ts
│   │
│   ├── App.tsx                  # Root component
│   ├── main.tsx                 # Entry point
│   └── vite-env.d.ts            # Vite type definitions
│
├── tests/                       # Test files
│   ├── components/
│   ├── pages/
│   ├── utils/
│   └── setup.ts
│
├── .env.example                 # Environment variables template
├── .env.local                   # Local environment variables
├── .gitignore
├── package.json
├── tsconfig.json                # TypeScript configuration
├── vite.config.ts               # Vite configuration
├── tailwind.config.js           # Tailwind CSS config (if using)
└── README.md
```

## Key Frontend Patterns

### Component Organization
- **Atomic Design**: Components organized by complexity (atoms → molecules → organisms)
- **Feature-based**: Redux slices organized by feature domain
- **Co-location**: Related files grouped together

### State Management
- **Redux Toolkit**: For global application state
- **React Query**: For server state caching (optional alternative)
- **Local State**: useState/useReducer for component-specific state

### Routing Strategy
- **React Router v6**: Declarative routing
- **Code Splitting**: Lazy loading for route-based chunks
- **Route Guards**: Protected routes for authenticated users

### API Integration
- **RTK Query**: Type-safe API calls with caching
- **Axios Interceptors**: Request/response transformation
- **Error Handling**: Centralized error boundary and handlers

