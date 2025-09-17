'use client'

import { useState, useCallback } from 'react'
import { Heart, Share2, X, GripVertical, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useFavorites } from '@/hooks/useFavorites'
import { FavoriteButton } from './FavoriteButton'
import type { FavoriteItem } from '@/types/sharing'

interface FavoritesWidgetProps {
  projectId: string
  onShare?: (selectedItems: FavoriteItem[]) => void
  className?: string
  isCollapsed?: boolean
  onToggleCollapse?: () => void
}

export function FavoritesWidget({
  projectId,
  onShare,
  className,
  isCollapsed = false,
  onToggleCollapse
}: FavoritesWidgetProps) {
  const {
    favorites,
    isLoading,
    error,
    addFavorite,
    removeFavorite,
    reorderFavorites,
    clearFavorites
  } = useFavorites(projectId)

  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [draggedItem, setDraggedItem] = useState<number | null>(null)

  // Handle item selection
  const toggleItemSelection = useCallback((itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }, [])

  // Handle adding/removing favorites
  const handleToggleFavorite = useCallback(async (item: Omit<FavoriteItem, 'position'>) => {
    const existingFavorite = favorites.find(fav => fav.id === item.id && fav.type === item.type)
    
    if (existingFavorite) {
      await removeFavorite(item.id, item.type)
      setSelectedItems(prev => prev.filter(id => id !== item.id))
    } else {
      await addFavorite(item)
    }
  }, [favorites, addFavorite, removeFavorite])

  // Handle drag and drop reordering
  const handleDragStart = useCallback((e: React.DragEvent, index: number) => {
    setDraggedItem(index)
    e.dataTransfer.effectAllowed = 'move'
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }, [])

  const handleDrop = useCallback((e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    
    if (draggedItem === null || draggedItem === dropIndex) {
      setDraggedItem(null)
      return
    }

    const newFavorites = [...favorites]
    const draggedItemData = newFavorites[draggedItem]
    
    // Remove the dragged item
    newFavorites.splice(draggedItem, 1)
    
    // Insert at new position
    newFavorites.splice(dropIndex, 0, draggedItemData)
    
    // Update positions and reorder
    reorderFavorites(newFavorites)
    setDraggedItem(null)
  }, [draggedItem, favorites, reorderFavorites])

  // Handle share action
  const handleShare = useCallback(() => {
    const itemsToShare = favorites.filter(item => selectedItems.includes(item.id))
    onShare?.(itemsToShare)
  }, [favorites, selectedItems, onShare])

  // Get selected items count
  const selectedCount = selectedItems.length

  if (isCollapsed) {
    return (
      <Card className={cn('fixed right-4 top-1/2 -translate-y-1/2 w-16 z-40', className)}>
        <CardContent className="p-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
            className="w-full h-12 relative"
          >
            <Heart size={20} className="text-red-500" />
            {favorites.length > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 w-5 text-xs p-0 flex items-center justify-center"
              >
                {favorites.length}
              </Badge>
            )}
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn('fixed right-4 top-1/2 -translate-y-1/2 w-80 max-h-[70vh] z-40', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Heart size={20} className="text-red-500" />
            Favoritos
            {favorites.length > 0 && (
              <Badge variant="secondary">{favorites.length}</Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-1">
            {favorites.length > 0 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={clearFavorites}
                className="h-8 w-8 text-gray-500 hover:text-red-500"
                title="Limpiar favoritos"
              >
                <Trash2 size={14} />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleCollapse}
              className="h-8 w-8"
            >
              <X size={16} />
            </Button>
          </div>
        </div>
        
        {selectedCount > 0 && (
          <div className="flex items-center justify-between pt-2 border-t">
            <span className="text-sm text-muted-foreground">
              {selectedCount} seleccionado{selectedCount > 1 ? 's' : ''}
            </span>
            <Button
              size="sm"
              onClick={handleShare}
              className="gap-2"
            >
              <Share2 size={14} />
              Compartir
            </Button>
          </div>
        )}
      </CardHeader>

      <CardContent className="p-3 pt-0">
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
          </div>
        )}

        {error && (
          <div className="text-sm text-red-500 text-center py-4">
            {error}
          </div>
        )}

        {!isLoading && !error && favorites.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Heart size={32} className="mx-auto mb-3 opacity-50" />
            <p className="text-sm">No hay favoritos aún</p>
            <p className="text-xs mt-1">
              Haz clic en el corazón para añadir elementos
            </p>
          </div>
        )}

        {!isLoading && !error && favorites.length > 0 && (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {favorites.map((item, index) => (
              <div
                key={`${item.type}-${item.id}`}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
                className={cn(
                  'group relative flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 cursor-move transition-colors',
                  draggedItem === index && 'opacity-50',
                  selectedItems.includes(item.id) && 'ring-2 ring-primary bg-accent'
                )}
              >
                {/* Drag handle */}
                <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <GripVertical size={14} className="text-muted-foreground" />
                </div>

                {/* Thumbnail */}
                <div className="flex-shrink-0 w-12 h-12 rounded-md bg-muted overflow-hidden">
                  {item.thumbnailUrl ? (
                    <img
                      src={item.thumbnailUrl}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                      <span className="text-xs text-gray-500">
                        {item.type === 'transformation' ? 'T' : 
                         item.type === 'moodboard' ? 'M' : 'I'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium truncate">
                    {item.title}
                  </h4>
                  <p className="text-xs text-muted-foreground capitalize">
                    {item.type === 'transformation' ? 'Transformación' : 
                     item.type === 'moodboard' ? 'Moodboard' : 'Imagen'}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  {/* Selection checkbox */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleItemSelection(item.id)}
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <div className={cn(
                      'w-4 h-4 rounded border-2 flex items-center justify-center',
                      selectedItems.includes(item.id) 
                        ? 'bg-primary border-primary text-primary-foreground'
                        : 'border-gray-300'
                    )}>
                      {selectedItems.includes(item.id) && (
                        <Plus size={10} className="rotate-45" />
                      )}
                    </div>
                  </Button>

                  {/* Remove from favorites */}
                  <FavoriteButton
                    itemId={item.id}
                    itemType={item.type}
                    title={item.title}
                    thumbnailUrl={item.thumbnailUrl}
                    metadata={item.metadata}
                    isFavorited={true}
                    onToggle={handleToggleFavorite}
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}