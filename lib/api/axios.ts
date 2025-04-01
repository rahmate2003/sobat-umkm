import axios, { type AxiosError, type AxiosResponse } from "axios"
import Cookies from "js-cookie"
import { refreshToken } from "./auth-service"

// Base URL dari API
const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.sobatumkm.com"

// Membuat instance axios
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 30000, // 30 detik timeout
})

// Interceptor untuk request
axiosInstance.interceptors.request.use(
  (config: any) => {
    // Mendapatkan token dari cookies
    const token = Cookies.get("access_token")

    // Jika token ada, tambahkan ke header
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  },
)

// Interceptor untuk response
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as any

    // Jika error 401 (Unauthorized) dan belum pernah retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        // Coba refresh token
        const newToken = await refreshToken()

        // Update token di cookies
        Cookies.set("access_token", newToken, {
          expires: Number.parseInt(process.env.NEXT_PUBLIC_ACCESS_TOKEN_EXPIRES || "1"),
        })

        // Update header dengan token baru
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`
        }

        // Retry request dengan token baru
        return axiosInstance(originalRequest)
      } catch (refreshError) {
        // Jika refresh token gagal, logout user
        Cookies.remove("access_token")
        Cookies.remove("refresh_token")

        // Redirect ke halaman login
        window.location.href = "/login"

        return Promise.reject(refreshError)
      }
    }

    // Handle error lainnya
    return Promise.reject(error)
  },
)

export default axiosInstance

