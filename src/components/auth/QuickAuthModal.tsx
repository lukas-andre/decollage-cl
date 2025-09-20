'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogOverlay
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuthModal, getActionMessage, AuthAction, getPendingAuthAction } from '@/hooks/use-auth-modal'
import { MagicLinkForm } from './MagicLinkForm'
import { X, Sparkles, Heart, Download, Bookmark, Share2, Eye, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

export function QuickAuthModal() {
  const router = useRouter()
  const { isOpen, data, closeModal } = useAuthModal()
  const [isExecutingAction, setIsExecutingAction] = useState(false)

  const actionConfig = data?.action ? getActionMessage(data.action) : null

  // Handle auth success - execute pending action and redirect
  const handleAuthSuccess = async () => {
    setIsExecutingAction(true)

    try {
      // Small delay to show success state
      await new Promise(resolve => setTimeout(resolve, 1000))

      // If there's a return URL, go back to it
      if (data?.returnUrl) {
        // Close modal first
        closeModal()

        // Navigate back to the original page
        window.location.href = data.returnUrl
        return
      }

      // Default redirect for successful auth
      closeModal()
      router.push('/dashboard/projects')

    } catch (error) {
      console.error('Error executing post-auth action:', error)
      // Still close modal and redirect on error
      closeModal()
      router.push('/dashboard/projects')
    } finally {
      setIsExecutingAction(false)
    }
  }

  // Check for pending auth action on component mount
  useEffect(() => {
    const pendingAction = getPendingAuthAction()
    if (pendingAction && !isOpen) {
      // Reopen modal with pending action data
      useAuthModal.getState().openModal(pendingAction)
    }
  }, [isOpen])

  // Get icon for the action
  const getActionIcon = (action?: AuthAction) => {
    const iconClass = "w-5 h-5"
    switch (action) {
      case 'like':
      case 'save':
        return <Heart className={iconClass} />
      case 'download':
        return <Download className={iconClass} />
      case 'share':
        return <Share2 className={iconClass} />
      case 'view-gallery':
        return <Eye className={iconClass} />
      case 'create-design':
      default:
        return <Sparkles className={iconClass} />
    }
  }

  // Get Chilean cultural loading messages
  const getLoadingMessage = () => {
    const messages = [
      "Preparando tu espacio de inspiración...",
      "Conectándote con la comunidad chilena de diseño...",
      "Desbloqueando tu creatividad...",
      "Creando tu cuenta con amor..."
    ]
    return messages[Math.floor(Math.random() * messages.length)]
  }

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      <DialogOverlay className="bg-black/60 backdrop-blur-sm" />
      <DialogContent className="max-w-md mx-auto bg-white border-none shadow-2xl rounded-none p-0 overflow-hidden">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-[#A3B1A1] to-[#C4886F] p-6 text-white">
          <button
            onClick={closeModal}
            className="absolute top-4 right-4 p-1 rounded-full bg-white/20 hover:bg-white/30 transition-colors duration-200"
            disabled={isExecutingAction}
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              {getActionIcon(data?.action)}
            </div>
            <div>
              <h2 className="text-xl font-cormorant font-light">
                {actionConfig?.title || 'Únete a Decollage'}
              </h2>
              {data?.action && (
                <Badge variant="secondary" className="bg-white/20 text-white border-none mt-1">
                  {data.action.replace('-', ' ')}
                </Badge>
              )}
            </div>
          </div>

          <p className="text-white/90 text-sm font-lato leading-relaxed">
            {actionConfig?.description || 'Crea tu cuenta en segundos y transforma tu hogar'}
          </p>
        </div>

        {/* Social Proof Banner */}
        <div className="bg-[#F8F8F8] px-6 py-3 border-b border-gray-100">
          <div className="flex items-center justify-center gap-2 text-xs text-[#333333]/70 font-lato">
            <Users className="w-4 h-4 text-[#A3B1A1]" />
            <span>
              <strong className="text-[#333333]">5,247 chilenas</strong> ya transformaron sus hogares
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {isExecutingAction ? (
            <div className="text-center space-y-4 py-8">
              <div className="w-12 h-12 bg-[#A3B1A1]/10 rounded-full flex items-center justify-center mx-auto">
                <Sparkles className="w-6 h-6 text-[#A3B1A1] animate-pulse" />
              </div>
              <div>
                <h3 className="text-lg font-cormorant font-light text-[#333333] mb-2">
                  ¡Todo listo!
                </h3>
                <p className="text-sm text-[#333333]/70 font-lato">
                  {getLoadingMessage()}
                </p>
              </div>
            </div>
          ) : (
            <>
              <MagicLinkForm
                onSuccess={handleAuthSuccess}
                onError={(error) => console.error('Auth error:', error)}
                placeholder="maria@email.com"
                ctaText={actionConfig?.ctaText || 'Crear mi cuenta'}
                description="Sin contraseñas, sin complicaciones"
              />

              {/* Benefits */}
              <div className="mt-6 pt-6 border-t border-gray-100">
                <h4 className="text-sm font-lato font-medium text-[#333333] mb-3">
                  Tu cuenta incluye:
                </h4>
                <div className="grid grid-cols-2 gap-3 text-xs text-[#333333]/70 font-lato">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-[#A3B1A1] rounded-full"></div>
                    <span>5 tokens gratis</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-[#C4886F] rounded-full"></div>
                    <span>Guardado ilimitado</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-[#A3B1A1] rounded-full"></div>
                    <span>Inspiración personal</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-[#C4886F] rounded-full"></div>
                    <span>Comunidad exclusiva</span>
                  </div>
                </div>
              </div>

              {/* Alternative Login */}
              <div className="mt-6 pt-4 border-t border-gray-100 text-center">
                <p className="text-xs text-[#333333]/60 font-lato mb-2">
                  ¿Ya tienes cuenta?
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    closeModal()
                    router.push('/login')
                  }}
                  className="text-[#A3B1A1] hover:text-[#333333] font-lato text-sm"
                >
                  Iniciar sesión
                </Button>
              </div>
            </>
          )}
        </div>

        {/* Chilean Touch */}
        <div className="bg-gradient-to-r from-[#A3B1A1]/5 to-[#C4886F]/5 px-6 py-3">
          <p className="text-center text-xs text-[#333333]/60 font-lato">
            Hecho con ❤️ para el hogar chileno
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Global modal provider component
export function AuthModalProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <QuickAuthModal />
    </>
  )
}