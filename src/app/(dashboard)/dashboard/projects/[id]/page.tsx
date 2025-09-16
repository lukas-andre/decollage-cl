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
  Ruler
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

interface DesignData {
  styles: Array<{
    id: string
    name: string
    code: string
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
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStatus, setUploadStatus] = useState<'selecting' | 'validating' | 'compressing' | 'uploading' | 'processing' | 'complete' | 'error'>('selecting')
  const [uploadError, setUploadError] = useState<string | null>(null)
  const nameInputRef = useRef<HTMLInputElement>(null)
  const [viewerModal, setViewerModal] = useState<{
    isOpen: boolean
    variant?: Variant
  }>({ isOpen: false })
  const [showNoTokensDialog, setShowNoTokensDialog] = useState(false)
  
  // Generation form state
  const [selectedStyle, setSelectedStyle] = useState('')
  const [selectedRoomType, setSelectedRoomType] = useState('')
  const [selectedColorScheme, setSelectedColorScheme] = useState('')
  const [customPrompt, setCustomPrompt] = useState('')
  const [roomWidth, setRoomWidth] = useState('')
  const [roomHeight, setRoomHeight] = useState('')
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false)

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

  const fetchVariants = async (baseImageId: string) => {
    try {
      setLoadingVariants(true)
      const response = await fetch(`/api/base-images/${baseImageId}/variants`)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Error al cargar variantes')
      }

      setVariants(data.variants || [])
      return data.variants || []
    } catch (error) {
      console.error('Error fetching variants:', error)
      toast.error('Error al cargar variantes')
      return []
    } finally {
      setLoadingVariants(false)
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
      
      // Refresh project to get new base image
      await fetchProject()
      
      // Select the newly uploaded image
      if (data.projectImage) {
        // Wait for project to be updated, then select the new image
        setTimeout(() => {
          const newImage = project.images.find(img => img.id === data.projectImage.id)
          if (newImage) {
            setSelectedBaseImage(newImage)
          }
        }, 100)
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
      const tokenCost = designData?.styles.find(s => s.id === selectedStyle)?.token_cost || 1
      deductTokens(tokenCost)
      
      toast.success('Generando diseño... Esto tomará unos 15-30 segundos')
      
      // Refresh variants immediately to show the new processing one
      await fetchVariants(selectedBaseImage.id)
      
      // Simple polling - check every 3 seconds for up to 40 seconds
      let pollCount = 0
      const maxPolls = 13 // 13 * 3 = 39 seconds
      
      const pollInterval = setInterval(async () => {
        pollCount++
        const updatedVariants = await fetchVariants(selectedBaseImage.id)
        
        // Check if the generation is complete
        const newGeneration = updatedVariants?.find((v: { id: string; status: string }) => v.id === data.generation.id)
        
        if (newGeneration) {
          if (newGeneration.status === 'completed') {
            clearInterval(pollInterval)
            setGenerating(false)
            toast.success('¡Diseño generado exitosamente!')
          } else if (newGeneration.status === 'failed') {
            clearInterval(pollInterval)
            setGenerating(false)
            toast.error('Error al generar el diseño. Por favor intenta nuevamente.')
          } else if (pollCount >= maxPolls) {
            // Timeout after ~40 seconds
            clearInterval(pollInterval)
            setGenerating(false)
            toast.info('La generación está tomando más tiempo. Actualizando...')
            // Do one final fetch
            await fetchVariants(selectedBaseImage.id)
          }
        }
      }, 3000)
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
      <div className="border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/projects">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            
            {/* Project Name with Inline Editing */}
            <div className="flex items-center gap-2">
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
                    className="w-[200px]"
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
                <div className="flex items-center gap-2">
                  <FolderOpen className="h-4 w-4 text-muted-foreground" />
                  <h2 className="text-lg font-semibold">{project.name}</h2>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setEditingName(true)}
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
            
            {project.description && (
              <p className="text-sm text-muted-foreground hidden lg:block">
                {project.description}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {project.images?.length || 0} imagen{(project.images?.length || 0) !== 1 ? 'es' : ''}
            </Badge>
            <Badge variant="outline">
              {project.total_transformations} transformaciones
            </Badge>
            <DashboardHeader />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column - Image Management & Controls */}
        <div className="w-[400px] border-r flex flex-col">
          {/* Base Images Gallery */}
          <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-sm flex items-center gap-2">
                <Grid3x3 className="h-4 w-4" />
                Imágenes Base
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

            <ScrollArea className="h-32">
              <div className="flex gap-2">
                {(!project?.images || project.images.length === 0) && !uploading ? (
                  <div className="text-sm text-muted-foreground py-4 text-center w-full">
                    No hay imágenes. Sube una para comenzar.
                  </div>
                ) : (
                  <>
                    {project?.images?.map((image) => (
                      <button
                        key={image.id}
                        onClick={() => setSelectedBaseImage(image)}
                        className={cn(
                          "relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all",
                          selectedBaseImage?.id === image.id 
                            ? "border-primary ring-2 ring-primary/20" 
                            : "border-transparent hover:border-gray-300"
                        )}
                      >
                        <Image
                          src={image.url}
                          alt={image.name || 'Imagen del proyecto'}
                          fill
                          className="object-cover"
                        />
                        {(image.transformations?.length || 0) > 0 && (
                          <div className="absolute bottom-0 right-0 bg-black/70 text-white text-xs px-1 rounded-tl">
                            {image.transformations?.length || 0}
                          </div>
                        )}
                      </button>
                    ))}
                    
                    {/* Show upload skeleton when uploading */}
                    {uploading && <ImageUploadSkeleton />}
                  </>
                )}
              </div>
            </ScrollArea>
            
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
              <div className="p-4 flex-1 flex flex-col">
                <h3 className="font-semibold text-sm mb-3">Generar Nuevo Diseño</h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium mb-1 block">
                      Estilo de Diseño *
                    </label>
                    <Select value={selectedStyle} onValueChange={setSelectedStyle}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecciona un estilo" />
                      </SelectTrigger>
                      <SelectContent>
                        {designData?.styles.map((style) => (
                          <SelectItem key={style.id} value={style.id}>
                            {style.name} ({style.token_cost} tokens)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                            {designData?.roomTypes.map((room) => (
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
                            {designData?.colorSchemes.map((scheme) => (
                              <SelectItem key={scheme.id} value={scheme.id}>
                                <div className="flex items-center gap-2">
                                  {scheme.name}
                                  <div className="flex gap-1">
                                    {scheme.hex_colors.slice(0, 3).map((color, i) => (
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

                <Button 
                  className="mt-4"
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
                      Generar Diseño ({designData?.styles.find(s => s.id === selectedStyle)?.token_cost || 1} tokens)
                    </>
                  )}
                </Button>
                
                {/* Token consumption preview */}
                {selectedStyle && hasTokens && (
                  <div className="mt-2 text-xs text-muted-foreground text-center">
                    Esto consumirá {designData?.styles.find(s => s.id === selectedStyle)?.token_cost || 1} tokens. 
                    Te quedarán {tokenBalance - (designData?.styles.find(s => s.id === selectedStyle)?.token_cost || 1)} tokens.
                  </div>
                )}
                
                {isLow && hasTokens && (
                  <div className="mt-2 text-xs text-yellow-600 text-center">
                    ⚠️ Tienes pocos tokens disponibles
                  </div>
                )}
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
          processedImage={viewerModal.variant.processed_image_url!}
          styleName={viewerModal.variant.style?.name}
          roomType={viewerModal.variant.room_type?.name}
          colorScheme={viewerModal.variant.color_scheme?.name}
        />
      )}

      {/* No Tokens Dialog */}
      <NoTokensDialog 
        isOpen={showNoTokensDialog}
        onClose={() => setShowNoTokensDialog(false)}
      />
    </div>
  )
}