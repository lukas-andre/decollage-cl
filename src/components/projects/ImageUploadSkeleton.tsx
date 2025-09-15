'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { Upload, Image as ImageIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ImageUploadSkeletonProps {
  className?: string
  showIcon?: boolean
}

export function ImageUploadSkeleton({ className, showIcon = true }: ImageUploadSkeletonProps) {
  return (
    <div className={cn(
      "relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 border-dashed border-gray-300",
      className
    )}>
      <Skeleton className="w-full h-full" />
      
      {/* Animated overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
      
      {showIcon && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Upload className="h-6 w-6 text-gray-400 animate-bounce" />
        </div>
      )}
    </div>
  )
}

export function ImagePreviewSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("relative aspect-video rounded-lg overflow-hidden bg-muted", className)}>
      <Skeleton className="w-full h-full" />
      
      {/* Shimmer effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 animate-pulse" />
      
      <div className="absolute inset-0 flex items-center justify-center">
        <ImageIcon className="h-8 w-8 text-gray-400" />
      </div>
    </div>
  )
}