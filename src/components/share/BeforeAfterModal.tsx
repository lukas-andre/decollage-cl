'use client'

import { useState, useEffect } from 'react'
import { X, Download, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

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
  const [sliderPosition, setSliderPosition] = useState(50)
  const [isDragging, setIsDragging] = useState(false)
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

  // Reset slider position when modal opens
  useEffect(() => {
    if (isOpen) {
      setSliderPosition(50)
    }
  }, [isOpen])

  const handleMouseDown = () => {
    setIsDragging(true)
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return

    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percentage = (x / rect.width) * 100
    setSliderPosition(Math.min(100, Math.max(0, percentage)))
  }

  const handleTouchStart = () => {
    setIsDragging(true)
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
  }

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging) return

    const touch = e.touches[0]
    const rect = e.currentTarget.getBoundingClientRect()
    const x = touch.clientX - rect.left
    const percentage = (x / rect.width) * 100
    setSliderPosition(Math.min(100, Math.max(0, percentage)))
  }

  if (!beforeImageUrl) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] p-0 bg-white border-0">
        <div className="relative flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <h2
              className="text-2xl font-light text-[#333333] tracking-wide"
              style={{ fontFamily: 'Cormorant, serif' }}
            >
              {title || 'Antes y Después'}
            </h2>
            <div className="flex items-center gap-3">
              {onShare && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onShare}
                  className="px-4 py-2 border border-[#333333] text-[#333333] hover:bg-[#333333] hover:text-white transition-all duration-300 rounded-none"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Compartir
                </Button>
              )}
              {onDownload && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onDownload}
                  className="px-4 py-2 border border-[#A3B1A1] text-[#A3B1A1] hover:bg-[#A3B1A1] hover:text-white transition-all duration-300 rounded-none"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Descargar
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-none"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Slider Container */}
          <div className="flex-1 overflow-hidden bg-[#F8F8F8]">
            <div className={cn(
              "relative w-full h-full min-h-[400px]",
              imageOrientation === 'vertical' && "max-w-2xl mx-auto",
              imageOrientation === 'square' && "max-w-4xl mx-auto"
            )}>
              <div
                className="relative w-full h-full cursor-ew-resize select-none"
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onMouseMove={handleMouseMove}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                onTouchMove={handleTouchMove}
              >
                {/* Before Image */}
                <img
                  src={beforeImageUrl}
                  alt="Antes"
                  className={cn(
                    "absolute inset-0 w-full h-full",
                    imageOrientation === 'vertical' ? "object-contain" : "object-cover"
                  )}
                  style={{ objectPosition: 'center center' }}
                />

                {/* After Image with Clip */}
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
                >
                  <img
                    src={afterImageUrl}
                    alt="Después"
                    className={cn(
                      "absolute inset-0 w-full h-full",
                      imageOrientation === 'vertical' ? "object-contain" : "object-cover"
                    )}
                    style={{ objectPosition: 'center center' }}
                  />
                </div>

                {/* Slider Line */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg"
                  style={{ left: `${sliderPosition}%` }}
                >
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white border-2 border-[#A3B1A1] flex items-center justify-center shadow-lg cursor-ew-resize">
                    <div className="flex gap-0.5">
                      <div className="w-0.5 h-4 bg-[#A3B1A1]"></div>
                      <div className="w-0.5 h-4 bg-[#A3B1A1]"></div>
                    </div>
                  </div>
                </div>

                {/* Labels */}
                <div className="absolute bottom-6 left-6">
                  <div
                    className="bg-black/90 text-white px-4 py-2 text-sm font-light tracking-widest backdrop-blur-sm"
                    style={{ fontFamily: 'Lato, sans-serif' }}
                  >
                    ANTES
                  </div>
                </div>
                <div className="absolute bottom-6 right-6">
                  <div
                    className="bg-[#A3B1A1]/90 text-white px-4 py-2 text-sm font-light tracking-widest backdrop-blur-sm"
                    style={{ fontFamily: 'Lato, sans-serif' }}
                  >
                    DESPUÉS
                  </div>
                </div>

                {/* Instruction overlay for first-time users */}
                <div className="absolute top-6 left-1/2 -translate-x-1/2">
                  <div
                    className="bg-white/90 backdrop-blur-sm px-4 py-2 text-sm text-[#333333] font-light shadow-lg"
                    style={{ fontFamily: 'Lato, sans-serif' }}
                  >
                    Arrastra para comparar
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}