'use client'

import Image from 'next/image'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Download, X, ZoomIn, ZoomOut } from 'lucide-react'
import { useState } from 'react'

interface BaseImagePreviewModalProps {
  isOpen: boolean
  onClose: () => void
  imageUrl: string
  imageName?: string
}

export function BaseImagePreviewModal({
  isOpen,
  onClose,
  imageUrl,
  imageName
}: BaseImagePreviewModalProps) {
  const [zoom, setZoom] = useState(1)

  const handleDownload = async () => {
    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = imageName || 'imagen-base.jpg'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading image:', error)
    }
  }

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3))
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.5))

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] md:max-w-[85vw] lg:max-w-[80vw] xl:max-w-7xl w-full max-h-[90vh] p-0" showCloseButton={false}>
        <DialogHeader className="p-4 pb-2 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">
              Vista de Imagen Base
            </DialogTitle>
            <div className="flex items-center gap-2">
              {/* Zoom Controls */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomOut}
                disabled={zoom <= 0.5}
                className="gap-2"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground min-w-[60px] text-center">
                {Math.round(zoom * 100)}%
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomIn}
                disabled={zoom >= 3}
                className="gap-2"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>

              {/* Download Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Descargar
              </Button>

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

          {/* Image Name */}
          {imageName && (
            <div className="text-sm text-muted-foreground mt-2">
              {imageName}
            </div>
          )}
        </DialogHeader>

        <div className="relative bg-muted/50 overflow-auto" style={{ height: 'calc(90vh - 90px)' }}>
          <div className="flex items-center justify-center min-h-full p-4">
            <div
              className="relative transition-transform duration-200"
              style={{ transform: `scale(${zoom})` }}
            >
              <Image
                src={imageUrl}
                alt={imageName || "Imagen base del proyecto"}
                width={800}
                height={600}
                className="max-w-full max-h-full object-contain"
                priority
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}