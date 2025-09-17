'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  CheckSquare,
  Heart,
  Share2,
  Sparkles,
  ArrowRight
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SelectionQuickStartProps {
  variantCount: number
  favoriteCount: number
  onStartSelection: () => void
  onShareFavorites: () => void
  className?: string
}

export function SelectionQuickStart({
  variantCount,
  favoriteCount,
  onStartSelection,
  onShareFavorites,
  className
}: SelectionQuickStartProps) {
  if (variantCount === 0) return null

  return (
    <Card
      className={cn(
        "fixed bottom-6 left-6 right-6 max-w-2xl mx-auto z-40",
        "transition-all duration-700 ease-out",
        "shadow-2xl border-[#A3B1A1]/20 bg-white/95 backdrop-blur-sm",
        "animate-in slide-in-from-bottom-4",
        className
      )}
    >
      <CardContent className="p-6">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center mb-3">
            <div className="w-12 h-12 rounded-full bg-[#A3B1A1]/10 flex items-center justify-center">
              <Share2 className="h-6 w-6 text-[#A3B1A1]" />
            </div>
          </div>

          <h3 className="text-lg font-medium text-gray-900 mb-2">
            ¿Listo para compartir tus diseños?
          </h3>

          <p className="text-sm text-muted-foreground">
            Selecciona tus mejores transformaciones para crear una presentación perfecta
          </p>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#A3B1A1]" />
            <span className="text-sm font-medium">{variantCount} diseños disponibles</span>
          </div>

          {favoriteCount > 0 && (
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-red-500 fill-current" />
              <span className="text-sm font-medium">{favoriteCount} favoritos</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {/* Primary Action */}
          <Button
            onClick={onStartSelection}
            className={cn(
              "w-full h-12 bg-[#A3B1A1] hover:bg-[#A3B1A1]/90",
              "transition-all duration-500 ease-out",
              "hover:scale-[1.02] hover:shadow-lg",
              "text-white font-medium"
            )}
          >
            <CheckSquare className="h-5 w-5 mr-3" />
            Empezar a Seleccionar
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>

          {/* Quick Actions */}
          <div className="flex gap-3">
            {favoriteCount > 0 && (
              <Button
                variant="outline"
                onClick={onShareFavorites}
                className={cn(
                  "flex-1 h-10 border-[#A3B1A1]/30 text-[#A3B1A1]",
                  "hover:bg-[#A3B1A1]/5 hover:border-[#A3B1A1]/50",
                  "transition-all duration-500 ease-out hover:scale-[1.02]"
                )}
              >
                <Heart className="h-4 w-4 mr-2 fill-current" />
                Compartir Favoritos
              </Button>
            )}

            <Button
              variant="outline"
              onClick={() => {
                // This would trigger sharing the whole project
                window.dispatchEvent(new CustomEvent('share-whole-project'))
              }}
              className={cn(
                favoriteCount > 0 ? "flex-1" : "w-full",
                "h-10 border-gray-300 text-gray-600",
                "hover:bg-gray-50 hover:border-gray-400",
                "transition-all duration-500 ease-out hover:scale-[1.02]"
              )}
            >
              <Share2 className="h-4 w-4 mr-2" />
              Proyecto Completo
            </Button>
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-4 text-center">
          <p className="text-xs text-muted-foreground">
            💡 <strong>Tip:</strong> Selecciona 3-5 diseños para crear la presentación perfecta
          </p>
        </div>
      </CardContent>
    </Card>
  )
}