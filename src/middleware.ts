import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Define paths that are considered public (accessible without a token)
  const isPublicPath = path === '/account/sign-in' || path === '/account/sign-up' || path === '/account/verifyemail'

  // Get the token from the cookies
  const token = request.cookies.get('token')?.value || ''

  // Redirect logic based on the path and token presence
  if(isPublicPath && token) {

  // If trying to access a public path with a token, redirect to the home page
    return NextResponse.redirect(new URL('/app', request.nextUrl))
  }

  // If trying to access a secure path without a token, redirect to the login page
  if (!isPublicPath && !token) {
    return NextResponse.redirect(new URL('/account/sign-in', request.nextUrl))
  }
}

// It specifies the paths for which this middleware should be executed. 
// In this case, it's applied to '/app', '/sign-in', and '/sign-up'.
export const config = {
  matcher: [
    '/app',
    '/account/sign-in',
    '/account/sign-up',
    '/account/verifyemail'
  ]
}