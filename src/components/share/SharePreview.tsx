'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Monitor,
  Smartphone,
  Globe,
  Heart,
  Eye,
  Calendar
} from 'lucide-react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { ShareConfig } from '@/types/sharing'

interface SharePreviewProps {
  config: ShareConfig
  selectedItems: any[]
  projectName: string
  className?: string
}

export function SharePreview({
  config,
  selectedItems,
  projectName,
  className
}: SharePreviewProps) {
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop')

  const displayTitle = config.customTitle || projectName
  const displayDescription = config.customDescription ||
    `Descubre ${selectedItems.length} increíbles diseños de transformación de espacios`

  const visibilityLabels = {
    public: { label: 'Público', icon: Globe, color: 'bg-green-100 text-green-700' },
    unlisted: { label: 'No listado', icon: Eye, color: 'bg-blue-100 text-blue-700' },
    private: { label: 'Privado', icon: Heart, color: 'bg-purple-100 text-purple-700' }
  }

  const currentVisibility = visibilityLabels[config.visibility]

  return (
    <div className={cn("space-y-4", className)}>
      {/* Preview Controls */}
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-sm text-[#A3B1A1]">
          Vista previa de la página compartida
        </h4>

        <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg">
          <Button
            variant={viewMode === 'desktop' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('desktop')}
            className="h-7 px-2"
          >
            <Monitor className="h-3 w-3 mr-1" />
            Desktop
          </Button>
          <Button
            variant={viewMode === 'mobile' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('mobile')}
            className="h-7 px-2"
          >
            <Smartphone className="h-3 w-3 mr-1" />
            Móvil
          </Button>
        </div>
      </div>

      {/* Mock Browser Window */}
      <Card className="overflow-hidden">
        <div className="bg-gray-100 px-3 py-2 border-b flex items-center gap-2">
          {/* Browser Dots */}
          <div className="flex gap-1">
            <div className="w-2 h-2 rounded-full bg-red-400" />
            <div className="w-2 h-2 rounded-full bg-yellow-400" />
            <div className="w-2 h-2 rounded-full bg-green-400" />
          </div>

          {/* URL Bar */}
          <div className="flex-1 mx-3">
            <div className="bg-white rounded px-2 py-1 text-xs text-gray-500 font-mono">
              decollage.cl/share/abc123...
            </div>
          </div>
        </div>

        <CardContent
          className={cn(
            "p-0 bg-white",
            viewMode === 'mobile' ? "max-w-sm mx-auto" : ""
          )}
        >
          {/* Preview Content */}
          <div className={cn(
            "p-6",
            viewMode === 'mobile' ? "p-4" : ""
          )}>
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-[#A3B1A1]/10 flex items-center justify-center">
                  <span className="text-[#A3B1A1] font-bold text-sm">D</span>
                </div>
                <span className="text-sm text-gray-600">Decollage.cl</span>
                <Badge
                  className={cn(
                    "text-xs",
                    currentVisibility.color
                  )}
                >
                  <currentVisibility.icon className="h-3 w-3 mr-1" />
                  {currentVisibility.label}
                </Badge>
              </div>

              <h1 className={cn(
                "font-bold text-gray-900 mb-2",
                viewMode === 'mobile' ? "text-lg" : "text-2xl"
              )}>
                {displayTitle}
              </h1>

              {displayDescription && (
                <p className={cn(
                  "text-gray-600",
                  viewMode === 'mobile' ? "text-sm" : "text-base"
                )}>
                  {displayDescription}
                </p>
              )}

              {/* Meta info */}
              <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Publicado hoy
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  0 visualizaciones
                </div>
              </div>
            </div>

            {/* Image Grid Preview */}
            {selectedItems.length > 0 && (
              <div className="space-y-4">
                <h3 className={cn(
                  "font-semibold text-gray-900",
                  viewMode === 'mobile' ? "text-base" : "text-lg"
                )}>
                  Transformaciones destacadas
                </h3>

                <div className={cn(
                  "grid gap-3",
                  viewMode === 'mobile'
                    ? "grid-cols-1"
                    : selectedItems.length === 1
                      ? "grid-cols-1"
                      : selectedItems.length === 2
                        ? "grid-cols-2"
                        : "grid-cols-2 lg:grid-cols-3"
                )}>
                  {selectedItems.slice(0, viewMode === 'mobile' ? 3 : 6).map((item, index) => (
                    <div
                      key={item.id}
                      className="relative aspect-[4/3] rounded-lg overflow-hidden bg-gray-100 group"
                    >
                      {item.result_image_url && (
                        <>
                          <Image
                            src={item.result_image_url}
                            alt={item.style?.name || `Diseño ${index + 1}`}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            sizes={viewMode === 'mobile' ? "100vw" : "(max-width: 768px) 50vw, 33vw"}
                          />

                          {/* Overlay with style name */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <div className="absolute bottom-2 left-2 right-2">
                              <p className="text-white text-sm font-medium truncate">
                                {item.style?.name}
                              </p>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>

                {selectedItems.length > (viewMode === 'mobile' ? 3 : 6) && (
                  <p className="text-center text-sm text-gray-500">
                    +{selectedItems.length - (viewMode === 'mobile' ? 3 : 6)} diseños más...
                  </p>
                )}
              </div>
            )}

            {/* Call to Action */}
            <div className="mt-8 p-4 bg-[#A3B1A1]/5 rounded-lg text-center">
              <p className="text-sm text-gray-600 mb-3">
                ¿Te inspiraste? Crea tus propias transformaciones
              </p>
              <Button
                className="bg-[#A3B1A1] hover:bg-[#A3B1A1]/90 text-white"
                size={viewMode === 'mobile' ? 'sm' : 'default'}
              >
                Comenzar mi proyecto
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview Info */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>• Esta es una vista previa de cómo se verá tu página compartida</p>
        <p>• Los visitantes podrán ver todos los diseños seleccionados en alta calidad</p>
        {config.visibility === 'private' && (
          <p>• Se requerirá contraseña para acceder al contenido</p>
        )}
      </div>
    </div>
  )
}