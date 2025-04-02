"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { refreshToken } from "@/lib/api/auth-service";
import { LoadingScreen } from "@/components/loading-screen";

export const AuthChecker = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAndRefreshToken = async () => {
      const accessToken = Cookies.get("access_token");
      const refreshTokenValue = Cookies.get("refresh_token");

      // Skip untuk guest paths (middleware sudah menangani redirect)
      if (
        pathname.startsWith("/login") ||
        pathname.startsWith("/register") ||
        pathname.startsWith("/forgot-password")
      ) {
        setIsLoading(false);
        return;
      }

      // Jika tidak ada token sama sekali, redirect ke login
      if (!accessToken && !refreshTokenValue) {
        router.replace("/login");
        return;
      }

      // Jika access token expired tapi refresh token ada
      if (refreshTokenValue && (!accessToken || isTokenExpired(accessToken))) {
        try {
          await refreshToken();
        } catch (error) {
          console.error("Refresh failed:", error);
          router.replace("/login?reason=session_expired");
          return;
        }
      }
      setIsLoading(false);
    };

    checkAndRefreshToken();
  }, [router, pathname]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
};

function isTokenExpired(token: string) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}