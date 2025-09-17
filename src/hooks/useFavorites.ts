'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { FavoriteItem, UseFavoritesReturn } from '@/types/sharing'

export function useFavorites(projectId: string): UseFavoritesReturn {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const supabase = createClient()

  // Load favorites for the project
  const loadFavorites = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        setFavorites([])
        return
      }

      const { data: favoritesData, error: favoritesError } = await supabase
        .from('project_favorites')
        .select(`
          id,
          item_id,
          item_type,
          position,
          transformations:item_id (
            id,
            result_image_url,
            custom_instructions,
            metadata
          ),
          moodboards:item_id (
            id,
            name,
            description,
            images_count
          ),
          images:item_id (
            id,
            url,
            name,
            thumbnail_url
          )
        `)
        .eq('project_id', projectId)
        .eq('user_id', user.id)
        .order('position', { ascending: true })

      if (favoritesError) {
        throw new Error(favoritesError.message)
      }

      // Transform the data into FavoriteItem format
      const items: FavoriteItem[] = (favoritesData || []).map(fav => {
        let title = 'Item'
        let thumbnailUrl = ''
        let metadata = {}

        if (fav.item_type === 'transformation' && fav.transformations) {
          const t = Array.isArray(fav.transformations) ? fav.transformations[0] : fav.transformations
          title = t.custom_instructions || 'Transformación'
          thumbnailUrl = t.result_image_url || ''
          metadata = t.metadata || {}
        } else if (fav.item_type === 'moodboard' && fav.moodboards) {
          const m = Array.isArray(fav.moodboards) ? fav.moodboards[0] : fav.moodboards
          title = m.name || 'Moodboard'
          thumbnailUrl = '' // Would need to get first image from moodboard
          metadata = { description: m.description, images_count: m.images_count }
        } else if (fav.item_type === 'image' && fav.images) {
          const i = Array.isArray(fav.images) ? fav.images[0] : fav.images
          title = i.name || 'Imagen'
          thumbnailUrl = i.thumbnail_url || i.url || ''
        }

        return {
          id: fav.item_id,
          type: fav.item_type as 'transformation' | 'moodboard' | 'image',
          title,
          thumbnailUrl,
          metadata,
          position: fav.position || 0
        }
      })

      setFavorites(items)
    } catch (err) {
      console.error('Error loading favorites:', err)
      setError(err instanceof Error ? err.message : 'Failed to load favorites')
    } finally {
      setIsLoading(false)
    }
  }, [projectId, supabase])

  // Add item to favorites
  const addFavorite = useCallback(async (item: Omit<FavoriteItem, 'position'>) => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        throw new Error('User must be authenticated')
      }

      // Get the next position
      const nextPosition = favorites.length

      const { error } = await supabase
        .from('project_favorites')
        .insert({
          project_id: projectId,
          user_id: user.id,
          item_id: item.id,
          item_type: item.type,
          position: nextPosition
        })

      if (error) {
        throw new Error(error.message)
      }

      // Add to local state
      const newItem: FavoriteItem = {
        ...item,
        position: nextPosition
      }
      setFavorites(prev => [...prev, newItem])

    } catch (err) {
      console.error('Error adding favorite:', err)
      setError(err instanceof Error ? err.message : 'Failed to add favorite')
      throw err
    }
  }, [projectId, favorites.length, supabase])

  // Remove item from favorites
  const removeFavorite = useCallback(async (itemId: string, itemType: string) => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        throw new Error('User must be authenticated')
      }

      const { error } = await supabase
        .from('project_favorites')
        .delete()
        .eq('project_id', projectId)
        .eq('user_id', user.id)
        .eq('item_id', itemId)
        .eq('item_type', itemType)

      if (error) {
        throw new Error(error.message)
      }

      // Remove from local state and reorder positions
      setFavorites(prev => {
        const filtered = prev.filter(item => item.id !== itemId || item.type !== itemType)
        return filtered.map((item, index) => ({ ...item, position: index }))
      })

    } catch (err) {
      console.error('Error removing favorite:', err)
      setError(err instanceof Error ? err.message : 'Failed to remove favorite')
      throw err
    }
  }, [projectId, supabase])

  // Reorder favorites
  const reorderFavorites = useCallback(async (reorderedItems: FavoriteItem[]) => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        throw new Error('User must be authenticated')
      }

      // Update positions in database
      const updates = reorderedItems.map((item, index) => ({
        project_id: projectId,
        user_id: user.id,
        item_id: item.id,
        item_type: item.type,
        position: index
      }))

      // Delete all current favorites for this project
      await supabase
        .from('project_favorites')
        .delete()
        .eq('project_id', projectId)
        .eq('user_id', user.id)

      // Insert with new positions
      const { error } = await supabase
        .from('project_favorites')
        .insert(updates)

      if (error) {
        throw new Error(error.message)
      }

      // Update local state
      setFavorites(reorderedItems.map((item, index) => ({ ...item, position: index })))

    } catch (err) {
      console.error('Error reordering favorites:', err)
      setError(err instanceof Error ? err.message : 'Failed to reorder favorites')
      throw err
    }
  }, [projectId, supabase])

  // Clear all favorites
  const clearFavorites = useCallback(async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        throw new Error('User must be authenticated')
      }

      const { error } = await supabase
        .from('project_favorites')
        .delete()
        .eq('project_id', projectId)
        .eq('user_id', user.id)

      if (error) {
        throw new Error(error.message)
      }

      setFavorites([])

    } catch (err) {
      console.error('Error clearing favorites:', err)
      setError(err instanceof Error ? err.message : 'Failed to clear favorites')
      throw err
    }
  }, [projectId, supabase])

  // Load favorites on mount and when projectId changes
  useEffect(() => {
    if (projectId) {
      loadFavorites()
    }
  }, [projectId, loadFavorites])

  return {
    favorites,
    isLoading,
    error,
    addFavorite,
    removeFavorite,
    reorderFavorites,
    clearFavorites
  }
}