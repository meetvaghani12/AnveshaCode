// src/app/auth/success/page.tsx
"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

function AuthSuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [message, setMessage] = useState("Completing authentication...")

  useEffect(() => {
    const token = searchParams.get('token')
    const error = searchParams.get('error')
    const user = searchParams.get('user')
    
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
    
    // Store the token in localStorage
    localStorage.setItem('token', token)
    
    // Store user data if available
    if (user) {
      try {
        const userData = JSON.parse(user)
        localStorage.setItem('user', user)
      } catch (e) {
        console.error('Failed to parse user data:', e)
      }
    }
    
    setMessage("Authentication successful! Redirecting to dashboard...")
    toast({
      title: "Authentication Successful",
      description: "You have been logged in successfully. Redirecting to dashboard...",
    })
    
    // Redirect to dashboard instead of home page
    setTimeout(() => router.push('/dashboard'), 1000)
  }, [searchParams, router])

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