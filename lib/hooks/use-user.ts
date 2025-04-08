//lib/hooks/use-user.ts
"use client"

import { useQuery } from "react-query"
import { getUserProfile, type User } from "@/lib/api/user-service"

export function useUser() {
  const {
    data: user,
    isLoading,
    error,
    refetch,
  } = useQuery<User>("userProfile", getUserProfile, {
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    onError: (error) => {
      console.error("Error fetching user profile:", error)
    },
  })

  return {
    user,
    isLoading,
    error,
    refetch,
  }
}
