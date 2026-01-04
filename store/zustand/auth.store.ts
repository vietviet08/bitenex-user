/**
 * Auth Store - Zustand
 * Manages authentication state, user session, and tokens
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { api, tokenService, setLogoutCallback } from '@/services/api';

// User type definition (matches backend AuthUserResponse)
export interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  is_verified: boolean;
  created_at: string;
}

// Login response types
interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

interface LoginResponse {
  tokens: TokenResponse;
  user: User;
}

// Auth state interface
interface AuthState {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;

  // Actions
  bootstrap: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setLoading: (loading: boolean) => void;
}

// Initial state
const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => {
      // Register logout callback with API interceptor
      setLogoutCallback(() => {
        get().logout();
      });

      return {
        ...initialState,

        bootstrap: async () => {
          set({ isLoading: true });

          try {
            // Check if we have a token
            const token = await tokenService.getToken();

            if (!token) {
              set({
                user: null,
                isAuthenticated: false,
                isInitialized: true,
                isLoading: false,
              });
              return;
            }

            // Validate token by fetching current user
            const response = await api.get<User>('/auth/me');

            set({
              user: response.data,
              isAuthenticated: true,
              isInitialized: true,
              isLoading: false,
            });
          } catch {
            // Token invalid or expired - clear state
            await tokenService.clearTokens();
            set({
              user: null,
              isAuthenticated: false,
              isInitialized: true,
              isLoading: false,
            });
          }
        },

        login: async (email: string, password: string) => {
          set({ isLoading: true });

          try {
            const response = await api.post<LoginResponse>('/auth/login', {
              email,
              password,
            });

            const { tokens, user } = response.data;

            // Store tokens securely
            await tokenService.setToken(tokens.access_token);
            await tokenService.setRefreshToken(tokens.refresh_token);

            set({
              user,
              isAuthenticated: true,
              isLoading: false,
            });
          } catch (error) {
            set({ isLoading: false });
            throw error;
          }
        },

        logout: async () => {
          try {
            // Call logout endpoint to revoke refresh token
            await api.post('/auth/logout');
          } catch {
            // Ignore errors - still clear local state
          }

          await tokenService.clearTokens();

          set({
            user: null,
            isAuthenticated: false,
          });
        },

        setLoading: (isLoading) => set({ isLoading }),
      };
    },
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        // Only persist user data, not loading/initialized states
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Selector hooks for optimized re-renders
export const useUser = () => useAuthStore((state) => state.user);
export const useIsAuthenticated = () =>
  useAuthStore((state) => state.isAuthenticated);
export const useAuthLoading = () => useAuthStore((state) => state.isLoading);
export const useIsInitialized = () =>
  useAuthStore((state) => state.isInitialized);
