import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("access_token")?.value;
  const pathname = request.nextUrl.pathname;

  // Daftar path yang memerlukan autentikasi (protected paths)
  const protectedPaths = [
    "/dashboard",
    "/manajemen-toko",
    "/owner",
    "/aktivitas",
    "/pengaturan",
  ];

  // Daftar path untuk guest (hanya bisa diakses jika belum login)
  const guestPaths = ["/login", "/register", "/forgot-password"];

  // Cek apakah path saat ini adalah protected path
  const isProtectedPath = protectedPaths.some((path) =>
    pathname.startsWith(path)
  );

  // Cek apakah path saat ini adalah guest path
  const isGuestPath = guestPaths.some((path) => pathname.startsWith(path));

  // Jika pengguna belum login dan mencoba akses protected path
  if (isProtectedPath && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Jika pengguna sudah login dan mencoba akses guest path
  if (isGuestPath && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Lanjutkan request jika tidak ada aturan yang dilanggar
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Terapkan middleware pada protected paths
    "/dashboard/:path*",
    "/manajemen-toko/:path*",
    "/owner/:path*",
    "/aktivitas/:path*",
    "/pengaturan/:path*",
    // Terapkan middleware pada guest paths
    "/login",
    "/register",
    "/forgot-password",
    // Kecualikan asset statis dan API
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};