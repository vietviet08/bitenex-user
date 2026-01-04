/**
 * API client configuration
 * Axios instance with interceptors for auth and error handling
 */

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';

// Environment config - replace with actual values
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

// Token storage keys
export const TOKEN_KEY = 'auth_token';
export const REFRESH_TOKEN_KEY = 'refresh_token';

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request interceptor - attach auth token
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // SecureStore may not be available (web)
      console.warn('[API] SecureStore not available');
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized - token expired
    if (error.response?.status === 401 && originalRequest) {
      // TODO: Implement token refresh logic
      // 1. Get refresh token from SecureStore
      // 2. Call refresh endpoint
      // 3. Store new tokens
      // 4. Retry original request

      // For now, just reject - will be implemented with auth flow
      console.warn('[API] Unauthorized - token may be expired');
    }

    // Transform error for consistent handling
    const apiError: ApiError = {
      message: extractErrorMessage(error),
      status: error.response?.status,
      code: (error.response?.data as Record<string, unknown>)?.error as string | undefined,
    };

    return Promise.reject(apiError);
  }
);

// Error message extraction helper
function extractErrorMessage(error: AxiosError): string {
  if (error.response?.data) {
    const data = error.response.data as Record<string, unknown>;
    if (typeof data.message === 'string') return data.message;
    if (typeof data.detail === 'string') return data.detail;
  }
  if (error.message) return error.message;
  return 'An unexpected error occurred';
}

// API Error type
export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

// Token management helpers
export const tokenService = {
  async getToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(TOKEN_KEY);
    } catch {
      return null;
    }
  },

  async setToken(token: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(TOKEN_KEY, token);
    } catch {
      console.warn('[Token] Failed to store token');
    }
  },

  async getRefreshToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
    } catch {
      return null;
    }
  },

  async setRefreshToken(token: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
    } catch {
      console.warn('[Token] Failed to store refresh token');
    }
  },

  async clearTokens(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    } catch {
      console.warn('[Token] Failed to clear tokens');
    }
  },
};

export default api;
