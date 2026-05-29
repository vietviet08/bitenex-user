import axios, {
    AxiosError,
    AxiosResponse,
    InternalAxiosRequestConfig,
} from "axios";
import { HTTP_STATUS } from "@/constants/errorCodes";
import { ApiErrorException } from "./apiError";
import { transformError } from "./errorHandler";
import { tokenService } from "./tokenService";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
console.log("API_BASE_URL", API_BASE_URL);

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
            const token = await tokenService.getToken();
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
            error.response?.status === HTTP_STATUS.UNAUTHORIZED &&
            originalRequest &&
            !originalRequest._retry
        ) {
            if (
                originalRequest.url?.includes("/auth/refresh") ||
                originalRequest.url?.includes("/auth/login")
            ) {
                throw new ApiErrorException(transformError(error));
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
                    .catch((err) => {
                        throw err;
                    });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const refreshToken = await tokenService.getRefreshToken();

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

                throw new ApiErrorException(transformError(error));
            }
        }

        throw new ApiErrorException(transformError(error));
    }
);

export default api;
