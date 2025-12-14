import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Mock users for authentication
const mockUsers = [
  {
    id: 1,
    email: 'admin@meetrix.com',
    password: 'password123',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin'
  },
  {
    id: 2,
    email: 'organizer1@meetrix.com',
    password: 'password123',
    firstName: 'John',
    lastName: 'Organizer',
    role: 'organizer'
  },
  {
    id: 3,
    email: 'organizer2@meetrix.com',
    password: 'password123',
    firstName: 'Jane',
    lastName: 'Organizer',
    role: 'organizer'
  },
  {
    id: 4,
    email: 'attendee1@meetrix.com',
    password: 'password123',
    firstName: 'Alice',
    lastName: 'Attendee',
    role: 'attendee'
  },
  {
    id: 5,
    email: 'attendee2@meetrix.com',
    password: 'password123',
    firstName: 'Bob',
    lastName: 'Attendee',
    role: 'attendee'
  }
];

interface AuthState {
  user: any | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const getStoredUser = () => {
  const stored = localStorage.getItem('meetrix_user');
  return stored ? JSON.parse(stored) : null;
};

const initialState: AuthState = {
  user: getStoredUser(),
  token: localStorage.getItem('meetrix_token'),
  isAuthenticated: !!getStoredUser(),
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<{ user: any; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.isLoading = false;
      state.error = null;
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = action.payload;
    },
    registerStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    registerSuccess: (state, action: PayloadAction<{ user: any; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.isLoading = false;
      state.error = null;
    },
    registerFailure: (state, action: PayloadAction<string>) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
      localStorage.removeItem('meetrix_user');
      localStorage.removeItem('meetrix_token');
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

// Mock authentication functions
export const mockLogin = (email: string, password: string) => {
  return new Promise<{ user: any; token: string }>((resolve, reject) => {
    setTimeout(() => {
      const user = mockUsers.find(u => u.email === email && u.password === password);
      if (user) {
        const { password: _, ...userWithoutPassword } = user;
        const token = `mock-token-${user.id}-${Date.now()}`;
        resolve({ user: userWithoutPassword, token });
      } else {
        reject(new Error('Invalid email or password'));
      }
    }, 1000);
  });
};

export const mockRegister = (userData: any) => {
  return new Promise<{ user: any; token: string }>((resolve, reject) => {
    setTimeout(() => {
      // Check if user already exists
      const existingUser = mockUsers.find(u => u.email === userData.email);
      if (existingUser) {
        reject(new Error('User already exists'));
        return;
      }

      // Create new user
      const newUser = {
        id: Date.now(),
        email: userData.email,
        password: userData.password,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role || 'attendee'
      };

      mockUsers.push(newUser);
      const { password: _, ...userWithoutPassword } = newUser;
      const token = `mock-token-${newUser.id}-${Date.now()}`;
      resolve({ user: userWithoutPassword, token });
    }, 1000);
  });
};

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  registerStart,
  registerSuccess,
  registerFailure,
  logout,
  clearError
} = authSlice.actions;
export default authSlice.reducer;

