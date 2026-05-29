import {
    useAuthLoading,
    useAuthStore,
    useIsAuthenticated,
    useIsInitialized,
    useUser,
} from "@/store/zustand/auth.store";
import { useMemo } from "react";

type AuthState = ReturnType<typeof useAuthStore.getState>;
const selectBootstrap = (state: AuthState) => state.bootstrap;
const selectLogin = (state: AuthState) => state.login;
const selectRegister = (state: AuthState) => state.register;
const selectLogout = (state: AuthState) => state.logout;

export function useAuth() {
    const user = useUser();
    const isAuthenticated = useIsAuthenticated();
    const isLoading = useAuthLoading();
    const isInitialized = useIsInitialized();

    const bootstrap = useAuthStore(selectBootstrap);
    const login = useAuthStore(selectLogin);
    const register = useAuthStore(selectRegister);
    const logout = useAuthStore(selectLogout);

    return useMemo(
        () => ({
            user,
            isAuthenticated,
            isLoading,
            isInitialized,

            bootstrap,
            login,
            register,
            logout,
        }),
        [
            user,
            isAuthenticated,
            isLoading,
            isInitialized,
            bootstrap,
            login,
            register,
            logout,
        ]
    );
}

export default useAuth;
