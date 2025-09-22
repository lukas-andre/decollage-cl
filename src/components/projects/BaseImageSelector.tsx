'use client'

import React, { memo } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Plus, X, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BaseImage {
  id: string
  name: string | null
  url: string
  upload_order: number | null
  created_at: string
}

interface BaseImageSelectorProps {
  images: BaseImage[]
  selectedImage: BaseImage | null
  onSelectImage: (image: BaseImage) => void
  onDeleteImage: (imageId: string) => void
  onUploadImage: (file: File) => void
  isUploading: boolean
}

export const BaseImageSelector = memo(function BaseImageSelector({
  images,
  selectedImage,
  onSelectImage,
  onDeleteImage,
  onUploadImage,
  isUploading
}: BaseImageSelectorProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-gray-900">Imágenes Base</h2>
        <label htmlFor="upload-input">
          <Button size="sm" variant="outline" asChild className="h-8">
            <span className="text-xs">
              {isUploading ? (
                <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
              ) : (
                <Plus className="h-3.5 w-3.5 mr-1.5" />
              )}
              Agregar
            </span>
          </Button>
          <input
            id="upload-input"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) onUploadImage(file)
            }}
          />
        </label>
      </div>

      <div className="overflow-x-auto pb-2">
        <div className="flex gap-3 min-w-0">
          {images?.map((image) => (
            <div
              key={image.id}
              className={cn(
                "relative group flex-shrink-0 transition-all cursor-pointer",
                "w-20 h-20 md:w-16 md:h-16",
                "rounded-lg overflow-hidden border-2",
                selectedImage?.id === image.id
                  ? "border-[#A3B1A1] shadow-lg ring-2 ring-[#A3B1A1]/20"
                  : "border-gray-200 hover:border-gray-300"
              )}
              onClick={() => onSelectImage(image)}
            >
              <Image
                src={image.url}
                alt={image.name || 'Imagen'}
                fill
                className="object-cover"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDeleteImage(image.id)
                }}
                className="absolute top-1 right-1 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </div>
          ))}
          {(!images || images.length === 0) && !isUploading && (
            <div className="text-center py-6 px-8 text-sm text-gray-500">
              Sube tu primera imagen para comenzar
            </div>
          )}
        </div>
      </div>
    </div>
  )
})