//lib/api/auth-service.ts
import axiosInstance from "./axios"
import Cookies from "js-cookie"
import type { User } from "./user-service"

interface ApiResponse<T> {
  success: boolean
  statusCode: number
  message: string
  data: T
}

interface LoginUser {
  id: number
  email: string
  role: string
}

interface Token {
  token: string
  expires: string
}

interface Tokens {
  access: Token
  refresh: Token
}

interface LoginResponseData {
  user: LoginUser
  token: Tokens
}

interface LoginRequest {
  email: string
  password: string
}

interface RefreshTokenResponseData {
  token: {
    access: Token
    refresh: Token
  }
}

export const login = async (
  credentials: LoginRequest,
): Promise<{ user: User; access_token: string; refresh_token: string }> => {
  try {
    const response = await axiosInstance.post<ApiResponse<LoginResponseData>>("/auth/login", credentials)

    if (response.data.success) {
      const { user, token } = response.data.data
      const { access, refresh } = token

      // Add console logs here to see the tokens
      console.log("Access Token:", access.token)
      console.log("Access Token Expires:", new Date(access.expires).toLocaleString())
      console.log("Refresh Token:", refresh.token)
      console.log("Refresh Token Expires:", new Date(refresh.expires).toLocaleString())

      // Set explicit expiration times based on current time
      const now = new Date()
      // Access token expires in 30 minutes from now
      const accessExpires = new Date(now.getTime() + 30 * 60 * 1000)
      // Refresh token expires in 30 days from now
      const refreshExpires = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

      console.log("Setting access token to expire at:", accessExpires.toLocaleString())
      console.log("Setting refresh token to expire at:", refreshExpires.toLocaleString())

      // Set access token with 30 minute expiration
      Cookies.set("access_token", access.token, {
        expires: accessExpires,
        path: "/",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      })

      // Set refresh token with 30 day expiration
      Cookies.set("refresh_token", refresh.token, {
        expires: refreshExpires,
        path: "/",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      })

      const mappedUser: User = {
        id: user.id,
        email: user.email,
        name: user.email.split("@")[0],
        role: user.role,
        phoneNumber: "",
        imageUrl: null,
      }

      return {
        user: mappedUser,
        access_token: access.token,
        refresh_token: refresh.token,
      }
    }
    throw new Error(response.data.message || "Login failed")
  } catch (error: any) {
    console.error("Login error:", error)
    clearAuthCookies()
    throw new Error(error?.response?.data?.message || "Login failed")
  }
}

export const logout = async (): Promise<void> => {
  try {
    await axiosInstance.post("/auth/logout")
  } catch (error) {
    console.error("Logout error:", error)
  } finally {
    clearAuthCookies()
  }
}
export const refreshToken = async (): Promise<string> => {
  const refreshTokenValue = Cookies.get("refresh_token")
  if (!refreshTokenValue) {
    clearAuthCookies()
    throw new Error("NO_REFRESH_TOKEN")
  }

  console.log("Attempting to refresh token with refresh token")

  try {
    const response = await axiosInstance.post<ApiResponse<RefreshTokenResponseData>>(
      "/auth/refresh-token",
      { refreshToken: refreshTokenValue },
      {
        headers: {
          "X-No-Retry": "true", 
        },
      },
    )

    if (response.data.success) {
      const { access, refresh } = response.data.data.token
      const now = new Date()
      // Access token expires in 30 minutes
      const accessExpires = new Date(now.getTime() + 30 * 60 * 1000)
      // Refresh token expires in 30 days - this ensures it persists even if browser is closed
      const refreshExpires = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

      // Verify both tokens are not expired
      if (new Date(access.expires) < now || new Date(refresh.expires) < now) {
        clearAuthCookies()
        throw new Error("NEW_TOKENS_EXPIRED")
      }

      console.log("Token refresh successful, setting new cookies")

      const cookieOptions = {
        path: "/",
        sameSite: "lax" as const,
        secure: process.env.NODE_ENV === "production",
      }

      // Set new access token
      Cookies.set("access_token", access.token, {
        ...cookieOptions,
        expires: accessExpires,
      })

      // Set new refresh token
      Cookies.set("refresh_token", refresh.token, {
        ...cookieOptions,
        expires: refreshExpires,
      })

      return access.token
    }

    // Handle unsuccessful responses
    throw new Error(response.data.message || "Token refresh failed")
  } catch (error: any) {
    console.error("Refresh token error:", error)

    // Handle specific error cases
    const errorMessage = error?.response?.data?.message?.toLowerCase() || ""
    const statusCode = error?.response?.status

    if (statusCode === 401 || errorMessage.includes("expired") || error.message === "NEW_TOKENS_EXPIRED") {
      clearAuthCookies()
      throw new Error("REFRESH_TOKEN_EXPIRED")
    }

    if (statusCode === 403 || errorMessage.includes("invalid")) {
      clearAuthCookies()
      throw new Error("REFRESH_TOKEN_INVALID")
    }

    // Handle other unexpected errors
    clearAuthCookies()
    throw new Error(error.message || "REFRESH_TOKEN_FAILED")
  }
}
export const getCurrentUser = async (): Promise<User> => {
  const accessToken = Cookies.get("access_token")
  if (!accessToken) {
    throw new Error("NO_ACCESS_TOKEN")
  }

  try {
    const response = await axiosInstance.get<ApiResponse<{ user: LoginUser }>>("/user/")

    if (response.data.success) {
      const user = response.data.data.user
      return {
        id: user.id,
        email: user.email,
        name: user.email.split("@")[0],
        role: user.role,
        phoneNumber: "",
        imageUrl: null,
      }
    }
    throw new Error(response.data.message || "Failed to get current user")
  } catch (error: any) {
    console.error("Get current user error:", error)
    if (error.response?.status === 401) {
      clearAuthCookies()
    }
    throw error
  }
}

const clearAuthCookies = () => {
  Cookies.remove("access_token", { path: "/" })
  // Cookies.remove("refresh_token", { path: "/" })
}
