# Event Management Platform - Meetrix

A scalable, full-stack event management platform built with React and Ruby on Rails.

## Architecture Overview

This platform provides comprehensive event management capabilities including:
- **Event Discovery & Search**: Find events with advanced filtering and location-based search
- **Ticketing & Registration**: Secure ticket purchasing and booking management
- **Organizer Dashboard**: Complete event management and analytics
- **Real-time Notifications**: WebSocket-based notifications
- **Group Bookings**: Collaborative booking for groups
- **Analytics**: Comprehensive event and user analytics

## Technology Stack

### Frontend
- **React 18+** with TypeScript
- **Redux Toolkit** for state management
- **React Router** for navigation
- **Material-UI / Tailwind CSS** for UI components
- **Google Maps API** for location services
- **Vite** for build tooling

### Backend
- **Ruby on Rails 7+** (API mode)
- **PostgreSQL 14+** for primary database
- **Redis 7+** for caching and job queues
- **Elasticsearch 8+** for search functionality
- **Sidekiq** for background job processing
- **ActionCable** for WebSocket connections

### External Services
- **Stripe** for payment processing
- **SendGrid** for email delivery
- **AWS S3** for file storage
- **Google Maps API** for geocoding and maps

## Project Structure

```
meetrix/
├── frontend/              # React frontend application
├── backend/               # Rails API backend
├── ARCHITECTURE.md        # High-level architecture documentation
├── FRONTEND_STRUCTURE.md  # Frontend folder structure
├── BACKEND_STRUCTURE.md   # Backend folder structure
├── API_COMMUNICATION_FLOW.md  # API flow documentation
├── SCALABILITY_CONSIDERATIONS.md  # Scalability strategies
└── README.md              # This file
```

## 🚀 Quick Start

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js 18+** and npm (for frontend)
- **Ruby 3.1+** and Rails 7+ (for backend)
- **PostgreSQL 15+** (database)
- **Redis 7+** (caching and background jobs)
- **Git** (version control)

### Option 1: Docker Setup (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd meetrix
   ```

2. **Run the setup script**
   ```bash
   ./setup.sh
   ```

3. **Access the applications**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000

### Option 2: Manual Setup

#### Backend Setup
```bash
cd backend

# Install Ruby dependencies
bundle install

# Setup database
rails db:create
rails db:migrate
rails db:seed

# Start Rails server
rails server
```

#### Frontend Setup (New Terminal)
```bash
cd frontend

# Install Node dependencies
npm install

# Start development server
npm run dev
```

## 📊 Demo Data

The application comes with pre-seeded demo data:

### Sample Events
- **Tech Conference 2024** - Technology, San Francisco
- **Music Festival Summer** - Music, New York
- **Business Leadership Summit** - Business, Chicago
- **Art & Design Exhibition** - Arts, Los Angeles
- **Startup Pitch Competition** - Business, Austin

### Demo Accounts
- **Admin**: admin@meetrix.com / password123
- **Organizer**: organizer1@meetrix.com / password123
- **Attendee**: attendee1@meetrix.com / password123

## 🎯 Key Features

### For Attendees
- Browse and search events with filters
- Secure ticket booking and payment
- Digital tickets with QR codes
- Booking management and history
- Real-time notifications

### For Organizers
- Create and manage events
- Comprehensive analytics dashboard
- Live check-in with QR scanning
- Attendee management
- Revenue tracking

### For Admins
- System-wide user management
- Platform analytics
- Security monitoring
- Content moderation

## Documentation

- **[Architecture](ARCHITECTURE.md)**: High-level system architecture and component breakdown
- **[Frontend Structure](FRONTEND_STRUCTURE.md)**: Complete React application structure
- **[Backend Structure](BACKEND_STRUCTURE.md)**: Complete Rails API structure
- **[API Communication Flow](API_COMMUNICATION_FLOW.md)**: Detailed API request/response flows
- **[Scalability Considerations](SCALABILITY_CONSIDERATIONS.md)**: Performance and scaling strategies

## Key Features

### Event Discovery
- Advanced search with filters (date, location, category, price)
- Location-based discovery using Google Maps
- Full-text search powered by Elasticsearch
- Personalized recommendations

### Ticketing System
- Multiple ticket types per event
- Real-time inventory management
- Secure payment processing via Stripe
- Digital ticket delivery

### Organizer Dashboard
- Event creation and management
- Real-time analytics and insights
- Attendee management
- Revenue tracking

### Group Bookings
- Create and manage booking groups
- Invite-based group joining
- Coordinated ticket purchasing
- Group discounts

### Notifications
- Real-time WebSocket notifications
- Email notifications
- Push notifications (future)
- Notification preferences

### Analytics
- Event performance metrics
- Revenue analytics
- Attendee demographics
- Engagement tracking

## Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn
- Ruby 3.1+ and Bundler
- PostgreSQL 14+
- Redis 7+
- Elasticsearch 8+ (optional for development)

### Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env.local
# Configure environment variables
npm run dev
```

### Backend Setup
```bash
cd backend
bundle install
cp .env.example .env
# Configure environment variables
rails db:create db:migrate db:seed
rails server
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh` - Refresh token

### Events
- `GET /api/v1/events` - List events
- `GET /api/v1/events/:id` - Event details
- `POST /api/v1/events` - Create event
- `PATCH /api/v1/events/:id` - Update event

### Bookings
- `POST /api/v1/bookings` - Create booking
- `GET /api/v1/bookings` - User bookings
- `POST /api/v1/bookings/:id/confirm` - Confirm payment

See [API Communication Flow](API_COMMUNICATION_FLOW.md) for detailed documentation.

## Scalability

The platform is designed for horizontal scaling:
- Stateless application servers
- Database read replicas
- Redis caching layer
- Elasticsearch for search
- Background job processing
- CDN for static assets

See [Scalability Considerations](SCALABILITY_CONSIDERATIONS.md) for detailed strategies.

## Security

- JWT-based authentication
- HTTPS for all communications
- API rate limiting
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- PCI DSS compliance (via Stripe)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License

## Support

For questions or issues, please open an issue on GitHub.

