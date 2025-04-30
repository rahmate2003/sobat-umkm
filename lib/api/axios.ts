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
  timeout: 300000,
})

axiosInstance.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    let token = Cookies.get("access_token")
    if (!config.headers) config.headers = {} as any

    
    const isAuthEndpoint = config.url?.includes("/auth/")

    
    if (!token && !isAuthEndpoint) {
      const refreshTokenValue = Cookies.get("refresh_token")
      if (refreshTokenValue) {
        try {
          console.log("No access token found but refresh token exists, attempting refresh")
          
          if (!config.headers["X-No-Retry"]) {
            const newToken = await refreshToken()
            token = newToken 
            console.log("Token refresh successful, continuing with request")
          }
        } catch (refreshError) {
          console.error("Refresh token failed during request:", refreshError)
          
        }
      } else {
        
        console.log("Making request without any tokens:", config.url)
      }
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
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

    if (originalRequest.url?.includes("/auth/")) {
      return Promise.reject(error)
    }

    if (error.response?.status === 401 || error.response?.status === 403) {
      originalRequest._retry = originalRequest._retry || false
      originalRequest._retryCount = (originalRequest._retryCount || 0) + 1

      if (!originalRequest._retry && originalRequest._retryCount <= 3) {
        originalRequest._retry = true
        console.log("Received 401/403, attempting token refresh")

        try {
          const newToken = await refreshToken()
          console.log("Token refresh successful, retrying request")
          originalRequest.headers.Authorization = `Bearer ${newToken}`
          return axiosInstance(originalRequest)
        } catch (refreshError: any) {
          console.error("Refresh token failed:", refreshError)

          
          if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
            const reason =
              refreshError.message === "REFRESH_TOKEN_EXPIRED"
                ? "session_expired"
                : refreshError.message === "REFRESH_TOKEN_INVALID"
                  ? "session_expired"
                  : "session_expired"
            console.log(`Redirecting to login with reason: ${reason}`)
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
