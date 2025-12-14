import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '@/store';

interface PrivateRouteProps {
  children: React.ReactNode;
  requiredRole?: 'organizer' | 'admin';
}

const PrivateRoute = ({ children, requiredRole }: PrivateRouteProps) => {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to login with return url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role requirement
  if (requiredRole) {
    const hasRequiredRole =
      user?.role === requiredRole || user?.role === 'admin';

    if (!hasRequiredRole) {
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
};

export default PrivateRoute;

