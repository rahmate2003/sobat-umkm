import axiosInstance from "./axios"
import Cookies from "js-cookie"
import type { User } from "./user-service"

// Interface untuk response API
interface ApiResponse<T> {
  success: boolean
  statusCode: number
  message: string
  data: T
}

// Interface untuk role
interface Role {
  roleName: string
}

// Interface untuk user dalam response login
interface LoginUser {
  id: number
  email: string
  role: Role
}

// Interface untuk token
interface Token {
  token: string
  expires: string
}

// Interface untuk tokens dalam response login
interface Tokens {
  access: Token
  refresh: Token
}

// Interface untuk response login data
interface LoginResponseData {
  user: LoginUser
  tokens: Tokens
}

// Interface untuk request login
interface LoginRequest {
  email: string
  password: string
}

// Interface untuk response refresh token
interface RefreshTokenResponseData {
  tokens: {
    access: Token
  }
}

// Fungsi untuk login
export const login = async (
  credentials: LoginRequest,
): Promise<{ user: User; access_token: string; refresh_token: string }> => {
  try {
    const response = await axiosInstance.post<ApiResponse<LoginResponseData>>("/auth/login", credentials)

    if (response.data.success) {
      const { user, tokens } = response.data.data

      // Ekstrak token
      const access_token = tokens.access.token
      const refresh_token = tokens.refresh.token

      // Hitung waktu kedaluwarsa dalam hari
      const accessExpires = new Date(tokens.access.expires)
      const refreshExpires = new Date(tokens.refresh.expires)
      const now = new Date()

      // Konversi ke hari (pembulatan ke bawah)
      const accessExpiresInDays = Math.floor((accessExpires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      const refreshExpiresInDays = Math.floor((refreshExpires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

      // Simpan token ke cookies dengan waktu kedaluwarsa yang sesuai
      Cookies.set("access_token", access_token, {
        expires: accessExpiresInDays > 0 ? accessExpiresInDays : 1,
      })
      Cookies.set("refresh_token", refresh_token, {
        expires: refreshExpiresInDays > 0 ? refreshExpiresInDays : 7,
      })

      // Konversi user dari response ke format User yang digunakan aplikasi
      const mappedUser: User = {
        id: user.id,
        email: user.email,
        name: user.email.split("@")[0], // Gunakan bagian depan email sebagai nama sementara
        role: user.role.roleName,
        phoneNumber: "", // Default kosong karena tidak ada dalam response
        imageUrl: null, // Default null karena tidak ada dalam response
      }

      return {
        user: mappedUser,
        access_token,
        refresh_token,
      }
    } else {
      throw new Error(response.data.message || "Login failed")
    }
  } catch (error: any) {
    console.error("Login error:", error)
    throw error.response?.data || error
  }
}

// Fungsi untuk logout
export const logout = async (): Promise<void> => {
  try {
    const response = await axiosInstance.post<ApiResponse<null>>("/auth/logout")

    if (response.data.success) {
      // Hapus token dari cookies
      Cookies.remove("access_token")
      Cookies.remove("refresh_token")
    } else {
      throw new Error(response.data.message || "Logout failed")
    }
  } catch (error: any) {
    console.error("Logout error:", error)
    // Hapus token dari cookies meskipun API gagal
    Cookies.remove("access_token")
    Cookies.remove("refresh_token")
    throw error.response?.data || error
  }
}

// Fungsi untuk refresh token
export const refreshToken = async (): Promise<string> => {
  const refresh = Cookies.get("refresh_token")

  if (!refresh) {
    throw new Error("No refresh token available")
  }

  try {
    const response = await axiosInstance.post<ApiResponse<RefreshTokenResponseData>>("/auth/refresh-token", {
      refreshToken: refresh,
    })

    if (response.data.success) {
      const newAccessToken = response.data.data.tokens.access.token
      const accessExpires = new Date(response.data.data.tokens.access.expires)
      const now = new Date()

      // Konversi ke hari (pembulatan ke bawah)
      const accessExpiresInDays = Math.floor((accessExpires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

      // Update token di cookies
      Cookies.set("access_token", newAccessToken, {
        expires: accessExpiresInDays > 0 ? accessExpiresInDays : 1,
      })

      return newAccessToken
    } else {
      throw new Error(response.data.message || "Token refresh failed")
    }
  } catch (error: any) {
    console.error("Refresh token error:", error)
    throw error.response?.data || error
  }
}

// Fungsi untuk mendapatkan user yang sedang login
export const getCurrentUser = async (): Promise<User> => {
  try {
    const response = await axiosInstance.get<ApiResponse<{ user: LoginUser }>>("/user/")

    if (response.data.success) {
      const user = response.data.data.user

      // Konversi user dari response ke format User yang digunakan aplikasi
      const mappedUser: User = {
        id: user.id,
        email: user.email,
        name: user.email.split("@")[0], // Gunakan bagian depan email sebagai nama sementara
        role: user.role.roleName,
        phoneNumber: "", // Default kosong karena tidak ada dalam response
        imageUrl: null, // Default null karena tidak ada dalam response
      }

      return mappedUser
    } else {
      throw new Error(response.data.message || "Failed to get current user")
    }
  } catch (error: any) {
    console.error("Get current user error:", error)
    throw error.response?.data || error
  }
}

