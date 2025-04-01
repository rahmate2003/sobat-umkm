import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Mendapatkan token dari cookies
  const token = request.cookies.get("access_token")?.value

  // Mendapatkan path saat ini
  const path = request.nextUrl.pathname

  // Daftar path yang memerlukan autentikasi
  const protectedPaths = ["/dashboard", "/manajemen-toko", "/owner", "/aktivitas", "/pengaturan"]

  // Daftar path untuk guest (belum login)
  const guestPaths = ["/login", "/register", "/forgot-password"]

  // Cek apakah path saat ini memerlukan autentikasi
  const isProtectedPath = protectedPaths.some(
    (protectedPath) => path === protectedPath || path.startsWith(`${protectedPath}/`),
  )

  // Cek apakah path saat ini untuk guest
  const isGuestPath = guestPaths.some((guestPath) => path === guestPath || path.startsWith(`${guestPath}/`))

  // Jika path memerlukan autentikasi dan tidak ada token
  if (isProtectedPath && !token) {
    // Redirect ke halaman login
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Jika path untuk guest dan ada token
  if (isGuestPath && token) {
    // Redirect ke dashboard
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // Lanjutkan request
  return NextResponse.next()
}

// Konfigurasi middleware
export const config = {
  matcher: [
    // Paths yang akan diproses oleh middleware
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}

