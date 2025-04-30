"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import Cookies from "js-cookie"
import { refreshToken } from "@/lib/api/auth-service"
import { LoadingScreen } from "@/components/loading-screen"
export const AuthChecker = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter()
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAndRefreshToken = async () => {
      const accessToken = Cookies.get("access_token")
      const refreshTokenValue = Cookies.get("refresh_token")

      console.log("AuthChecker - Checking tokens:", {
        hasAccessToken: !!accessToken,
        hasRefreshToken: !!refreshTokenValue,
        currentPath: pathname,
      })

      // Skip for guest paths
      if (
        pathname.startsWith("/login") ||
        pathname.startsWith("/register") ||
        pathname.startsWith("/forgot-password") ||
        pathname.startsWith("/auth/google") // Add this to prevent redirect during OAuth flow
      ) {
        setIsLoading(false)
        return
      }

      // No tokens at all - redirect to login
      if (!refreshTokenValue) {
        console.log("AuthChecker - No refresh token, redirecting to login")
        router.replace("/login")
        return
      }

      // If we have a refresh token but no access token or it's expired, try to refresh
      if (!accessToken) {
        try {
          console.log("AuthChecker - No access token but refresh token exists, attempting refresh")
          await refreshToken()
          console.log("AuthChecker - Token refresh successful")
          setIsLoading(false)
        } catch (error: any) {
          console.error("AuthChecker - Refresh failed:", error)

          // Handle specific error cases
          if (error.message === "REFRESH_TOKEN_EXPIRED" || error.message === "REFRESH_TOKEN_INVALID") {
            router.replace("/login?reason=session_expired")
          } else {
            router.replace("/login?reason=session_expired")
          }
          return
        }
      } else if (isTokenExpired(accessToken)) {
        try {
          console.log("AuthChecker - Access token expired, attempting refresh")
          await refreshToken()
          console.log("AuthChecker - Token refresh successful")
          setIsLoading(false)
        } catch (error: any) {
          console.error("AuthChecker - Refresh failed:", error)
          router.replace("/login?reason=session_expired")
          return
        }
      } else {
        console.log("AuthChecker - Valid tokens found")
        setIsLoading(false)
      }
    }

    checkAndRefreshToken()
  }, [router, pathname])

  if (isLoading) {
    return <LoadingScreen />
  }

  return <>{children}</>
}

// Improved token expiration check with better error handling
function isTokenExpired(token: string): boolean {
  try {
    const base64Url = token.split(".")[1]
    if (!base64Url) return true

    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    )

    const payload = JSON.parse(jsonPayload)
    return payload.exp * 1000 < Date.now()
  } catch (error) {
    console.error("Error parsing token:", error)
    return true // If we can't parse the token, consider it expired
  }
}
