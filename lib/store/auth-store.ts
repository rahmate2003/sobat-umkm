//lib/store/auth-store.ts
import { create } from "zustand"
import { persist } from "zustand/middleware"
import Cookies from "js-cookie"
import type { User } from "@/lib/api/user-service"

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  setUser: (user: User | null) => void
  setAuthenticated: (isAuthenticated: boolean) => void
  setLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: typeof window !== "undefined" ? !!Cookies.get("access_token") : false,
      isLoading: false,
      error: null,
      setUser: (user) => set({ user }),
      setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      logout: () => {
        Cookies.remove("access_token")
        Cookies.remove("refresh_token")
        set({ user: null, isAuthenticated: false })
      },
    }),
    {
         name: "auth-storage",
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      }),
    },
  ),
)

