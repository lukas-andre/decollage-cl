'use client'

import { use, useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  ArrowLeft,
  Plus,
  Sparkles,
  Image as ImageIcon,
  Loader2,
  Download,
  Heart,
  Eye,
  Grid3x3,
  ChevronDown,
  ChevronRight,
  FolderOpen,
  AlertCircle,
  Edit2,
  Check,
  X,
  Upload,
  Info,
  Ruler,
  RefreshCw,
  Armchair,
  Trash2,
  Zap,
  Palette
} from 'lucide-react'
import { ImageViewerModal } from '@/components/projects/ImageViewerModal'
import Link from 'next/link'
import { toast } from 'sonner'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { useTokenBalance } from '@/hooks/useTokenBalance'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { UploadProgress } from '@/components/projects/UploadProgress'
import { ImageUploadSkeleton, ImagePreviewSkeleton } from '@/components/projects/ImageUploadSkeleton'
import { NoTokensDialog } from '@/components/tokens/NoTokensDialog'
import { VariantGallery } from '@/components/projects/VariantGallery'
import { FavoriteButton } from '@/components/project/FavoriteButton'
import { SelectionSummary } from '@/components/project/SelectionSummary'
import { Share2 } from 'lucide-react'

interface BaseImage {
  id: string
  name: string | null
  url: string
  upload_order: number | null
  created_at: string
  transformations?: Array<{
    id: string
    status: string
  }>
}

interface Project {
  id: string
  name: string
  description: string | null
  status: 'active' | 'completed' | 'archived'
  total_transformations: number
  created_at: string
  updated_at: string
  images: BaseImage[]
}

interface Variant {
  id: string
  result_image_url: string | null
  is_favorite: boolean
  created_at: string
  tokens_consumed: number
  status: 'pending' | 'processing' | 'completed' | 'failed'
  style: {
    id: string
    name: string
    code: string
    category?: string
    macrocategory?: string
  } | null
  room_type?: {
    id: string
    name: string
    code: string
  } | null
  color_palette?: {
    id: string
    name: string
    code: string
    hex_colors: string[]
  } | null
  metadata?: {
    style_name?: string
    style_category?: string
    style_macrocategory?: string
    furniture_mode?: string
    room_type_name?: string
    color_palette_name?: string
    provider?: string
    cloudflare_variants?: {
      gallery?: string
      preview?: string
      thumbnail?: string
    }
    [key: string]: any
  }
}

interface DesignData {
  styles: Array<{
    id: string
    name: string
    code: string
    macrocategory?: string | null
    token_cost: number
  }>
  roomTypes: Array<{
    id: string
    name: string
    code: string
  }>
  colorSchemes: Array<{
    id: string
    name: string
    code: string
    hex_colors: string[]
  }>
}

