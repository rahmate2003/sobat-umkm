//lib/api/axios.ts
import axios, { type AxiosError, type AxiosResponse } from "axios";
import Cookies from "js-cookie";
import { refreshToken } from "./auth-service";
import { InternalAxiosRequestConfig } from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.sobatumkm.com";

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 30000,
});

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = Cookies.get("access_token");
    if (!config.headers) config.headers = {} as any;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { 
      _retry?: boolean;
      _retryCount?: number;
    };

    if (originalRequest.url?.includes("/auth/")) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401) {
      originalRequest._retry = originalRequest._retry || false;
      originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;

      if (!originalRequest._retry && originalRequest._retryCount <= 1) {
        originalRequest._retry = true;

        try {
          const newToken = await refreshToken();
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          console.error("Refresh token failed:", refreshError);
          if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
            window.location.href = "/login?reason=session_expired";
          }
          return Promise.reject(refreshError);
        }
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;