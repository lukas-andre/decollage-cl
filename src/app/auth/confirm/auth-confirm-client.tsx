'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'

export default function AuthConfirmClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying')
  const [message, setMessage] = useState('Verificando tu enlace mágico...')

  const handlePostAuth = async (user: any, redirect?: string | null) => {
    // Check for pending action in localStorage
    const pendingAction = localStorage.getItem('pendingAuthAction')

    // Get the auth context from session storage
    const authContext = sessionStorage.getItem('authReturnContext')

    // If we're in a popup/modal context, notify the parent window
    if (window.opener) {
      window.opener.postMessage({
        type: 'AUTH_SUCCESS',
        user: user,
        pendingAction: pendingAction ? JSON.parse(pendingAction) : null,
        authContext: authContext ? JSON.parse(authContext) : null
      }, window.location.origin)

      // Clear pending action and session storage
      if (pendingAction) {
        localStorage.removeItem('pendingAuthAction')
      }
      sessionStorage.removeItem('authReturnUrl')
      sessionStorage.removeItem('authReturnContext')

      // Close the popup after a brief delay
      setTimeout(() => {
        window.close()
      }, 1500)
    } else {
      // Regular redirect flow
      setTimeout(() => {
        // Clear session storage
        sessionStorage.removeItem('authReturnUrl')
        sessionStorage.removeItem('authReturnContext')

        if (redirect) {
          // If redirect doesn't start with /, add it
          const finalRedirect = redirect.startsWith('/') ? redirect : `/${redirect}`
          // Use router.push for client-side navigation
          router.push(finalRedirect)
        } else {
          router.push('/dashboard')
        }
      }, 1500)
    }

    // Convert anonymous session if exists
    const sessionToken = localStorage.getItem('anonymousSession')
    if (sessionToken && user) {
      // Call API to convert anonymous reactions to user reactions
      await fetch('/api/auth/convert-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionToken,
          userId: user.id
        })
      })
      localStorage.removeItem('anonymousSession')
    }
  }

  useEffect(() => {
    const verifyToken = async () => {
      const supabase = createClient()

      // First, check if user is already authenticated (happens after clicking magic link)
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        // User is already authenticated - they just clicked the magic link
        setStatus('success')
        setMessage('¡Ya estás autenticado! Redirigiendo...')

        // Try to get redirect from multiple sources
        let redirect = searchParams.get('redirect_to') ||
                      searchParams.get('redirect') ||
                      sessionStorage.getItem('authReturnUrl')

        // If still no redirect, check user metadata
        if (!redirect && user.user_metadata?.redirect_path) {
          redirect = user.user_metadata.redirect_path
        }

        // Handle the post-auth flow
        await handlePostAuth(user, redirect)
        return
      }

      // Check for PKCE flow parameters
      const token = searchParams.get('token')
      const type = searchParams.get('type')

      // Check for magic link flow parameters
      const token_hash = searchParams.get('token_hash')

      // Try to get redirect from URL params first, then fall back to session storage
      let redirect = searchParams.get('redirect_to') || searchParams.get('redirect')

      // If no redirect in URL, check session storage (for when Supabase strips our redirect param)
      if (!redirect) {
        redirect = sessionStorage.getItem('authReturnUrl')
      }

      // Handle PKCE flow (the URL you're receiving)
      if (token && token.startsWith('pkce_')) {
        try {
          // For PKCE flow, we need to exchange the code
          const { data, error } = await supabase.auth.exchangeCodeForSession(
            window.location.href
          )

          if (error) throw error

          setStatus('success')
          setMessage('¡Verificación exitosa! Redirigiendo...')

          // Handle the rest of the flow
          handlePostAuth(data.user, redirect)
        } catch (error: any) {
          console.error('PKCE verification error:', error)
          setStatus('error')
          setMessage('Error al verificar el enlace. Por favor intenta de nuevo.')
        }
        return
      }

      // Handle standard magic link flow
      if (!token_hash && !type && !user) {
        setStatus('error')
        setMessage('Enlace inválido. Por favor solicita un nuevo enlace.')
        return
      }

      try {
        // Verify the OTP token
        if (!token_hash) {
          throw new Error('Token hash is missing')
        }

        const { data, error } = await supabase.auth.verifyOtp({
          token_hash,
          type: type as 'email'
        })

        if (error) throw error

        setStatus('success')
        setMessage('¡Verificación exitosa! Redirigiendo...')

        // Handle the rest of the flow
        await handlePostAuth(data.user, redirect)

      } catch (error: any) {
        console.error('Auth confirmation error:', error)
        setStatus('error')

        if (error.message?.includes('Token has expired')) {
          setMessage('El enlace ha expirado. Por favor solicita uno nuevo.')
        } else if (error.message?.includes('User already registered')) {
          setMessage('Este email ya está registrado. Por favor inicia sesión.')
        } else {
          setMessage('Error al verificar el enlace. Por favor intenta de nuevo.')
        }
      }
    }

    verifyToken()
  }, [searchParams, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F8F8F8] to-[#A3B1A1]/10">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center space-y-6">
          {/* Logo */}
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-[#A3B1A1] to-[#C4886F] rounded-full flex items-center justify-center">
            <span className="text-white font-cormorant text-2xl font-light">D</span>
          </div>

          {/* Status Icon */}
          <div className="flex justify-center">
            {status === 'verifying' && (
              <Loader2 className="h-12 w-12 animate-spin text-[#A3B1A1]" />
            )}
            {status === 'success' && (
              <CheckCircle className="h-12 w-12 text-green-500 animate-in zoom-in duration-300" />
            )}
            {status === 'error' && (
              <XCircle className="h-12 w-12 text-red-500 animate-in zoom-in duration-300" />
            )}
          </div>

          {/* Message */}
          <div className="space-y-2">
            <h1 className="text-2xl font-cormorant text-[#333333]">
              {status === 'verifying' && 'Verificando acceso'}
              {status === 'success' && '¡Bienvenida!'}
              {status === 'error' && 'Algo salió mal'}
            </h1>
            <p className="text-[#666666] font-lato">
              {message}
            </p>
          </div>

          {/* Error actions */}
          {status === 'error' && (
            <div className="pt-4 space-y-3">
              <button
                onClick={() => router.push('/auth/signin')}
                className="w-full px-4 py-3 bg-[#A3B1A1] text-white rounded-lg hover:bg-[#A3B1A1]/90 transition-colors font-lato"
              >
                Iniciar sesión
              </button>
              <button
                onClick={() => router.push('/')}
                className="w-full px-4 py-3 border border-gray-200 text-[#333333] rounded-lg hover:bg-gray-50 transition-colors font-lato"
              >
                Volver al inicio
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}