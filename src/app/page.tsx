"use client"

import { useEffect } from "react"

export default function RedirectPage() {
  useEffect(() => {
    window.location.href = "/login" // Redirect to /login
  }, [])

  return (
    <div className="flex flex-col items-center justify-center min-h-[200px]">
      <div className="w-12 h-12 border-4 border-gray-300 border-t-primary rounded-full animate-spin"></div>
      <p className="mt-4 text-sm text-muted-foreground">Redirecting...</p>
    </div>
  )
}

