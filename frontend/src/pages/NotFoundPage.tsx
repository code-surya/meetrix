import { Link } from 'react-router-dom';
import { Container } from '@/components/layout/Container';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Container>
        <div className="max-w-2xl w-full">
          <div className="text-center">
            <div className="mb-8">
              <div className="mx-auto w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mb-6 shadow-soft">
                <svg
                  className="w-12 h-12 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-.966-5.618-2.479M12 7v8m0-8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3z"
                  />
                </svg>
              </div>
              <div className="text-8xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                404
              </div>
            </div>

            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Oops! Page Not Found
            </h1>

            <p className="text-xl text-gray-600 mb-8 max-w-lg mx-auto leading-relaxed">
              The page you're looking for doesn't exist. It might have been moved, deleted, or you might have mistyped the URL.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link
                to="/"
                className="btn btn-primary px-8 py-3"
              >
                <span className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Go Home
                </span>
              </Link>

              <Link
                to="/events"
                className="btn btn-secondary px-8 py-3"
              >
                <span className="flex items-center">
                  Browse Events
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </Link>
            </div>

            <div className="card">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Looking for something specific?</h3>
              </div>

              <p className="text-gray-600 mb-6">
                Here are some popular pages you might be interested in:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link
                  to="/events"
                  className="flex items-center p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-200 group"
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-blue-200 transition-colors">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 group-hover:text-blue-700">Explore Events</div>
                    <div className="text-sm text-gray-500">Find amazing events near you</div>
                  </div>
                </Link>

                <Link
                  to="/register"
                  className="flex items-center p-4 rounded-xl border border-gray-200 hover:border-purple-300 hover:bg-purple-50/50 transition-all duration-200 group"
                >
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-purple-200 transition-colors">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 group-hover:text-purple-700">Sign Up</div>
                    <div className="text-sm text-gray-500">Create your free account</div>
                  </div>
                </Link>

                <Link
                  to="/login"
                  className="flex items-center p-4 rounded-xl border border-gray-200 hover:border-green-300 hover:bg-green-50/50 transition-all duration-200 group"
                >
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-green-200 transition-colors">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 group-hover:text-green-700">Sign In</div>
                    <div className="text-sm text-gray-500">Access your account</div>
                  </div>
                </Link>

                <Link
                  to="/dashboard"
                  className="flex items-center p-4 rounded-xl border border-gray-200 hover:border-orange-300 hover:bg-orange-50/50 transition-all duration-200 group"
                >
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-orange-200 transition-colors">
                    <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 group-hover:text-orange-700">Dashboard</div>
                    <div className="text-sm text-gray-500">Manage your events</div>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default NotFoundPage;
