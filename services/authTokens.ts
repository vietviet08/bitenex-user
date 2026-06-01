import axios from "axios";

import { tokenService } from "./tokenService";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

let refreshPromise: Promise<string | null> | null = null;

export async function getFreshAccessToken(): Promise<string | null> {
    if (refreshPromise) {
        return refreshPromise;
    }

    refreshPromise = (async () => {
        const refreshToken = await tokenService.getRefreshToken();
        if (!refreshToken || !API_BASE_URL) {
            return tokenService.getToken();
        }

        try {
            const response = await axios.post<{
                access_token: string;
                refresh_token: string;
            }>(`${API_BASE_URL}/auth/refresh`, {
                refresh_token: refreshToken,
            });

            await tokenService.setToken(response.data.access_token);
            await tokenService.setRefreshToken(response.data.refresh_token);
            return response.data.access_token;
        } catch (error) {
            await tokenService.clearTokens();
            console.warn("[Auth] Failed to refresh access token for socket:", error);
            return null;
        } finally {
            refreshPromise = null;
        }
    })();

    return refreshPromise;
}
