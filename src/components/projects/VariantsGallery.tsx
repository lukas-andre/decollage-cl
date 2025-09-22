'use client'

import React, { memo } from 'react'
import Image from 'next/image'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, Heart, Brush, Maximize2, Check, Grid2x2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface Variant {
  id: string
  result_image_url: string | null
  is_favorite: boolean
  created_at: string
  tokens_consumed: number
  status: 'pending' | 'processing' | 'completed' | 'failed'
  style: { id: string; name: string; code: string; category: string; macrocategory: string } | null
  room_type: { name: string } | null
  color_palette: { name: string; hex_colors: string[] } | null
  metadata?: any
}

interface VariantsGalleryProps {
  variants: Variant[]
  selectedVariant: string | null
  loading: boolean
  onSelectVariant: (variantId: string) => void
  onToggleFavorite: (variantId: string) => void
  onOpenViewer: (variant: Variant, mode?: 'view' | 'edit') => void
}

export const VariantsGallery = memo(function VariantsGallery({
  variants,
  selectedVariant,
  loading,
  onSelectVariant,
  onToggleFavorite,
  onOpenViewer
}: VariantsGalleryProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-[#A3B1A1]" />
      </div>
    )
  }

  if (variants.length === 0) {
    return (
      <div className="text-center py-16 px-8 border-2 border-dashed border-gray-200 rounded-xl">
        <Grid2x2 className="h-10 w-10 text-gray-300 mx-auto mb-3" />
        <p className="text-sm text-gray-600 font-medium">
          No hay diseños generados aún
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Usa el panel de diseño para crear tu primer diseño
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
      {variants.map((variant) => (
        <motion.div
          key={variant.id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
          className="group relative"
          onClick={() => {
            onSelectVariant(variant.id)
            if (variant.status === 'completed' && variant.result_image_url) {
              onOpenViewer(variant, 'view')
            }
          }}
        >
          <Card className={cn(
            "overflow-hidden hover:shadow-xl transition-all duration-200 cursor-pointer",
            selectedVariant === variant.id
              ? "border-2 border-[#A3B1A1] ring-2 ring-[#A3B1A1]/20"
              : "border-gray-200"
          )}>
            {variant.status === 'completed' && variant.result_image_url ? (
              <>
                <div className="relative aspect-square">
                  <Image
                    src={variant.result_image_url}
                    alt="Variante"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-200">
                    <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                      <div className="flex gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onToggleFavorite(variant.id)
                          }}
                          className="w-8 h-8 md:w-7 md:h-7 rounded-full bg-white/95 hover:bg-white flex items-center justify-center transition-all shadow-lg"
                          title="Favorito"
                        >
                          <Heart className={cn(
                            "h-4 w-4 md:h-3.5 md:w-3.5 transition-colors",
                            variant.is_favorite ? "fill-red-500 text-red-500" : "text-gray-700"
                          )} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onOpenViewer(variant, 'edit')
                          }}
                          className="w-8 h-8 md:w-7 md:h-7 rounded-full bg-white/95 hover:bg-white flex items-center justify-center transition-all shadow-lg"
                          title="Refinar"
                        >
                          <Brush className="h-4 w-4 md:h-3.5 md:w-3.5 text-gray-700" />
                        </button>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onOpenViewer(variant, 'view')
                        }}
                        className="w-8 h-8 md:w-7 md:h-7 rounded-full bg-white/95 hover:bg-white flex items-center justify-center transition-all shadow-lg"
                        title="Ampliar"
                      >
                        <Maximize2 className="h-4 w-4 md:h-3.5 md:w-3.5 text-gray-700" />
                      </button>
                    </div>
                  </div>
                  {selectedVariant === variant.id && (
                    <div className="absolute top-2 right-2">
                      <div className="w-6 h-6 rounded-full bg-[#A3B1A1] flex items-center justify-center shadow-lg">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    </div>
                  )}
                </div>
                {/* Clean design - No metadata badges */}
              </>
            ) : variant.status === 'processing' ? (
              <div className="aspect-square flex items-center justify-center bg-gray-50">
                <Loader2 className="h-5 w-5 animate-spin text-[#A3B1A1]" />
              </div>
            ) : variant.status === 'failed' ? (
              <div className="aspect-square flex items-center justify-center bg-red-50 text-red-500 text-xs p-3 text-center">
                Error al generar
              </div>
            ) : (
              <div className="aspect-square flex items-center justify-center bg-gray-50">
                <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
              </div>
            )}
          </Card>
        </motion.div>
      ))}
    </div>
  )
})