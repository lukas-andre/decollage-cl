'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Download, X, ArrowLeftRight, Share2 } from 'lucide-react'
import { BeforeAfterSlider } from './BeforeAfterSlider'

interface ImageViewerModalProps {
  isOpen: boolean
  onClose: () => void
  originalImage: string
  processedImage: string
  styleName?: string
  roomType?: string
  colorScheme?: string
  projectId?: string
  variantId?: string
  onQuickShare?: () => void
}

export function ImageViewerModal({
  isOpen,
  onClose,
  originalImage,
  processedImage,
  styleName,
  roomType,
  colorScheme,
  projectId,
  variantId,
  onQuickShare
}: ImageViewerModalProps) {
  const [viewMode, setViewMode] = useState<'single' | 'comparison'>('single')
  const [showOriginal, setShowOriginal] = useState(false)

  const handleDownload = async (imageUrl: string, filename: string) => {
    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading image:', error)
    }
  }

  const getFileName = () => {
    const timestamp = new Date().getTime()
    const style = styleName?.toLowerCase().replace(/\s+/g, '-') || 'staged'
    return `virtual-staging-${style}-${timestamp}.jpg`
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] md:max-w-[85vw] lg:max-w-[80vw] xl:max-w-7xl w-full max-h-[90vh] p-0" showCloseButton={false}>
        <DialogHeader className="p-4 pb-2 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">
              {viewMode === 'comparison' ? 'Comparación Antes/Después' : 'Vista de Diseño'}
            </DialogTitle>
            <div className="flex items-center gap-2">
              {/* View Mode Toggle */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode(viewMode === 'single' ? 'comparison' : 'single')}
                className="gap-2"
              >
                <ArrowLeftRight className="h-4 w-4" />
                {viewMode === 'single' ? 'Comparar' : 'Vista Simple'}
              </Button>
              
              {/* Download Button */}
              {viewMode === 'single' ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload(
                    showOriginal ? originalImage : processedImage,
                    showOriginal ? 'original.jpg' : getFileName()
                  )}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Descargar
                </Button>
              ) : (
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(originalImage, 'original.jpg')}
                    className="gap-1 px-2"
                  >
                    <Download className="h-3 w-3" />
                    Original
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(processedImage, getFileName())}
                    className="gap-1 px-2"
                  >
                    <Download className="h-3 w-3" />
                    Diseño
                  </Button>
                </div>
              )}

              {/* Quick Share Button */}
              {onQuickShare && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onQuickShare}
                  className="gap-2 bg-[#A3B1A1] hover:bg-[#A3B1A1]/90 text-white border-[#A3B1A1]"
                >
                  <Share2 className="h-4 w-4" />
                  Compartir
                </Button>
              )}

              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8 ml-2"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Metadata */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
            {styleName && <span>Estilo: {styleName}</span>}
            {roomType && <span>• Habitación: {roomType}</span>}
            {colorScheme && <span>• Colores: {colorScheme}</span>}
          </div>
        </DialogHeader>

        <div className="relative bg-muted/50" style={{ height: 'calc(90vh - 90px)' }}>
          {viewMode === 'comparison' ? (
            <div className="relative w-full h-full flex items-center justify-center p-4">
              <div className="relative w-full h-full max-w-full max-h-full">
                <BeforeAfterSlider
                  beforeImage={originalImage}
                  afterImage={processedImage}
                  beforeAlt="Original"
                  afterAlt="Diseño Virtual"
                  className="w-full h-full"
                />
              </div>
              <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20">
                <div className="bg-black/60 text-white text-sm px-4 py-2 rounded-full backdrop-blur-sm">
                  Desliza para comparar
                </div>
              </div>
            </div>
          ) : (
            <div className="relative w-full h-full">
              <Image
                src={showOriginal ? originalImage : processedImage}
                alt={showOriginal ? "Original" : "Diseño Virtual"}
                fill
                className="object-contain"
                priority
              />
              
              {/* Toggle between original and processed in single view */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                <Button
                  variant={!showOriginal ? "default" : "secondary"}
                  size="sm"
                  onClick={() => setShowOriginal(false)}
                >
                  Diseño Virtual
                </Button>
                <Button
                  variant={showOriginal ? "default" : "secondary"}
                  size="sm"
                  onClick={() => setShowOriginal(true)}
                >
                  Original
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}