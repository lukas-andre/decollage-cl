'use client'

import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface BeforeAfterSliderProps {
  items: Array<{
    id: string
    title?: string | null
    description?: string | null
    imageUrl: string
    beforeImageUrl?: string | null
    metadata?: any
  }>
}

export function BeforeAfterSlider({ items }: BeforeAfterSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [sliderPosition, setSliderPosition] = useState(50)
  const [isDragging, setIsDragging] = useState(false)
  const [imageOrientation, setImageOrientation] = useState<'horizontal' | 'vertical' | 'square'>('horizontal')
  const containerRef = useRef<HTMLDivElement>(null)

  const currentItem = items[currentIndex]

  // Detect image orientation when item changes
  useEffect(() => {
    if (currentItem?.imageUrl) {
      const img = new Image()
      img.onload = () => {
        const aspectRatio = img.width / img.height
        if (aspectRatio > 1.2) {
          setImageOrientation('horizontal')
        } else if (aspectRatio < 0.8) {
          setImageOrientation('vertical')
        } else {
          setImageOrientation('square')
        }
      }
      img.src = currentItem.imageUrl
    }
  }, [currentItem])

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

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0]
    const rect = e.currentTarget.getBoundingClientRect()
    const x = touch.clientX - rect.left
    const percentage = (x / rect.width) * 100
    setSliderPosition(Math.min(100, Math.max(0, percentage)))
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? items.length - 1 : prev - 1))
    setSliderPosition(50)
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === items.length - 1 ? 0 : prev + 1))
    setSliderPosition(50)
  }

  if (!currentItem || !currentItem.beforeImageUrl) {
    return null
  }

  return (
    <div className="relative">
      {/* Main Slider Container - Adaptive aspect ratio */}
      <div
        ref={containerRef}
        className={cn(
          "relative overflow-hidden bg-[#F8F8F8] cursor-ew-resize select-none shadow-2xl",
          imageOrientation === 'vertical' ? "aspect-[3/4] max-w-2xl mx-auto" :
          imageOrientation === 'square' ? "aspect-square max-w-3xl mx-auto" :
          "aspect-[16/9]"
        )}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
      >
        {/* Before Image */}
        <img
          src={currentItem.beforeImageUrl}
          alt={`${currentItem.title || 'Transformación'} - Antes`}
          className="absolute inset-0 w-full h-full object-cover"
          draggable={false}
        />

        {/* After Image with Clip */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
        >
          <img
            src={currentItem.imageUrl}
            alt={`${currentItem.title || 'Transformación'} - Después`}
            className="absolute inset-0 w-full h-full object-cover"
            draggable={false}
          />
        </div>

        {/* Slider Line */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-white shadow-lg transition-none"
          style={{ left: `${sliderPosition}%` }}
        >
          {/* Handle */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-xl flex items-center justify-center">
            <div className="flex gap-1">
              <div className="w-0.5 h-4 bg-[#333333]"></div>
              <div className="w-0.5 h-4 bg-[#333333]"></div>
            </div>
          </div>
        </div>

        {/* Labels */}
        <div className="absolute top-4 left-4 z-10">
          <div className="bg-black/80 backdrop-blur-sm text-white px-3 py-1 text-xs font-light tracking-widest" style={{ fontFamily: 'Lato, sans-serif' }}>
            ANTES
          </div>
        </div>
        <div className="absolute top-4 right-4 z-10">
          <div className="bg-[#A3B1A1] backdrop-blur-sm text-white px-3 py-1 text-xs font-light tracking-widest" style={{ fontFamily: 'Lato, sans-serif' }}>
            DESPUÉS
          </div>
        </div>

        {/* Navigation Arrows for Multiple Items */}
        {items.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation()
                goToPrevious()
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110"
              onMouseDown={(e) => e.stopPropagation()}
            >
              <ChevronLeft className="w-5 h-5 text-[#333333]" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                goToNext()
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110"
              onMouseDown={(e) => e.stopPropagation()}
            >
              <ChevronRight className="w-5 h-5 text-[#333333]" />
            </button>
          </>
        )}
      </div>

      {/* Item Info */}
      {currentItem.title && (
        <div className="mt-4">
          <h3
            className="text-xl font-light text-[#333333] tracking-wide"
            style={{ fontFamily: 'Cormorant, serif' }}
          >
            {currentItem.title}
          </h3>
          {currentItem.description && (
            <p
              className="mt-2 text-gray-600 font-light"
              style={{ fontFamily: 'Lato, sans-serif' }}
            >
              {currentItem.description}
            </p>
          )}
        </div>
      )}

      {/* Indicators for Multiple Items */}
      {items.length > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {items.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentIndex(index)
                setSliderPosition(50)
              }}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-300",
                index === currentIndex
                  ? "bg-[#A3B1A1] w-6"
                  : "bg-gray-300 hover:bg-gray-400"
              )}
            />
          ))}
        </div>
      )}

      {/* Instructions */}
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500 font-light italic" style={{ fontFamily: 'Lato, sans-serif' }}>
          Desliza para comparar antes y después
        </p>
      </div>
    </div>
  )
}