'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { triggerAuth, AuthAction } from '@/hooks/use-auth-modal'
import {
  Sparkles,
  Heart,
  Download,
  Share2,
  Gift,
  Clock,
  Users,
  Star,
  Zap,
  ArrowRight,
  X
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ConversionPromptProps {
  action: AuthAction
  context?: {
    itemTitle?: string
    itemImage?: string
    shareToken?: string
    userCount?: number
    recentActivity?: string
  }
  position?: 'center' | 'bottom' | 'top'
  variant?: 'gentle' | 'urgent' | 'benefit'
  autoShow?: boolean
  delay?: number
  onDismiss?: () => void
  className?: string
}

interface PromptConfig {
  title: string
  description: string
  ctaText: string
  benefits: string[]
  urgency?: string
  icon: React.ReactNode
  color: string
}

export function ConversionPrompt({
  action,
  context = {},
  position = 'center',
  variant = 'benefit',
  autoShow = true,
  delay = 3000,
  onDismiss,
  className
}: ConversionPromptProps) {
  const [isVisible, setIsVisible] = useState(!autoShow)
  const [isAnimating, setIsAnimating] = useState(false)

  // Auto-show with delay
  useEffect(() => {
    if (autoShow) {
      const timer = setTimeout(() => {
        setIsVisible(true)
        setIsAnimating(true)
      }, delay)

      return () => clearTimeout(timer)
    }
  }, [autoShow, delay])

  const handleDismiss = () => {
    setIsAnimating(false)
    setTimeout(() => {
      setIsVisible(false)
      onDismiss?.()
    }, 300)
  }

  const handleConvert = () => {
    triggerAuth(action, {
      shareToken: context.shareToken,
      title: context.itemTitle,
      imageUrl: context.itemImage,
      metadata: {
        source: 'conversion_prompt',
        variant,
        position
      }
    })
  }

  const getPromptConfig = (): PromptConfig => {
    const configs: Record<AuthAction, PromptConfig> = {
      like: {
        title: 'Guarda tus favoritos',
        description: 'Crea tu biblioteca personal de inspiración y nunca pierdas los diseños que amas',
        ctaText: 'Guardar este diseño',
        benefits: ['Biblioteca personal', 'Inspiración ilimitada', 'Acceso desde cualquier dispositivo'],
        icon: <Heart className="w-5 h-5" />,
        color: 'from-[#C4886F] to-[#A3B1A1]'
      },
      download: {
        title: 'Descarga en alta calidad',
        description: 'Accede a imágenes HD para usar en tus proyectos y presentaciones',
        ctaText: 'Descargar HD',
        benefits: ['Calidad profesional', 'Sin marcas de agua', 'Uso comercial permitido'],
        urgency: variant === 'urgent' ? 'Oferta limitada por tiempo' : undefined,
        icon: <Download className="w-5 h-5" />,
        color: 'from-[#A3B1A1] to-[#C4886F]'
      },
      save: {
        title: 'Crea tu colección',
        description: 'Organiza diseños en colecciones temáticas y compártelas con amigas',
        ctaText: 'Crear colección',
        benefits: ['Organización inteligente', 'Compartir colecciones', 'Notificaciones de nuevos diseños'],
        icon: <Sparkles className="w-5 h-5" />,
        color: 'from-[#A3B1A1] to-[#C4886F]'
      },
      'create-design': {
        title: 'Transforma tu espacio',
        description: 'Únete a miles de chilenas creando diseños únicos para sus hogares',
        ctaText: 'Crear mi diseño',
        benefits: ['5 diseños gratis', 'IA especializada en Chile', 'Estilos locales auténticos'],
        urgency: variant === 'urgent' ? '5 tokens de bienvenida por tiempo limitado' : undefined,
        icon: <Sparkles className="w-5 h-5" />,
        color: 'from-[#A3B1A1] to-[#C4886F]'
      },
      'view-gallery': {
        title: 'Explora la galería completa',
        description: 'Descubre cientos de transformaciones reales de hogares chilenos',
        ctaText: 'Ver galería completa',
        benefits: ['Inspiración ilimitada', 'Filtros por ciudad', 'Nuevos diseños semanales'],
        icon: <Zap className="w-5 h-5" />,
        color: 'from-[#A3B1A1] to-[#C4886F]'
      },
      share: {
        title: 'Comparte este diseño',
        description: 'Inspira a tus amigas y construye tu red de diseño',
        ctaText: 'Compartir ahora',
        benefits: ['Inspirar a amigas', 'Construir red de diseño', 'Ganar tokens por referidos'],
        icon: <Share2 className="w-5 h-5" />,
        color: 'from-[#C4886F] to-[#A3B1A1]'
      },
      comment: {
        title: 'Únete a la conversación',
        description: 'Conecta con diseñadoras y comparte tus ideas',
        ctaText: 'Comentar',
        benefits: ['Comunidad activa', 'Consejos de expertas', 'Networking de diseño'],
        icon: <Users className="w-5 h-5" />,
        color: 'from-[#A3B1A1] to-[#C4886F]'
      },
      follow: {
        title: 'Sigue a este creador',
        description: 'No te pierdas los nuevos diseños de tus creadores favoritos',
        ctaText: 'Seguir creador',
        benefits: ['Notificaciones de nuevos diseños', 'Contenido exclusivo', 'Acceso anticipado'],
        icon: <Users className="w-5 h-5" />,
        color: 'from-[#C4886F] to-[#A3B1A1]'
      }
    }

    return configs[action]
  }

  const config = getPromptConfig()

  if (!isVisible) return null

  const positionClasses = {
    center: 'fixed inset-0 flex items-center justify-center z-50',
    bottom: 'fixed bottom-4 left-4 right-4 z-50',
    top: 'fixed top-4 left-4 right-4 z-50'
  }

  return (
    <div className={positionClasses[position]}>
      {/* Backdrop for center position */}
      {position === 'center' && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleDismiss} />
      )}

      <div className={cn(
        "relative bg-white rounded-lg shadow-2xl max-w-lg w-full mx-auto overflow-hidden border border-gray-100",
        position === 'center' && "transform transition-all duration-300",
        isAnimating && position === 'center' && "scale-100 opacity-100",
        !isAnimating && position === 'center' && "scale-95 opacity-0",
        position !== 'center' && "transform transition-all duration-300",
        isAnimating && position !== 'center' && "translate-y-0 opacity-100",
        !isAnimating && position !== 'center' && "translate-y-4 opacity-0",
        className
      )}>
        {/* Header with gradient */}
        <div className={cn(
          "bg-gradient-to-r p-6 text-white relative",
          `bg-gradient-to-r ${config.color}`
        )}>
          {onDismiss && (
            <button
              onClick={handleDismiss}
              className="absolute top-4 right-4 p-1 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              {config.icon}
            </div>

            <div className="flex-1">
              <h3 className="text-xl font-cormorant font-light mb-2">
                {config.title}
              </h3>
              <p className="text-white/90 text-sm font-lato leading-relaxed">
                {config.description}
              </p>

              {config.urgency && (
                <Badge variant="secondary" className="bg-white/20 text-white border-none mt-3">
                  <Clock className="w-3 h-3 mr-1" />
                  {config.urgency}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Benefits */}
          <div className="mb-6">
            <h4 className="text-sm font-lato font-medium text-[#333333] mb-3 flex items-center gap-2">
              <Gift className="w-4 h-4 text-[#A3B1A1]" />
              Tu cuenta incluye:
            </h4>
            <div className="space-y-2">
              {config.benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-[#A3B1A1]/10 rounded-full flex items-center justify-center">
                    <Star className="w-3 h-3 text-[#A3B1A1]" />
                  </div>
                  <span className="text-sm text-[#333333]/80 font-lato">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Social proof */}
          {context.userCount && (
            <div className="mb-6 p-4 bg-[#F8F8F8] rounded-lg">
              <div className="flex items-center gap-2 text-sm text-[#333333]/70 font-lato">
                <Users className="w-4 h-4 text-[#A3B1A1]" />
                <span>
                  <strong className="text-[#333333]">
                    {context.userCount.toLocaleString('es-CL')} chilenas
                  </strong>
                  {' '}ya están creando diseños únicos
                </span>
              </div>
              {context.recentActivity && (
                <p className="text-xs text-[#333333]/60 mt-1">
                  Última actividad: {context.recentActivity}
                </p>
              )}
            </div>
          )}

          {/* CTA */}
          <Button
            onClick={handleConvert}
            className="w-full bg-[#A3B1A1] hover:bg-[#A3B1A1]/90 text-white font-lato rounded-none transition-all duration-500 transform hover:scale-[1.02] py-3"
          >
            {config.ctaText}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>

          {/* Footer note */}
          <p className="text-center text-xs text-[#333333]/60 font-lato mt-4">
            Sin spam. Cancela cuando quieras. Hecho con ❤️ para Chile.
          </p>
        </div>
      </div>
    </div>
  )
}

// Hook for programmatic prompt management
export function useConversionPrompt() {
  const [activePrompt, setActivePrompt] = useState<ConversionPromptProps | null>(null)

  const showPrompt = (props: Omit<ConversionPromptProps, 'onDismiss'>) => {
    setActivePrompt({
      ...props,
      onDismiss: () => setActivePrompt(null)
    })
  }

  const hidePrompt = () => {
    setActivePrompt(null)
  }

  return {
    activePrompt,
    showPrompt,
    hidePrompt,
    ConversionPromptComponent: activePrompt ? (
      <ConversionPrompt {...activePrompt} />
    ) : null
  }
}