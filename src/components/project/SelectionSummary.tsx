'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardContent } from '@/components/ui/card'
import {
  Share2,
  X,
  Heart,
  ChevronUp,
  ChevronDown,
  Eye
} from 'lucide-react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface Variant {
  id: string
  result_image_url: string | null
  is_favorite: boolean
  created_at: string
  tokens_consumed: number
  status: 'pending' | 'processing' | 'completed' | 'failed'
  style: {
    id: string
    name: string
    code: string
  } | null
}

interface SelectionSummaryProps {
  selectedVariants: Set<string>
  variants: Variant[]
  onShareSelected: () => void
  onClearSelection: () => void
  onViewVariant?: (variantId: string) => void
  onToggleSelection?: (variantId: string) => void
  className?: string
}

export function SelectionSummary({
  selectedVariants,
  variants,
  onShareSelected,
  onClearSelection,
  onViewVariant,
  onToggleSelection,
  className
}: SelectionSummaryProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (selectedVariants.size === 0) {
    return null
  }

  const selectedItems = variants.filter(v => selectedVariants.has(v.id) && v.status === 'completed')
  const favoriteCount = selectedItems.filter(v => v.is_favorite).length

  return (
    <Card
      className={cn(
        "fixed bottom-6 left-6 right-6 max-w-4xl mx-auto z-50",
        "transition-all duration-700 ease-out",
        "shadow-2xl border-[#A3B1A1]/20 bg-white/95 backdrop-blur-sm",
        className
      )}
    >
      <CardContent className="p-0">
        {/* Header */}
        <div className="p-4 border-b border-[#A3B1A1]/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#A3B1A1] animate-pulse" />
                <span className="font-medium text-sm">
                  {selectedVariants.size} diseño{selectedVariants.size !== 1 ? 's' : ''} seleccionado{selectedVariants.size !== 1 ? 's' : ''}
                </span>
              </div>

              {favoriteCount > 0 && (
                <Badge variant="outline" className="text-xs border-red-200 text-red-600">
                  <Heart className="h-3 w-3 mr-1 fill-current" />
                  {favoriteCount} favorito{favoriteCount !== 1 ? 's' : ''}
                </Badge>
              )}

              {/* Mini Image Previews */}
              <div className="flex -space-x-2 ml-2">
                {selectedItems.slice(0, 4).map((variant, index) => (
                  <div
                    key={variant.id}
                    className="relative w-8 h-8 rounded-full border-2 border-white overflow-hidden bg-muted shadow-sm"
                    style={{ zIndex: 10 - index }}
                    title={variant.style?.name || 'Diseño'}
                  >
                    {variant.result_image_url && (
                      <Image
                        src={variant.result_image_url}
                        alt={variant.style?.name || 'Diseño'}
                        fill
                        className="object-cover"
                        sizes="32px"
                      />
                    )}
                  </div>
                ))}
                {selectedItems.length > 4 && (
                  <div className="w-8 h-8 rounded-full border-2 border-white bg-[#A3B1A1] text-white text-xs flex items-center justify-center font-medium shadow-sm">
                    +{selectedItems.length - 4}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Expand/Collapse */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="h-8 w-8 p-0 hover:bg-[#A3B1A1]/10"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronUp className="h-4 w-4" />
                )}
              </Button>

              {/* Clear Selection */}
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearSelection}
                className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Visual Stats */}
          <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <span>
                {new Set(selectedItems.map(v => v.style?.name).filter(Boolean)).size} estilos diferentes
              </span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 mt-3">
            <Button
              onClick={onShareSelected}
              className="bg-[#A3B1A1] hover:bg-[#A3B1A1]/90 text-white"
              size="sm"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Compartir Selección
            </Button>

            <span className="text-xs text-muted-foreground">
              o haz clic en "Compartir Favoritos" para una selección rápida
            </span>
          </div>
        </div>

        {/* Expandable Preview Grid */}
        {isExpanded && (
          <div className="p-4">
            <ScrollArea className="max-h-48">
              <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2">
                {selectedItems.map((variant) => (
                  <div
                    key={variant.id}
                    className="relative group cursor-pointer"
                    onClick={() => onViewVariant?.(variant.id)}
                  >
                    <div className="aspect-square rounded-lg overflow-hidden bg-muted border-2 border-[#A3B1A1]/20">
                      {variant.result_image_url && (
                        <Image
                          src={variant.result_image_url}
                          alt={variant.style?.name || 'Diseño'}
                          width={80}
                          height={80}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      )}

                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                        <Eye className="h-4 w-4 text-white" />
                      </div>

                      {/* Unselect button */}
                      {onToggleSelection && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onToggleSelection(variant.id)
                          }}
                          className="absolute top-1 right-1 w-4 h-4 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-2 w-2" />
                        </button>
                      )}

                      {/* Favorite indicator */}
                      {variant.is_favorite && (
                        <div className="absolute top-1 left-1">
                          <Heart className="h-3 w-3 text-red-500 fill-current" />
                        </div>
                      )}
                    </div>

                    {/* Style name */}
                    <p className="text-xs text-center mt-1 truncate text-muted-foreground">
                      {variant.style?.name}
                    </p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </CardContent>
    </Card>
  )
}