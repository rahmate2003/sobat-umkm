"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"

export default function GoogleAuthFailurePage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const error = searchParams.get("error") || "Authentication failed"
    router.replace(`/login?error=${encodeURIComponent(error)}`)
  }, [router, searchParams])

  return null
}
