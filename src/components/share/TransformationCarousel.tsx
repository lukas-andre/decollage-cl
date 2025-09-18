'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface TransformationItem {
  id: string
  title?: string
  description?: string
  imageUrl: string
  beforeImageUrl?: string
  style?: string
  room?: string
}

interface TransformationCarouselProps {
  items: TransformationItem[]
  autoPlay?: boolean
  interval?: number
}

export function TransformationCarousel({
  items,
  autoPlay = true,
  interval = 5000
}: TransformationCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showBefore, setShowBefore] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)

  useEffect(() => {
    if (!autoPlay) return

    const timer = setInterval(() => {
      handleNext()
    }, interval)

    return () => clearInterval(timer)
  }, [currentIndex, autoPlay, interval])

  const handlePrevious = () => {
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentIndex((prev) => (prev === 0 ? items.length - 1 : prev - 1))
      setIsTransitioning(false)
      setShowBefore(false)
    }, 300)
  }

  const handleNext = () => {
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentIndex((prev) => (prev === items.length - 1 ? 0 : prev + 1))
      setIsTransitioning(false)
      setShowBefore(false)
    }, 300)
  }

  const currentItem = items[currentIndex]

  if (!currentItem) return null

  return (
    <div className="relative w-full">
      {/* Main Image Container - Dynamic aspect ratio for mixed orientations */}
      <div className="relative h-[50vh] lg:h-[60vh] overflow-hidden bg-[#F8F8F8]">
        {/* Before/After Images */}
        <div className="relative w-full h-full">
          {currentItem.beforeImageUrl && (
            <img
              src={currentItem.beforeImageUrl}
              alt="Antes"
              className={cn(
                "absolute inset-0 w-full h-full object-contain transition-opacity duration-700",
                showBefore ? "opacity-100" : "opacity-0"
              )}
              style={{
                objectPosition: 'center center'
              }}
            />
          )}
          <img
            src={currentItem.imageUrl}
            alt={currentItem.title || "Transformación"}
            className={cn(
              "absolute inset-0 w-full h-full object-contain transition-opacity duration-700",
              !showBefore ? "opacity-100" : "opacity-0",
              isTransitioning && "opacity-50"
            )}
            style={{
              objectPosition: 'center center'
            }}
          />

          {/* Elegant Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
        </div>


        {/* Navigation Controls */}
        <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 flex justify-between px-4 lg:px-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePrevious}
            className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white transition-all duration-300 h-12 w-12"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNext}
            className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white transition-all duration-300 h-12 w-12"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>

        {/* Subtle Before/After Toggle */}
        {currentItem.beforeImageUrl && (
          <div className="absolute top-6 right-6">
            <Button
              variant="ghost"
              onClick={() => setShowBefore(!showBefore)}
              className="bg-black/30 backdrop-blur-sm hover:bg-black/50 text-white transition-all duration-500 px-4 py-2 text-sm"
              style={{ fontFamily: 'Lato, sans-serif' }}
            >
              {showBefore ? 'Después' : 'Antes'}
            </Button>
          </div>
        )}

        {/* Minimal Dots Indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
          {items.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentIndex(index)
                setShowBefore(false)
              }}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-500",
                index === currentIndex
                  ? "bg-white w-6"
                  : "bg-white/50 hover:bg-white/70"
              )}
              aria-label={`Ir a transformación ${index + 1}`}
            />
          ))}
        </div>
      </div>

    </div>
  )
}