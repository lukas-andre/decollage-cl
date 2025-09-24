'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Mail, Lock, Sparkles } from 'lucide-react'

type AuthState = 'initial' | 'has_password' | 'magic_link' | 'loading'

export function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [authState, setAuthState] = useState<AuthState>('initial')
  const [magicLinkSent, setMagicLinkSent] = useState(false)

  const checkUserStatus = async (emailToCheck: string) => {
    if (!emailToCheck || !emailToCheck.includes('@')) return

    setAuthState('loading')
    setError(null)

    try {
      const res = await fetch('/api/auth/check-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailToCheck })
      })

      const data = await res.json()

      if (!data.exists) {
        // New user, suggest signup
        setAuthState('initial')
        setError('No encontramos una cuenta con este correo. ¿Quieres crear una?')
      } else if (data.hasPassword) {
        setAuthState('has_password')
      } else {
        setAuthState('magic_link')
      }
    } catch (error) {
      console.error('Error checking user status:', error)
      setAuthState('initial')
    }
  }

  const handleEmailBlur = () => {
    if (email && email.includes('@')) {
      checkUserStatus(email)
    }
  }

  const handlePasswordLogin = async () => {
    if (!password) {
      setError('Por favor ingresa tu contraseña')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message)
        return
      }

      // Update user metadata to ensure password_set flag is true
      if (data.user) {
        await supabase.auth.updateUser({
          data: {
            password_set: true,
            auth_method: 'password'
          }
        })
      }

      // Check if user has a profile
      const profileResponse = await fetch('/api/auth/profile')
      const profileData = await profileResponse.json()

      if (!profileData.exists) {
        // New user, create profile (default to B2C)
        await fetch('/api/auth/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userType: 'b2c' })
        })
      }

      router.refresh()
      router.push('/dashboard/projects')
    } catch {
      setError('Ha ocurrido un error inesperado')
    } finally {
      setIsLoading(false)
    }
  }

  const handleMagicLink = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        }
      })

      if (error) {
        setError(error.message)
        return
      }

      setMagicLinkSent(true)
    } catch {
      setError('Ha ocurrido un error inesperado')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (authState === 'has_password') {
      await handlePasswordLogin()
    } else if (authState === 'magic_link') {
      await handleMagicLink()
    } else {
      // Initial state - check user first
      await checkUserStatus(email)
    }
  }

  if (magicLinkSent) {
    return (
      <div className="space-y-6">
        <Alert className="border-[#A3B1A1]/30 bg-[#A3B1A1]/10">
          <Sparkles className="h-4 w-4" />
          <AlertDescription className="text-[#333333] font-lato">
            ¡Revisa tu correo! Te enviamos un enlace mágico para iniciar sesión a {email}
          </AlertDescription>
        </Alert>

        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setMagicLinkSent(false)
            setAuthState('initial')
            setEmail('')
          }}
          className="w-full border-[#A3B1A1]/20 hover:border-[#A3B1A1] text-[#333333] font-lato rounded-none transition-all duration-300"
        >
          Intentar con otro correo
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && !error.includes('crear una') && (
        <Alert variant="destructive" className="border-[#C4886F]/30 bg-[#C4886F]/10">
          <AlertDescription className="text-[#C4886F] font-lato">{error}</AlertDescription>
        </Alert>
      )}

      {error && error.includes('crear una') && (
        <Alert className="border-[#C4886F]/30 bg-[#C4886F]/10">
          <AlertDescription className="text-[#333333] font-lato">
            {error}{' '}
            <a href="/signup" className="text-[#A3B1A1] underline hover:no-underline">
              Crear cuenta gratis
            </a>
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="email" className="text-[#333333] font-lato font-medium">
          Correo Electrónico
        </Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A3B1A1]" />
          <Input
            id="email"
            type="email"
            placeholder="maria@email.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              setAuthState('initial')
              setError(null)
            }}
            onBlur={handleEmailBlur}
            className="pl-10 border-[#A3B1A1]/20 focus:border-[#A3B1A1] focus:ring-[#A3B1A1]/20 rounded-none font-lato transition-all duration-300"
            required
            disabled={isLoading}
          />
        </div>
      </div>

      {authState === 'has_password' && (
        <div className="space-y-2">
          <Label htmlFor="password" className="text-[#333333] font-lato font-medium">
            Contraseña
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A3B1A1]" />
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 border-[#A3B1A1]/20 focus:border-[#A3B1A1] focus:ring-[#A3B1A1]/20 rounded-none font-lato transition-all duration-300"
              required
              disabled={isLoading}
            />
          </div>
        </div>
      )}

      {authState === 'magic_link' && (
        <Alert className="border-[#A3B1A1]/30 bg-[#A3B1A1]/10">
          <Sparkles className="h-4 w-4" />
          <AlertDescription className="text-[#333333] font-lato">
            Tu cuenta usa Magic Link. Te enviaremos un enlace seguro para iniciar sesión.
          </AlertDescription>
        </Alert>
      )}

      <Button
        type="submit"
        className="w-full bg-[#A3B1A1] hover:bg-[#A3B1A1]/90 text-white font-lato rounded-none transition-all duration-500 transform hover:scale-[1.02] py-3"
        disabled={isLoading || authState === 'loading'}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {authState === 'magic_link' ? 'Enviando enlace...' : 'Iniciando sesión...'}
          </>
        ) : authState === 'loading' ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Verificando...
          </>
        ) : authState === 'magic_link' ? (
          <>
            <Sparkles className="mr-2 h-4 w-4" />
            Enviar Magic Link
          </>
        ) : authState === 'has_password' ? (
          'Iniciar Sesión'
        ) : (
          'Continuar'
        )}
      </Button>

      {authState === 'has_password' && (
        <div className="text-center">
          <button
            type="button"
            onClick={() => setAuthState('magic_link')}
            className="text-sm text-[#A3B1A1] hover:text-[#333333] transition-colors duration-300 font-lato"
          >
            Prefiero usar Magic Link
          </button>
        </div>
      )}

      {authState === 'magic_link' && (
        <div className="text-center">
          <button
            type="button"
            onClick={() => setAuthState('has_password')}
            className="text-sm text-[#A3B1A1] hover:text-[#333333] transition-colors duration-300 font-lato"
          >
            Usar contraseña en su lugar
          </button>
        </div>
      )}
    </form>
  )
}