export default function ProjectWorkspacePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedBaseImage, setSelectedBaseImage] = useState<BaseImage | null>(null)
  const [variants, setVariants] = useState<Variant[]>([])
  const [loadingVariants, setLoadingVariants] = useState(false)
  const [designData, setDesignData] = useState<DesignData | null>(null)
  const [generating, setGenerating] = useState(false)
  const [allProjects, setAllProjects] = useState<Array<{id: string, name: string}>>([])
  const [editingName, setEditingName] = useState(false)
  const [projectName, setProjectName] = useState('')
  const [uploading, setUploading] = useState(false)
  // Selection state for sharing
  const [selectedVariants, setSelectedVariants] = useState<Set<string>>(new Set())
  const [showSelection, setShowSelection] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStatus, setUploadStatus] = useState<'selecting' | 'validating' | 'compressing' | 'uploading' | 'processing' | 'complete' | 'error'>('selecting')
  const [uploadError, setUploadError] = useState<string | null>(null)
  const nameInputRef = useRef<HTMLInputElement>(null)
  const [viewerModal, setViewerModal] = useState<{
    isOpen: boolean
    variant?: Variant
  }>({ isOpen: false })
  const [showNoTokensDialog, setShowNoTokensDialog] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean
    imageId?: string
    imageName?: string
  }>({ isOpen: false })
  
  // Generation form state
  const [selectedStyle, setSelectedStyle] = useState('')
  const [selectedRoomType, setSelectedRoomType] = useState('')
  const [selectedColorScheme, setSelectedColorScheme] = useState('')
  const [selectedFurnitureMode, setSelectedFurnitureMode] = useState('replace_all')
  const [customPrompt, setCustomPrompt] = useState('')
  const [roomWidth, setRoomWidth] = useState('')
  const [roomHeight, setRoomHeight] = useState('')
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false)
  const [selectedMacroCategory, setSelectedMacroCategory] = useState('')

  const router = useRouter()
  const { available: tokenBalance, hasTokens, isLow, deduct: deductTokens } = useTokenBalance()

  useEffect(() => {
    fetchProject()
    fetchDesignData()
    fetchAllProjects()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  useEffect(() => {
    if (selectedBaseImage) {
      fetchVariants(selectedBaseImage.id)
      // Reset generation form when switching base images
      setSelectedStyle('')
      setSelectedRoomType('')
      setSelectedColorScheme('')
      setSelectedFurnitureMode('replace_all')
    }
  }, [selectedBaseImage])

  const fetchProject = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/projects/${id}`)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Error al cargar proyecto')
      }

      setProject(data.project)
      setProjectName(data.project.name)
      
      // Auto-select first image if available
      if (data.project.images?.length > 0 && !selectedBaseImage) {
        setSelectedBaseImage(data.project.images[0])
      }
    } catch (error) {
      console.error('Error fetching project:', error)
      toast.error('Error al cargar proyecto')
    } finally {
      setLoading(false)
    }
  }, [id, selectedBaseImage])

  const fetchDesignData = async () => {
    try {
      const response = await fetch('/api/design-data')
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Error al cargar datos de diseño')
      }

      setDesignData(data)
    } catch (error) {
      console.error('Error fetching design data:', error)
      toast.error('Error al cargar opciones de diseño')
    }
  }

  const fetchAllProjects = async () => {
    try {
      const response = await fetch('/api/projects?status=active')
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Error al cargar proyectos')
      }

      setAllProjects(data.projects?.map((p: { id: string; name: string }) => ({
        id: p.id,
        name: p.name
      })) || [])
    } catch (error) {
      console.error('Error fetching all projects:', error)
    }
  }

  // Computed filtered styles based on selected macrocategory
  const filteredStyles = designData?.styles?.filter(style => {
    if (!selectedMacroCategory || selectedMacroCategory === 'all') {
      return true
    }
    return style.macrocategory === selectedMacroCategory
  }) || []

  // Get unique macrocategories from available styles
  const availableMacroCategories = Array.from(
    new Set(designData?.styles?.map(style => style.macrocategory).filter((cat): cat is string => Boolean(cat)))
  ).sort()

  // Reset selected style when macrocategory filter changes if current style is not in filtered list
  useEffect(() => {
    if (selectedStyle && filteredStyles.length > 0) {
      const styleExists = filteredStyles.some(style => style.id === selectedStyle)
      if (!styleExists) {
        setSelectedStyle('')
      }
    }
  }, [selectedMacroCategory, filteredStyles, selectedStyle])

  const fetchVariants = async (baseImageId: string) => {
    try {
      setLoadingVariants(true)
      const response = await fetch(`/api/base-images/${baseImageId}/variants`)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Error al cargar variantes')
      }

      setVariants(data.transformations || [])
      return data.transformations || []
    } catch (error) {
      console.error('Error fetching variants:', error)
      toast.error('Error al cargar variantes')
      return []
    } finally {
      setLoadingVariants(false)
    }
  }

  const handleDeleteImage = async (imageId: string) => {
    try {
      const response = await fetch(`/api/images/${imageId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Error al eliminar imagen')
      }

      // Remove the image from the project state
      if (project) {
        const updatedImages = project.images.filter(img => img.id !== imageId)
        setProject({ ...project, images: updatedImages })

        // If the deleted image was selected, select the first remaining image or clear selection
        if (selectedBaseImage?.id === imageId) {
          setSelectedBaseImage(updatedImages.length > 0 ? updatedImages[0] : null)
          setVariants([])
        }
      }

      toast.success('Imagen eliminada correctamente')
    } catch (error) {
      console.error('Error deleting image:', error)
      toast.error(error instanceof Error ? error.message : 'Error al eliminar imagen')
    } finally {
      setDeleteDialog({ isOpen: false })
    }
  }

  const handleImageUpload = async (file: File) => {
    if (!project) return

    setUploading(true)
    setUploadProgress(0)
    setUploadError(null)
    setUploadStatus('validating')

    try {
      // Validation phase
      const maxSize = 10 * 1024 * 1024 // 10MB
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
      
      if (file.size > maxSize) {
        throw new Error('La imagen es muy grande. Máximo 10MB permitido.')
      }
      
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Formato no soportado. Usa JPG, PNG o WebP.')
      }

      setUploadProgress(10)
      
      // Compression check (simulated)
      if (file.size > 5 * 1024 * 1024) {
        setUploadStatus('compressing')
        setUploadProgress(20)
        await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate compression time
      }

      // Upload phase
      setUploadStatus('uploading')
      setUploadProgress(30)

      const formData = new FormData()
      formData.append('file', file)
      formData.append('name', file.name)
      
      const response = await fetch(`/api/projects/${project.id}/upload-image`, {
        method: 'POST',
        body: formData
      })

      setUploadProgress(70)

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al subir imagen')
      }

      // Processing phase
      setUploadStatus('processing')
      setUploadProgress(90)
      await new Promise(resolve => setTimeout(resolve, 500)) // Brief processing simulation

      setUploadProgress(100)
      setUploadStatus('complete')

      toast.success('Imagen subida correctamente')

      // Update project state directly instead of refetching
      if (data.projectImage && project) {
        const newImage = {
          id: data.projectImage.id,
          name: data.projectImage.name,
          url: data.projectImage.url,
          upload_order: data.projectImage.upload_order,
          created_at: data.projectImage.created_at,
          transformations: []
        }

        // Add the new image to the project's images array
        const updatedProject = {
          ...project,
          images: [...(project.images || []), newImage],
          updated_at: new Date().toISOString()
        }

        setProject(updatedProject)
        setSelectedBaseImage(newImage)
      }

      // Reset upload state after 2 seconds
      setTimeout(() => {
        setUploading(false)
        setUploadProgress(0)
        setUploadStatus('selecting')
      }, 2000)

    } catch (error) {
      console.error('Error uploading image:', error)
      const errorMessage = error instanceof Error ? error.message : 'Error al subir imagen'
      setUploadError(errorMessage)
      setUploadStatus('error')
      toast.error(errorMessage)
      
      // Reset error state after 5 seconds
      setTimeout(() => {
        setUploading(false)
        setUploadProgress(0)
        setUploadStatus('selecting')
        setUploadError(null)
      }, 5000)
    }
  }

  const handleProjectNameUpdate = async () => {
    if (!project || projectName.trim() === project.name) {
      setEditingName(false)
      return
    }

    try {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: projectName.trim() })
      })

      if (!response.ok) {
        throw new Error('Error al actualizar nombre')
      }

      setProject({ ...project, name: projectName.trim() })
      toast.success('Nombre actualizado')
      setEditingName(false)
    } catch (error) {
      console.error('Error updating project name:', error)
      toast.error('Error al actualizar nombre')
      setProjectName(project.name)
      setEditingName(false)
    }
  }

  useEffect(() => {
    if (editingName && nameInputRef.current) {
      nameInputRef.current.focus()
      nameInputRef.current.select()
    }
  }, [editingName])

  // Handle share events
  useEffect(() => {
    const handleShareWholeProject = () => {
      // Clear selection storage and navigate to preview page
      localStorage.removeItem(`share-selection-${id}`)
      router.push(`/dashboard/projects/${id}/share`)
    }

    const handleQuickSelectBest = () => {
      handleSelectBest()
      toast.success('Mejores diseños seleccionados')
    }

    const handleQuickSelectFavorites = () => {
      handleSelectAllFavorites()
      toast.success('Favoritos seleccionados')
    }

    const handleQuickSelectByStyle = () => {
      // For now, just select all favorites as it's the most common use case
      handleSelectAllFavorites()
      toast.success('Diseños seleccionados por estilo')
    }

    window.addEventListener('share-whole-project', handleShareWholeProject)
    window.addEventListener('quick-select-best', handleQuickSelectBest)
    window.addEventListener('quick-select-favorites', handleQuickSelectFavorites)
    window.addEventListener('quick-select-by-style', handleQuickSelectByStyle)

    return () => {
      window.removeEventListener('share-whole-project', handleShareWholeProject)
      window.removeEventListener('quick-select-best', handleQuickSelectBest)
      window.removeEventListener('quick-select-favorites', handleQuickSelectFavorites)
      window.removeEventListener('quick-select-by-style', handleQuickSelectByStyle)
    }
  }, [id, router, variants])

  const handleViewImage = (variant: Variant) => {
    setViewerModal({ isOpen: true, variant })
  }

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

  const handleToggleFavorite = async (variantId: string) => {
    try {
      const response = await fetch(`/api/variants/${variantId}/favorite`, {
        method: 'PATCH'
      })

      if (!response.ok) {
        throw new Error('Error al actualizar favorito')
      }

      // Optimistically update the variant in the list
      setVariants(prev => prev.map(variant =>
        variant.id === variantId
          ? { ...variant, is_favorite: !variant.is_favorite }
          : variant
      ))

      const variant = variants.find(v => v.id === variantId)
      toast.success(
        variant?.is_favorite
          ? 'Removido de favoritos'
          : 'Agregado a favoritos'
      )
    } catch (error) {
      console.error('Error toggling favorite:', error)
      toast.error('Error al actualizar favorito')
    }
  }

  // Selection management functions
  const handleToggleSelection = (variantId: string) => {
    setSelectedVariants(prev => {
      const newSet = new Set(prev)
      if (newSet.has(variantId)) {
        newSet.delete(variantId)
      } else {
        newSet.add(variantId)
      }
      return newSet
    })
  }

  const handleShareSelected = () => {
    if (selectedVariants.size === 0) {
      toast.error('Selecciona al menos un diseño para compartir')
      return
    }

    const selectedItems = variants.filter(v => selectedVariants.has(v.id))
    const selectedIds = selectedItems.map(item => item.id)
    console.log('Saving to localStorage:', selectedIds)
    // Save to localStorage for preview page
    localStorage.setItem(`share-selection-${id}`, JSON.stringify(selectedIds))
    console.log('Navigating to share page...')
    // Navigate to preview page
    router.push(`/dashboard/projects/${id}/share`)
  }

  const handleShareFavorites = () => {
    const favoriteItems = variants.filter(v => v.is_favorite && v.status === 'completed')
    if (favoriteItems.length === 0) {
      toast.error('No tienes diseños marcados como favoritos')
      return
    }

    const favoriteIds = favoriteItems.map(item => item.id)
    console.log('Saving favorites to localStorage:', favoriteIds)
    // Save to localStorage for preview page
    localStorage.setItem(`share-selection-${id}`, JSON.stringify(favoriteIds))
    console.log('Navigating to share page...')
    // Navigate to preview page
    router.push(`/dashboard/projects/${id}/share`)
  }

  const handleClearSelection = () => {
    setSelectedVariants(new Set())
    setShowSelection(false)
  }


  // Quick selection modes
  const handleSelectBest = () => {
    // Select variants with highest token consumption (most complex/premium)
    const bestVariants = variants
      .filter(v => v.status === 'completed')
      .sort((a, b) => b.tokens_consumed - a.tokens_consumed)
      .slice(0, 5) // Top 5 most complex
      .map(v => v.id)

    setSelectedVariants(new Set(bestVariants))
    toast.success(`Seleccionados ${bestVariants.length} diseños premium`)
  }

  const handleSelectByStyle = (styleName: string) => {
    const styleVariants = variants
      .filter(v => v.status === 'completed' && v.style?.name === styleName)
      .map(v => v.id)

    setSelectedVariants(prev => {
      const newSet = new Set(prev)
      styleVariants.forEach(id => newSet.add(id))
      return newSet
    })

    toast.success(`Agregados ${styleVariants.length} diseños de ${styleName}`)
  }

  const handleSelectAllFavorites = () => {
    const favoriteVariants = variants
      .filter(v => v.status === 'completed' && v.is_favorite)
      .map(v => v.id)

    setSelectedVariants(new Set(favoriteVariants))
    toast.success(`Seleccionados ${favoriteVariants.length} favoritos`)
  }

  const handleGenerateVariant = async () => {
    if (!selectedBaseImage || !selectedStyle) {
      toast.error('Selecciona un estilo para generar')
      return
    }

    // Check token balance
    if (!hasTokens) {
      setShowNoTokensDialog(true)
      return
    }

    setGenerating(true)

    try {
      const response = await fetch(`/api/base-images/${selectedBaseImage.id}/generate-variant`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          style_id: selectedStyle,
          room_type_id: selectedRoomType || null,
          color_scheme_id: selectedColorScheme || null,
          furniture_mode: selectedFurnitureMode,
          custom_prompt: customPrompt || null,
          dimensions: {
            width: roomWidth ? parseFloat(roomWidth) : null,
            height: roomHeight ? parseFloat(roomHeight) : null
          },
          provider: 'gemini' // Use Gemini for state-of-the-art image generation
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al generar variante')
      }

      // Deduct tokens optimistically
      const tokenCost = filteredStyles.find(s => s.id === selectedStyle)?.token_cost || 1
      deductTokens(tokenCost)

      // If the transformation is already completed (as shown in your response), add it immediately
      if (data.transformation) {
        // Add the new transformation to the list
        setVariants(prev => [data.transformation, ...prev])

        if (data.transformation.status === 'completed') {
          toast.success('¡Diseño generado exitosamente!')
        } else {
          toast.success('Diseño en proceso de generación...')
        }
      } else {
        toast.success('Diseño enviado a generar')
        // Refresh variants to get the latest
        await fetchVariants(selectedBaseImage.id)
      }

      setGenerating(false)
    } catch (error) {
      console.error('Error generating variant:', error)
      toast.error(error instanceof Error ? error.message : 'Error al generar variante')
      setGenerating(false)
    }
  }

  // Don't show loading spinner for better UX
  if (loading) {
    return null
  }

  if (!project) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-2">Proyecto no encontrado</h1>
          <p className="text-muted-foreground mb-4">
            El proyecto que buscas no existe o no tienes acceso a él.
          </p>
          <Button asChild>
            <Link href="/dashboard/projects">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a proyectos
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="border-b px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/projects">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            
            {/* Project Name with Inline Editing */}
            <div className="flex items-center gap-4">
              {editingName ? (
                <div className="flex items-center gap-2">
                  <Input
                    ref={nameInputRef}
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleProjectNameUpdate()
                      if (e.key === 'Escape') {
                        setProjectName(project.name)
                        setEditingName(false)
                      }
                    }}
                    className="w-[300px] text-xl font-light"
                  />
                  <Button size="sm" variant="ghost" onClick={handleProjectNameUpdate}>
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setProjectName(project.name)
                      setEditingName(false)
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-3 group">
                  <h1 className="text-xl font-light text-[#333333]">{project.name}</h1>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setEditingName(true)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            {/* Project Switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[250px]">
                <DropdownMenuLabel>Cambiar proyecto</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <ScrollArea className="h-[300px]">
                  {allProjects
                    .filter(p => p.id !== project.id)
                    .map((p) => (
                      <DropdownMenuItem
                        key={p.id}
                        onClick={() => router.push(`/dashboard/projects/${p.id}`)}
                        className="cursor-pointer"
                      >
                        <FolderOpen className="h-4 w-4 mr-2" />
                        <span className="truncate">{p.name}</span>
                      </DropdownMenuItem>
                    ))}
                </ScrollArea>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/projects" className="cursor-pointer">
                    <Grid3x3 className="h-4 w-4 mr-2" />
                    Ver todos los proyectos
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <div className="flex items-center gap-6 text-xs text-muted-foreground">
              {project.description && (
                <p className="text-sm text-[#A3B1A1] font-light hidden lg:block">
                  {project.description}
                </p>
              )}
              <div className="flex items-center gap-4 text-xs">
                <span>{project.images?.length || 0} imagen{(project.images?.length || 0) !== 1 ? 'es' : ''}</span>
                <span>•</span>
                <span>{project.total_transformations} transformación{project.total_transformations !== 1 ? 'es' : ''}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Selection Mode Toggle */}
            {showSelection && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowSelection(false)
                  setSelectedVariants(new Set())
                }}
                className="text-muted-foreground hover:text-foreground transition-all duration-300"
              >
                <X className="h-4 w-4 mr-2" />
                Cancelar selección
              </Button>
            )}

            {/* Quick Selection Options */}
            {showSelection && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-[#A3B1A1] hover:text-[#A3B1A1]/80">
                    <Zap className="h-4 w-4 mr-2" />
                    Selección Rápida
                    <ChevronDown className="h-3 w-3 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="text-xs">Modos de selección</DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  <DropdownMenuItem onClick={handleSelectBest}>
                    <Sparkles className="h-4 w-4 mr-2 text-yellow-600" />
                    <div>
                      <span className="font-medium">Seleccionar Mejores</span>
                      <p className="text-xs text-muted-foreground">Top 5 diseños premium</p>
                    </div>
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={handleSelectAllFavorites}>
                    <Heart className="h-4 w-4 mr-2 text-red-500" />
                    <div>
                      <span className="font-medium">Todos los Favoritos</span>
                      <p className="text-xs text-muted-foreground">
                        {variants.filter(v => v.is_favorite && v.status === 'completed').length} diseños
                      </p>
                    </div>
                  </DropdownMenuItem>

                  {/* Style-based selection */}
                  {Array.from(new Set(variants.filter(v => v.status === 'completed' && v.style?.name).map(v => v.style!.name))).length > 1 && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuLabel className="text-xs">Por estilo</DropdownMenuLabel>
                      {Array.from(new Set(variants.filter(v => v.status === 'completed' && v.style?.name).map(v => v.style!.name))).slice(0, 4).map(styleName => (
                        <DropdownMenuItem
                          key={styleName}
                          onClick={() => handleSelectByStyle(styleName)}
                        >
                          <Palette className="h-4 w-4 mr-2 text-[#A3B1A1]" />
                          <div>
                            <span className="font-medium">{styleName}</span>
                            <p className="text-xs text-muted-foreground">
                              {variants.filter(v => v.status === 'completed' && v.style?.name === styleName).length} diseños
                            </p>
                          </div>
                        </DropdownMenuItem>
                      ))}
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Intelligent Share Button */}
            <Button
              variant="default"
              size="sm"
              onClick={() => {
                // Intelligent sharing logic
                if (showSelection && selectedVariants.size > 0) {
                  // Share selected variants
                  handleShareSelected()
                } else if (!showSelection) {
                  // Simply enter selection mode
                  setShowSelection(true)
                  toast.info('Selecciona los diseños que quieres compartir')
                } else {
                  // In selection mode but nothing selected, suggest quick options
                  setShowSelection(true)
                  toast.info('Selecciona diseños o usa "Selección Rápida"')
                }
              }}
              className="bg-[#A3B1A1] hover:bg-[#A3B1A1]/90 transition-colors duration-300"
            >
              <Share2 className="h-4 w-4 mr-2" />
              {showSelection && selectedVariants.size > 0
                ? `Compartir ${selectedVariants.size} diseño${selectedVariants.size !== 1 ? 's' : ''}`
                : 'Compartir'
              }
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column - Image Management & Controls */}
        <div className="w-[400px] border-r flex flex-col h-full overflow-hidden">
          {/* Base Images Gallery */}
          <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-sm flex items-center gap-2">
                <Grid3x3 className="h-4 w-4" />
                Imágenes Base
                {project?.images && project.images.length > 4 && (
                  <span className="text-xs text-muted-foreground">
                    ({project.images.length} total)
                  </span>
                )}
              </h2>
              <label htmlFor="upload-input">
                <Button size="sm" variant="outline" asChild>
                  <span>
                    <Plus className="h-3 w-3 mr-1" />
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
                    if (file) handleImageUpload(file)
                  }}
                />
              </label>
            </div>

            <div className="relative">
              <div className="overflow-x-auto overflow-y-hidden scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
                <div className="flex gap-2 pb-2 min-h-[88px]">
                {(!project?.images || project.images.length === 0) && !uploading ? (
                  <div className="text-sm text-muted-foreground py-4 text-center w-full">
                    No hay imágenes. Sube una para comenzar.
                  </div>
                ) : (
                  <>
                    {project?.images?.map((image) => (
                      <div
                        key={image.id}
                        className={cn(
                          "relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all group",
                          selectedBaseImage?.id === image.id
                            ? "border-primary ring-2 ring-primary/20 scale-105"
                            : "border-transparent hover:border-gray-300"
                        )}
                      >
                        <button
                          onClick={() => setSelectedBaseImage(image)}
                          className="w-full h-full hover:scale-105 transition-transform"
                        >
                          <Image
                            src={image.url}
                            alt={image.name || 'Imagen del proyecto'}
                            fill
                            className="object-cover"
                          />
                        </button>

                        {/* Delete button - appears on hover */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setDeleteDialog({
                              isOpen: true,
                              imageId: image.id,
                              imageName: image.name || 'esta imagen'
                            })
                          }}
                          className="absolute top-1 right-1 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>

                        {(image.transformations?.length || 0) > 0 && (
                          <div className="absolute bottom-0 right-0 bg-black/70 text-white text-xs px-1 rounded-tl">
                            {image.transformations?.length || 0}
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Show upload skeleton when uploading */}
                    {uploading && <ImageUploadSkeleton />}
                  </>
                )}
                </div>
              </div>
            </div>

            {/* Upload Progress */}
            {uploading && (
              <div className="mt-3">
                <UploadProgress 
                  progress={uploadProgress}
                  status={uploadStatus}
                  error={uploadError || undefined}
                />
              </div>
            )}
          </div>

          {/* Active Base Image */}
          {(selectedBaseImage || uploading) && (
            <>
              <div className="p-4 border-b">
                <h3 className="font-semibold text-sm mb-2">Imagen Activa</h3>
                {uploading && !selectedBaseImage ? (
                  <ImagePreviewSkeleton />
                ) : selectedBaseImage ? (
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                    <Image
                      src={selectedBaseImage.url}
                      alt={selectedBaseImage.name || 'Imagen del proyecto'}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : null}
                <p className="text-xs text-muted-foreground mt-2">
                  {uploading && !selectedBaseImage 
                    ? 'Subiendo imagen...' 
                    : selectedBaseImage?.name || 'Imagen del proyecto'}
                </p>
              </div>

              {/* Generation Panel */}
              <div className="flex-1 flex flex-col min-h-0">
                <div className="p-4 pb-0">
                  <h3 className="font-semibold text-sm mb-3">Generar Nuevo Diseño</h3>
                </div>

                <div className="flex-1 overflow-y-auto px-4 min-h-0">
                  <div className="space-y-3 pb-4">
                  {/* Macrocategory Filter */}
                  {availableMacroCategories.length > 0 && (
                    <div>
                      <label className="text-xs font-medium mb-1 block">
                        Categoría de Estilo
                      </label>
                      <Select value={selectedMacroCategory} onValueChange={setSelectedMacroCategory}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Todas las categorías" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todas las categorías</SelectItem>
                          {availableMacroCategories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div>
                    <label className="text-xs font-medium mb-1 block">
                      Estilo de Diseño *
                    </label>
                    <Select value={selectedStyle} onValueChange={setSelectedStyle}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecciona un estilo" />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredStyles?.map((style) => (
                          <SelectItem key={style.id} value={style.id}>
                            {style.name} ({style.token_cost} tokens)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Furniture Preservation Mode */}
                  <div>
                    <label className="text-xs font-medium mb-1 block flex items-center gap-1">
                      <Armchair className="h-3 w-3" />
                      Manejo de Mobiliario
                    </label>
                    <Select value={selectedFurnitureMode} onValueChange={setSelectedFurnitureMode}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="keep_all">
                          <div className="flex flex-col items-start">
                            <span className="font-medium">Conservar Todo (Misma Posición)</span>
                            <span className="text-xs text-muted-foreground">Preserva mobiliario exactamente como está</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="keep_reposition">
                          <div className="flex flex-col items-start">
                            <span className="font-medium">Conservar (Permitir Reposición)</span>
                            <span className="text-xs text-muted-foreground">Mismo mobiliario, pero puede reorganizarse</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="keep_add_more">
                          <div className="flex flex-col items-start">
                            <span className="font-medium">Conservar + Agregar Más</span>
                            <span className="text-xs text-muted-foreground">Preserva existente y añade piezas complementarias</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="replace_all">
                          <div className="flex flex-col items-start">
                            <span className="font-medium">Reemplazar Todo</span>
                            <span className="text-xs text-muted-foreground">Transformación completa del mobiliario</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      Controla cómo se maneja el mobiliario existente
                    </p>
                  </div>

                  {/* Custom Prompt Field */}
                  <div>
                    <label className="text-xs font-medium mb-1 block flex items-center gap-1">
                      Instrucciones Personalizadas
                      <Info className="h-3 w-3 text-muted-foreground" />
                    </label>
                    <Textarea
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      placeholder="Ej: Añade una lámpara colgante moderna sobre la mesa del comedor..."
                      className="min-h-[60px] resize-none text-xs"
                    />
                    <p className="text-[10px] text-muted-foreground mt-1">
                      💡 Pro tip: Añade detalles específicos para obtener resultados más precisos
                    </p>
                  </div>

                  {/* Room Dimensions */}
                  <div>
                    <label className="text-xs font-medium mb-1 block flex items-center gap-1">
                      <Ruler className="h-3 w-3" />
                      Dimensiones Estimadas (metros)
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Input
                          type="number"
                          step="0.1"
                          value={roomWidth}
                          onChange={(e) => setRoomWidth(e.target.value)}
                          placeholder="Ancho"
                          className="text-xs"
                        />
                      </div>
                      <div>
                        <Input
                          type="number"
                          step="0.1"
                          value={roomHeight}
                          onChange={(e) => setRoomHeight(e.target.value)}
                          placeholder="Alto"
                          className="text-xs"
                        />
                      </div>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      Recomendado para mejor proporción del mobiliario
                    </p>
                  </div>

                  {/* Advanced Options Collapsible */}
                  <Collapsible
                    open={showAdvancedOptions}
                    onOpenChange={setShowAdvancedOptions}
                  >
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-xs p-0 h-auto hover:bg-transparent"
                      >
                        {showAdvancedOptions ? (
                          <ChevronDown className="h-3 w-3 mr-1" />
                        ) : (
                          <ChevronRight className="h-3 w-3 mr-1" />
                        )}
                        Opciones Avanzadas
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-3 mt-2">
                      <div>
                        <label className="text-xs font-medium mb-1 block">
                          Tipo de Habitación
                        </label>
                        <Select value={selectedRoomType} onValueChange={setSelectedRoomType}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Opcional - Sin especificar" />
                          </SelectTrigger>
                          <SelectContent>
                            {designData?.roomTypes?.map((room) => (
                              <SelectItem key={room.id} value={room.id}>
                                {room.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {selectedRoomType && (
                          <button
                            onClick={() => setSelectedRoomType('')}
                            className="text-xs text-muted-foreground hover:text-foreground mt-1"
                          >
                            Limpiar selección
                          </button>
                        )}
                      </div>

                      <div>
                        <label className="text-xs font-medium mb-1 block">
                          Esquema de Color
                        </label>
                        <Select value={selectedColorScheme} onValueChange={setSelectedColorScheme}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Opcional - Sin especificar" />
                          </SelectTrigger>
                          <SelectContent>
                            {designData?.colorSchemes?.map((scheme) => (
                              <SelectItem key={scheme.id} value={scheme.id}>
                                <div className="flex items-center gap-2">
                                  {scheme.name}
                                  <div className="flex gap-1">
                                    {scheme.hex_colors?.slice(0, 3).map((color, i) => (
                                      <div
                                        key={i}
                                        className="w-3 h-3 rounded-full border"
                                        style={{ backgroundColor: color }}
                                      />
                                    ))}
                                  </div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {selectedColorScheme && (
                          <button
                            onClick={() => setSelectedColorScheme('')}
                            className="text-xs text-muted-foreground hover:text-foreground mt-1"
                          >
                            Limpiar selección
                          </button>
                        )}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                  </div>
                </div>

                {/* Generation Button - Always visible at bottom */}
                <div className="p-4 border-t flex-shrink-0">
                  <Button
                    className="w-full"
                    onClick={handleGenerateVariant}
                    disabled={!selectedStyle || generating || !hasTokens}
                    variant={!hasTokens ? "destructive" : "default"}
                  >
                    {generating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generando...
                      </>
                    ) : !hasTokens ? (
                      <>
                        <AlertCircle className="mr-2 h-4 w-4" />
                        Sin tokens
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Generar Diseño ({filteredStyles.find(s => s.id === selectedStyle)?.token_cost || 1} tokens)
                      </>
                    )}
                  </Button>

                  {/* Token consumption preview */}
                  {selectedStyle && hasTokens && (
                    <div className="mt-2 text-xs text-muted-foreground text-center">
                      Esto consumirá {filteredStyles.find(s => s.id === selectedStyle)?.token_cost || 1} tokens.
                      Te quedarán {tokenBalance - (filteredStyles.find(s => s.id === selectedStyle)?.token_cost || 1)} tokens.
                    </div>
                  )}

                  {isLow && hasTokens && (
                    <div className="mt-2 text-xs text-yellow-600 text-center">
                      ⚠️ Tienes pocos tokens disponibles
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Right Column - Variant Gallery */}
        <div className="flex-1 bg-muted/30">
          {!selectedBaseImage ? (
            <div className="h-full flex items-center justify-center text-center p-8">
              <div>
                <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Selecciona una imagen base</h3>
                <p className="text-sm text-muted-foreground">
                  Sube imágenes base y selecciona una para ver y generar variantes de diseño
                </p>
              </div>
            </div>
          ) : (
            <VariantGallery
              variants={variants}
              loading={loadingVariants}
              onToggleFavorite={handleToggleFavorite}
              originalImage={selectedBaseImage.url}
              onRefresh={() => selectedBaseImage && fetchVariants(selectedBaseImage.id)}
              selectedVariants={selectedVariants}
              onToggleSelection={handleToggleSelection}
              showSelection={showSelection}
            />
          )}
        </div>
      </div>

      {/* Image Viewer Modal */}
      {viewerModal.variant && selectedBaseImage && (
        <ImageViewerModal
          isOpen={viewerModal.isOpen}
          onClose={() => setViewerModal({ isOpen: false })}
          originalImage={selectedBaseImage.url}
          processedImage={viewerModal.variant.result_image_url!}
          styleName={viewerModal.variant.style?.name}
          roomType={viewerModal.variant.room_type?.name}
          colorScheme={viewerModal.variant.color_palette?.name}
        />
      )}

      {/* No Tokens Dialog */}
      <NoTokensDialog
        isOpen={showNoTokensDialog}
        onClose={() => setShowNoTokensDialog(false)}
      />

      {/* Delete Image Confirmation Dialog */}
      <AlertDialog
        open={deleteDialog.isOpen}
        onOpenChange={(open) => setDeleteDialog({ isOpen: open })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar imagen?</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas eliminar {deleteDialog.imageName}? Esta acción no se puede deshacer.
              Todas las transformaciones relacionadas también se eliminarán.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteDialog.imageId && handleDeleteImage(deleteDialog.imageId)}
              className="bg-red-500 hover:bg-red-600"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>


      {/* Selection Summary Panel */}
      <SelectionSummary
        selectedVariants={selectedVariants}
        variants={variants}
        onShareSelected={handleShareSelected}
        onClearSelection={handleClearSelection}
        onToggleSelection={handleToggleSelection}
        onViewVariant={(variantId) => {
          const variant = variants.find(v => v.id === variantId)
          if (variant && variant.result_image_url) {
            setViewerModal({
              isOpen: true,
              variant
            })
          }
        }}
      />


    </div>
  )
}