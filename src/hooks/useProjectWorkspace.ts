import { useState, useCallback, useEffect } from 'react'
import { toast } from 'sonner'

interface BaseImage {
  id: string
  name: string | null
  url: string
  upload_order: number | null
  created_at: string
}

interface Project {
  id: string
  name: string
  description: string | null
  status: 'active' | 'completed' | 'archived'
  total_transformations: number
  images: BaseImage[]
}

interface Variant {
  id: string
  result_image_url: string | null
  is_favorite: boolean
  created_at: string
  tokens_consumed: number
  status: 'pending' | 'processing' | 'completed' | 'failed'
  style: { id: string; name: string; code: string; category: string; macrocategory: string } | null
  room_type: { name: string } | null
  color_palette: { name: string; hex_colors: string[] } | null
  metadata?: any
}

export function useProjectWorkspace(projectId: string) {
  // Core state
  const [project, setProject] = useState<Project | null>(null)
  const [selectedBaseImage, setSelectedBaseImage] = useState<BaseImage | null>(null)
  const [variants, setVariants] = useState<Variant[]>([])

  // UI state
  const [loading, setLoading] = useState(true)
  const [loadingVariants, setLoadingVariants] = useState(false)
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null)

  // Generation state - ISOLATED
  const [generating, setGenerating] = useState(false)
  const [generationComplete, setGenerationComplete] = useState(false)
  const [lastGeneratedVariant, setLastGeneratedVariant] = useState<Variant | null>(null)

  // Fetch project data once
  useEffect(() => {
    let mounted = true

    const fetchProject = async () => {
      try {
        const response = await fetch(`/api/projects/${projectId}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Error al cargar proyecto')
        }

        if (mounted) {
          setProject(data.project)
          if (data.project.images?.length > 0 && !selectedBaseImage) {
            setSelectedBaseImage(data.project.images[0])
          }
        }
      } catch (error) {
        console.error('Error fetching project:', error)
        toast.error('Error al cargar proyecto')
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    fetchProject()

    return () => {
      mounted = false
    }
  }, [projectId]) // Only depend on projectId, not selectedBaseImage

  // Fetch variants when base image changes
  useEffect(() => {
    if (!selectedBaseImage) return

    let mounted = true

    const fetchVariants = async () => {
      try {
        setLoadingVariants(true)
        const response = await fetch(`/api/base-images/${selectedBaseImage.id}/variants`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Error al cargar variantes')
        }

        if (mounted) {
          setVariants(data.transformations || [])
        }
      } catch (error) {
        console.error('Error fetching variants:', error)
        toast.error('Error al cargar variantes')
      } finally {
        if (mounted) {
          setLoadingVariants(false)
        }
      }
    }

    fetchVariants()

    return () => {
      mounted = false
    }
  }, [selectedBaseImage?.id])

  // Add image locally
  const addImage = useCallback((image: BaseImage) => {
    setProject(prev => prev ? {
      ...prev,
      images: [...(prev.images || []), image]
    } : null)
  }, [])

  // Remove image locally
  const removeImage = useCallback((imageId: string) => {
    setProject(prev => prev ? {
      ...prev,
      images: prev.images.filter(img => img.id !== imageId)
    } : null)

    if (selectedBaseImage?.id === imageId) {
      const remainingImages = project?.images.filter(img => img.id !== imageId)
      setSelectedBaseImage(remainingImages?.[0] || null)
    }
  }, [selectedBaseImage, project])

  // Add variant locally (for generation)
  const addVariant = useCallback((variant: Variant) => {
    setVariants(prev => [variant, ...prev])
    setLastGeneratedVariant(variant)
    setSelectedVariant(variant.id)
  }, [])

  // Update variant locally
  const updateVariant = useCallback((id: string, updates: Partial<Variant>) => {
    setVariants(prev => prev.map(v =>
      v.id === id ? { ...v, ...updates } : v
    ))
  }, [])

  // Reset generation state
  const resetGenerationState = useCallback(() => {
    setGenerating(false)
    setGenerationComplete(false)
    setLastGeneratedVariant(null)
  }, [])

  return {
    // Core data
    project,
    selectedBaseImage,
    variants,

    // UI state
    loading,
    loadingVariants,
    selectedVariant,

    // Generation state (isolated)
    generating,
    generationComplete,
    lastGeneratedVariant,

    // Setters
    setProject,
    setSelectedBaseImage,
    setSelectedVariant,
    setGenerating,
    setGenerationComplete,

    // Actions
    addImage,
    removeImage,
    addVariant,
    updateVariant,
    resetGenerationState
  }
}