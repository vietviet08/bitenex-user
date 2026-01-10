import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { api, setLogoutCallback } from "@/services/api";
import { tokenService } from "@/services/tokenService";

export interface User {
    id: string;
    email: string;
    full_name: string;
    role: string;
    is_verified: boolean;
    created_at: string;
}

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

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    isInitialized: boolean;

    bootstrap: () => Promise<void>;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    setLoading: (loading: boolean) => void;
}

const initialState = {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    isInitialized: false,
};

let isBootstrapping = false;
let hasRehydrated = false;

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            ...initialState,

            bootstrap: async () => {
                if (isBootstrapping || get().isInitialized) {
                    return;
                }

                isBootstrapping = true;
                set({ isLoading: true });

                try {
                    const token = await tokenService.getToken();

                    if (!token) {
                        set({
                            user: null,
                            isAuthenticated: false,
                            isInitialized: true,
                            isLoading: false,
                        });
                        isBootstrapping = false;
                        return;
                    }

                    const response = await api.get<User>("/auth/me");

                    set({
                        user: response.data,
                        isAuthenticated: true,
                        isInitialized: true,
                        isLoading: false,
                    });
                    isBootstrapping = false;
                } catch {
                    await tokenService.clearTokens();
                    set({
                        user: null,
                        isAuthenticated: false,
                        isInitialized: true,
                        isLoading: false,
                    });
                    isBootstrapping = false;
                }
            },

            login: async (email: string, password: string) => {
                set({ isLoading: true });

                try {
                    const response = await api.post<LoginResponse>(
                        "/auth/login",
                        {
                            email,
                            password,
                        }
                    );

                    const { tokens, user } = response.data;

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
                    const refreshToken = await tokenService.getRefreshToken();
                    if (refreshToken) {
                        await api.post("/auth/logout", {
                            refresh_token: refreshToken,
                        });
                    }
                } catch {}

                await tokenService.clearTokens();

                set({
                    user: null,
                    isAuthenticated: false,
                });
            },

            setLoading: (isLoading) => set({ isLoading }),
        }),
        {
            name: "auth-storage",
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({
                user: state.user,
                isAuthenticated: state.isAuthenticated,
            }),
            onRehydrateStorage: () => (state) => {
                hasRehydrated = true;
            },
        }
    )
);

export const getHasRehydrated = () => hasRehydrated;

setLogoutCallback(() => {
    useAuthStore.getState().logout();
});

export const useUser = () => useAuthStore((state) => state.user);
export const useIsAuthenticated = () =>
    useAuthStore((state) => state.isAuthenticated);
export const useAuthLoading = () => useAuthStore((state) => state.isLoading);
export const useIsInitialized = () =>
    useAuthStore((state) => state.isInitialized);
