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

  const handleMouseEnter = useCallback(() => {
    if (!beforeImageUrl) return
    setShowBefore(true)
  }, [beforeImageUrl])

  const handleMouseLeave = useCallback(() => {
    setShowBefore(false)
  }, [])

  const handleTouchStart = useCallback(() => {
    if (!beforeImageUrl) return
    setShowBefore(true)
  }, [beforeImageUrl])

  const handleTouchEnd = useCallback(() => {
    setShowBefore(false)
  }, [])

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
    <div
      className={cn(
        "relative overflow-hidden bg-[#F8F8F8] group",
        isMobile && isVertical ? "aspect-[3/4]" : "",
        className
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* After Image - Always visible */}
      <img
        src={afterImageUrl}
        alt={title || "Transformación"}
        className={cn(
          "w-full h-full",
          isMobile && isVertical ? "object-cover" : "object-contain"
        )}
        style={{ objectPosition: 'center center' }}
      />

      {/* Before Image - Shows on hover/tap */}
      {beforeImageUrl && (
        <div className={cn(
          "absolute inset-0 transition-opacity duration-300",
          showBefore ? "opacity-100" : "opacity-0 pointer-events-none"
        )}>
          <img
            src={beforeImageUrl}
            alt="Antes"
            className={cn(
              "w-full h-full",
              isMobile && isVertical ? "object-cover" : "object-contain"
            )}
            style={{ objectPosition: 'center center' }}
          />

          {/* Label for Before */}
          <div className="absolute top-4 left-4">
            <div className="bg-black/80 backdrop-blur-sm text-white px-3 py-1 text-xs font-light tracking-widest">
              ANTES
            </div>
          </div>
        </div>
      )}

      {/* Hover hint - only show when not showing before */}
      {beforeImageUrl && !showBefore && (
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-lg">
            <div className="flex items-center gap-2 text-xs text-[#333333] font-light">
              <Eye className="w-3 h-3" />
              <span style={{ fontFamily: 'Lato, sans-serif' }}>
                Hover para ver antes
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}