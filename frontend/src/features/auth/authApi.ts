import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { mockLogin, mockRegister } from './authSlice';

// Mock base query for authentication
const mockAuthBaseQuery = async (args: any) => {
  try {
    if (args.method === 'POST' && args.url.includes('/auth/login')) {
      const result = await mockLogin(args.body.auth.email, args.body.auth.password);
      return { data: result };
    }
    if (args.method === 'POST' && args.url.includes('/auth/register')) {
      const result = await mockRegister(args.body.user);
      return { data: result };
    }
    if (args.method === 'DELETE' && args.url.includes('/auth/logout')) {
      return { data: { success: true } };
    }
    return { data: {} };
  } catch (error: any) {
    return { error: { status: 400, data: { message: error.message } } };
  }
};

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: process.env.NODE_ENV === 'development' ? mockAuthBaseQuery : fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1',
  }),
  tagTypes: ['User'],
  endpoints: (builder) => ({
    login: builder.mutation<any, { email: string; password: string }>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: { auth: credentials },
      }),
    }),
    register: builder.mutation<any, any>({
      query: (userData) => ({
        url: '/auth/register',
        method: 'POST',
        body: { user: userData },
      }),
    }),
    logout: builder.mutation<any, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'DELETE',
      }),
    }),
  }),
});

export const { useLoginMutation, useRegisterMutation, useLogoutMutation } = authApi;

