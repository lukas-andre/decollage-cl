'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Mail, ArrowRight, CheckCircle2, Heart } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MagicLinkFormProps {
  onSuccess?: () => void
  onError?: (error: string) => void
  placeholder?: string
  ctaText?: string
  description?: string
}

type FormStep = 'email' | 'code' | 'success'

export function MagicLinkForm({
  onSuccess,
  onError,
  placeholder = "tu@email.com",
  ctaText = "Continuar",
  description = "Te enviaremos un código para acceder sin contraseña"
}: MagicLinkFormProps) {
  const [step, setStep] = useState<FormStep>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resendCooldown, setResendCooldown] = useState(0)
  const codeInputRef = useRef<HTMLInputElement>(null)

  // Cooldown timer for resend
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  // Auto-focus code input when step changes
  useEffect(() => {
    if (step === 'code' && codeInputRef.current) {
      codeInputRef.current.focus()
    }
  }, [step])

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const sendMagicLink = async () => {
    if (!validateEmail(email)) {
      setError('Por favor ingresa un email válido')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      // Use signInWithOtp for magic link
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
          data: {
            source: 'viral_conversion',
            timestamp: new Date().toISOString(),
          }
        }
      })

      if (error) {
        throw error
      }

      setStep('code')
      setResendCooldown(60) // 60 second cooldown
    } catch (error: any) {
      const message = error.message || 'Error al enviar el código'
      setError(message)
      onError?.(message)
    } finally {
      setIsLoading(false)
    }
  }

  const verifyCode = async () => {
    if (code.length !== 6) {
      setError('El código debe tener 6 dígitos')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      const { error } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: 'email'
      })

      if (error) {
        throw error
      }

      // Check if user has a profile, create if not
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .single()

        if (!profile) {
          // Create B2C profile with welcome tokens
          await fetch('/api/auth/profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              full_name: user.user_metadata?.full_name || null,
              userType: 'personal'
            })
          })
        }
      }

      setStep('success')

      // Call success callback after a brief delay to show success state
      setTimeout(() => {
        onSuccess?.()
      }, 1500)

    } catch (error: any) {
      const message = error.message === 'Invalid token'
        ? 'Código incorrecto. Intenta nuevamente'
        : error.message || 'Error al verificar el código'
      setError(message)
      onError?.(message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    if (resendCooldown > 0) return

    setError(null)
    await sendMagicLink()
  }

  if (step === 'success') {
    return (
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-[#A3B1A1]/10 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8 text-[#A3B1A1]" />
        </div>
        <div>
          <h3 className="text-lg font-cormorant font-light text-[#333333] mb-2">
            ¡Bienvenida a Decollage!
          </h3>
          <p className="text-sm text-[#333333]/70 font-lato">
            Tu cuenta está lista. Comenzando tu experiencia...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive" className="border-[#C4886F]/30 bg-[#C4886F]/10">
          <AlertDescription className="text-[#C4886F] font-lato text-sm">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {step === 'email' && (
        <>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-[#333333] font-lato font-medium">
              Correo Electrónico
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A3B1A1]" />
              <Input
                id="email"
                type="email"
                placeholder={placeholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMagicLink()}
                className="pl-10 border-[#A3B1A1]/20 focus:border-[#A3B1A1] focus:ring-[#A3B1A1]/20 rounded-none font-lato transition-all duration-300"
                disabled={isLoading}
                autoFocus
              />
            </div>
            <p className="text-xs text-[#333333]/60 font-lato">
              {description}
            </p>
          </div>

          <Button
            onClick={sendMagicLink}
            className="w-full bg-[#A3B1A1] hover:bg-[#A3B1A1]/90 text-white font-lato rounded-none transition-all duration-500 transform hover:scale-[1.02] py-3"
            disabled={isLoading || !email}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando código...
              </>
            ) : (
              <>
                {ctaText}
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </>
      )}

      {step === 'code' && (
        <>
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-[#A3B1A1]/10 rounded-full flex items-center justify-center mx-auto">
              <Mail className="w-6 h-6 text-[#A3B1A1]" />
            </div>
            <h3 className="text-lg font-cormorant font-light text-[#333333]">
              Revisa tu correo
            </h3>
            <p className="text-sm text-[#333333]/70 font-lato">
              Enviamos un código de 6 dígitos a<br />
              <span className="font-medium text-[#333333]">{email}</span>
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="code" className="text-[#333333] font-lato font-medium">
              Código de verificación
            </Label>
            <Input
              ref={codeInputRef}
              id="code"
              type="text"
              placeholder="000000"
              value={code}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 6)
                setCode(value)
                // Auto-verify when 6 digits are entered
                if (value.length === 6) {
                  setTimeout(() => verifyCode(), 100)
                }
              }}
              className="text-center text-lg tracking-wider border-[#A3B1A1]/20 focus:border-[#A3B1A1] focus:ring-[#A3B1A1]/20 rounded-none font-lato transition-all duration-300"
              disabled={isLoading}
              maxLength={6}
            />
          </div>

          <Button
            onClick={verifyCode}
            className="w-full bg-[#A3B1A1] hover:bg-[#A3B1A1]/90 text-white font-lato rounded-none transition-all duration-500 transform hover:scale-[1.02] py-3"
            disabled={isLoading || code.length !== 6}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verificando...
              </>
            ) : (
              <>
                Acceder
                <Heart className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>

          <div className="text-center">
            <button
              onClick={handleResend}
              disabled={resendCooldown > 0}
              className={cn(
                "text-sm font-lato transition-colors duration-300",
                resendCooldown > 0
                  ? "text-[#333333]/40 cursor-not-allowed"
                  : "text-[#A3B1A1] hover:text-[#333333]"
              )}
            >
              {resendCooldown > 0
                ? `Reenviar en ${resendCooldown}s`
                : "¿No recibiste el código? Reenviar"
              }
            </button>
          </div>

          <div className="text-center">
            <button
              onClick={() => setStep('email')}
              className="text-sm text-[#333333]/60 hover:text-[#333333] font-lato transition-colors duration-300"
            >
              Cambiar email
            </button>
          </div>
        </>
      )}
    </div>
  )
}