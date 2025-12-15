import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store';
import { useRegisterMutation } from '@/features/auth/authApi';
import { registerStart, registerSuccess, registerFailure, clearError } from '@/features/auth/authSlice';
import { Container } from '@/components/layout/Container';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'attendee',
  });
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { error, isLoading } = useAppSelector((state) => state.auth);
  const [register] = useRegisterMutation();

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      dispatch(registerFailure('Passwords do not match'));
      return;
    }

    if (!formData.email || !formData.password || !formData.firstName || !formData.lastName) {
      dispatch(registerFailure('Please fill in all fields'));
      return;
    }

    dispatch(registerStart());

    try {
      const result = await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      }).unwrap();

      // Store in localStorage
      localStorage.setItem('meetrix_token', result.token);
      localStorage.setItem('meetrix_user', JSON.stringify(result.user));

      dispatch(registerSuccess(result));
      navigate('/');
    } catch (err: any) {
      dispatch(registerFailure(err.data?.message || 'Registration failed'));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Container>
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-soft">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Join Meetrix
            </h2>
            <p className="text-gray-600">
              Create your account and start exploring amazing events
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
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="form-label">
                      First name
                    </label>
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      required
                      className="form-input"
                      placeholder="John"
                      value={formData.firstName}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="form-label">
                      Last name
                    </label>
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      required
                      className="form-input"
                      placeholder="Doe"
                      value={formData.lastName}
                      onChange={handleChange}
                    />
                  </div>
                </div>

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
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="role" className="form-label">
                    Account Type
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <select
                      id="role"
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className="form-select pl-12"
                    >
                      <option value="attendee">🎟️ Event Attendee</option>
                      <option value="organizer">🎪 Event Organizer</option>
                    </select>
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
                      autoComplete="new-password"
                      required
                      className="form-input pl-12"
                      placeholder="Create a strong password"
                      value={formData.password}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="form-label">
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    className="form-input"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
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
                    Creating Account...
                  </>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              By creating an account, you agree to our{' '}
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

export default RegisterPage;
