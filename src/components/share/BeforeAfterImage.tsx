'use client'

import { useState, useRef, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { Eye } from 'lucide-react'

interface BeforeAfterImageProps {
  beforeImageUrl?: string
  afterImageUrl: string
  title?: string
  className?: string
  isVertical?: boolean
  isMobile?: boolean
}

export function BeforeAfterImage({
  beforeImageUrl,
  afterImageUrl,
  title,
  className,
  isVertical = false,
  isMobile = false
}: BeforeAfterImageProps) {
  const [showBefore, setShowBefore] = useState(false)
  const [isPressed, setIsPressed] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout>({} as NodeJS.Timeout)

  const handleMouseEnter = useCallback(() => {
    if (!beforeImageUrl) return
    setIsHovering(true)
    setShowBefore(true)
  }, [beforeImageUrl])

  const handleMouseLeave = useCallback(() => {
    setIsHovering(false)
    setShowBefore(false)
    setIsPressed(false)
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
  }, [])

  const handlePressStart = useCallback(() => {
    if (!beforeImageUrl) return
    setIsPressed(true)
    setShowBefore(true)
  }, [beforeImageUrl])

  const handlePressEnd = useCallback(() => {
    setIsPressed(false)
    if (!isHovering) {
      setShowBefore(false)
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
  }, [isHovering])

  // If no before image, just show the after image
  if (!beforeImageUrl) {
    return (
      <div className={cn(
        "relative overflow-hidden bg-[#F8F8F8]",
        isMobile && isVertical ? "aspect-[3/4]" : "",
        className
      )}>
        <img
          src={afterImageUrl}
          alt={title || "Transformación"}
          className={cn(
            "w-full h-full",
            isMobile && isVertical ? "object-cover" : "object-contain"
          )}
          style={{ objectPosition: 'center center' }}
        />
      </div>
    )
  }

  return (
    <div className={cn(
      "relative overflow-hidden bg-[#F8F8F8] group cursor-pointer",
      isMobile && isVertical ? "aspect-[3/4]" : "",
      className
    )}>
      {/* Before Image */}
      <img
        src={beforeImageUrl}
        alt="Antes"
        className={cn(
          "absolute inset-0 w-full h-full transition-opacity duration-300",
          isMobile && isVertical ? "object-cover" : "object-contain",
          showBefore ? "opacity-100" : "opacity-0"
        )}
        style={{ objectPosition: 'center center' }}
      />

      {/* After Image */}
      <img
        src={afterImageUrl}
        alt={title || "Transformación"}
        className={cn(
          "w-full h-full transition-all duration-500",
          isMobile && isVertical ? "object-cover" : "object-contain",
          showBefore ? "opacity-0" : "opacity-100",
          isPressed ? "scale-105" : "group-hover:scale-102"
        )}
        style={{ objectPosition: 'center center' }}
      />

      {/* Interactive Overlay */}
      <div
        className="absolute inset-0 cursor-pointer select-none"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseDown={handlePressStart}
        onMouseUp={handlePressEnd}
        onTouchStart={handlePressStart}
        onTouchEnd={handlePressEnd}
        onTouchCancel={handlePressEnd}
      >
        {/* Subtle instruction overlay */}
        <div className={cn(
          "absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 transition-opacity duration-300",
          (isHovering || isPressed) && beforeImageUrl ? "opacity-100" : "opacity-0"
        )}>
          <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg">
            <div className="flex items-center gap-2 text-sm text-[#333333] font-light">
              <Eye className="w-4 h-4" />
              <span style={{ fontFamily: 'Lato, sans-serif' }}>
                {showBefore ? 'Mostrando: Antes' : 'Hover para ver "antes"'}
              </span>
            </div>
          </div>
        </div>

        {/* Visual feedback */}
        {(isPressed || isHovering) && (
          <div className={cn(
            "absolute inset-0 transition-all duration-300",
            isPressed ? "bg-white/10 animate-pulse" : "bg-transparent"
          )} />
        )}
      </div>

      {/* Before/After Indicator */}
      {showBefore && (
        <div className="absolute top-4 left-4">
          <div className="bg-[#A3B1A1]/90 backdrop-blur-sm text-white px-3 py-1 text-xs font-light tracking-widest">
            ANTES
          </div>
        </div>
      )}
    </div>
  )
}