import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/store';
import { logout } from '@/features/auth/authSlice';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const isActiveRoute = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const navLinkClasses = (path: string) =>
    `relative px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
      isActiveRoute(path)
        ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 shadow-soft'
        : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50/50'
    }`;

  return (
    <nav className="bg-white/95 backdrop-blur-lg shadow-soft border-b border-gray-100/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link
            to="/"
            className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
            onClick={closeMobileMenu}
          >
            Meetrix
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/events" className={navLinkClasses('/events')}>
              Explore Events
            </Link>

            {isAuthenticated && (
              <>
                <Link to="/bookings" className={navLinkClasses('/bookings')}>
                  My Bookings
                </Link>

                {user?.role === 'organizer' && (
                  <>
                    <Link to="/dashboard" className={navLinkClasses('/dashboard')}>
                      Dashboard
                    </Link>
                    <Link to="/events/create" className={navLinkClasses('/events/create')}>
                      Create Event
                    </Link>
                  </>
                )}
              </>
            )}
          </div>

          {/* Desktop User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-soft">
                    <span className="text-sm font-semibold text-white">
                      {user?.firstName?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-700 hidden lg:block">
                    Welcome, {user?.firstName}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-3 rounded-xl text-gray-700 hover:text-blue-600 hover:bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
            aria-expanded="false"
          >
            <span className="sr-only">Open main menu</span>
            <svg
              className={`${isMobileMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <svg
              className={`${isMobileMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:hidden border-t border-gray-100/50 bg-white/95 backdrop-blur-lg`}>
          <div className="px-4 pt-6 pb-6 space-y-3">
            <Link
              to="/events"
              className={`block px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 ${
                isActiveRoute('/events')
                  ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 shadow-soft'
                  : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50/50'
              }`}
              onClick={closeMobileMenu}
            >
              Explore Events
            </Link>

            {isAuthenticated && (
              <>
                <Link
                  to="/bookings"
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActiveRoute('/bookings')
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                  onClick={closeMobileMenu}
                >
                  My Bookings
                </Link>

                {user?.role === 'organizer' && (
                  <>
                    <Link
                      to="/dashboard"
                      className={`block px-3 py-2 rounded-md text-base font-medium ${
                        isActiveRoute('/dashboard')
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                      }`}
                      onClick={closeMobileMenu}
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/events/create"
                      className={`block px-3 py-2 rounded-md text-base font-medium ${
                        isActiveRoute('/events/create')
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                      }`}
                      onClick={closeMobileMenu}
                    >
                      Create Event
                    </Link>
                  </>
                )}
              </>
            )}

            {/* Mobile Auth Section */}
            <div className="border-t border-gray-200 pt-4 mt-4">
              {isAuthenticated ? (
                <div className="space-y-3">
                  <div className="flex items-center px-4 py-4 bg-gray-50/50 rounded-xl">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-soft">
                      <span className="text-sm font-semibold text-white">
                        {user?.firstName?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div className="ml-4">
                      <div className="text-base font-semibold text-gray-900">
                        {user?.firstName} {user?.lastName}
                      </div>
                      <div className="text-sm text-gray-500">{user?.email}</div>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link
                    to="/login"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors"
                    onClick={closeMobileMenu}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="block px-3 py-2 rounded-md text-base font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                    onClick={closeMobileMenu}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
