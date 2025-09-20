import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, source, returnUrl, action } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email es requerido' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Formato de email inválido' },
        { status: 400 }
      )
    }

    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          },
        },
      }
    )

    // Create redirect URL with action context
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || `${request.nextUrl.protocol}//${request.nextUrl.host}`
    const redirectTo = new URL('/auth/callback', baseUrl)

    if (returnUrl) {
      redirectTo.searchParams.set('next', returnUrl)
    }

    if (action) {
      redirectTo.searchParams.set('action', action)
    }

    // Send magic link via Supabase
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: redirectTo.toString(),
        data: {
          source: source || 'quick_auth_modal',
          action: action || 'login',
          timestamp: new Date().toISOString(),
          return_url: returnUrl,
        }
      }
    })

    if (error) {
      console.error('Magic link send error:', error)

      // Provide user-friendly error messages
      let userMessage = 'Error al enviar el código'

      if (error.message.includes('rate limit')) {
        userMessage = 'Demasiados intentos. Intenta nuevamente en unos minutos'
      } else if (error.message.includes('invalid email')) {
        userMessage = 'Email inválido'
      } else if (error.message.includes('Email not confirmed')) {
        userMessage = 'Confirma tu email primero'
      }

      return NextResponse.json(
        { error: userMessage },
        { status: 400 }
      )
    }

    // Log successful magic link request for analytics
    console.log(`Magic link sent to ${email}`, {
      source,
      action,
      timestamp: new Date().toISOString()
    })

    return NextResponse.json({
      success: true,
      message: 'Código enviado exitosamente',
      email: email
    })

  } catch (error) {
    console.error('Send magic link error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}