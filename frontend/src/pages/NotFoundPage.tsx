import { Link } from 'react-router-dom';
import { Container } from '@/components/layout/Container';

const NotFoundPage = () => {
  return (
    <Container>
      <div className="py-16">
        <div className="text-center">
          <div className="mb-8">
            <svg
              className="mx-auto h-24 w-24 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-.966-5.618-2.479M12 7v8m0-8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3z"
              />
            </svg>
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-4">404 - Page Not Found</h1>

          <p className="text-xl text-gray-600 mb-8 max-w-md mx-auto">
            Sorry, the page you're looking for doesn't exist. It might have been moved, deleted, or you entered the wrong URL.
          </p>

          <div className="space-y-4">
            <Link
              to="/"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors duration-200"
            >
              Go to Homepage
            </Link>

            <div className="block">
              <Link
                to="/events"
                className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
              >
                Browse Events →
              </Link>
            </div>
          </div>

          <div className="mt-12 p-6 bg-gray-50 rounded-lg max-w-lg mx-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Pages</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
              <Link
                to="/events"
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                • Explore Events
              </Link>
              <Link
                to="/register"
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                • Sign Up
              </Link>
              <Link
                to="/login"
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                • Login
              </Link>
              <Link
                to="/dashboard"
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                • Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default NotFoundPage;
