'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { createClient } from '@/lib/supabase/client'
import { useAuthModal } from '@/hooks/use-auth-modal'
import { Loader2, Mail, Heart, MessageSquare, Bookmark, Download, UserPlus, CheckCircle, Share2, Sparkles, Eye } from 'lucide-react'

const ACTION_ICONS: Record<string, any> = {
  like: Heart,
  comment: MessageSquare,
  save: Bookmark,
  download: Download,
  follow: UserPlus,
  share: Share2,
  'create-design': Sparkles,
  'view-gallery': Eye
}

const ACTION_MESSAGES: Record<string, any> = {
  like: {
    title: '¡Dale aplausos a este diseño!',
    description: 'Ingresa tu email para continuar aplaudiendo diseños que te inspiran.',
    cta: 'Aplaudir este diseño'
  },
  comment: {
    title: 'Comparte tu opinión',
    description: 'Ingresa tu email para comentar y conectar con la comunidad.',
    cta: 'Comentar'
  },
  save: {
    title: 'Guarda tus favoritos',
    description: 'Ingresa tu email para crear tu colección de diseños inspiradores.',
    cta: 'Guardar diseño'
  },
  download: {
    title: 'Descarga este diseño',
    description: 'Ingresa tu email para descargar diseños en alta calidad.',
    cta: 'Descargar imagen'
  },
  follow: {
    title: 'Sigue a este creador',
    description: 'Ingresa tu email para seguir creadores y no perderte sus nuevos diseños.',
    cta: 'Seguir creador'
  },
  share: {
    title: 'Comparte este diseño',
    description: 'Ingresa tu email para compartir diseños con tu comunidad.',
    cta: 'Compartir diseño'
  },
  'create-design': {
    title: 'Crea tu propio diseño',
    description: 'Ingresa tu email para empezar a transformar tus espacios.',
    cta: 'Crear diseño'
  },
  'view-gallery': {
    title: 'Explora la galería completa',
    description: 'Ingresa tu email para ver miles de diseños inspiradores.',
    cta: 'Ver galería'
  }
}

