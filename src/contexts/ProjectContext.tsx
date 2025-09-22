'use client'

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { toast } from 'sonner'

// Types
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

interface ProjectContextType {
  // State
  project: Project | null
  selectedBaseImage: BaseImage | null
  variants: Variant[]
  loadingVariants: boolean
  selectedVariant: string | null

  // Actions
  setProject: (project: Project | null) => void
  setSelectedBaseImage: (image: BaseImage | null) => void
  setVariants: (variants: Variant[]) => void
  addVariant: (variant: Variant) => void
  updateVariant: (id: string, updates: Partial<Variant>) => void
  setSelectedVariant: (id: string | null) => void
  fetchVariants: (baseImageId: string) => Promise<Variant[]>

  // Image management
  addImage: (image: BaseImage) => void
  removeImage: (imageId: string) => void
  updateProjectName: (name: string) => void
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined)

export function ProjectProvider({ children, projectId }: { children: ReactNode; projectId: string }) {
  const [project, setProject] = useState<Project | null>(null)
  const [selectedBaseImage, setSelectedBaseImage] = useState<BaseImage | null>(null)
  const [variants, setVariants] = useState<Variant[]>([])
  const [loadingVariants, setLoadingVariants] = useState(false)
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null)

  // Fetch variants for a base image
  const fetchVariants = useCallback(async (baseImageId: string): Promise<Variant[]> => {
    try {
      setLoadingVariants(true)
      const response = await fetch(`/api/base-images/${baseImageId}/variants`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al cargar variantes')
      }

      const transformations = data.transformations || []
      setVariants(transformations)
      return transformations
    } catch (error) {
      console.error('Error fetching variants:', error)
      toast.error('Error al cargar variantes')
      return []
    } finally {
      setLoadingVariants(false)
    }
  }, [])

  // Add a new variant to the list
  const addVariant = useCallback((variant: Variant) => {
    setVariants(prev => [variant, ...prev])
  }, [])

  // Update a variant
  const updateVariant = useCallback((id: string, updates: Partial<Variant>) => {
    setVariants(prev => prev.map(v =>
      v.id === id ? { ...v, ...updates } : v
    ))
  }, [])

  // Add image to project
  const addImage = useCallback((image: BaseImage) => {
    setProject(prev => prev ? {
      ...prev,
      images: [...(prev.images || []), image]
    } : null)
  }, [])

  // Remove image from project
  const removeImage = useCallback((imageId: string) => {
    setProject(prev => prev ? {
      ...prev,
      images: prev.images.filter(img => img.id !== imageId)
    } : null)

    // If the removed image was selected, select another
    if (selectedBaseImage?.id === imageId) {
      const remainingImages = project?.images.filter(img => img.id !== imageId)
      setSelectedBaseImage(remainingImages?.[0] || null)
    }
  }, [selectedBaseImage, project])

  // Update project name
  const updateProjectName = useCallback((name: string) => {
    setProject(prev => prev ? { ...prev, name } : null)
  }, [])

  const value: ProjectContextType = {
    project,
    selectedBaseImage,
    variants,
    loadingVariants,
    selectedVariant,
    setProject,
    setSelectedBaseImage,
    setVariants,
    addVariant,
    updateVariant,
    setSelectedVariant,
    fetchVariants,
    addImage,
    removeImage,
    updateProjectName
  }

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  )
}

export function useProject() {
  const context = useContext(ProjectContext)
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider')
  }
  return context
}