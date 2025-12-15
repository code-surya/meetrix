import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store';
import { useLoginMutation } from '@/features/auth/authApi';
import { loginStart, loginSuccess, loginFailure, clearError } from '@/features/auth/authSlice';
import { Container } from '@/components/layout/Container';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { error, isLoading } = useAppSelector((state) => state.auth);
  const [login] = useLoginMutation();

  // Get the intended destination from location state
  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    // Clear any previous errors when component mounts
    dispatch(clearError());
  }, [dispatch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      dispatch(loginFailure('Please fill in all fields'));
      return;
    }

    dispatch(loginStart());

    try {
      const result = await login({
        email: formData.email,
        password: formData.password,
      }).unwrap();

      // Store in localStorage
      localStorage.setItem('meetrix_token', result.token);
      localStorage.setItem('meetrix_user', JSON.stringify(result.user));

      dispatch(loginSuccess(result));
      navigate(from, { replace: true });
    } catch (err: any) {
      dispatch(loginFailure(err.data?.message || 'Login failed'));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Container>
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-soft">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back
            </h2>
            <p className="text-gray-600">
              Sign in to your Meetrix account to continue
            </p>
          </div>

          <div className="card">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="form-label">
                    Email address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                      </svg>
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      className="form-input pl-12"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="form-label">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      className="form-input pl-12"
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <Link
                    to="/forgot-password"
                    className="font-medium text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    Forgot your password?
                  </Link>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary w-full py-3 text-base font-semibold"
              >
                {isLoading ? (
                  <>
                    <div className="spinner mr-2"></div>
                    Signing in...
                  </>
                ) : (
                  'Sign in'
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className="font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </div>

          {/* Demo credentials */}
          <div className="mt-8 card">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-gray-900">Demo Credentials</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Admin:</span>
                <span className="font-mono text-gray-900">admin@meetrix.com</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Organizer:</span>
                <span className="font-mono text-gray-900">organizer1@meetrix.com</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Attendee:</span>
                <span className="font-mono text-gray-900">attendee1@meetrix.com</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              Password for all accounts: <span className="font-mono">password123</span>
            </p>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              By signing in, you agree to our{' '}
              <Link to="#" className="text-blue-600 hover:text-blue-800">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="#" className="text-blue-600 hover:text-blue-800">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default LoginPage;
