import axios, { type AxiosError, type AxiosResponse } from "axios"
import Cookies from "js-cookie"
import { refreshToken } from "./auth-service"
import type { InternalAxiosRequestConfig } from "axios"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.sobatumkm.com"

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 30000,
})

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = Cookies.get("access_token")
    if (!config.headers) config.headers = {} as any

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    } else {
      // If we're making a request without an access token (except for auth endpoints)
      // Log this for debugging purposes
      if (!config.url?.includes("/auth/")) {
        console.log("Making request without access token:", config.url)
      }
    }

    return config
  },
  (error: AxiosError) => Promise.reject(error),
)
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean
      _retryCount?: number
    }

    // Skip refresh token logic for auth endpoints to avoid infinite loops
    if (originalRequest.url?.includes("/auth/")) {
      return Promise.reject(error)
    }

    // Handle unauthorized or forbidden responses by attempting token refresh
    if (error.response?.status === 401 || error.response?.status === 403) {
      originalRequest._retry = originalRequest._retry || false
      originalRequest._retryCount = (originalRequest._retryCount || 0) + 1

      // Only retry up to 3 times to prevent infinite loops
      if (!originalRequest._retry && originalRequest._retryCount <= 3) {
        originalRequest._retry = true
        // console.log("Received 401/403, attempting token refresh")

        try {
          const newToken = await refreshToken()
          // console.log("Token refresh successful, retrying request")
          originalRequest.headers.Authorization = `Bearer ${newToken}`
          return axiosInstance(originalRequest)
        } catch (refreshError: any) {
          console.error("Refresh token failed:", refreshError)

          // Redirect to login if we're in the browser and not already on the login page
          if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
            const reason =
              refreshError.message === "REFRESH_TOKEN_EXPIRED"
                ? "session_expired"
                : refreshError.message === "REFRESH_TOKEN_INVALID"
                  ? "session_expired"
                  : "session_expired"
            // console.log(`Redirecting to login with reason: ${reason}`)
            window.location.href = `/login?reason=${reason}`
          }
          return Promise.reject(refreshError)
        }
      } else if (originalRequest._retryCount > 3) {
        console.error("Maximum retry attempts reached")
      }
    }

    return Promise.reject(error)
  },
)

export default axiosInstance

