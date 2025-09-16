'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Filter,
  Heart,
  Calendar,
  Palette,
  Home,
  Download,
  X,
  RefreshCw
} from 'lucide-react'
import { VariantCard } from './VariantCard'
import { Lightbox } from '@/components/gallery/Lightbox'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface Variant {
  id: string
  processed_image_url: string | null
  is_favorite: boolean
  created_at: string
  tokens_consumed: number
  status: 'pending' | 'processing' | 'completed' | 'failed'
  style: {
    id: string
    name: string
    code: string
  }
  room_type: {
    id: string
    name: string
    code: string
  } | null
  color_scheme: {
    id: string
    name: string
    code: string
    hex_colors: string[]
  } | null
}

interface VariantGalleryProps {
  variants: Variant[]
  loading?: boolean
  onToggleFavorite?: (variantId: string) => void
  originalImage?: string // Base image URL for comparison
  onRefresh?: () => void
}

type FilterType = 'all' | 'favorites' | 'style' | 'room_type' | 'date'
type SortType = 'newest' | 'oldest' | 'tokens_asc' | 'tokens_desc'

export function VariantGallery({ variants, loading = false, onToggleFavorite, originalImage, onRefresh }: VariantGalleryProps) {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')
  const [styleFilter, setStyleFilter] = useState<string>('all')
  const [roomTypeFilter, setRoomTypeFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<SortType>('newest')
  const [lightboxIndex, setLightboxIndex] = useState<number>(-1)

  // Get unique styles and room types for filters
  const { uniqueStyles, uniqueRoomTypes } = useMemo(() => {
    const styles = new Set<string>()
    const roomTypes = new Set<string>()
    
    variants.forEach(variant => {
      if (variant.style?.name) styles.add(variant.style.name)
      if (variant.room_type?.name) roomTypes.add(variant.room_type.name)
    })
    
    return {
      uniqueStyles: Array.from(styles).sort(),
      uniqueRoomTypes: Array.from(roomTypes).sort()
    }
  }, [variants])

  // Filter and sort variants
  const filteredAndSortedVariants = useMemo(() => {
    let filtered = variants.filter(variant => {
      // Only show completed variants
      if (variant.status !== 'completed' || !variant.processed_image_url) return false
      
      // Apply filters
      switch (activeFilter) {
        case 'favorites':
          return variant.is_favorite
        case 'style':
          return styleFilter && styleFilter !== 'all' ? variant.style?.name === styleFilter : true
        case 'room_type':
          return roomTypeFilter && roomTypeFilter !== 'all' ? variant.room_type?.name === roomTypeFilter : true
        default:
          return true
      }
    })

    // Apply additional style filter if not using style as main filter
    if (activeFilter !== 'style' && styleFilter && styleFilter !== 'all') {
      filtered = filtered.filter(variant => variant.style?.name === styleFilter)
    }

    // Apply additional room type filter if not using room_type as main filter
    if (activeFilter !== 'room_type' && roomTypeFilter && roomTypeFilter !== 'all') {
      filtered = filtered.filter(variant => variant.room_type?.name === roomTypeFilter)
    }

    // Sort results
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        case 'tokens_asc':
          return a.tokens_consumed - b.tokens_consumed
        case 'tokens_desc':
          return b.tokens_consumed - a.tokens_consumed
        case 'newest':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }
    })

    return filtered
  }, [variants, activeFilter, styleFilter, roomTypeFilter, sortBy])

  // Also include processing variants for display
  const processingVariants = variants.filter(v => 
    v.status === 'processing' || v.status === 'pending' || v.status === 'failed'
  )

  const allDisplayVariants = [...processingVariants, ...filteredAndSortedVariants]

  const handleDownloadImage = async (imageUrl: string, styleName?: string) => {
    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const timestamp = new Date().getTime()
      const style = styleName?.toLowerCase().replace(/\s+/g, '-') || 'staged'
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

  const clearFilters = () => {
    setActiveFilter('all')
    setStyleFilter('all')
    setRoomTypeFilter('all')
    setSortBy('newest')
  }

  const hasActiveFilters = activeFilter !== 'all' || (styleFilter && styleFilter !== 'all') || (roomTypeFilter && roomTypeFilter !== 'all') || sortBy !== 'newest'

  if (allDisplayVariants.length === 0 && !loading) {
    return (
      <div className="h-full flex items-center justify-center text-center p-8">
        <div>
          <Filter className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold mb-2">
            {hasActiveFilters ? 'No se encontraron resultados' : 'No hay diseños generados'}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {hasActiveFilters 
              ? 'Prueba ajustando los filtros para ver más resultados'
              : 'Genera tu primer diseño seleccionando un estilo y haciendo clic en "Generar Diseño"'
            }
          </p>
          {hasActiveFilters && (
            <Button variant="outline" onClick={clearFilters}>
              Limpiar filtros
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Filters Header */}
      <div className="p-4 border-b bg-background">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">
            Diseños Generados ({filteredAndSortedVariants.length})
          </h2>

          <div className="flex items-center gap-2">
            {onRefresh && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                disabled={loading}
                className="flex items-center gap-2"
              >
                <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
                Actualizar
              </Button>
            )}
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4 mr-1" />
                Limpiar filtros
              </Button>
            )}
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Filters */}
          <Button
            variant={activeFilter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveFilter('all')}
          >
            Todos
          </Button>
          
          <Button
            variant={activeFilter === 'favorites' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveFilter('favorites')}
            className="gap-1"
          >
            <Heart className="h-3 w-3" />
            Favoritos
            {variants.filter(v => v.is_favorite && v.status === 'completed').length > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs">
                {variants.filter(v => v.is_favorite && v.status === 'completed').length}
              </Badge>
            )}
          </Button>

          {/* Style Filter */}
          <Select value={styleFilter} onValueChange={setStyleFilter}>
            <SelectTrigger className="w-[150px] h-8">
              <div className="flex items-center gap-1">
                <Palette className="h-3 w-3" />
                <SelectValue placeholder="Estilo" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estilos</SelectItem>
              {uniqueStyles.map((style) => (
                <SelectItem key={style} value={style}>
                  {style}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Room Type Filter */}
          <Select value={roomTypeFilter} onValueChange={setRoomTypeFilter}>
            <SelectTrigger className="w-[150px] h-8">
              <div className="flex items-center gap-1">
                <Home className="h-3 w-3" />
                <SelectValue placeholder="Habitación" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las habitaciones</SelectItem>
              {uniqueRoomTypes.map((roomType) => (
                <SelectItem key={roomType} value={roomType}>
                  {roomType}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Sort */}
          <Select value={sortBy} onValueChange={(value: SortType) => setSortBy(value)}>
            <SelectTrigger className="w-[130px] h-8">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <SelectValue />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Más recientes</SelectItem>
              <SelectItem value="oldest">Más antiguos</SelectItem>
              <SelectItem value="tokens_asc">Menos tokens</SelectItem>
              <SelectItem value="tokens_desc">Más tokens</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Gallery Grid */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {allDisplayVariants.map((variant, index) => (
              <VariantCard
                key={variant.id}
                variant={variant}
                onView={() => {
                  // Find the index in completed variants for lightbox
                  const completedIndex = filteredAndSortedVariants.findIndex(v => v.id === variant.id)
                  if (completedIndex >= 0) {
                    setLightboxIndex(completedIndex)
                  }
                }}
                onDownload={() => {
                  if (variant.processed_image_url) {
                    handleDownloadImage(variant.processed_image_url, variant.style?.name)
                  }
                }}
                onToggleFavorite={onToggleFavorite ? () => onToggleFavorite(variant.id) : undefined}
                isLoading={loading}
              />
            ))}
          </div>
        </div>
      </ScrollArea>

      {/* Lightbox */}
      <Lightbox
        isOpen={lightboxIndex >= 0}
        onClose={() => setLightboxIndex(-1)}
        images={filteredAndSortedVariants}
        initialIndex={Math.max(0, lightboxIndex)}
        onToggleFavorite={onToggleFavorite}
        originalImage={originalImage}
      />
    </div>
  )
}