# Meetrix Frontend

A modern React application for the Meetrix event management platform, built with TypeScript, Vite, and Tailwind CSS.

## 🚀 Features

### Core Functionality
- **Event Discovery** - Browse and search events with advanced filters
- **User Authentication** - JWT-based login and registration
- **Event Booking** - Seamless ticket booking with payment integration
- **Organizer Dashboard** - Comprehensive event management tools
- **Real-time Notifications** - WebSocket-powered live updates
- **Analytics Dashboard** - Event performance metrics and insights

### Technical Features
- **React 18** with TypeScript for type safety
- **Vite** for fast development and optimized builds
- **Redux Toolkit** for state management
- **React Router** for client-side routing
- **Tailwind CSS** for styling
- **RTK Query** for API state management
- **Mock Data** for development without backend

## 🛠️ Tech Stack

- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite
- **State Management:** Redux Toolkit + RTK Query
- **Styling:** Tailwind CSS
- **Routing:** React Router v6
- **Charts:** Recharts
- **QR Scanning:** @zxing/library
- **HTTP Client:** Axios
- **WebSocket:** Socket.io-client

## 📋 Prerequisites

- **Node.js** 18+ and npm
- **Git** for version control

## 🚀 Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

Copy the environment example file:

```bash
cp .env.example .env
```

Update the environment variables in `.env`:

```env
# API Configuration
VITE_API_URL=http://localhost:3000/api/v1
VITE_WS_URL=ws://localhost:3000

# Application Configuration
VITE_APP_NAME=Meetrix
VITE_APP_ENV=development

# Google Maps (for location features)
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Stripe (for payments)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key
```

### 3. Development Server

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### 4. Build for Production

```bash
npm run build
```

### 5. Preview Production Build

```bash
npm run preview
```

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── analytics/       # Analytics dashboard components
│   ├── booking/         # Booking flow components
│   ├── checkin/         # QR check-in components
│   ├── common/          # Shared components
│   ├── events/          # Event-related components
│   ├── layout/          # Layout components
│   └── notifications/   # Notification components
├── context/             # React contexts
├── features/            # Redux slices and RTK Query APIs
│   ├── analytics/
│   ├── auth/
│   ├── bookings/
│   ├── events/
│   └── notifications/
├── hooks/               # Custom React hooks
├── pages/               # Page components
│   ├── Auth/           # Authentication pages
│   ├── Booking/        # Booking flow pages
│   ├── Dashboard/      # Dashboard pages
│   ├── Events/         # Event pages
│   ├── Home/           # Home page
│   └── Profile/        # User profile pages
├── routes/              # Routing configuration
├── services/            # API services and utilities
│   ├── api/            # API client and endpoints
│   ├── mockData.ts     # Mock data for development
│   ├── qrScanner.ts    # QR scanning service
│   └── websocket/      # WebSocket client
├── store/               # Redux store configuration
├── types/               # TypeScript type definitions
├── utils/               # Utility functions
└── main.tsx            # Application entry point
```

## 🎯 Development Features

### Mock Data
The application includes comprehensive mock data for development without requiring a backend:

- **Events** - Sample events across different categories
- **Users** - Mock user accounts with different roles
- **Bookings** - Sample booking data with various statuses
- **Analytics** - Mock analytics data for dashboards

### Demo Credentials
- **Admin:** admin@meetrix.com / password123
- **Organizer:** organizer1@meetrix.com / password123
- **Attendee:** attendee1@meetrix.com / password123

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect Repository**
   - Import your project to Vercel
   - Set build command: `npm run build`
   - Set output directory: `dist`

2. **Environment Variables**
   - Add all environment variables from `.env`

3. **Deploy**
   - Vercel will automatically handle the SPA routing

### Netlify

1. **Connect Repository**
   - Import your project to Netlify

2. **Build Settings**
   - Build command: `npm run build`
   - Publish directory: `dist`

3. **Deploy**
   - The `_redirects` file handles SPA routing

### Manual Deployment

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Serve the `dist` directory** using any static file server

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## 🌟 Key Components

### Authentication Flow
- JWT-based authentication with refresh tokens
- Protected routes with role-based access
- Persistent login state

### Event Discovery
- Advanced filtering (category, date, location, price)
- Search functionality
- Infinite scroll pagination
- Google Maps integration

### Booking Flow
- Multi-step booking process
- Group booking with discounts
- Payment integration (Stripe/Razorpay)
- QR code generation

### Real-time Features
- WebSocket connections for live updates
- Real-time notifications
- Live check-in status

## 🔒 Security Features

- **Input Validation** - Comprehensive form validation
- **XSS Protection** - Sanitized user inputs
- **CSRF Protection** - Secure API communication
- **Secure Storage** - JWT tokens in localStorage

## 📱 Responsive Design

- **Mobile-first** approach
- **Tailwind CSS** utility classes
- **Responsive grid** layouts
- **Touch-friendly** interactions

## 🧪 Testing

### Component Testing
```bash
npm run test
```

### E2E Testing (Future)
```bash
npm run test:e2e
```

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch
3. **Make** your changes
4. **Run** tests and linting
5. **Submit** a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Troubleshooting

### Common Issues

**Build Errors**
- Ensure all dependencies are installed: `npm install`
- Check Node.js version: `node --version` (should be 18+)

**API Connection Issues**
- Verify environment variables in `.env`
- Check if backend is running on correct port

**Routing Issues**
- Ensure you're using a static file server that supports SPA routing
- Check `_redirects` or `vercel.json` configuration

**Styling Issues**
- Verify Tailwind CSS is properly configured
- Check for conflicting CSS classes

## 🎯 Performance

### Optimization Features
- **Code Splitting** - Lazy-loaded routes and components
- **Tree Shaking** - Unused code elimination
- **Image Optimization** - Future enhancement
- **Caching** - RTK Query intelligent caching
- **Bundle Analysis** - Build size monitoring

### Bundle Analysis
```bash
npm run build
npx vite-bundle-analyzer dist
```

## 🚀 Future Enhancements

- **PWA Support** - Service workers and offline functionality
- **Internationalization** - Multi-language support
- **Advanced Analytics** - Real-time metrics and reporting
- **Social Features** - Event sharing and social interactions
- **Mobile App** - React Native companion app

---

**Meetrix** - Making event management simple, beautiful, and scalable.

