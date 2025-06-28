// src/app/auth/success/page.tsx
"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth-context"

function AuthSuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [message, setMessage] = useState("Completing authentication...")
  const { login, user, isLoading } = useAuth()
  const [hasLoggedIn, setHasLoggedIn] = useState(false)

  useEffect(() => {
    const token = searchParams.get('token')
    const error = searchParams.get('error')
    // const user = searchParams.get('user') // not needed, context will fetch
    
    if (error) {
      setMessage(`Authentication failed: ${error}`)
      toast({
        title: "Authentication Failed",
        description: error,
        variant: "destructive"
      })
      setTimeout(() => router.push('/signin'), 2000)
      return
    }
    
    if (!token) {
      setMessage("Authentication failed: No token received")
      toast({
        title: "Authentication Failed",
        description: "No authentication token received",
        variant: "destructive"
      })
      setTimeout(() => router.push('/signin'), 2000)
      return
    }

    // Only call login once
    if (!hasLoggedIn) {
      setHasLoggedIn(true)
      login(token)
        .then(() => {
          setMessage("Authentication successful! Redirecting to dashboard...")
          toast({
            title: "Authentication Successful",
            description: "You have been logged in successfully. Redirecting to dashboard...",
          })
        })
        .catch(() => {
          setMessage("Authentication failed: Could not complete login")
          toast({
            title: "Authentication Failed",
            description: "Could not complete login",
            variant: "destructive"
          })
          setTimeout(() => router.push('/signin'), 2000)
        })
    }
  }, [searchParams, router, login, hasLoggedIn])

  // Redirect to dashboard only after user is set and not loading
  useEffect(() => {
    if (user && !isLoading) {
      router.push('/dashboard')
    }
  }, [user, isLoading, router])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin" />
        <p className="mt-4">{message}</p>
      </div>
    </div>
  )
}

export default function AuthSuccessPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin" />
          <p className="mt-4">Loading...</p>
        </div>
      </div>
    }>
      <AuthSuccessContent />
    </Suspense>
  )
}