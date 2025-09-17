'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Loader2,
  AlertCircle,
  Heart,
  Eye,
  Download,
  Check
} from 'lucide-react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

// Helper function to get user-friendly furniture mode labels
function getFurnitureModeLabel(mode: string): { label: string; icon: string } {
  switch (mode) {
    case 'keep_all':
      return { label: 'Conservar Todo', icon: '' }
    case 'keep_reposition':
      return { label: 'Conservar + Reposicionar', icon: '' }
    case 'keep_add_more':
      return { label: 'Conservar + Agregar', icon: '' }
    case 'replace_all':
    default:
      return { label: 'Reemplazar Todo', icon: '' }
  }
}

interface VariantCardProps {
  variant: {
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
      category?: string
      macrocategory?: string
    } | null
    room_type?: {
      id: string
      name: string
      code: string
    } | null
    color_palette?: {
      id: string
      name: string
      code: string
      hex_colors: string[]
    } | null
    metadata?: {
      style_name?: string
      style_category?: string
      style_macrocategory?: string
      furniture_mode?: string
      [key: string]: any
    } | null
  }
  onView: () => void
  onDownload: () => void
  onToggleFavorite?: () => void
  isLoading?: boolean
  // Selection functionality
  isSelected?: boolean
  onToggleSelection?: () => void
  showSelection?: boolean
}

export function VariantCard({
  variant,
  onView,
  onDownload,
  onToggleFavorite,
  isLoading = false,
  isSelected = false,
  onToggleSelection,
  showSelection = false
}: VariantCardProps) {
  return (
    <Card
      className={cn(
        "overflow-hidden transition-all duration-500 group",
        variant.status === 'processing' && "ring-2 ring-primary ring-offset-2 animate-pulse",
        variant.status === 'completed' && "cursor-pointer hover:shadow-lg hover:scale-[1.02]",
        isLoading && "opacity-50",
        isSelected && "ring-2 ring-[#A3B1A1] ring-offset-2 shadow-lg scale-[1.02]"
      )}
      onClick={() => {
        if (variant.status === 'completed') {
          if (showSelection && onToggleSelection) {
            onToggleSelection()
          } else {
            onView()
          }
        }
      }}
    >
      <div className="relative aspect-[4/3] bg-muted">
        {variant.status === 'processing' || variant.status === 'pending' ? (
          <div className="h-full flex flex-col items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse"></div>
              <Loader2 className="h-8 w-8 animate-spin text-primary relative z-10" />
            </div>
            <span className="text-sm font-medium text-primary mt-3">Generando diseño...</span>
            <span className="text-xs text-muted-foreground mt-1">15-30 segundos</span>
          </div>
        ) : variant.status === 'failed' ? (
          <div className="h-full flex flex-col items-center justify-center bg-destructive/5">
            <AlertCircle className="h-8 w-8 text-destructive mb-2" />
            <span className="text-sm font-medium">Error al generar</span>
            <span className="text-xs text-muted-foreground mt-1">Intenta nuevamente</span>
          </div>
        ) : variant.result_image_url ? (
          <>
            <Image
              src={variant.result_image_url}
              alt={`Diseño ${variant.style?.name}`}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            />
            
            {/* Selection Checkbox - Elegant top-left positioning */}
            {showSelection && onToggleSelection && (
              <div
                className={cn(
                  "absolute top-3 left-3 transition-all duration-500 ease-out",
                  "opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100",
                  isSelected && "opacity-100 scale-100"
                )}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onToggleSelection()
                  }}
                  className={cn(
                    "w-6 h-6 rounded-full border-2 transition-all duration-500 ease-out",
                    "flex items-center justify-center",
                    "hover:scale-110 hover:shadow-lg",
                    isSelected
                      ? "bg-[#A3B1A1] border-[#A3B1A1] text-white shadow-lg"
                      : "bg-white/90 border-white/90 text-transparent hover:bg-white"
                  )}
                >
                  <Check className="h-3 w-3" />
                </button>
              </div>
            )}

            {/* Hover Overlay */}
            <div className={cn(
              "absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20",
              "transition-opacity duration-500 ease-out",
              showSelection ? "opacity-0 group-hover:opacity-80" : "opacity-0 group-hover:opacity-100"
            )}>
              <div className="absolute bottom-2 left-2 right-2 flex gap-1">
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-7 px-2 flex-1 text-xs"
                  onClick={(e) => {
                    e.stopPropagation()
                    onView()
                  }}
                >
                  <Eye className="h-3 w-3 mr-1" />
                  Ver
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-7 px-2 flex-1 text-xs"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDownload()
                  }}
                >
                  <Download className="h-3 w-3 mr-1" />
                  Descargar
                </Button>
              </div>

              {/* Favorite Button */}
              {onToggleFavorite && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute top-2 right-2 h-7 w-7 p-0 hover:bg-white/20"
                  onClick={(e) => {
                    e.stopPropagation()
                    onToggleFavorite()
                  }}
                >
                  <Heart className={cn(
                    "h-3 w-3",
                    variant.is_favorite ? "fill-red-500 text-red-500" : "text-white"
                  )} />
                </Button>
              )}
            </div>
          </>
        ) : null}
      </div>
      
      {/* Card Content */}
      <CardContent className="p-3">
        {variant.status === 'completed' && (
          <>
            <div className="space-y-1 text-xs">
              <p className="font-medium truncate">{variant.style?.name}</p>

              {/* Macrocategory and Category */}
              {(variant.style?.macrocategory || variant.metadata?.style_macrocategory) && (
                <p className="text-muted-foreground truncate text-[10px]">
                  {variant.style?.macrocategory || variant.metadata?.style_macrocategory}
                  {(variant.style?.category || variant.metadata?.style_category) &&
                    ` > ${variant.style?.category || variant.metadata?.style_category}`
                  }
                </p>
              )}

              {variant.room_type && (
                <p className="text-muted-foreground truncate">
                  {variant.room_type.name}
                </p>
              )}

              {variant.color_palette && (
                <div className="flex items-center gap-1">
                  <span className="text-muted-foreground truncate flex-1">
                    {variant.color_palette.name}
                  </span>
                  <div className="flex gap-0.5 flex-shrink-0">
                    {variant.color_palette.hex_colors.slice(0, 3).map((color, i) => (
                      <div
                        key={i}
                        className="w-2 h-2 rounded-full border border-border"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Furniture Mode Badge */}
              {variant.metadata?.furniture_mode && (
                <div className="flex items-center gap-1 mt-1">
                  <Badge
                    variant="outline"
                    className="text-[10px] px-1.5 py-0.5 h-auto bg-primary/5 border-primary/20"
                  >
                    {getFurnitureModeLabel(variant.metadata.furniture_mode).label}
                  </Badge>
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-between mt-3 pt-2 border-t">
              <div className="flex items-center gap-1">
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className={cn(
                    "h-7 w-7 p-0",
                    variant.is_favorite && "text-red-500"
                  )}
                  onClick={(e) => {
                    e.stopPropagation()
                    onToggleFavorite?.()
                  }}
                >
                  <Heart className={cn(
                    "h-3 w-3",
                    variant.is_favorite && "fill-current"
                  )} />
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}