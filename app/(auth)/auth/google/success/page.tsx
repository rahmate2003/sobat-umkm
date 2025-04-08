"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuthStore } from "@/lib/store/auth-store"
import Cookies from "js-cookie"
import { LoadingScreen } from "@/components/loading-screen"

export default function GoogleAuthSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setUser, setAuthenticated } = useAuthStore()

  useEffect(() => {
    const handleGoogleAuthSuccess = async () => {
      try {
        // Get tokens and user data from URL params
        const accessToken = searchParams.get("token")
        const refreshToken = searchParams.get("refreshToken")
        const userJson = searchParams.get("user")

        console.log("Auth Success - Tokens received:", { accessToken, refreshToken })

        if (!accessToken || !refreshToken || !userJson) {
          console.error("Missing required auth data", { accessToken, refreshToken, userJson })
          router.replace("/login?error=auth_failed")
          return
        }

        // Parse user data
        const userData = JSON.parse(userJson)
        console.log("User data parsed:", userData)

        // Set cookies with explicit expiration times
        const now = new Date()
        // Access token expires in 30 minutes from now
        const accessExpires = new Date(now.getTime() + 30 * 60 * 1000)
        // Refresh token expires in 30 days from now
        const refreshExpires = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

        console.log("Setting cookies with expiration:", {
          accessExpires: accessExpires.toISOString(),
          refreshExpires: refreshExpires.toISOString(),
        })

        // Set access token with 30 minute expiration
        Cookies.set("access_token", accessToken, {
          expires: accessExpires,
          path: "/",
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
        })

        // Set refresh token with 30 day expiration
        Cookies.set("refresh_token", refreshToken, {
          expires: refreshExpires,
          path: "/",
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
        })

        // Verify cookies were set
        const accessTokenCookie = Cookies.get("access_token")
        const refreshTokenCookie = Cookies.get("refresh_token")

        console.log("Cookies after setting:", {
          accessTokenCookie: !!accessTokenCookie,
          refreshTokenCookie: !!refreshTokenCookie,
        })

        // Map the user data to match your application's user structure
        const user = {
          id: userData.id,
          email: userData.email,
          name: userData.name || userData.email.split("@")[0],
          role: userData.role,
          phoneNumber: "",
          imageUrl: null,
        }

        // Update auth state
        console.log("Updating auth state with user:", user)
        setUser(user)
        setAuthenticated(true)

        // Add a small delay to ensure state is updated before redirect
        setTimeout(() => {
          console.log("Redirecting to dashboard...")
          router.replace("/dashboard")
        }, 100)
      } catch (error) {
        console.error("Error processing Google auth success:", error)
        router.replace(`/login?error=${encodeURIComponent("Failed to process authentication")}`)
      }
    }

    handleGoogleAuthSuccess()
  }, [searchParams, router, setUser, setAuthenticated])

  return <LoadingScreen />
}
