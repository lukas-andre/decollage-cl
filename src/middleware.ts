import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

// Define route types
const PUBLIC_ROUTES = [
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/auth/callback',
  '/auth/confirm',
  '/auth-code-error',
  '/',
  '/pricing',
  '/share', // Add share pages as public routes
]

const AUTH_ROUTES = ['/login', '/signup', '/forgot-password', '/reset-password']

const PROTECTED_ROUTES = [
  '/dashboard',
  '/generate',
  '/gallery',
  '/settings',
  '/profile',
]

const ADMIN_ROUTES = [
  '/admin',
  '/admin/users',
  '/admin/analytics',
  '/admin/content',
  '/admin/settings',
]

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Create Supabase client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Skip auth checks if environment variables are not available
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.next()
  }

  // Create response first for cookie handling
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        )
        supabaseResponse = NextResponse.next({
          request,
        })
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        )
      },
    },
  })

  // IMPORTANT: Refresh the user session - this validates the JWT
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Check if route is public
  const isPublicRoute = PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route)
  )

  // Check if route is an auth route (login, signup, etc)
  const isAuthRoute = AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route)
  )

  // Check if route is protected
  const isProtectedRoute = PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route)
  )

  // Check if route is admin
  const isAdminRoute = ADMIN_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route)
  )

  // If user is not authenticated
  if (!user) {
    // Allow public routes
    if (isPublicRoute) {
      return supabaseResponse
    }

    // Redirect to login for protected routes
    if (isProtectedRoute || isAdminRoute) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('redirectTo', pathname)
      return NextResponse.redirect(url)
    }

    return supabaseResponse
  }

  // Get user profile for role checking
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // If user is authenticated but on auth route, redirect to appropriate dashboard
  if (isAuthRoute) {
    const url = request.nextUrl.clone()

    if (profile && 'role' in profile && profile.role === 'admin') {
      url.pathname = '/admin'
    } else {
      url.pathname = '/dashboard'
    }

    return NextResponse.redirect(url)
  }

  // Check admin routes
  if (isAdminRoute) {
    if (!profile || !('role' in profile) || profile.role !== 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }
  }

  // Add user info to headers for server components
  if (user && profile && 'role' in profile) {
    supabaseResponse.headers.set('x-user-id', user.id)
    supabaseResponse.headers.set('x-user-email', user.email || '')
    supabaseResponse.headers.set('x-user-role', profile.role || 'user')
    supabaseResponse.headers.set(
      'x-user-tokens',
      'tokens_available' in profile ? profile.tokens_available?.toString() || '0' : '0'
    )
  }

  // IMPORTANT: Return the supabaseResponse to maintain cookie state
  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - share (public share pages)
     * - api/share (share API routes)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|share|api/share|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}