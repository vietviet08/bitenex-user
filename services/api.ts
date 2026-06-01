import axios, {
    AxiosError,
    AxiosResponse,
    InternalAxiosRequestConfig,
} from "axios";
import { HTTP_STATUS } from "@/constants/errorCodes";
import { ApiErrorException } from "./apiError";
import { getFreshAccessToken } from "./authTokens";
import { transformError } from "./errorHandler";
import { tokenService } from "./tokenService";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
console.log("API_BASE_URL", API_BASE_URL);

let onLogout: (() => void) | null = null;

export function setLogoutCallback(callback: () => void): void {
    onLogout = callback;
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

            originalRequest._retry = true;

            try {
                const access_token = await getFreshAccessToken();
                if (!access_token) {
                    throw new Error("No access token available after refresh");
                }

                if (originalRequest.headers) {
                    originalRequest.headers.Authorization = `Bearer ${access_token}`;
                }

                return api(originalRequest);
            } catch (refreshError) {
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
