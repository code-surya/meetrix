// API Endpoints configuration
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
    FORGOT_PASSWORD: '/auth/forgot_password',
    RESET_PASSWORD: '/auth/reset_password',
    CHANGE_PASSWORD: '/auth/change_password',
  },

  // Events
  EVENTS: {
    LIST: '/events',
    DETAIL: (id: number | string) => `/events/${id}`,
    CREATE: '/events',
    UPDATE: (id: number | string) => `/events/${id}`,
    DELETE: (id: number | string) => `/events/${id}`,
    PUBLISH: (id: number | string) => `/events/${id}/publish`,
    CANCEL: (id: number | string) => `/events/${id}/cancel`,
    ANALYTICS: (id: number | string) => `/events/${id}/analytics`,
    SEARCH: '/events/search',
  },

  // Bookings
  BOOKINGS: {
    LIST: '/bookings',
    DETAIL: (id: number | string) => `/bookings/${id}`,
    CREATE: '/bookings',
    CONFIRM: (id: number | string) => `/bookings/${id}/confirm`,
    CANCEL: (id: number | string) => `/bookings/${id}/cancel`,
    AVAILABILITY: '/bookings/availability',
    VERIFY_QR: '/bookings/verify_qr',
  },

  // Payments
  PAYMENTS: {
    LIST: '/payments',
    DETAIL: (id: number | string) => `/payments/${id}`,
    CREATE: '/payments',
    CONFIRM: (id: number | string) => `/payments/${id}/confirm`,
    REFUND: (id: number | string) => `/payments/${id}/refund`,
    STATUS: (id: number | string) => `/payments/${id}/status`,
  },

  // Notifications
  NOTIFICATIONS: {
    LIST: '/notifications',
    DETAIL: (id: number | string) => `/notifications/${id}`,
    MARK_READ: (id: number | string) => `/notifications/${id}/read`,
    MARK_ALL_READ: '/notifications/mark_all_read',
    UNREAD: '/notifications/unread',
  },

  // Groups
  GROUPS: {
    LIST: '/groups',
    DETAIL: (id: number | string) => `/groups/${id}`,
    CREATE: '/groups',
    UPDATE: (id: number | string) => `/groups/${id}`,
    DELETE: (id: number | string) => `/groups/${id}`,
    JOIN: (id: number | string) => `/groups/${id}/join`,
    LEAVE: (id: number | string) => `/groups/${id}/leave`,
    BOOK: (id: number | string) => `/groups/${id}/book`,
  },

  // Analytics
  ANALYTICS: {
    DASHBOARD: '/analytics/dashboard',
    REVENUE: '/analytics/revenue',
    REGISTRATIONS: '/analytics/registrations',
    EVENTS: '/analytics/events',
    EVENT: (id: number | string) => `/analytics/events/${id}`,
    TICKET_TYPES: '/analytics/ticket-types',
  },
} as const;

