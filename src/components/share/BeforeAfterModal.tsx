'use client'

import { useState, useEffect } from 'react'
import { X, Download, Share2, Maximize2, Minimize2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { BeforeAfterSlider } from '@/components/projects/BeforeAfterSlider'
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
  const [imageOrientation, setImageOrientation] = useState<'horizontal' | 'vertical' | 'square'>('horizontal')
  const [isFullscreen, setIsFullscreen] = useState(false)

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

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  // Handle escape from fullscreen
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  // Allow modal to open even without beforeImageUrl
  // This lets users see the after image in fullscreen

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn(
        "p-0 bg-black border-0",
        isFullscreen ? "max-w-full max-h-full w-full h-full" : "max-w-[95vw] max-h-[95vh]"
      )}>
        <div className="relative flex flex-col h-full">
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/70 to-transparent p-6">
            <div className="flex items-center justify-between">
              <h2
                className="text-2xl font-light text-white tracking-wide"
                style={{ fontFamily: 'Cormorant, serif' }}
              >
                {title || 'Antes y Después'}
              </h2>
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleFullscreen}
                  className="text-white hover:bg-white/20 rounded-none"
                >
                  {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </Button>
                {onShare && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onShare}
                    className="text-white hover:bg-white/20 rounded-none"
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                )}
                {onDownload && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onDownload}
                    className="text-white hover:bg-white/20 rounded-none"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-white hover:bg-white/20 rounded-none"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Slider Container */}
          <div className="flex-1 flex items-center justify-center bg-black pt-20">
            <div className={cn(
              "relative w-full h-full",
              imageOrientation === 'vertical' && "max-w-3xl mx-auto",
              imageOrientation === 'square' && "max-w-5xl mx-auto"
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
                    className={cn(
                      "max-w-full max-h-full",
                      imageOrientation === 'vertical' ? "object-contain" : "object-cover"
                    )}
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