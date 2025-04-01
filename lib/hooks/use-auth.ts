"use client"

import { useCallback } from "react"
import { useMutation, useQuery, useQueryClient } from "react-query"
import { useRouter } from "next/navigation"
import { login as loginApi, logout as logoutApi, getCurrentUser } from "@/lib/api/auth-service"
import { useAuthStore } from "@/lib/store/auth-store"
import type { User } from "@/lib/api/user-service"

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

  // Query untuk mendapatkan user saat ini
  const { data: user, refetch: refetchUser } = useQuery<User>("currentUser", getCurrentUser, {
    enabled: isAuthenticated,
    onSuccess: (data) => {
      setUser(data)
    },
    onError: () => {
      setUser(null)
      setAuthenticated(false)
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Mutation untuk login
  const loginMutation = useMutation(loginApi, {
    onMutate: () => {
      setLoading(true)
      setError(null)
    },
    onSuccess: async (data) => {
      setUser(data.user)
      setAuthenticated(true)

      // Invalidate user profile query to ensure fresh data
      queryClient.invalidateQueries("userProfile")

      router.push("/dashboard")
    },
    onError: (error: any) => {
      setError(error?.message || "Login gagal. Silakan coba lagi.")
      setAuthenticated(false)
    },
    onSettled: () => {
      setLoading(false)
    },
  })

  // Mutation untuk logout
  const logoutMutation = useMutation(logoutApi, {
    onMutate: () => {
      setLoading(true)
    },
    onSuccess: () => {
      logoutStore()
      // Invalidate queries
      queryClient.invalidateQueries("userProfile")
      queryClient.invalidateQueries("currentUser")

      router.push("/login")
    },
    onError: () => {
      // Bahkan jika API logout gagal, kita tetap logout di client
      logoutStore()
      // Invalidate queries
      queryClient.invalidateQueries("userProfile")
      queryClient.invalidateQueries("currentUser")

      router.push("/login")
    },
    onSettled: () => {
      setLoading(false)
    },
  })

  // Fungsi untuk login
  const login = useCallback(
    (email: string, password: string) => {
      loginMutation.mutate({ email, password })
    },
    [loginMutation],
  )

  // Fungsi untuk logout
  const logout = useCallback(() => {
    logoutMutation.mutate()
  }, [logoutMutation])

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

