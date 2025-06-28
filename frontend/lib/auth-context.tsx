// src/lib/auth-context.tsx
"use client"

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { authApi } from './auth'

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  subscription?: {
    plan: 'BASIC' | 'ADVANCED' | 'ENTERPRISE' | null
  }
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (token: string) => Promise<void>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const login = async (token: string) => {
    console.log('Auth Context: Login called with token', token ? 'Token exists' : 'No token')
    if (!token) {
      console.error('Auth Context: No token provided for login')
      return
    }
    
    localStorage.setItem('token', token)
    await checkAuth() // Wait for checkAuth to complete
    
    // After successful login and user state update, redirect to dashboard
    if (user) {
      router.push('/dashboard')
    }
  }

  const logout = async () => {
    console.log('Auth Context: Logout called')
    const token = localStorage.getItem('token')
    if (token) {
      try {
        console.log('Auth Context: Calling logout API')
        await authApi.logout(token)
      } catch (error) {
        console.error('Auth Context: Logout API error:', error)
      }
    }
    console.log('Auth Context: Clearing local storage and user state')
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    router.push('/signin')
  }

  const checkAuth = async () => {
    console.log('Auth Context: checkAuth called')
    const token = localStorage.getItem('token')
    console.log('Auth Context: Token from localStorage:', token ? 'Token exists' : 'No token')

    if (!token) {
      console.log('Auth Context: No token found, setting user to null')
      setUser(null)
      setIsLoading(false)
      return
    }

    try {
      console.log('Auth Context: Fetching user profile')
      const response = await authApi.getUserProfile(token)
      console.log('Auth Context: User profile response:', response)

      if (response.user) {
        console.log('Auth Context: Setting user state:', response.user)
        setUser(response.user)
        // Store updated user data in localStorage
        localStorage.setItem('user', JSON.stringify(response.user))
      } else {
        console.log('Auth Context: No user in response, clearing token and user state')
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setUser(null)
        router.push('/signin')
      }
    } catch (error) {
      console.error('Auth Context: Error fetching user profile:', error)
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      setUser(null)
      router.push('/signin')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    console.log('Auth Context: Initial checkAuth on mount')
    checkAuth()
  }, [])

  // Add effect to log state changes
  useEffect(() => {
    console.log('Auth Context: User state changed:', user)
  }, [user])

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}