//lib/api/auth.service.ts
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
    refresh: Token // Tambahkan refresh token di response
  }
}
export const login = async (
  credentials: LoginRequest
): Promise<{ user: User; access_token: string; refresh_token: string }> => {
  try {
    const response = await axiosInstance.post<ApiResponse<LoginResponseData>>(
      "/auth/login",
      credentials
    );

    if (response.data.success) {
      const { user, tokens } = response.data.data;

      const access_token = tokens.access.token;
      const refresh_token = tokens.refresh.token;

      // Simpan token ke cookies dengan waktu kedaluwarsa yang sesuai
      Cookies.set("access_token", access_token, {
        expires: 30 / (60 * 24), // 30 menit dalam fraksi hari
      });
      Cookies.set("refresh_token", refresh_token, {
        expires: 30, // 30 hari
      });

      const mappedUser: User = {
        id: user.id,
        email: user.email,
        name: user.email.split("@")[0],
        role: user.role.roleName,
        phoneNumber: "",
        imageUrl: null,
      };

      return {
        user: mappedUser,
        access_token,
        refresh_token,
      };
    } else {
      throw new Error(response.data.message || "Login failed");
    }
  } catch (error: any) {
    console.error("Login error:", error);
    throw new Error(error?.response?.data?.message || "Login failed");
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
// Fungsi refreshToken yang diperbarui
export const refreshToken = async (): Promise<string> => {
  const refresh = Cookies.get("refresh_token");

  if (!refresh) {
    throw new Error("No refresh token available");
  }

  try {
    const response = await axiosInstance.post<ApiResponse<RefreshTokenResponseData>>(
      "/auth/refresh-token",
      { refreshToken: refresh } // Request body sesuai contoh Anda
    );

    if (response.data.success) {
      const newAccessToken = response.data.data.tokens.access.token;
      const newRefreshToken = response.data.data.tokens.refresh.token;

      // Simpan access token dan refresh token baru ke cookies
      Cookies.set("access_token", newAccessToken, {
        expires: 30 / (60 * 24), // 30 menit
      });
      Cookies.set("refresh_token", newRefreshToken, {
        expires: 30, // 30 hari
      });

      return newAccessToken;
    } else {
      throw new Error(response.data.message || "Token refresh failed");
    }
  } catch (error: any) {
    console.error("Refresh token error:", error);
    // Hapus token jika refresh gagal
    Cookies.remove("access_token");
    Cookies.remove("refresh_token");
    throw error.response?.data || error;
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

