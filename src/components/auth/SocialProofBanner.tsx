'use client'

import { useState, useEffect } from 'react'
import { Users, Heart, Eye, Sparkles, TrendingUp } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface ActivityData {
  recentUsers: string[]
  totalUsers: number
  activeNow: number
  recentActions: Array<{
    user: string
    action: string
    timeAgo: string
    location?: string
  }>
}

interface SocialProofBannerProps {
  variant?: 'compact' | 'full'
  className?: string
  data?: Partial<ActivityData>
}

// Mock data for demonstration - in production this would come from your analytics
const defaultActivityData: ActivityData = {
  recentUsers: ['Sofía', 'Camila', 'Valentina', 'María', 'Andrea'],
  totalUsers: 5247,
  activeNow: 23,
  recentActions: [
    { user: 'Sofía de Providencia', action: 'guardó este diseño', timeAgo: 'hace 2 min' },
    { user: 'Camila de Valparaíso', action: 'creó un nuevo diseño', timeAgo: 'hace 5 min', location: 'Valparaíso' },
    { user: 'María de Las Condes', action: 'descargó una imagen', timeAgo: 'hace 8 min' },
    { user: 'Andrea de Ñuñoa', action: 'se unió a Decollage', timeAgo: 'hace 12 min' },
    { user: 'Valentina de Vitacura', action: 'compartió su transformación', timeAgo: 'hace 15 min' }
  ]
}

export function SocialProofBanner({
  variant = 'compact',
  className,
  data = {}
}: SocialProofBannerProps) {
  const [currentActionIndex, setCurrentActionIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  const activityData = { ...defaultActivityData, ...data }

  // Cycle through recent actions
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentActionIndex((prev) =>
        (prev + 1) % activityData.recentActions.length
      )
    }, 4000)

    return () => clearInterval(timer)
  }, [activityData.recentActions.length])

  // Show banner after a slight delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  if (!isVisible) return null

  if (variant === 'compact') {
    return (
      <div className={cn(
        "flex items-center justify-center gap-2 py-2 px-4 bg-gradient-to-r from-[#A3B1A1]/10 to-[#C4886F]/10 border border-[#A3B1A1]/20 rounded-lg",
        className
      )}>
        <div className="flex items-center gap-2">
          <div className="flex -space-x-1">
            {activityData.recentUsers.slice(0, 3).map((user, index) => (
              <div
                key={user}
                className="w-6 h-6 bg-gradient-to-br from-[#A3B1A1] to-[#C4886F] rounded-full flex items-center justify-center text-white text-xs font-medium border-2 border-white"
                style={{ zIndex: 3 - index }}
              >
                {user[0]}
              </div>
            ))}
          </div>
          <Users className="w-4 h-4 text-[#A3B1A1]" />
        </div>

        <div className="text-sm text-[#333333]/80 font-lato">
          <span className="font-medium text-[#333333]">
            {activityData.totalUsers.toLocaleString('es-CL')} chilenas
          </span>
          {' '}ya transformaron sus hogares
        </div>

        <Badge variant="secondary" className="bg-[#A3B1A1]/20 text-[#333333] border-none text-xs">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
          {activityData.activeNow} creando ahora
        </Badge>
      </div>
    )
  }

  return (
    <div className={cn(
      "bg-white border border-[#A3B1A1]/20 rounded-lg p-6 shadow-sm",
      className
    )}>
      {/* Header Stats */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="flex -space-x-2">
            {activityData.recentUsers.slice(0, 4).map((user, index) => (
              <div
                key={user}
                className="w-10 h-10 bg-gradient-to-br from-[#A3B1A1] to-[#C4886F] rounded-full flex items-center justify-center text-white font-medium border-3 border-white shadow-sm"
                style={{ zIndex: 4 - index }}
              >
                {user[0]}
              </div>
            ))}
          </div>

          <div>
            <h3 className="text-lg font-cormorant font-light text-[#333333]">
              Comunidad Activa
            </h3>
            <p className="text-sm text-[#333333]/70 font-lato">
              <span className="font-medium text-[#A3B1A1]">
                {activityData.totalUsers.toLocaleString('es-CL')}
              </span>
              {' '}chilenas creando diseños únicos
            </p>
          </div>
        </div>

        <div className="text-right">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-[#333333]">
              {activityData.activeNow} activas ahora
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs text-[#333333]/60">
            <TrendingUp className="w-3 h-3" />
            <span>+12% esta semana</span>
          </div>
        </div>
      </div>

      {/* Live Activity Feed */}
      <div className="space-y-3">
        <h4 className="text-sm font-lato font-medium text-[#333333] flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#A3B1A1]" />
          Actividad en vivo
        </h4>

        <div className="space-y-2">
          {activityData.recentActions.slice(0, 3).map((action, index) => (
            <div
              key={index}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg transition-all duration-500",
                index === currentActionIndex % 3
                  ? "bg-[#A3B1A1]/10 border border-[#A3B1A1]/20"
                  : "bg-gray-50/50"
              )}
            >
              <div className="w-8 h-8 bg-gradient-to-br from-[#A3B1A1] to-[#C4886F] rounded-full flex items-center justify-center text-white text-sm font-medium">
                {action.user[0]}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm text-[#333333] font-lato">
                  <span className="font-medium">{action.user}</span>
                  {' '}{action.action}
                </p>
                <p className="text-xs text-[#333333]/60 font-lato">
                  {action.timeAgo}
                </p>
              </div>

              <div className="flex items-center gap-1">
                {getActionIcon(action.action)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trust Indicators */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="flex items-center justify-center gap-1 mb-1">
              <Heart className="w-4 h-4 text-[#C4886F]" />
              <span className="text-lg font-cormorant font-light text-[#333333]">
                4.9
              </span>
            </div>
            <p className="text-xs text-[#333333]/60 font-lato">Satisfacción</p>
          </div>

          <div>
            <div className="flex items-center justify-center gap-1 mb-1">
              <Sparkles className="w-4 h-4 text-[#A3B1A1]" />
              <span className="text-lg font-cormorant font-light text-[#333333]">
                2.3k
              </span>
            </div>
            <p className="text-xs text-[#333333]/60 font-lato">Diseños esta semana</p>
          </div>

          <div>
            <div className="flex items-center justify-center gap-1 mb-1">
              <Eye className="w-4 h-4 text-[#A3B1A1]" />
              <span className="text-lg font-cormorant font-light text-[#333333]">
                47k
              </span>
            </div>
            <p className="text-xs text-[#333333]/60 font-lato">Vistas mensuales</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function getActionIcon(action: string) {
  if (action.includes('guardó') || action.includes('diseño')) {
    return <Heart className="w-4 h-4 text-[#C4886F]" />
  }
  if (action.includes('descargó')) {
    return <Eye className="w-4 h-4 text-[#A3B1A1]" />
  }
  if (action.includes('unió') || action.includes('registró')) {
    return <Sparkles className="w-4 h-4 text-[#A3B1A1]" />
  }
  return <Users className="w-4 h-4 text-[#A3B1A1]" />
}