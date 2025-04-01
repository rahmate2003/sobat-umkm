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

  const { data: user, refetch: refetchUser } = useQuery<User>(
    "currentUser",
    getCurrentUser,
    {
      enabled: isAuthenticated && !!Cookies.get("access_token"),
      onSuccess: (data) => setUser(data),
      onError: () => {
        setUser(null);
        setAuthenticated(false);
        logoutStore();
        if (typeof window !== "undefined" && window.location.pathname !== "/login") {
          router.replace("/login");
        }
      },
      staleTime: 5 * 60 * 1000,
    }
  )

  // Pengecekan token saat komponen mount atau isAuthenticated berubah
  useEffect(() => {
    const accessToken = Cookies.get("access_token");
    const refreshToken = Cookies.get("refresh_token");

    if (isAuthenticated && (!accessToken || !refreshToken)) {
      logoutStore();
      router.replace("/login");
    }
  }, [isAuthenticated, logoutStore, router]);

  const loginMutation = useMutation(loginApi, {
    onMutate: () => {
      setLoading(true);
      setError(null);
    },
    onSuccess: async (data) => {
      setUser(data.user);
      setAuthenticated(true);
      queryClient.invalidateQueries("userProfile");
      router.replace("/dashboard");
    },
    onError: (error: any) => {
      setError(error?.message || "Login gagal. Silakan coba lagi.");
      setAuthenticated(false);
    },
    onSettled: () => {
      setLoading(false);
    },
  });

  const logoutMutation = useMutation(logoutApi, {
    onMutate: () => setLoading(true),
    onSuccess: () => {
      logoutStore();
      queryClient.invalidateQueries("userProfile");
      queryClient.invalidateQueries("currentUser");
      router.replace("/login");
    },
    onError: () => {
      logoutStore();
      queryClient.invalidateQueries("userProfile");
      queryClient.invalidateQueries("currentUser");
      router.replace("/login");
    },
    onSettled: () => setLoading(false),
  });

  const login = useCallback(
    (email: string, password: string) => loginMutation.mutate({ email, password }),
    [loginMutation]
  );

  const logout = useCallback(() => logoutMutation.mutate(), [logoutMutation]);

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    refetchUser,
  };
}