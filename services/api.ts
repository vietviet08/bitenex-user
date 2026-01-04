import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import * as SecureStore from 'expo-secure-store';

// Environment config - replace with actual values
const API_BASE_URL =
    process.env.EXPO_PUBLIC_API_BASE_URL;

// Token storage keys
export const TOKEN_KEY = 'auth_token';
export const REFRESH_TOKEN_KEY = 'refresh_token';

// Flag to prevent multiple refresh calls
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (error: unknown) => void;
}> = [];

// Callback for logout - will be set by auth store
let onLogout: (() => void) | null = null;

export function setLogoutCallback(callback: () => void): void {
  onLogout = callback;
}

// Process queued requests after token refresh
function processQueue(error: unknown, token: string | null = null): void {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token);
    }
  });
  failedQueue = [];
}

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
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Handle 401 Unauthorized - token expired
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      // Don't retry refresh or login endpoints
      if (
        originalRequest.url?.includes('/auth/refresh') ||
        originalRequest.url?.includes('/auth/login')
      ) {
        return Promise.reject(transformError(error));
      }

      if (isRefreshing) {
        // Wait for the ongoing refresh to complete
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);

        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Call refresh endpoint
        const response = await axios.post<{
          access_token: string;
          refresh_token: string;
        }>(`${API_BASE_URL}/auth/refresh`, {
          refresh_token: refreshToken,
        });

        const { access_token, refresh_token: newRefreshToken } = response.data;

        // Store new tokens
        await tokenService.setToken(access_token);
        await tokenService.setRefreshToken(newRefreshToken);

        // Update header for retry
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
        }

        processQueue(null, access_token);
        isRefreshing = false;

        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;

        // Clear tokens and trigger logout
        await tokenService.clearTokens();
        if (onLogout) {
          onLogout();
        }

        return Promise.reject(transformError(error));
      }
    }

    return Promise.reject(transformError(error));
  }
);

// Transform axios error to ApiError
function transformError(error: AxiosError): ApiError {
  const apiError: ApiError = {
    message: extractErrorMessage(error),
    status: error.response?.status,
    code: (error.response?.data as Record<string, unknown>)?.error as
      | string
      | undefined,
  };
  return apiError;
}

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