export function MagicLinkModal() {
  const isOpen = useAuthModal(state => state.isOpen)
  const actionType = useAuthModal(state => state.actionType)
  const actionContext = useAuthModal(state => state.actionContext)
  const closeModal = useAuthModal(state => state.closeModal)
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [countdown, setCountdown] = useState(0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const supabase = createClient()

      // Check if user exists first
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single()

      // Capture the current full URL (including share path)
      const currentUrl = window.location.href
      const redirectPath = window.location.pathname + window.location.search

      // Store the return URL in session storage before sending the magic link
      // This ensures we can retrieve it after authentication even if Supabase doesn't preserve our redirect
      sessionStorage.setItem('authReturnUrl', redirectPath)
      sessionStorage.setItem('authReturnContext', JSON.stringify({
        actionType,
        shareToken: actionContext?.shareToken,
        timestamp: Date.now()
      }))

      // Send magic link
      // Note: Supabase might override the redirect_to parameter with the one configured in the dashboard
      const { data, error: authError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/confirm`,
          shouldCreateUser: true,
          data: {
            utm_source: 'share_interaction',
            signup_method: 'magic_link',
            initial_action: actionType,
            original_url: currentUrl,
            share_token: actionContext?.shareToken,
            redirect_path: redirectPath  // Store in user metadata as backup
          }
        }
      })

      if (authError) {
        if (authError.message.includes('rate limit')) {
          // Parse rate limit time from error or default to 60 seconds
          setCountdown(60)
          const timer = setInterval(() => {
            setCountdown(prev => {
              if (prev <= 1) {
                clearInterval(timer)
                return 0
              }
              return prev - 1
            })
          }, 1000)
          throw new Error(`Por favor espera ${countdown} segundos antes de solicitar otro enlace`)
        }
        throw authError
      }

      setSuccess(true)

      // Track successful magic link send
      await fetch('/api/analytics/track-gate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_type: 'magic_link_sent',
          action: actionType,
          email: email,
          metadata: actionContext
        })
      })

      // Auto-close after 5 seconds if still on success screen
      setTimeout(() => {
        if (success) {
          closeModal()
        }
      }, 5000)

    } catch (error: any) {
      console.error('Magic link error:', error)
      setError(error.message || 'Error al enviar el enlace. Por favor intenta de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!actionType) return null

  const Icon = ACTION_ICONS[actionType]
  const messages = ACTION_MESSAGES[actionType]

  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      <DialogContent className="sm:max-w-md" aria-describedby="auth-dialog-description">
        {!success ? (
          <>
            <DialogHeader className="space-y-4">
              <div className="mx-auto w-12 h-12 bg-gradient-to-br from-[#A3B1A1] to-[#C4886F] rounded-full flex items-center justify-center">
                <Icon className="h-6 w-6 text-white" />
              </div>
              <DialogTitle className="text-center font-cormorant text-2xl text-[#333333]">
                {messages.title}
              </DialogTitle>
              <DialogDescription id="auth-dialog-description" className="text-center font-lato text-[#666666]">
                {messages.description}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="space-y-2">
                <label htmlFor="email" className="sr-only">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading || countdown > 0}
                  className="w-full h-12 px-4 font-lato border-gray-200 focus:border-[#A3B1A1] focus:ring-[#A3B1A1]"
                  autoFocus
                />
              </div>

              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-600 font-lato text-sm">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                disabled={isLoading || !email || countdown > 0}
                className="w-full h-12 bg-gradient-to-r from-[#A3B1A1] to-[#C4886F] text-white hover:opacity-90 transition-opacity font-lato"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando enlace...
                  </>
                ) : countdown > 0 ? (
                  `Espera ${countdown} segundos`
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Enviar enlace mágico
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-[#666666] font-lato">
                Al continuar, aceptas nuestros{' '}
                <a href="/terms" className="underline hover:text-[#333333]">
                  términos de servicio
                </a>{' '}
                y{' '}
                <a href="/privacy" className="underline hover:text-[#333333]">
                  política de privacidad
                </a>
                .
              </p>
            </form>

            <div className="relative pt-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-[#666666] font-lato">
                  Sin contraseña
                </span>
              </div>
            </div>

            <p className="text-sm text-center text-[#666666] font-lato">
              Te enviaremos un enlace seguro para acceder. No necesitas recordar contraseñas.
            </p>
          </>
        ) : (
          <div className="text-center space-y-6 py-8">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>

            <div className="space-y-2">
              <h3 className="font-cormorant text-2xl text-[#333333]">
                ¡Revisa tu correo!
              </h3>
              <p className="font-lato text-[#666666]">
                Hemos enviado un enlace mágico a
              </p>
              <p className="font-lato font-semibold text-[#333333]">
                {email}
              </p>
            </div>

            <div className="space-y-3 pt-4">
              <div className="flex items-start space-x-3 text-left">
                <span className="flex-shrink-0 w-6 h-6 bg-[#A3B1A1]/20 rounded-full flex items-center justify-center text-sm font-semibold text-[#A3B1A1]">
                  1
                </span>
                <p className="text-sm text-[#666666] font-lato">
                  Abre el email que te enviamos
                </p>
              </div>
              <div className="flex items-start space-x-3 text-left">
                <span className="flex-shrink-0 w-6 h-6 bg-[#A3B1A1]/20 rounded-full flex items-center justify-center text-sm font-semibold text-[#A3B1A1]">
                  2
                </span>
                <p className="text-sm text-[#666666] font-lato">
                  Haz clic en el enlace para acceder
                </p>
              </div>
              <div className="flex items-start space-x-3 text-left">
                <span className="flex-shrink-0 w-6 h-6 bg-[#A3B1A1]/20 rounded-full flex items-center justify-center text-sm font-semibold text-[#A3B1A1]">
                  3
                </span>
                <p className="text-sm text-[#666666] font-lato">
                  ¡Listo! Podrás {messages.cta.toLowerCase()}
                </p>
              </div>
            </div>

            <p className="text-xs text-[#666666] font-lato">
              ¿No recibiste el email? Revisa tu carpeta de spam o{' '}
              <button
                onClick={() => {
                  setSuccess(false)
                  setEmail('')
                }}
                className="underline hover:text-[#333333]"
              >
                intenta con otro email
              </button>
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}