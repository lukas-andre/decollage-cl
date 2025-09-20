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
  Expand,
  BookmarkPlus,
  MoreVertical,
  Upload,
  Images,
  Settings,
  Share2
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useTokenBalance } from '@/hooks/useTokenBalance'
import { createClient } from '@/lib/supabase/client'
import { shareService } from '@/lib/services/share.service'
import { NoTokensDialog } from '@/components/tokens/NoTokensDialog'
import { ContextFirstWizard } from '@/components/projects/ContextFirstWizard'
import { ShareButton } from '@/components/share/ShareButton'
import { EnhancedShareDialog } from '@/components/share/EnhancedShareDialog'
import { ShareSuccessDialog } from '@/components/share/ShareSuccessDialog'
import { ImageViewerModal } from '@/components/projects/ImageViewerModal'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  style: { id: string; name: string; code: string; category: string; macrocategory: string } | null
  room_type: { name: string } | null
  color_palette: { name: string; hex_colors: string[] } | null
  metadata?: any
}

interface DesignData {
  styles: Array<{ id: string; name: string; code: string; token_cost: number }>
  roomTypes: Array<{ id: string; name: string; code: string }>
  colorSchemes: Array<{ id: string; name: string; code: string; hex_colors: string[] }>
}

export default function MobileOptimizedProjectWorkspace({ params }: { params: Promise<{ id: string }> }) {
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
  const [generationComplete, setGenerationComplete] = useState(false)
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false)
  const [shareVariantId, setShareVariantId] = useState<string | null>(null)
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false)
  const [shareUrl, setShareUrl] = useState('')
  const [shareFormat, setShareFormat] = useState<'quick' | 'story'>('quick')
  const [isSharing, setIsSharing] = useState(false)
  const [mobileTab, setMobileTab] = useState<'gallery' | 'design'>('gallery')
  const nameInputRef = useRef<HTMLInputElement>(null)
  const { available: tokenBalance, hasTokens, deduct: deductTokens } = useTokenBalance()

  useEffect(() => {
    fetchProject()
    fetchDesignData()
  }, [id])

  useEffect(() => {
    if (selectedBaseImage) {
      fetchVariants(selectedBaseImage.id)
      setGenerationComplete(false)
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
      await fetchProject()

      if (data.baseImage) {
        setSelectedBaseImage(data.baseImage)
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      toast.error('Error al subir imagen')
    } finally {
      setIsUploadingImage(false)
    }
  }

  const handleDeleteImage = async (imageId: string) => {
    if (!project) return

    try {
      const response = await fetch(`/api/projects/${project.id}/images/${imageId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Error al eliminar imagen')
      }

      toast.success('Imagen eliminada')
      await fetchProject()

      if (selectedBaseImage?.id === imageId) {
        setSelectedBaseImage(project.images[0] || null)
      }
    } catch (error) {
      console.error('Error deleting image:', error)
      toast.error('Error al eliminar imagen')
    }
  }

  const handleProjectNameUpdate = async () => {
    if (!project || projectName === project.name) {
      setEditingName(false)
      return
    }

    try {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: projectName })
      })

      if (!response.ok) {
        throw new Error('Error al actualizar nombre')
      }

      toast.success('Nombre actualizado')
      await fetchProject()
    } catch (error) {
      console.error('Error updating project name:', error)
      toast.error('Error al actualizar nombre')
      setProjectName(project.name)
    } finally {
      setEditingName(false)
    }
  }

  const handleToggleFavorite = async (variantId: string) => {
    try {
      const variant = variants.find(v => v.id === variantId)
      if (!variant) return

      const response = await fetch(`/api/variants/${variantId}/favorite`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_favorite: !variant.is_favorite })
      })

      if (!response.ok) {
        throw new Error('Error al actualizar favorito')
      }

      setVariants(prev => prev.map(v =>
        v.id === variantId ? { ...v, is_favorite: !v.is_favorite } : v
      ))

      toast.success(variant.is_favorite ? 'Removido de favoritos' : 'Agregado a favoritos')
    } catch (error) {
      console.error('Error toggling favorite:', error)
      toast.error('Error al actualizar favorito')
    }
  }

  const handleSaveCustomStyle = async (variant: Variant) => {
    toast.info('Función próximamente disponible')
  }

  const handleGenerate = async (params: any) => {
    if (!selectedBaseImage) return
    setGenerating(true)
    setGenerationComplete(false)

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
        if (data.transformation.status === 'completed') {
          setGenerationComplete(true)
          // Switch to gallery tab on mobile after generation
          setMobileTab('gallery')
        }
      } else {
        toast.success('Diseño enviado a generar')
        await fetchVariants(selectedBaseImage.id)
        setGenerationComplete(true)
        setMobileTab('gallery')
      }
    } catch (error) {
      console.error('Error generating variant:', error)
      toast.error(error instanceof Error ? error.message : 'Error al generar variante')
    } finally {
      setGenerating(false)
    }
  }

  // Gallery View Component
  const GalleryView = () => (
    <div className="p-4 space-y-4 bg-white">
      {/* Base Images Section - Mobile Optimized */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-900">Imágenes Base</h2>
          <label htmlFor="upload-input">
            <Button size="sm" variant="outline" asChild className="h-8">
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

        {/* Base Images Horizontal Scroll - Larger for Mobile */}
        <div className="overflow-x-auto pb-2">
          <div className="flex gap-3 min-w-0">
            {project?.images?.map((image) => (
              <div
                key={image.id}
                className={cn(
                  "relative group flex-shrink-0 transition-all cursor-pointer",
                  "w-20 h-20 md:w-16 md:h-16", // Larger on mobile
                  "rounded-lg overflow-hidden border-2",
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
                  className="absolute top-1 right-1 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity shadow-lg"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </div>
            ))}
            {(!project?.images || project.images.length === 0) && !isUploadingImage && (
              <div className="text-center py-6 px-8 text-sm text-gray-500">
                Sube tu primera imagen para comenzar
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Selected Base Image Preview - Mobile Optimized */}
      {selectedBaseImage && (
        <div className="flex gap-4">
          <div className="w-28 md:w-32">
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
              Usa el panel de diseño para crear variaciones.
              Toca cualquier diseño generado para expandirlo.
            </p>
          </div>
        </div>
      )}

      {/* Generated Variants Section - Mobile Grid */}
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
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
                        {/* Mobile-friendly Overlay Actions */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-transparent opacity-0 group-hover:opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all duration-200">
                          <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                            <div className="flex gap-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleToggleFavorite(variant.id)
                                }}
                                className="w-8 h-8 md:w-7 md:h-7 rounded-full bg-white/95 hover:bg-white flex items-center justify-center transition-all shadow-lg"
                                title="Favorito"
                              >
                                <Heart className={cn(
                                  "h-4 w-4 md:h-3.5 md:w-3.5 transition-colors",
                                  variant.is_favorite ? "fill-red-500 text-red-500" : "text-gray-700"
                                )} />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setViewerModal({ isOpen: true, variant, initialMode: 'edit' })
                                }}
                                className="w-8 h-8 md:w-7 md:h-7 rounded-full bg-white/95 hover:bg-white flex items-center justify-center transition-all shadow-lg"
                                title="Refinar"
                              >
                                <Brush className="h-4 w-4 md:h-3.5 md:w-3.5 text-gray-700" />
                              </button>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setViewerModal({ isOpen: true, variant })
                              }}
                              className="w-8 h-8 md:w-7 md:h-7 rounded-full bg-white/95 hover:bg-white flex items-center justify-center transition-all shadow-lg"
                              title="Ampliar"
                            >
                              <Maximize2 className="h-4 w-4 md:h-3.5 md:w-3.5 text-gray-700" />
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
                      <div className="p-1.5 md:p-2">
                        <div className="flex items-center justify-between">
                          {variant.style && (
                            <p className="text-[10px] md:text-[11px] text-gray-600 truncate flex-1">
                              {variant.style.name}
                            </p>
                          )}
                          {variant.metadata?.is_refined && (
                            <Brush className="h-2.5 w-2.5 text-[#C4886F]" />
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
              Ve a la pestaña "Diseñar" para crear tu primer diseño
            </p>
            <Button
              onClick={() => setMobileTab('design')}
              className="mt-4 lg:hidden bg-[#A3B1A1] hover:bg-[#A3B1A1]/90"
              size="sm"
            >
              <Wand2 className="h-4 w-4 mr-2" />
              Ir a Diseñar
            </Button>
          </div>
        ) : (
          <div className="text-center py-16 px-8">
            <p className="text-sm text-gray-500">
              Selecciona o sube una imagen base para comenzar
            </p>
          </div>
        )}
      </div>
    </div>
  )

  // Design Panel Component
  const DesignPanel = () => (
    <div className="p-4 bg-gray-50 min-h-full">
      {/* Mobile: Show selected image preview at top */}
      {selectedBaseImage && (
        <div className="lg:hidden mb-4 p-3 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 relative rounded overflow-hidden flex-shrink-0">
              <Image
                src={selectedBaseImage.url}
                alt="Imagen seleccionada"
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-900">Imagen seleccionada</p>
              <p className="text-[10px] text-gray-500">
                {variants.filter(v => v.status === 'completed').length} diseños generados
              </p>
              <Button
                size="sm"
                variant="link"
                className="h-auto p-0 text-xs text-[#A3B1A1]"
                onClick={() => setMobileTab('gallery')}
              >
                Ver galería →
              </Button>
            </div>
          </div>
        </div>
      )}

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
          onGenerationComplete={generationComplete}
        />
      ) : (
        <div className="text-center py-12">
          <div className="w-10 h-10 rounded-full bg-gray-200 mx-auto mb-2 flex items-center justify-center">
            <Wand2 className="h-5 w-5 text-gray-400" />
          </div>
          <p className="text-sm text-gray-600 font-medium">
            Selecciona una imagen
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Para comenzar a diseñar
          </p>
          <Button
            onClick={() => setMobileTab('gallery')}
            className="mt-4 lg:hidden"
            variant="outline"
            size="sm"
          >
            <Images className="h-4 w-4 mr-2" />
            Ir a Galería
          </Button>
        </div>
      )}
    </div>
  )

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
    <div className="min-h-screen bg-gray-50 flex flex-col pb-16 lg:pb-0">
      {/* Responsive Header */}
      <div className="border-b bg-white flex-shrink-0">
        {/* Mobile Header */}
        <div className="lg:hidden">
          <div className="flex items-center justify-between h-14 px-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Button variant="ghost" size="icon" asChild className="h-9 w-9 flex-shrink-0">
                <Link href="/dashboard/projects">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <h1 className="text-sm font-medium text-gray-900 truncate">{project.name}</h1>
            </div>

            <div className="flex items-center gap-2">
              {/* Token Badge */}
              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r from-[#A3B1A1]/10 to-[#C4886F]/10 border border-[#A3B1A1]/20">
                <Zap className="h-3 w-3 text-[#A3B1A1]" />
                <span className="text-xs font-semibold text-gray-700">{tokenBalance}</span>
              </div>

              {/* Mobile Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => setEditingName(true)}>
                    <Edit2 className="mr-2 h-4 w-4" />
                    Editar nombre
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Share2 className="mr-2 h-4 w-4" />
                    Compartir proyecto
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden lg:flex h-12 items-center px-6 gap-6">
          <Button variant="ghost" size="icon" asChild className="h-8 w-8">
            <Link href="/dashboard/projects">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>

          {/* Project Name with Edit */}
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
          <Button variant="outline" size="sm" className="h-8">
            <Share2 className="h-3.5 w-3.5 mr-1.5" />
            Compartir
          </Button>
        </div>
      </div>

      {/* Mobile Tab Navigation */}
      <div className="lg:hidden border-b bg-white sticky top-0 z-10">
        <Tabs value={mobileTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 rounded-none h-12">
            <TabsTrigger
              value="gallery"
              onClick={() => setMobileTab('gallery')}
              className="data-[state=active]:border-b-2 data-[state=active]:border-[#A3B1A1] rounded-none"
            >
              <Images className="h-4 w-4 mr-2" />
              Galería
            </TabsTrigger>
            <TabsTrigger
              value="design"
              onClick={() => setMobileTab('design')}
              className="data-[state=active]:border-b-2 data-[state=active]:border-[#A3B1A1] rounded-none"
            >
              <Wand2 className="h-4 w-4 mr-2" />
              Diseñar
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto">
        {/* Mobile View */}
        <div className="lg:hidden">
          <Tabs value={mobileTab} className="h-full">
            <TabsContent value="gallery" className="m-0">
              <GalleryView />
            </TabsContent>
            <TabsContent value="design" className="m-0">
              <DesignPanel />
            </TabsContent>
          </Tabs>
        </div>

        {/* Desktop View */}
        <div className="hidden lg:flex h-full">
          <div className="flex-1 bg-white overflow-auto">
            <GalleryView />
          </div>
          <div className="w-[380px] bg-gray-50 border-l flex flex-col">
            <div className="p-4 border-b bg-white">
              <h2 className="text-sm font-semibold text-gray-900">Panel de Diseño</h2>
              <p className="text-xs text-gray-500 mt-0.5">Personaliza tu transformación</p>
            </div>
            <div className="flex-1 overflow-y-auto">
              <DesignPanel />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Action Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-20">
        <div className="flex items-center justify-around py-2 px-4">
          <label htmlFor="mobile-upload-input">
            <Button size="sm" variant="outline" asChild className="h-9">
              <span className="text-xs flex items-center">
                <Upload className="h-4 w-4 mr-1.5" />
                Subir
              </span>
            </Button>
            <input
              id="mobile-upload-input"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleImageUpload(file)
              }}
            />
          </label>

          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-full">
            <Images className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">
              {variants.filter(v => v.status === 'completed').length}
            </span>
            <span className="text-xs text-gray-500">diseños</span>
          </div>

          {project && variants.length > 0 && (
            <Button size="sm" variant="outline" className="h-9">
              <Share2 className="h-4 w-4 mr-1.5" />
              <span className="text-xs">Compartir</span>
            </Button>
          )}
        </div>
      </div>

      {/* Modals */}
      {viewerModal.isOpen && viewerModal.variant && selectedBaseImage && (
        <ImageViewerModal
          isOpen={viewerModal.isOpen}
          onClose={() => setViewerModal({ isOpen: false })}
          originalImage={selectedBaseImage.url}
          processedImage={viewerModal.variant.result_image_url || ''}
          styleName={viewerModal.variant.style?.name}
          roomType={viewerModal.variant.room_type?.name}
          colorScheme={viewerModal.variant.color_palette?.name}
          projectId={id}
          variantId={viewerModal.variant.id}
          initialMode={viewerModal.initialMode}
        />
      )}

      {expandedBaseImage && selectedBaseImage && (
        <Dialog open={expandedBaseImage} onOpenChange={setExpandedBaseImage}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>{selectedBaseImage.name || 'Imagen Base'}</DialogTitle>
            </DialogHeader>
            <div className="relative aspect-video w-full">
              <Image
                src={selectedBaseImage.url}
                alt={selectedBaseImage.name || 'Imagen'}
                fill
                className="object-contain"
              />
            </div>
          </DialogContent>
        </Dialog>
      )}

      <NoTokensDialog
        isOpen={showNoTokensDialog}
        onClose={() => setShowNoTokensDialog(false)}
      />
    </div>
  )
}