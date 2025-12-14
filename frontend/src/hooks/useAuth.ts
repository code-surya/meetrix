import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import { useLoginMutation, useRegisterMutation, useLogoutMutation } from '@/features/auth/authApi';
import { setCredentials, clearCredentials } from '@/features/auth/authSlice';
import { setToken, clearToken } from '@/services/storage/localStorage';
import { useNavigate } from 'react-router-dom';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, token, isAuthenticated } = useAppSelector((state) => state.auth);

  const [loginMutation, { isLoading: isLoggingIn }] = useLoginMutation();
  const [registerMutation, { isLoading: isRegistering }] = useRegisterMutation();
  const [logoutMutation] = useLogoutMutation();

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        const result = await loginMutation({ email, password }).unwrap();
        const { user: userData, access_token, refresh_token } = result.data;

        // Store tokens
        setToken(access_token, refresh_token);

        // Update Redux state
        dispatch(setCredentials({ user: userData, token: access_token }));

        return { success: true, user: userData };
      } catch (error: any) {
        return {
          success: false,
          error: error.data?.error?.message || 'Login failed',
        };
      }
    },
    [dispatch, loginMutation]
  );

  const register = useCallback(
    async (userData: { email: string; password: string; first_name: string; last_name: string }) => {
      try {
        const result = await registerMutation(userData).unwrap();
        const { user: newUser, access_token, refresh_token } = result.data;

        // Store tokens
        setToken(access_token, refresh_token);

        // Update Redux state
        dispatch(setCredentials({ user: newUser, token: access_token }));

        return { success: true, user: newUser };
      } catch (error: any) {
        return {
          success: false,
          error: error.data?.error?.message || 'Registration failed',
        };
      }
    },
    [dispatch, registerMutation]
  );

  const logout = useCallback(async () => {
    try {
      await logoutMutation().unwrap();
    } catch (error) {
      // Continue with logout even if API call fails
      console.error('Logout error:', error);
    } finally {
      // Clear tokens
      clearToken();

      // Clear Redux state
      dispatch(clearCredentials());

      // Redirect to login
      navigate('/login');
    }
  }, [dispatch, logoutMutation, navigate]);

  return {
    user,
    token,
    isAuthenticated,
    isLoggingIn,
    isRegistering,
    login,
    register,
    logout,
  };
};

