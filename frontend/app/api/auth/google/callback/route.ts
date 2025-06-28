// src/app/api/auth/google/callback/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // Get the code from the URL parameters
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  
  if (!code) {
    // Redirect to signin page if no code is provided
    return NextResponse.redirect(new URL('/signin?error=No authentication code received', request.url))
  }
  
  try {
    // Exchange the code for tokens
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/google/callback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code }),
    })
    
    if (!response.ok) {
      throw new Error('Failed to exchange code for tokens')
    }
    
    const data = await response.json()
    
    // Set the token in a cookie
    const redirectUrl = new URL('/api/auth/success', request.url)
    
    if (data.token) {
      // Add token to the URL as a parameter (will be extracted and stored in localStorage)
      redirectUrl.searchParams.set('token', data.token)
      
      if (data.user) {
        // Ensure user data is properly stringified
        const userData = typeof data.user === 'string' ? data.user : JSON.stringify(data.user)
        redirectUrl.searchParams.set('user', userData)
      }
    } else {
      redirectUrl.searchParams.set('error', data.message || 'Authentication failed')
    }
    
    return NextResponse.redirect(redirectUrl)
  } catch (error) {
    console.error('OAuth callback error:', error)
    return NextResponse.redirect(
      new URL(`/signin?error=${encodeURIComponent(error instanceof Error ? error.message : 'Authentication failed')}`, request.url)
    )
  }
}