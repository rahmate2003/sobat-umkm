//lib/hooks/use-auth.ts

"use client"

import { useCallback, useEffect } from "react"
import { useMutation, useQuery, useQueryClient } from "react-query"
import { useRouter } from "next/navigation"
import { login as loginApi, logout as logoutApi, getCurrentUser } from "@/lib/api/auth-service"
import { useAuthStore } from "@/lib/store/auth-store"
import type { User } from "@/lib/api/user-service"
import Cookies from "js-cookie"

export function useAuth() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const {
    isAuthenticated,
    isLoading,
    error,
    setUser,
    setAuthenticated,
    setLoading,
    setError,
    logout: logoutStore,
  } = useAuthStore()
  const { data: user, refetch: refetchUser } = useQuery<User>("currentUser", getCurrentUser, {
    enabled: isAuthenticated,
    onSuccess: (data) => {
      setUser(data)
      setAuthenticated(true)
    },
    onError: (error: any) => {
      console.error("Failed to fetch current user:", error)

      // Clear tokens and reset state
      Cookies.remove("access_token", { path: "/" })
      Cookies.remove("refresh_token", { path: "/" })
      setUser(null)
      setAuthenticated(false)
      logoutStore()

      // Check for specific error message for expired tokens
      const isSessionExpired =
        error.message === "REFRESH_TOKEN_EXPIRED" || error?.response?.data?.message === "Expired or Invalid Token"

      // Redirect to login with appropriate message
      if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
        if (isSessionExpired) {
          router.replace("/login?reason=session_expired")
        } else {
          router.replace("/login")
        }
      }
    },
    retry: 1,
    staleTime: 5 * 60 * 1000,
  })

  // Effect untuk cek token saat mount
  useEffect(() => {
    const checkAuth = () => {
      const accessToken = Cookies.get("access_token")
      const refreshToken = Cookies.get("refresh_token")

      if (!accessToken || !refreshToken) {
        logoutStore()
        if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
          router.replace("/login")
        }
      } else {
        setAuthenticated(true)
      }
    }

    checkAuth()
  }, [logoutStore, router])
  const loginMutation = useMutation(loginApi, {
    onMutate: () => {
      setLoading(true)
      setError(null)
    },
    onSuccess: async (data) => {
      setUser(data.user)
      setAuthenticated(true)
      queryClient.invalidateQueries("userProfile")
      router.replace("/dashboard")
    },
    onError: (error: any) => {
      setError(error?.message || "Login gagal. Silakan coba lagi.")
      setAuthenticated(false)
    },
    onSettled: () => {
      setLoading(false)
    },
  })

  const logoutMutation = useMutation(logoutApi, {
    onMutate: () => setLoading(true),
    onSuccess: () => {
      logoutStore()
      queryClient.invalidateQueries("userProfile")
      queryClient.invalidateQueries("currentUser")
      router.replace("/login")
    },
    onError: () => {
      logoutStore()
      queryClient.invalidateQueries("userProfile")
      queryClient.invalidateQueries("currentUser")
      router.replace("/login")
    },
    onSettled: () => setLoading(false),
  })

  const login = useCallback(
    (email: string, password: string) => loginMutation.mutate({ email, password }),
    [loginMutation],
  )

  const logout = useCallback(() => logoutMutation.mutate(), [logoutMutation])

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    refetchUser,
  }
}

