'use client'

import { useState, useEffect, useCallback } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  Heart,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Layers,
  Image as ImageIcon
} from 'lucide-react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { BeforeAfterSlider } from '@/components/projects/BeforeAfterSlider'

interface LightboxProps {
  isOpen: boolean
  onClose: () => void
  images: Array<{
    id: string
    result_image_url: string | null
    original_image_url?: string
    is_favorite: boolean
    style?: { name: string } | null
    room_type?: { name: string } | null
    color_palette?: { name: string; hex_colors?: string[] } | null
    tokens_consumed: number
    created_at: string
  }>
  initialIndex: number
  onToggleFavorite?: (id: string) => void
  originalImage?: string // Original base image URL
}

export function Lightbox({ 
  isOpen, 
  onClose, 
  images, 
  initialIndex, 
  onToggleFavorite,
  originalImage 
}: LightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [zoom, setZoom] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [showSlider, setShowSlider] = useState(false)
  
  const currentImage = images[currentIndex]

  // Reset zoom, position and slider when image changes
  useEffect(() => {
    setZoom(1)
    setPosition({ x: 0, y: 0 })
    setShowSlider(false)
  }, [currentIndex])

  // Reset index when initialIndex changes
  useEffect(() => {
    setCurrentIndex(initialIndex)
  }, [initialIndex])

  const handlePrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))
  }, [images.length])

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))
  }, [images.length])

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isOpen) return
    
    switch (e.key) {
      case 'Escape':
        onClose()
        break
      case 'ArrowLeft':
        handlePrevious()
        break
      case 'ArrowRight':
        handleNext()
        break
      case '+':
      case '=':
        setZoom(prev => Math.min(prev * 1.2, 3))
        break
      case '-':
        setZoom(prev => Math.max(prev / 1.2, 0.5))
        break
      case '0':
        setZoom(1)
        setPosition({ x: 0, y: 0 })
        break
    }
  }, [isOpen, handlePrevious, handleNext, onClose])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  const handleDownload = async () => {
    if (!currentImage?.result_image_url) return
    
    try {
      const response = await fetch(currentImage.result_image_url)
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const timestamp = new Date().getTime()
      const style = currentImage.style?.name?.toLowerCase().replace(/\s+/g, '-') || 'staged'
      a.download = `virtual-staging-${style}-${timestamp}.jpg`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success('Imagen descargada exitosamente')
    } catch (error) {
      console.error('Error downloading image:', error)
      toast.error('Error al descargar la imagen')
    }
  }

  if (!currentImage?.result_image_url) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-black/95">
        <div className="relative w-full h-full flex flex-col">
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/70 to-transparent p-4">
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <h3 className="font-semibold">{currentImage.style?.name}</h3>
                {currentImage.room_type && (
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                    {currentImage.room_type.name}
                  </Badge>
                )}
                {currentImage.color_palette && (
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-white/80">
                      {currentImage.color_palette.name}
                    </span>
                    <div className="flex gap-0.5">
                      {currentImage.color_palette.hex_colors?.slice(0, 3).map((color, i) => (
                        <div
                          key={i}
                          className="w-3 h-3 rounded-full border border-white/30"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-white/80">
                  {currentIndex + 1} de {images.length}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="text-white hover:bg-white/20"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Image Container */}
          <div className="flex-1 flex items-center justify-center relative overflow-hidden">
            {showSlider && originalImage ? (
              <div className="w-[80vw] h-[70vh] relative">
                <BeforeAfterSlider
                  beforeImage={originalImage}
                  afterImage={currentImage.result_image_url}
                  beforeAlt="Original"
                  afterAlt={currentImage.style?.name || "Diseño generado"}
                  className="w-full h-full"
                />
              </div>
            ) : (
              <div
                className="relative transition-transform duration-200 ease-out cursor-move"
                style={{
                  transform: `scale(${zoom}) translate(${position.x}px, ${position.y}px)`,
                  transformOrigin: 'center center'
                }}
                onMouseDown={(e) => {
                  if (zoom <= 1) return
                  const startX = e.clientX - position.x
                  const startY = e.clientY - position.y
                  
                  const handleMouseMove = (e: MouseEvent) => {
                    setPosition({
                      x: e.clientX - startX,
                      y: e.clientY - startY
                    })
                  }
                  
                  const handleMouseUp = () => {
                    window.removeEventListener('mousemove', handleMouseMove)
                    window.removeEventListener('mouseup', handleMouseUp)
                  }
                  
                  window.addEventListener('mousemove', handleMouseMove)
                  window.addEventListener('mouseup', handleMouseUp)
                }}
              >
                <Image
                  src={currentImage.result_image_url}
                  alt="Diseño generado"
                  width={800}
                  height={600}
                  className="max-w-[80vw] max-h-[70vh] object-contain"
                  priority
                />
              </div>
            )}

            {/* Navigation Arrows */}
            {images.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handlePrevious}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 bg-black/30"
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 bg-black/30"
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </>
            )}
          </div>

          {/* Bottom Controls */}
          <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/70 to-transparent p-4">
            <div className="flex items-center justify-between">
              {/* View Controls */}
              <div className="flex items-center gap-2">
                {originalImage && (
                  <Button
                    variant={showSlider ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setShowSlider(!showSlider)}
                    className={cn(
                      "text-white hover:bg-white/20",
                      showSlider && "bg-white/20 hover:bg-white/30"
                    )}
                  >
                    <Layers className="h-4 w-4 mr-1" />
                    {showSlider ? "Comparando" : "Comparar"}
                  </Button>
                )}
                
                {!showSlider && (
                  <>
                    <div className="h-6 w-px bg-white/20 mx-1" />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setZoom(prev => Math.max(prev / 1.2, 0.5))}
                      disabled={zoom <= 0.5}
                      className="text-white hover:bg-white/20"
                    >
                      <ZoomOut className="h-4 w-4" />
                    </Button>
                    <span className="text-white text-sm min-w-[3rem] text-center">
                      {Math.round(zoom * 100)}%
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setZoom(prev => Math.min(prev * 1.2, 3))}
                      disabled={zoom >= 3}
                      className="text-white hover:bg-white/20"
                    >
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setZoom(1)
                        setPosition({ x: 0, y: 0 })
                      }}
                      className="text-white hover:bg-white/20"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                  {currentImage.tokens_consumed} tokens
                </Badge>
                
                {onToggleFavorite && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onToggleFavorite(currentImage.id)}
                    className={cn(
                      "text-white hover:bg-white/20",
                      currentImage.is_favorite && "text-red-400 hover:text-red-300"
                    )}
                  >
                    <Heart className={cn(
                      "h-4 w-4",
                      currentImage.is_favorite && "fill-current"
                    )} />
                  </Button>
                )}
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDownload}
                  className="text-white hover:bg-white/20"
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}