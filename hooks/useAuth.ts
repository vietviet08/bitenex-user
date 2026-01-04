import {
  useAuthStore,
  useUser,
  useIsAuthenticated,
  useAuthLoading,
  useIsInitialized,
} from '@/store/zustand/auth.store';

export function useAuth() {
  const user = useUser();
  const isAuthenticated = useIsAuthenticated();
  const isLoading = useAuthLoading();
  const isInitialized = useIsInitialized();

  const bootstrap = useAuthStore((state) => state.bootstrap);
  const login = useAuthStore((state) => state.login);
  const logout = useAuthStore((state) => state.logout);

  return {
    // State
    user,
    isAuthenticated,
    isLoading,
    isInitialized,

    // Actions
    bootstrap,
    login,
    logout,
  };
}

export default useAuth;
