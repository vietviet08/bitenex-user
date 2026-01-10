import * as SecureStore from "expo-secure-store";

export const TOKEN_KEY = "auth_token";
export const REFRESH_TOKEN_KEY = "refresh_token";

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
            console.warn("[Token] Failed to store token");
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
            console.warn("[Token] Failed to store refresh token");
        }
    },

    async clearTokens(): Promise<void> {
        try {
            await SecureStore.deleteItemAsync(TOKEN_KEY);
            await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
        } catch {
            console.warn("[Token] Failed to clear tokens");
        }
    },
};
