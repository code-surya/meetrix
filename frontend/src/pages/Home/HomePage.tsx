import { Link } from 'react-router-dom';
import { Container } from '@/components/layout/Container';

const HomePage = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="absolute inset-0 bg-white/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="text-center fade-in">
            <h1 className="text-5xl md:text-7xl font-bold text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text mb-8 leading-tight">
              Welcome to Meetrix
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 mb-12 max-w-3xl mx-auto leading-relaxed">
              Discover amazing events, book tickets seamlessly, and manage your events like a pro.
              Join thousands of attendees and organizers on the ultimate event management platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link
                to="/events"
                className="btn btn-primary btn-lg group shadow-soft hover:shadow-medium"
              >
                <span className="flex items-center">
                  Explore Events
                  <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </Link>
              <Link
                to="/register"
                className="btn btn-secondary btn-lg shadow-soft hover:shadow-medium"
              >
                Become an Organizer
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <Container>
        <div className="py-32">
          <div className="text-center mb-20 fade-in-up">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Why Choose Meetrix?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Everything you need to discover, organize, and attend amazing events.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="card text-center hover-lift fade-in-up" style={{ animationDelay: '0.1s' }}>
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-soft">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Discover Events</h3>
              <p className="text-gray-600 leading-relaxed">
                Find events that match your interests with our powerful search and filtering system.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="card text-center hover-lift fade-in-up" style={{ animationDelay: '0.2s' }}>
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-soft">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Easy Booking</h3>
              <p className="text-gray-600 leading-relaxed">
                Book tickets instantly with secure payment processing and instant confirmation.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="card text-center hover-lift fade-in-up" style={{ animationDelay: '0.3s' }}>
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-soft">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Analytics Dashboard</h3>
              <p className="text-gray-600 leading-relaxed">
                Track attendance, revenue, and performance with comprehensive analytics tools.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="card-elevated text-center bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white p-12 fade-in-up" style={{ animationDelay: '0.4s' }}>
          <h2 className="text-4xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-blue-100 mb-10 max-w-2xl mx-auto text-lg leading-relaxed">
            Join thousands of event organizers and attendees using Meetrix to create unforgettable experiences.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link
              to="/register"
              className="btn btn-lg bg-white text-purple-600 hover:bg-gray-50 font-semibold shadow-soft hover:shadow-medium"
            >
              Sign Up Free
            </Link>
            <Link
              to="/events"
              className="btn btn-outline btn-lg border-white text-white hover:bg-white hover:text-purple-600 font-semibold"
            >
              Browse Events
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default HomePage;
