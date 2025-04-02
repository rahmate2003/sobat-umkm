// lib/api/auth.service.ts
import axiosInstance from "./axios";
import Cookies from "js-cookie";
import type { User } from "./user-service";

interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
}


interface LoginUser {
  id: number;
  email: string;
  role: string;
}

interface Token {
  token: string;
  expires: string; // ISO 8601 format
}

interface Tokens {
  access: Token;
  refresh: Token;
}

interface LoginResponseData {
  user: LoginUser;
  token: Tokens;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface RefreshTokenResponseData {
  token: {
    access: Token;
    refresh: Token;
  };
}
// lib/api/auth.service.ts (login function)
export const login = async (
  credentials: LoginRequest
): Promise<{ user: User; access_token: string; refresh_token: string }> => {
  try {
    const response = await axiosInstance.post<ApiResponse<LoginResponseData>>(
      "/auth/login",
      credentials
    );

    if (response.data.success) {
      const { user, token } = response.data.data;
      const { access, refresh } = token;

      // Set access token to expire in 30 days, keep refresh token as per server response
      const accessExpires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
      const refreshExpires = new Date(refresh.expires);

      Cookies.set("access_token", access.token, {
        expires: accessExpires,
      });
      Cookies.set("refresh_token", refresh.token, {
        expires: refreshExpires,
      });

      const mappedUser: User = {
        id: user.id,
        email: user.email,
        name: user.email.split("@")[0],
        role: user.role,
        phoneNumber: "",
        imageUrl: null,
      };

      return {
        user: mappedUser,
        access_token: access.token,
        refresh_token: refresh.token,
      };
    } else {
      throw new Error(response.data.message || "Login failed");
    }
  } catch (error: any) {
    console.error("Login error:", error);
    Cookies.remove("access_token");
    Cookies.remove("refresh_token");
    throw new Error(error?.response?.data?.message || "Login failed");
  }
};

export const logout = async (): Promise<void> => {
  try {
    await axiosInstance.post<ApiResponse<null>>("/auth/logout");
  } catch (error) {
    console.error("Logout error:", error);
  } finally {
    // Always remove tokens
    Cookies.remove("access_token");
    Cookies.remove("refresh_token");
  }
};

// lib/api/auth.service.ts (refreshToken function)
export const refreshToken = async (): Promise<string> => {
  const refreshTokenValue = Cookies.get("refresh_token");
  if (!refreshTokenValue) throw new Error("No refresh token available");

  try {
    const response = await axiosInstance.post<ApiResponse<RefreshTokenResponseData>>(
      "/auth/refresh-token",
      { refreshToken: refreshTokenValue }
    );

    if (response.data.success) {
      const { access, refresh } = response.data.data.token;

      // Set access token to expire in 30 days, keep refresh token as per server response
      const accessExpires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
      const refreshExpires = new Date(refresh.expires);

      Cookies.set("access_token", access.token, { expires: accessExpires });
      Cookies.set("refresh_token", refresh.token, { expires: refreshExpires });

      return access.token;
    }
    throw new Error(response.data.message || "Token refresh failed");
  } catch (error: any) {
    console.error("Step 6 - Refresh Token Error:", error.response?.data || error);
    Cookies.remove("access_token");
    Cookies.remove("refresh_token");
    throw error.response?.data || error;
  }
};

export const getCurrentUser = async (): Promise<User> => {
  const accessToken = Cookies.get("access_token");
  if (!accessToken) throw new Error("No access token available");

  try {
    const response = await axiosInstance.get<ApiResponse<{ user: LoginUser }>>("/user/");

    if (response.data.success) {
      const user = response.data.data.user;
      return {
        id: user.id,
        email: user.email,
        name: user.email.split("@")[0],
        role: user.role,
        phoneNumber: "",
        imageUrl: null,
      };
    }
    throw new Error(response.data.message || "Failed to get current user");
  } catch (error: any) {
    console.error("Get current user error:", error);
    if (error.response?.status === 401) {
      Cookies.remove("access_token");
      Cookies.remove("refresh_token");
    }
    throw error.response?.data || error;
  }
};