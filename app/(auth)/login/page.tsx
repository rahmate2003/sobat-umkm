"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/lib/hooks/use-auth"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { GoogleAuthButton } from "@/components/google-auth-button"
import { useSearchParams } from "next/navigation"

export default function LoginPage() {
  const { login, isLoading, error } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [sessionExpired, setSessionExpired] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const searchParams = useSearchParams()

  // Check for session_expired parameter in URL
  useEffect(() => {
    const reason = searchParams.get("reason")
    const error = searchParams.get("error")

    if (reason === "session_expired") {
      setSessionExpired(true)
    }

    if (error) {
      setAuthError(decodeURIComponent(error))
    }
  }, [searchParams])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    login(formData.email, formData.password)
  }

  return (
    <div className="flex h-screen">
      {/* Left side - Illustration */}
      <div className="hidden md:flex md:w-1/2 bg-white p-8 flex-col justify-center items-center">
        <div className="max-w-md">
          <div className="mb-8">
            <Image src="/sidebar-logo.png" alt="Login Illustration" width={1000} height={1000} className="mx-auto" />
          </div>
          <h2 className="text-2xl font-bold">
            Welcome <span className="text-primary">Admin NukaPos</span>,
          </h2>
          <p className="text-gray-600">Please Login First!!</p>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="w-full md:w-1/2 bg-primary flex justify-center items-center p-4">
        <div className="bg-white rounded-lg p-8 w-full max-w-md">
          <div className="flex flex-col items-center mb-6">
            <Image src="/logo.png" alt="Sobat UMKM Logo" width={120} height={120} />
            {/* <h1 className="text-2xl font-bold text-primary mt-4">SoBAT UMKM</h1> */}
          </div>

          <h2 className="text-2xl font-bold text-center mb-2">Masuk</h2>
          <p className="text-center text-primary mb-6">Masukkan Email dan Kata sandi !!</p>

          {sessionExpired && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>Sesi Anda telah berakhir. Silakan login kembali.</AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {authError && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{authError}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1">
                  Email*
                </label>
                <Input
                  id="email"
                  name="email"
                  placeholder="Masukkan Email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isLoading}
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-1">
                  Kata sandi*
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Masukkan Kata Sandi"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={isLoading}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                <div className="flex justify-end mt-1">
                  <Link href="/forgot-password" className="text-sm text-gray-500 hover:text-primary">
                    Lupa Kata Sandi
                  </Link>
                </div>
              </div>

              <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isLoading}>
                {isLoading ? "Memproses..." : "Masuk"}
              </Button>

              <div className="relative flex items-center justify-center mt-4">
                <div className="border-t border-gray-300 flex-grow"></div>
                <span className="mx-4 text-sm text-gray-500">Atau</span>
                <div className="border-t border-gray-300 flex-grow"></div>
              </div>

              <GoogleAuthButton className="w-full" disabled={isLoading} />

              <p className="text-center text-sm mt-4">
                Belum punya akun?{" "}
                <Link href="/register" className="text-primary font-medium">
                  Daftar
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
