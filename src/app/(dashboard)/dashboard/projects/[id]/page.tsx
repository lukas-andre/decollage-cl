'use client'

import { use, useEffect, useState, useCallback, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  Plus,
  Loader2,
  Heart,
  Edit2,
  Check,
  X,
  Maximize2,
  Grid2x2,
  Zap,
  Wand2,
  Brush,
  Expand
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useTokenBalance } from '@/hooks/useTokenBalance'
import { NoTokensDialog } from '@/components/tokens/NoTokensDialog'
import { ContextFirstWizard } from '@/components/projects/ContextFirstWizard'
import { ShareButton } from '@/components/share/ShareButton'
import { ImageViewerModal } from '@/components/projects/ImageViewerModal'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { motion } from 'framer-motion'


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
  style: { name: string } | null
  room_type: { name: string } | null
  color_palette: { name: string; hex_colors: string[] } | null
  metadata?: any
}

interface DesignData {
  styles: Array<{ id: string; name: string; code: string; token_cost: number }>
  roomTypes: Array<{ id: string; name: string; code: string }>
  colorSchemes: Array<{ id: string; name: string; code: string; hex_colors: string[] }>
}

export default function ModernProjectWorkspace({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedBaseImage, setSelectedBaseImage] = useState<BaseImage | null>(null)
  const [variants, setVariants] = useState<Variant[]>([])
  const [loadingVariants, setLoadingVariants] = useState(false)
  const [designData, setDesignData] = useState<DesignData | null>(null)
  const [generating, setGenerating] = useState(false)
  const [editingName, setEditingName] = useState(false)
  const [projectName, setProjectName] = useState('')
  const [showNoTokensDialog, setShowNoTokensDialog] = useState(false)
  const [viewerModal, setViewerModal] = useState<{
    isOpen: boolean
    variant?: Variant
    initialMode?: 'view' | 'edit'
  }>({ isOpen: false })
  const [expandedBaseImage, setExpandedBaseImage] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null)
  const nameInputRef = useRef<HTMLInputElement>(null)
  const { available: tokenBalance, hasTokens, deduct: deductTokens } = useTokenBalance()

  useEffect(() => {
    fetchProject()
    fetchDesignData()
  }, [id])

  useEffect(() => {
    if (selectedBaseImage) {
      fetchVariants(selectedBaseImage.id)
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

  const handleImageUpload = async (file: File) => {
    if (!project) return

    setIsUploadingImage(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('name', file.name)

      const response = await fetch(`/api/projects/${project.id}/upload-image`, {
        method: 'POST',
        body: formData
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Error al subir imagen')
      }

      toast.success('Imagen subida correctamente')

      if (data.projectImage && project) {
        const newImage = {
          id: data.projectImage.id,
          name: data.projectImage.name,
          url: data.projectImage.url,
          upload_order: data.projectImage.upload_order,
          created_at: data.projectImage.created_at
        }

        const updatedProject = {
          ...project,
          images: [...(project.images || []), newImage]
        }

        setProject(updatedProject)
        setSelectedBaseImage(newImage)
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      toast.error(error instanceof Error ? error.message : 'Error al subir imagen')
    } finally {
      setIsUploadingImage(false)
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

      if (project) {
        const updatedImages = project.images.filter(img => img.id !== imageId)
        setProject({ ...project, images: updatedImages })

        if (selectedBaseImage?.id === imageId) {
          setSelectedBaseImage(updatedImages.length > 0 ? updatedImages[0] : null)
          setVariants([])
        }
      }

      toast.success('Imagen eliminada')
    } catch (error) {
      console.error('Error deleting image:', error)
      toast.error(error instanceof Error ? error.message : 'Error al eliminar imagen')
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
        headers: { 'Content-Type': 'application/json' },
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

  const handleToggleFavorite = async (variantId: string) => {
    try {
      const response = await fetch(`/api/variants/${variantId}/favorite`, {
        method: 'PATCH'
      })

      if (!response.ok) {
        throw new Error('Error al actualizar favorito')
      }

      setVariants(prev => prev.map(variant =>
        variant.id === variantId
          ? { ...variant, is_favorite: !variant.is_favorite }
          : variant
      ))

      const variant = variants.find(v => v.id === variantId)
      toast.success(variant?.is_favorite ? 'Removido de favoritos' : 'Agregado a favoritos')
    } catch (error) {
      console.error('Error toggling favorite:', error)
      toast.error('Error al actualizar favorito')
    }
  }

  const handleSaveRefinement = (newVariant: any) => {
    // Add the refined variant to the list
    setVariants(prev => [newVariant, ...prev])
    toast.success('Refinamiento guardado exitosamente')
  }

  const handleGenerate = async (params: any) => {
    if (!selectedBaseImage) return
    setGenerating(true)

    try {
      const response = await fetch(`/api/base-images/${selectedBaseImage.id}/generate-variant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...params, provider: 'gemini' })
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Error al generar variante')
      }

      deductTokens(1)

      if (data.transformation) {
        setVariants(prev => [data.transformation, ...prev])
        toast.success(
          data.transformation.status === 'completed'
            ? '¡Diseño generado!'
            : 'Generando diseño...'
        )
      } else {
        toast.success('Diseño enviado a generar')
        await fetchVariants(selectedBaseImage.id)
      }
    } catch (error) {
      console.error('Error generating variant:', error)
      toast.error(error instanceof Error ? error.message : 'Error al generar variante')
    } finally {
      setGenerating(false)
    }
  }


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#A3B1A1]" />
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Proyecto no encontrado</h1>
          <Button asChild>
            <Link href="/dashboard/projects">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Minimalist Header Bar */}
      <div className="h-12 border-b bg-white flex items-center px-6 gap-6 flex-shrink-0">
        <Button variant="ghost" size="icon" asChild className="h-8 w-8">
          <Link href="/dashboard/projects">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>

        {/* Project Name */}
        <div className="flex items-center gap-2 flex-1">
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
                className="h-7 w-[250px] text-sm"
              />
              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={handleProjectNameUpdate}>
                <Check className="h-3 w-3" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6"
                onClick={() => {
                  setProjectName(project.name)
                  setEditingName(false)
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2 group">
              <h1 className="text-sm font-medium text-gray-900">{project.name}</h1>
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => setEditingName(true)}
              >
                <Edit2 className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>

        {/* Token Balance */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-[#A3B1A1]/10 to-[#C4886F]/10 border border-[#A3B1A1]/20">
          <Zap className="h-3.5 w-3.5 text-[#A3B1A1]" />
          <span className="text-xs font-semibold text-gray-700">{tokenBalance}</span>
          <span className="text-xs text-gray-500">tokens</span>
        </div>

        {/* Share Button */}
        {project && (
          <ShareButton
            project={project as any}
            generations={variants.filter(v => v.status === 'completed' && v.result_image_url).map(v => ({
              id: v.id,
              created_at: v.created_at,
              updated_at: v.created_at,
              user_id: '',
              project_id: project.id,
              base_image_id: selectedBaseImage?.id || null,
              completed_at: v.created_at,
              custom_instructions: null,
              error_message: null,
              inspiration_weight: null,
              inspirations: null,
              iterations: null,
              metadata: v.metadata || null,
              moodboard_id: null,
              palette_id: null,
              processing_time_ms: null,
              prompt_used: null,
              rating: null,
              result_image_url: v.result_image_url,
              result_cloudflare_id: null,
              result_public_url: v.result_image_url,
              room_type_id: null,
              season_id: null,
              share_count: 0,
              share_settings: null,
              status: v.status,
              style_id: null,
              tokens_consumed: v.tokens_consumed,
              user_notes: null,
              variations: null,
              is_favorite: v.is_favorite,
              is_shared: false
            }))}
            className="h-7 px-3 text-xs"
          />
        )}
      </div>

      {/* Two Column Gallery + Inspector Layout */}
      <div className="flex-1 flex min-h-0">
        {/* Left Column: Gallery (Visual Workspace) */}
        <div className="flex-1 bg-white overflow-auto">
          <div className="p-4 space-y-4">
            {/* Base Images Section - Compact */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xs font-semibold text-gray-900">Imágenes Base</h2>
                <label htmlFor="upload-input">
                  <Button size="sm" variant="outline" asChild>
                    <span className="text-xs">
                      {isUploadingImage ? (
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
                      if (file) handleImageUpload(file)
                    }}
                  />
                </label>
              </div>

              {/* Base Images Horizontal Scroll */}
              <div className="overflow-x-auto pb-2">
                <div className="flex gap-3 min-w-0">
                  {project?.images?.map((image) => (
                    <div
                      key={image.id}
                      className={cn(
                        "relative group flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all cursor-pointer",
                        selectedBaseImage?.id === image.id
                          ? "border-[#A3B1A1] shadow-lg ring-2 ring-[#A3B1A1]/20"
                          : "border-gray-200 hover:border-gray-300"
                      )}
                      onClick={() => setSelectedBaseImage(image)}
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
                          handleDeleteImage(image.id)
                        }}
                        className="absolute top-1 right-1 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                      >
                        <X className="h-2.5 w-2.5" />
                      </button>
                    </div>
                  ))}
                  {(!project?.images || project.images.length === 0) && !isUploadingImage && (
                    <div className="text-center py-4 px-8 text-sm text-gray-500">
                      Sube tu primera imagen para comenzar
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Selected Base Image Preview - Smaller */}
            {selectedBaseImage && (
              <div className="flex gap-4">
                <div className="w-32">
                  <h3 className="text-xs font-semibold text-gray-900 mb-2">Imagen Activa</h3>
                  <div
                    className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 border-2 border-[#A3B1A1] shadow-sm cursor-pointer group transition-all hover:shadow-md"
                    onClick={() => setExpandedBaseImage(true)}
                  >
                    <Image
                      src={selectedBaseImage.url}
                      alt={selectedBaseImage.name || 'Imagen'}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <Expand className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500">
                    Haz clic en cualquier diseño generado para expandirlo.
                    Usa el panel derecho para crear nuevas variaciones.
                  </p>
                </div>
              </div>
            )}

            {/* Generated Variants Section - Centered Focus */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-gray-900">Diseños Generados</h2>
                {selectedBaseImage && (
                  <Badge variant="secondary" className="text-xs">
                    {variants.length} diseño{variants.length !== 1 ? 's' : ''}
                  </Badge>
                )}
              </div>

              {loadingVariants ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="h-6 w-6 animate-spin text-[#A3B1A1]" />
                </div>
              ) : variants.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {variants.map((variant) => (
                    <motion.div
                      key={variant.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2 }}
                      className="group relative"
                      onClick={() => {
                        setSelectedVariant(variant.id)
                        if (variant.status === 'completed' && variant.result_image_url) {
                          setViewerModal({ isOpen: true, variant, initialMode: 'view' })
                        }
                      }}
                    >
                      <Card className={cn(
                        "overflow-hidden hover:shadow-xl transition-all duration-200 cursor-pointer",
                        selectedVariant === variant.id
                          ? "border-2 border-[#A3B1A1] ring-2 ring-[#A3B1A1]/20"
                          : "border-gray-200"
                      )}>
                        {variant.status === 'completed' && variant.result_image_url ? (
                          <>
                            <div className="relative aspect-square">
                              <Image
                                src={variant.result_image_url}
                                alt="Variante"
                                fill
                                className="object-cover"
                              />
                              {/* Overlay Actions */}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-200">
                                <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                                  <div className="flex gap-1">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleToggleFavorite(variant.id)
                                      }}
                                      className="w-7 h-7 rounded-full bg-white/95 hover:bg-white flex items-center justify-center transition-all shadow-lg"
                                      title="Favorito"
                                    >
                                      <Heart className={cn(
                                        "h-3.5 w-3.5 transition-colors",
                                        variant.is_favorite ? "fill-red-500 text-red-500" : "text-gray-700"
                                      )} />
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        setViewerModal({ isOpen: true, variant, initialMode: 'edit' })
                                      }}
                                      className="w-7 h-7 rounded-full bg-white/95 hover:bg-white flex items-center justify-center transition-all shadow-lg"
                                      title="Refinar"
                                    >
                                      <Brush className="h-3.5 w-3.5 text-gray-700" />
                                    </button>
                                  </div>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setViewerModal({ isOpen: true, variant })
                                    }}
                                    className="w-7 h-7 rounded-full bg-white/95 hover:bg-white flex items-center justify-center transition-all shadow-lg"
                                    title="Ampliar"
                                  >
                                    <Maximize2 className="h-3.5 w-3.5 text-gray-700" />
                                  </button>
                                </div>
                              </div>
                              {/* Active indicator */}
                              {selectedVariant === variant.id && (
                                <div className="absolute top-2 right-2">
                                  <div className="w-6 h-6 rounded-full bg-[#A3B1A1] flex items-center justify-center shadow-lg">
                                    <Check className="h-3 w-3 text-white" />
                                  </div>
                                </div>
                              )}
                            </div>
                            {/* Minimal Metadata */}
                            <div className="p-2">
                              <div className="flex items-center justify-between">
                                {variant.style && (
                                  <p className="text-[10px] text-gray-600 truncate flex-1">
                                    {variant.style.name}
                                  </p>
                                )}
                                {variant.metadata?.is_refined && (
                                  <Brush className="h-2.5 w-2.5 text-[#C4886F]" title="Refinado" />
                                )}
                              </div>
                            </div>
                          </>
                        ) : variant.status === 'processing' ? (
                          <div className="aspect-square flex items-center justify-center bg-gray-50">
                            <Loader2 className="h-5 w-5 animate-spin text-[#A3B1A1]" />
                          </div>
                        ) : variant.status === 'failed' ? (
                          <div className="aspect-square flex items-center justify-center bg-red-50 text-red-500 text-xs p-3 text-center">
                            Error al generar
                          </div>
                        ) : (
                          <div className="aspect-square flex items-center justify-center bg-gray-50">
                            <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                          </div>
                        )}
                      </Card>
                    </motion.div>
                  ))}
                </div>
              ) : selectedBaseImage ? (
                <div className="text-center py-16 px-8 border-2 border-dashed border-gray-200 rounded-xl">
                  <Grid2x2 className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-600 font-medium">
                    No hay diseños generados aún
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Usa el panel de controles para crear tu primer diseño
                  </p>
                </div>
              ) : (
                <div className="text-center py-16 px-8">
                  <p className="text-sm text-gray-500">
                    Selecciona una imagen base para comenzar
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Inspector (Controls) */}
        <div className="w-[380px] bg-gray-50 border-l flex flex-col">
          <div className="p-4 border-b bg-white">
            <h2 className="text-sm font-semibold text-gray-900">Panel de Diseño</h2>
            <p className="text-xs text-gray-500 mt-0.5">Personaliza tu transformación</p>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {selectedBaseImage && designData ? (
              <ContextFirstWizard
                designData={{
                  styles: designData.styles || [],
                  roomTypes: designData.roomTypes || [],
                  colorPalettes: designData.colorSchemes || []
                }}
                selectedBaseImage={selectedBaseImage}
                generating={generating}
                hasTokens={hasTokens}
                tokenBalance={tokenBalance}
                onGenerate={handleGenerate}
                onNoTokens={() => setShowNoTokensDialog(true)}
              />
            ) : (
              <div className="text-center py-12">
                <div className="w-10 h-10 rounded-full bg-gray-200 mx-auto mb-2 flex items-center justify-center">
                  <Wand2 className="h-5 w-5 text-gray-400" />
                </div>
                <p className="text-xs text-gray-600 font-medium">
                  Selecciona una imagen
                </p>
                <p className="text-[10px] text-gray-400 mt-1">
                  Para comenzar a diseñar
                </p>
              </div>
            )}
          </div>
        </div>
      </div>


      {/* Image Viewer Modal - Unified for view and edit */}
      {viewerModal.variant && selectedBaseImage && (
        <ImageViewerModal
          isOpen={viewerModal.isOpen}
          onClose={() => setViewerModal({ isOpen: false })}
          originalImage={selectedBaseImage.url}
          processedImage={viewerModal.variant.result_image_url!}
          styleName={viewerModal.variant.style?.name}
          roomType={viewerModal.variant.room_type?.name}
          colorScheme={viewerModal.variant.color_palette?.name}
          projectId={id}
          variantId={viewerModal.variant.id}
          initialMode={viewerModal.initialMode || 'view'}
          onSaveRefinement={handleSaveRefinement}
          onAddAsBaseImage={() => {
            // Refresh base images to show the new one
            fetchProject()
            toast.success('Imagen agregada como base para el proyecto')
          }}
        />
      )}

      {/* Base Image Expanded Modal */}
      {expandedBaseImage && selectedBaseImage && (
        <Dialog open={expandedBaseImage} onOpenChange={setExpandedBaseImage}>
          <DialogContent className="max-w-[90vw] md:max-w-[70vw] lg:max-w-[60vw] p-0">
            <DialogHeader className="p-4 border-b">
              <DialogTitle>{selectedBaseImage.name || 'Imagen Base'}</DialogTitle>
            </DialogHeader>
            <div className="relative w-full" style={{ aspectRatio: '16/10' }}>
              <Image
                src={selectedBaseImage.url}
                alt={selectedBaseImage.name || 'Imagen Base'}
                fill
                className="object-contain"
                priority
              />
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* No Tokens Dialog */}
      <NoTokensDialog
        isOpen={showNoTokensDialog}
        onClose={() => setShowNoTokensDialog(false)}
      />
    </div>
  )
}