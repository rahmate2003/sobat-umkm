// lib/api/axios.ts
import axios, { type AxiosError, type AxiosResponse } from "axios";
import Cookies from "js-cookie";
import { refreshToken } from "./auth-service";
import { InternalAxiosRequestConfig } from "axios";

// Base URL dari API
const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.sobatumkm.com";

// Membuat instance axios
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 30000, // 30 detik timeout
});

// Interceptor untuk request
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Mendapatkan token dari cookies
    const token = Cookies.get("access_token");

    // Pastikan headers ada, jika tidak, inisialisasi
    if (!config.headers) {
      config.headers = {} as any;
    }

    // Jika token ada, tambahkan ke header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (originalRequest.url?.includes("/auth/login") || originalRequest.url?.includes("/auth/refresh-token")) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const newToken = await refreshToken();
        Cookies.set("access_token", newToken, { expires: 30 / (60 * 24) }); // 30 menit
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        Cookies.remove("access_token");
        Cookies.remove("refresh_token");
        if (typeof window !== "undefined" && window.location.pathname !== "/login") {
          window.location.href = "/login"; // Redirect ke login jika refresh gagal
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;