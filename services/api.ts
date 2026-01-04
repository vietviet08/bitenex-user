import axios, {
    AxiosError,
    AxiosResponse,
    InternalAxiosRequestConfig,
} from "axios";
import * as SecureStore from "expo-secure-store";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
console.log("API_BASE_URL", API_BASE_URL);

export const TOKEN_KEY = "auth_token";
export const REFRESH_TOKEN_KEY = "refresh_token";

let isRefreshing = false;
let failedQueue: {
    resolve: (value: unknown) => void;
    reject: (error: unknown) => void;
}[] = [];

let onLogout: (() => void) | null = null;

export function setLogoutCallback(callback: () => void): void {
    onLogout = callback;
}

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

export const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});

api.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        try {
            const token = await SecureStore.getItemAsync(TOKEN_KEY);
            if (token && config.headers) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch {
            console.warn("[API] SecureStore not available");
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
            _retry?: boolean;
        };

        if (
            error.response?.status === 401 &&
            originalRequest &&
            !originalRequest._retry
        ) {
            if (
                originalRequest.url?.includes("/auth/refresh") ||
                originalRequest.url?.includes("/auth/login")
            ) {
                return Promise.reject(transformError(error));
            }

            if (isRefreshing) {
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
                const refreshToken = await SecureStore.getItemAsync(
                    REFRESH_TOKEN_KEY
                );

                if (!refreshToken) {
                    throw new Error("No refresh token available");
                }

                const response = await axios.post<{
                    access_token: string;
                    refresh_token: string;
                }>(`${API_BASE_URL}/auth/refresh`, {
                    refresh_token: refreshToken,
                });

                const { access_token, refresh_token: newRefreshToken } =
                    response.data;

                await tokenService.setToken(access_token);
                await tokenService.setRefreshToken(newRefreshToken);

                if (originalRequest.headers) {
                    originalRequest.headers.Authorization = `Bearer ${access_token}`;
                }

                processQueue(null, access_token);
                isRefreshing = false;

                return api(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                isRefreshing = false;

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

function extractErrorMessage(error: AxiosError): string {
    if (error.response?.data) {
        const data = error.response.data as Record<string, unknown>;
        if (typeof data.message === "string") return data.message;
        if (typeof data.detail === "string") return data.detail;
    }
    if (error.message) return error.message;
    return "An unexpected error occurred";
}

export interface ApiError {
    message: string;
    status?: number;
    code?: string;
}

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

export default api;
