'use client'

import { useState } from 'react'
import { Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface FavoriteButtonProps {
  itemId: string
  itemType: 'transformation' | 'moodboard' | 'image'
  title?: string
  thumbnailUrl?: string
  metadata?: Record<string, any>
  isFavorited: boolean
  onToggle: (item: {
    id: string
    type: 'transformation' | 'moodboard' | 'image'
    title: string
    thumbnailUrl: string
    metadata?: Record<string, any>
  }) => Promise<void>
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'ghost' | 'outline'
  className?: string
  disabled?: boolean
}

export function FavoriteButton({
  itemId,
  itemType,
  title = 'Item',
  thumbnailUrl = '',
  metadata = {},
  isFavorited,
  onToggle,
  size = 'md',
  variant = 'ghost',
  className,
  disabled = false
}: FavoriteButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleClick = async () => {
    if (disabled || isLoading) return

    try {
      setIsLoading(true)
      await onToggle({
        id: itemId,
        type: itemType,
        title,
        thumbnailUrl,
        metadata
      })
    } catch (error) {
      console.error('Error toggling favorite:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-9 w-9',
    lg: 'h-10 w-10'
  }

  const iconSizes = {
    sm: 14,
    md: 16,
    lg: 18
  }

  return (
    <Button
      variant={variant}
      size="icon"
      onClick={handleClick}
      disabled={disabled || isLoading}
      className={cn(
        sizeClasses[size],
        'relative transition-all duration-200',
        isFavorited && 'text-red-500 hover:text-red-600',
        !isFavorited && 'text-gray-400 hover:text-red-400',
        isLoading && 'opacity-70',
        className
      )}
      title={isFavorited ? 'Quitar de favoritos' : 'Añadir a favoritos'}
    >
      <Heart
        size={iconSizes[size]}
        className={cn(
          'transition-all duration-200',
          isFavorited && 'fill-current',
          isLoading && 'animate-pulse'
        )}
      />
      
      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={cn(
            'rounded-full border-2 border-current border-t-transparent animate-spin',
            size === 'sm' && 'h-3 w-3',
            size === 'md' && 'h-4 w-4',
            size === 'lg' && 'h-5 w-5'
          )} />
        </div>
      )}
    </Button>
  )
}