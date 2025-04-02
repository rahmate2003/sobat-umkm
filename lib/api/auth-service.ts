//lib/api/auth-service.ts
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
  expires: string;
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

      // Add console logs here to see the tokens
      console.log("Access Token:", access.token);
      console.log("Access Token Expires:", new Date(access.expires).toLocaleString());
      console.log("Refresh Token:", refresh.token);
      console.log("Refresh Token Expires:", new Date(refresh.expires).toLocaleString());

//  const accessExpires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
//       const refreshExpires = new Date(refresh.expires);

//       Cookies.set("access_token", access.token, {
//         expires: accessExpires,
//       });
      // Set cookies with proper expiration from server
      Cookies.set("access_token", access.token, {
        expires: new Date(access.expires),
        path: "/",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });

      Cookies.set("refresh_token", refresh.token, {
        expires: new Date(refresh.expires),
        path: "/",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
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
    }
    throw new Error(response.data.message || "Login failed");
  } catch (error: any) {
    console.error("Login error:", error);
    clearAuthCookies();
    throw new Error(error?.response?.data?.message || "Login failed");
  }
};

export const logout = async (): Promise<void> => {
  try {
    await axiosInstance.post("/auth/logout");
  } catch (error) {
    console.error("Logout error:", error);
  } finally {
    clearAuthCookies();
  }
};

export const refreshToken = async (): Promise<string> => {
  const refreshTokenValue = Cookies.get("refresh_token");
  if (!refreshTokenValue) {
    throw new Error("NO_REFRESH_TOKEN");
  }

  try {
    const response = await axiosInstance.post<ApiResponse<RefreshTokenResponseData>>(
      "/auth/refresh-token",
      { refreshToken: refreshTokenValue },
      {
        headers: {
          "X-No-Retry": "true",
        },
      }
    );

    if (response.data.success) {
      const { access, refresh } = response.data.data.token;
      const now = new Date();

      if (new Date(refresh.expires) < now) {
        throw new Error("REFRESH_TOKEN_EXPIRED");
      }

      const cookieOptions = {
        expires: new Date(access.expires),
        path: "/",
        sameSite: "lax" as const,
        secure: process.env.NODE_ENV === "production",
      };

      Cookies.set("access_token", access.token, cookieOptions);
      Cookies.set("refresh_token", refresh.token, {
        ...cookieOptions,
        expires: new Date(refresh.expires),
      });

      return access.token;
    }
    throw new Error(response.data.message || "Token refresh failed");
  } catch (error: any) {
    console.error("Refresh token error:", error);
    clearAuthCookies();
    throw error;
  }
};

export const getCurrentUser = async (): Promise<User> => {
  const accessToken = Cookies.get("access_token");
  if (!accessToken) {
    throw new Error("NO_ACCESS_TOKEN");
  }

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
      clearAuthCookies();
    }
    throw error;
  }
};

const clearAuthCookies = () => {
  Cookies.remove("access_token", { path: "/" });
  Cookies.remove("refresh_token", { path: "/" });
};