// lib/api/axios.ts
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
    "X-Client-Timezone": Intl.DateTimeFormat().resolvedOptions().timeZone, // Add client timezone
  },
  timeout: 30000,
});

// Request interceptor
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

// lib/api/axios.ts (response interceptor)
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

      if (!originalRequest._retry && originalRequest._retryCount <= 3) {
        originalRequest._retry = true;

        try {
          const newToken = await refreshToken();
          // Set access token to expire in 30 days
          const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days in milliseconds
          Cookies.set("access_token", newToken, { expires });
          
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          console.error("Step 11 - Refresh Failed:", refreshError);
          Cookies.remove("access_token");
          Cookies.remove("refresh_token");
          
          if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
            window.location.href = "/login";
          }
          return Promise.reject(refreshError);
        }
      }
    }

    return Promise.reject(error);
  }
);
export default axiosInstance;