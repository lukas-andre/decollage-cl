'use client'

import { useEffect, useState } from 'react'
import ColorThief from 'colorthief'

interface ColorPaletteProps {
  imageUrl: string
  className?: string
}

export function ColorPalette({ imageUrl, className = '' }: ColorPaletteProps) {
  const [palette, setPalette] = useState<[number, number, number][]>([])
  const [dominantColor, setDominantColor] = useState<[number, number, number] | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const extractColors = async () => {
      if (!imageUrl) return

      const colorThief = new ColorThief()
      const img = new Image()
      img.crossOrigin = 'Anonymous'

      img.addEventListener('load', function() {
        try {
          // Get dominant color
          const dominant = colorThief.getColor(img)
          setDominantColor(dominant)

          // Get palette
          const extractedPalette = colorThief.getPalette(img, 5)
          setPalette(extractedPalette)
        } catch (error) {
          console.error('Error extracting colors:', error)
        } finally {
          setLoading(false)
        }
      })

      img.addEventListener('error', function() {
        console.error('Error loading image for color extraction')
        setLoading(false)
      })

      // Load image
      img.src = imageUrl
    }

    extractColors()
  }, [imageUrl])

  const rgbToHex = (r: number, g: number, b: number) => {
    return '#' + [r, g, b].map(x => {
      const hex = x.toString(16)
      return hex.length === 1 ? '0' + hex : hex
    }).join('')
  }

  const rgbToString = (rgb: [number, number, number]) => {
    return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`
  }

  if (loading) {
    return (
      <div className={`flex gap-2 ${className}`}>
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="w-12 h-12 rounded-lg bg-gray-200 animate-pulse"
          />
        ))}
      </div>
    )
  }

  if (!palette.length) return null

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center gap-4">
        <h3 className="text-sm font-medium text-gray-700">Paleta de Colores</h3>
        {dominantColor && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>Dominante:</span>
            <div
              className="w-6 h-6 rounded-full border border-gray-300"
              style={{ backgroundColor: rgbToString(dominantColor) }}
            />
            <span>{rgbToHex(...dominantColor)}</span>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        {palette.map((color, index) => (
          <div
            key={index}
            className="group relative"
          >
            <div
              className="w-14 h-14 rounded-lg shadow-sm border border-gray-200 transition-transform hover:scale-110 cursor-pointer"
              style={{ backgroundColor: rgbToString(color) }}
              onClick={() => {
                // Copy color to clipboard
                navigator.clipboard.writeText(rgbToHex(...color))
              }}
            />
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              {rgbToHex(...color)}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-sage-100/20 rounded-lg">
        <p className="text-xs text-gray-600">
          Haz clic en cualquier color para copiarlo al portapapeles
        </p>
      </div>
    </div>
  )
}