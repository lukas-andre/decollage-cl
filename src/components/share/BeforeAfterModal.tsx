'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { BeforeAfterSlider } from '@/components/projects/BeforeAfterSlider'
import { cn } from '@/lib/utils'
import * as VisuallyHidden from '@radix-ui/react-visually-hidden'

interface BeforeAfterModalProps {
  isOpen: boolean
  onClose: () => void
  beforeImageUrl?: string
  afterImageUrl: string
  title?: string
  onDownload?: () => void
  onShare?: () => void
}

export function BeforeAfterModal({
  isOpen,
  onClose,
  beforeImageUrl,
  afterImageUrl,
  title,
  onDownload,
  onShare
}: BeforeAfterModalProps) {
  const [imageOrientation, setImageOrientation] = useState<'horizontal' | 'vertical' | 'square'>('horizontal')

  // Detect image orientation
  useEffect(() => {
    if (afterImageUrl) {
      const img = new Image()
      img.onload = () => {
        const aspectRatio = img.width / img.height
        if (aspectRatio > 1.1) {
          setImageOrientation('horizontal')
        } else if (aspectRatio < 0.9) {
          setImageOrientation('vertical')
        } else {
          setImageOrientation('square')
        }
      }
      img.src = afterImageUrl
    }
  }, [afterImageUrl])

  // Allow modal to open even without beforeImageUrl
  // This lets users see the after image in fullscreen

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-0 bg-black border-0 max-w-[95vw] max-h-[95vh]">
        <VisuallyHidden.Root>
          <DialogTitle>Comparación de imágenes</DialogTitle>
          <DialogDescription>
            Usa el control deslizante para comparar las imágenes antes y después
          </DialogDescription>
        </VisuallyHidden.Root>
        <div className="relative flex flex-col h-full">
          {/* Close Button Only - Top Right */}
          <div className="absolute top-4 right-4 z-20">
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-sm transition-all duration-200"
            >
              <X className="w-6 h-6" />
            </Button>
          </div>

          {/* Slider Container */}
          <div className="flex-1 flex items-center justify-center bg-black p-4">
            <div className={cn(
              "relative w-full h-full",
              imageOrientation === 'vertical' && "max-w-2xl mx-auto",
              imageOrientation === 'square' && "max-w-4xl mx-auto"
            )}>
              {beforeImageUrl ? (
                <BeforeAfterSlider
                  beforeImage={beforeImageUrl}
                  afterImage={afterImageUrl}
                  beforeAlt="Antes"
                  afterAlt="Después"
                  className="w-full h-full"
                />
              ) : (
                // Show just the after image if no before image
                <div className="w-full h-full flex items-center justify-center">
                  <img
                    src={afterImageUrl}
                    alt="Transformación"
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}