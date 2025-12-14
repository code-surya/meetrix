import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Loading } from '@/components/common/Loading';
import Navbar from '@/components/layout/Navbar';
import PrivateRoute from './PrivateRoute';
import PublicRoute from './PublicRoute';

// Lazy load pages for code splitting
const HomePage = lazy(() => import('@/pages/Home/HomePage'));
const EventDiscoveryPage = lazy(() => import('@/pages/Events/EventDiscoveryPage'));
const EventDetailPage = lazy(() => import('@/pages/Events/EventDetailPage'));
const EventCreatePage = lazy(() => import('@/pages/Events/EventCreatePage'));
const EventEditPage = lazy(() => import('@/pages/Events/EventEditPage'));

const BookingPage = lazy(() => import('@/pages/Booking/BookingPage'));
const BookingConfirmationPage = lazy(() => import('@/pages/Booking/BookingConfirmationPage'));
const MyBookingsPage = lazy(() => import('@/pages/Booking/MyBookingsPage'));
const BookingDetailPage = lazy(() => import('@/pages/Booking/BookingDetailPage'));

const OrganizerDashboard = lazy(() => import('@/pages/Dashboard/OrganizerDashboard'));
const AnalyticsPage = lazy(() => import('@/pages/Dashboard/AnalyticsPage'));
const EventManagementPage = lazy(() => import('@/pages/Dashboard/EventManagementPage'));
const CheckInPage = lazy(() => import('@/pages/Dashboard/CheckInPage'));

const LoginPage = lazy(() => import('@/pages/Auth/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/Auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('@/pages/Auth/ForgotPasswordPage'));

const UserProfilePage = lazy(() => import('@/pages/Profile/UserProfilePage'));
const SettingsPage = lazy(() => import('@/pages/Profile/SettingsPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

const AppRoutes = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Suspense fallback={<Loading />}>
        <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/events" element={<EventDiscoveryPage />} />
        <Route path="/events/:id" element={<EventDetailPage />} />

        {/* Auth Routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <PublicRoute>
              <ForgotPasswordPage />
            </PublicRoute>
          }
        />

        {/* Protected Routes - Attendee */}
        <Route
          path="/bookings"
          element={
            <PrivateRoute>
              <MyBookingsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/bookings/:id"
          element={
            <PrivateRoute>
              <BookingDetailPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/events/:id/book"
          element={
            <PrivateRoute>
              <BookingPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/bookings/:id/confirm"
          element={
            <PrivateRoute>
              <BookingConfirmationPage />
            </PrivateRoute>
          }
        />

        {/* Protected Routes - Organizer */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute requiredRole="organizer">
              <OrganizerDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard/events"
          element={
            <PrivateRoute requiredRole="organizer">
              <EventManagementPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard/analytics"
          element={
            <PrivateRoute requiredRole="organizer">
              <AnalyticsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/events/create"
          element={
            <PrivateRoute requiredRole="organizer">
              <EventCreatePage />
            </PrivateRoute>
          }
        />
        <Route
          path="/events/:id/edit"
          element={
            <PrivateRoute requiredRole="organizer">
              <EventEditPage />
            </PrivateRoute>
          }
        />

        {/* Profile Routes */}
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <UserProfilePage />
            </PrivateRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <PrivateRoute>
              <SettingsPage />
            </PrivateRoute>
          }
        />

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      </Suspense>
    </div>
  );
};

export default AppRoutes;

