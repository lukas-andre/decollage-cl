'use client'

import { use, useEffect, useState, memo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ArrowLeft, Loader2, Zap, Wand2, Images, Expand, Upload, Share2 } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useMediaQuery } from '@/hooks/use-media-query'
import { ShareButton } from '@/components/share/ShareButton'
import { EnhancedShareDialog } from '@/components/share/EnhancedShareDialog'
import { ShareSuccessDialog } from '@/components/share/ShareSuccessDialog'
import { createClient } from '@/lib/supabase/client'
import { shareService } from '@/lib/services/share.service'

// Contexts
import { ProjectProvider, useProject } from '@/contexts/ProjectContext'
import { GenerationProvider, useGeneration } from '@/contexts/GenerationContext'

// Components
import { BaseImageSelector } from '@/components/projects/BaseImageSelector'
import { VariantsGallery } from '@/components/projects/VariantsGallery'
import { ContextFirstWizard } from '@/components/projects/ContextFirstWizard'
import { ImageViewerModal } from '@/components/projects/ImageViewerModal'
import { NoTokensDialog } from '@/components/tokens/NoTokensDialog'

// Hooks
import { useTokenBalance } from '@/hooks/useTokenBalance'
import { useWizardState } from '@/hooks/useWizardState'

// Gallery Section Component (Memoized to prevent re-renders)
const GallerySection = memo(function GallerySection({ onQuickShare }: { onQuickShare?: (variantId: string) => void }) {
  const {
    project,
    selectedBaseImage,
    variants,
    loadingVariants,
    selectedVariant,
    setSelectedBaseImage,
    setSelectedVariant,
    fetchVariants,
    addImage,
    removeImage,
    updateVariant
  } = useProject()

  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [expandedBaseImage, setExpandedBaseImage] = useState(false)
  const [viewerModal, setViewerModal] = useState<{
    isOpen: boolean
    variant?: any
    initialMode?: 'view' | 'edit'
  }>({ isOpen: false })

  // Load variants when base image changes
  useEffect(() => {
    if (selectedBaseImage) {
      fetchVariants(selectedBaseImage.id)
    }
  }, [selectedBaseImage?.id, fetchVariants])

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
      if (data.projectImage) {
        addImage(data.projectImage)
        setSelectedBaseImage(data.projectImage)
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
      removeImage(imageId)
    } catch (error) {
      console.error('Error deleting image:', error)
      toast.error('Error al eliminar imagen')
    }
  }

  const handleToggleFavorite = async (variantId: string) => {
    const variant = variants.find(v => v.id === variantId)
    if (!variant) return

    try {
      const response = await fetch(`/api/variants/${variantId}/favorite`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_favorite: !variant.is_favorite })
      })

      if (!response.ok) {
        throw new Error('Error al actualizar favorito')
      }

      updateVariant(variantId, { is_favorite: !variant.is_favorite })
      toast.success(variant.is_favorite ? 'Removido de favoritos' : 'Agregado a favoritos')
    } catch (error) {
      console.error('Error toggling favorite:', error)
      toast.error('Error al actualizar favorito')
    }
  }

  return (
    <div className="p-4 space-y-4 bg-white">
      <BaseImageSelector
        images={project?.images || []}
        selectedImage={selectedBaseImage}
        onSelectImage={setSelectedBaseImage}
        onDeleteImage={handleDeleteImage}
        onUploadImage={handleImageUpload}
        isUploading={isUploadingImage}
      />

      {/* Selected Base Image Preview */}
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

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-900">Diseños Generados</h2>
          {selectedBaseImage && (
            <Badge variant="secondary" className="text-xs">
              {variants.length} diseño{variants.length !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>

        {selectedBaseImage ? (
          <VariantsGallery
            variants={variants}
            selectedVariant={selectedVariant}
            loading={loadingVariants}
            onSelectVariant={setSelectedVariant}
            onToggleFavorite={handleToggleFavorite}
            onOpenViewer={(variant, mode) => setViewerModal({ isOpen: true, variant, initialMode: mode })}
          />
        ) : (
          <div className="text-center py-16 px-8">
            <p className="text-sm text-gray-500">
              Selecciona o sube una imagen base para comenzar
            </p>
          </div>
        )}
      </div>

      {viewerModal.isOpen && viewerModal.variant && selectedBaseImage && (
        <ImageViewerModal
          isOpen={viewerModal.isOpen}
          onClose={() => setViewerModal({ isOpen: false })}
          originalImage={selectedBaseImage.url}
          processedImage={viewerModal.variant.result_image_url || ''}
          styleName={viewerModal.variant.style?.name}
          roomType={viewerModal.variant.room_type?.name}
          colorScheme={viewerModal.variant.color_palette?.name}
          projectId={project?.id || ''}
          variantId={viewerModal.variant.id}
          initialMode={viewerModal.initialMode}
          onQuickShare={onQuickShare}
        />
      )}

      {/* Dialog for expanded base image */}
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
    </div>
  )
})

// Design Panel Component (Memoized)
const DesignPanel = memo(function DesignPanel({ 
  projectId, 
  designData, 
  isVisible 
}: { 
  projectId: string
  designData: any
  isVisible: boolean
}) {
  const { selectedBaseImage, addVariant, setSelectedVariant, variants } = useProject()
  const {
    generating,
    generationComplete,
    lastGeneratedVariant,
    setGenerating,
    setGenerationComplete,
    setLastGeneratedVariant
  } = useGeneration()

  const { available: tokenBalance, hasTokens, deduct: deductTokens } = useTokenBalance()
  const [showNoTokensDialog, setShowNoTokensDialog] = useState(false)
  const [expandedImage, setExpandedImage] = useState(false)
  const [viewerModal, setViewerModal] = useState<{
    isOpen: boolean
    variant?: any
    initialMode?: 'view' | 'edit'
  }>({ isOpen: false })
  const isMobile = useMediaQuery('(max-width: 1024px)')

  // Use wizard state hook with proper isolation
  const {
    step: wizardStep,
    formData: wizardFormData,
    setStep: setWizardStep,
    setFormData: setWizardFormData,
    reset: resetWizardState
  } = useWizardState({ projectId, baseImageId: selectedBaseImage?.id })

  const handleGenerate = async (params: any) => {
    if (!selectedBaseImage) return

    // Keep wizard on step 4
    setWizardStep(4)
    setGenerating(true)
    setGenerationComplete(false)
    setLastGeneratedVariant(null)

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
        addVariant(data.transformation)
        setLastGeneratedVariant(data.transformation)
        setSelectedVariant(data.transformation.id)
        toast.success(
          data.transformation.status === 'completed'
            ? '¡Diseño generado!'
            : 'Generando diseño...'
        )

        if (data.transformation.status === 'completed') {
          setGenerationComplete(true)
        }
      }
    } catch (error) {
      console.error('Error generating variant:', error)
      toast.error(error instanceof Error ? error.message : 'Error al generar variante')
    } finally {
      setGenerating(false)
    }
  }

  if (!selectedBaseImage || !designData) {
    return (
      <div className="p-4 text-center">
        <div className="w-10 h-10 rounded-full bg-gray-200 mx-auto mb-2 flex items-center justify-center">
          <Wand2 className="h-5 w-5 text-gray-400" />
        </div>
        <p className="text-sm text-gray-600 font-medium">
          Selecciona una imagen
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Para comenzar a diseñar
        </p>
      </div>
    )
  }

  return (
    <div className={`p-4 ${!isVisible ? 'hidden' : ''}`}>
      {/* Mobile: Show selected image preview at top */}
      {isMobile && selectedBaseImage && (
        <div className="lg:hidden mb-4 p-3 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <div
              className="w-16 h-16 relative rounded overflow-hidden flex-shrink-0 cursor-pointer"
              onClick={() => setExpandedImage(true)}
            >
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
              <p className="text-[10px] text-blue-500 mt-1">
                Toca para expandir
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Dialog for expanded image */}
      {expandedImage && selectedBaseImage && (
        <Dialog open={expandedImage} onOpenChange={setExpandedImage}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Imagen Base</DialogTitle>
            </DialogHeader>
            <div className="relative aspect-video w-full">
              <Image
                src={selectedBaseImage.url}
                alt="Imagen base"
                fill
                className="object-contain"
              />
            </div>
          </DialogContent>
        </Dialog>
      )}

      <ContextFirstWizard
        designData={{
          styles: designData.styles || [],
          roomTypes: designData.roomTypes || [],
          colorPalettes: designData.colorSchemes || []
        }}
        generating={generating}
        hasTokens={hasTokens}
        tokenBalance={tokenBalance}
        onGenerate={handleGenerate}
        onNoTokens={() => setShowNoTokensDialog(true)}
        onGenerationComplete={generationComplete}
        lastGeneratedVariant={lastGeneratedVariant}
        currentStep={wizardStep}
        onStepChange={setWizardStep}
        formData={wizardFormData}
        onFormDataChange={setWizardFormData}
        onStartNewDesign={() => {
          resetWizardState()
          setGenerationComplete(false)
          setLastGeneratedVariant(null)
        }}
        onViewGeneratedImage={(variant) => {
          if (!variant || !selectedBaseImage) return
          setViewerModal({ isOpen: true, variant, initialMode: 'view' })
        }}
      />

      <NoTokensDialog
        isOpen={showNoTokensDialog}
        onClose={() => setShowNoTokensDialog(false)}
      />

      {/* ImageViewerModal for generated images */}
      {viewerModal.isOpen && viewerModal.variant && selectedBaseImage && (
        <ImageViewerModal
          isOpen={viewerModal.isOpen}
          onClose={() => setViewerModal({ isOpen: false })}
          originalImage={selectedBaseImage.url}
          processedImage={viewerModal.variant.result_image_url || ''}
          styleName={viewerModal.variant.style?.name}
          roomType={viewerModal.variant.room_type?.name}
          colorScheme={viewerModal.variant.color_palette?.name}
          projectId={projectId}
          variantId={viewerModal.variant.id}
          initialMode={viewerModal.initialMode}
        />
      )}
    </div>
  )
})

// Main Page Component
function ProjectPageContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { project, setProject, selectedBaseImage, setSelectedBaseImage, variants } = useProject()
  const { available: tokenBalance } = useTokenBalance()
  const [loading, setLoading] = useState(true)
  const [mobileTab, setMobileTab] = useState<'gallery' | 'design'>('gallery')
  const [designData, setDesignData] = useState<any>(null)
  const [designDataLoading, setDesignDataLoading] = useState(false)
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [shareSuccessDialogOpen, setShareSuccessDialogOpen] = useState(false)
  const [shareUrl, setShareUrl] = useState('')
  const [shareFormat, setShareFormat] = useState<'quick' | 'story'>('quick')
  const [selectedShareVariants, setSelectedShareVariants] = useState<string[]>([])
  const [isSharing, setIsSharing] = useState(false)
  const isMobile = useMediaQuery('(max-width: 1024px)')
  const supabase = createClient()

  useEffect(() => {
    fetchProject()
    fetchDesignData()
  }, [id])

  const fetchDesignData = async () => {
    try {
      setDesignDataLoading(true)
      const response = await fetch('/api/design-data')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al cargar datos de diseño')
      }

      setDesignData(data)
    } catch (error) {
      console.error('Error fetching design data:', error)
      toast.error('Error al cargar opciones de diseño')
    } finally {
      setDesignDataLoading(false)
    }
  }

  const handleQuickShare = (variantId: string) => {
    setSelectedShareVariants([variantId])
    setShareDialogOpen(true)
  }

  const handleShare = async (selectedIds: string[], format: 'quick' | 'story') => {
    try {
      setIsSharing(true)
      setShareFormat(format)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user || !project) {
        toast.error('Debes iniciar sesión para compartir')
        return
      }

      // Create share using the existing service
      const shareResponse = await shareService.createShare(project.id, {
        type: 'project',
        customTitle: project.name,
        customDescription: project.description || undefined,
        featured: selectedIds,
        visibility: 'public'
      }, supabase)

      // Update the share with our new format-specific data
      const whatsappMessage = format === 'quick'
        ? `¡Mira cómo transformé mi espacio con Decollage! 🏠✨\n\nProyecto: ${project.name}\n\nDescubre más transformaciones en decollage.cl`
        : null

      await supabase
        .from('project_shares')
        .update({
          share_format: format,
          whatsapp_message: whatsappMessage
        })
        .eq('share_token', shareResponse.shareToken)

      setShareUrl(shareResponse.shareUrl)
      setShareDialogOpen(false)
      setShareSuccessDialogOpen(true)

    } catch (error) {
      console.error('Error sharing project:', error)
      toast.error('Error al compartir el proyecto')
    } finally {
      setIsSharing(false)
    }
  }

  const fetchProject = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/projects/${id}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al cargar proyecto')
      }

      setProject(data.project)

      if (data.project.images?.length > 0) {
        setSelectedBaseImage(data.project.images[0])
      }
    } catch (error) {
      console.error('Error fetching project:', error)
      toast.error('Error al cargar proyecto')
    } finally {
      setLoading(false)
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
      {/* Header */}
      <div className="border-b bg-white flex-shrink-0">
        <div className="flex items-center justify-between h-14 px-4 lg:h-12 lg:px-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild className="h-9 w-9 lg:h-8 lg:w-8">
              <Link href="/dashboard/projects">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-sm font-medium text-gray-900">{project.name}</h1>
          </div>

          <div className="flex items-center gap-2">
            {/* Desktop Share Button */}
            {project && variants.length > 0 && (
              <div className="hidden lg:block">
                <ShareButton
                  project={project as any}
                  generations={variants as any}
                  className="h-8"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Tabs */}
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

      {/* Content */}
      <div className={`flex-1 overflow-auto lg:pb-0 ${
        isMobile && mobileTab === 'gallery' ? 'pb-32' : 'pb-0'
      }`}>
        {/* Mobile View */}
        <div className="lg:hidden">
          <div className={mobileTab === 'gallery' ? '' : 'hidden'}>
            <GallerySection onQuickShare={handleQuickShare} />
          </div>
          <div className={mobileTab === 'design' ? '' : 'hidden'}>
            {designDataLoading ? (
              <div className="p-4 text-center">
                <Loader2 className="h-6 w-6 animate-spin text-[#A3B1A1] mx-auto mb-2" />
                <p className="text-sm text-gray-500">Cargando opciones de diseño...</p>
              </div>
            ) : (
              <DesignPanel 
                projectId={id} 
                designData={designData}
                isVisible={mobileTab === 'design'}
              />
            )}
          </div>
        </div>

        {/* Desktop View */}
        <div className="hidden lg:flex h-full">
          <div className="flex-1 bg-white overflow-auto">
            <GallerySection onQuickShare={handleQuickShare} />
          </div>
          <div className="w-[380px] bg-gray-50 border-l flex flex-col">
            <div className="p-4 border-b bg-white">
              <h2 className="text-sm font-semibold text-gray-900">Panel de Diseño</h2>
              <p className="text-xs text-gray-500 mt-0.5">Personaliza tu transformación</p>
            </div>
            <div className="flex-1 overflow-y-auto">
              {designDataLoading ? (
                <div className="p-4 text-center">
                  <Loader2 className="h-6 w-6 animate-spin text-[#A3B1A1] mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Cargando opciones de diseño...</p>
                </div>
              ) : (
                <DesignPanel 
                  projectId={id} 
                  designData={designData}
                  isVisible={true}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Bar - Only in Gallery view */}
      {isMobile && project && mobileTab === 'gallery' && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-100 z-20">
          <div className="px-4 py-4">
            {/* Three Action Buttons */}
            <div className="grid grid-cols-3 gap-3">
              {/* Subir Foto */}
              <Button
                variant="ghost"
                className="flex flex-col items-center gap-1.5 h-auto py-3 px-2 text-[#333333] hover:bg-[#F8F8F8] transition-all duration-300"
                onClick={() => {
                  // Trigger file upload for base image
                  const fileInput = document.createElement('input')
                  fileInput.type = 'file'
                  fileInput.accept = 'image/*'
                  fileInput.onchange = (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0]
                    if (file) {
                      // Use existing handleImageUpload logic from GallerySection
                      // This would need to be lifted up or accessed via context
                      toast.success('Función de subida próximamente')
                    }
                  }
                  fileInput.click()
                }}
              >
                <Upload className="h-5 w-5" />
                <span className="text-xs font-light tracking-wide" style={{ fontFamily: 'Lato, sans-serif' }}>
                  Subir
                </span>
              </Button>

              {/* Diseñar */}
              <Button
                variant="ghost"
                className="flex flex-col items-center gap-1.5 h-auto py-3 px-2 bg-[#A3B1A1]/10 text-[#A3B1A1] hover:bg-[#A3B1A1]/20 transition-all duration-300 border border-[#A3B1A1]/20"
                onClick={() => setMobileTab('design')}
                disabled={!selectedBaseImage}
              >
                <Wand2 className="h-5 w-5" />
                <span className="text-xs font-light tracking-wide" style={{ fontFamily: 'Lato, sans-serif' }}>
                  Diseñar
                </span>
              </Button>

              {/* Compartir */}
              <Button
                variant="ghost"
                className="flex flex-col items-center gap-1.5 h-auto py-3 px-2 text-[#333333] hover:bg-[#F8F8F8] transition-all duration-300"
                onClick={() => {
                  if (variants.length > 0) {
                    setSelectedShareVariants(variants.map(v => v.id))
                    setShareDialogOpen(true)
                  } else {
                    toast.error('Necesitas generar al menos un diseño para compartir')
                  }
                }}
                disabled={variants.length === 0}
              >
                <Share2 className="h-5 w-5" />
                <span className="text-xs font-light tracking-wide" style={{ fontFamily: 'Lato, sans-serif' }}>
                  Compartir
                </span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Share Dialogs */}
      {project && (
        <>
          <EnhancedShareDialog
            open={shareDialogOpen}
            onOpenChange={setShareDialogOpen}
            project={project as any}
            generations={variants as any}
            onShare={handleShare}
          />

          <ShareSuccessDialog
            open={shareSuccessDialogOpen}
            onOpenChange={setShareSuccessDialogOpen}
            shareUrl={shareUrl}
            format={shareFormat}
          />
        </>
      )}
    </div>
  )
}

// Export with Providers
export default function RefactoredProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  return (
    <ProjectProvider projectId={id}>
      <GenerationProvider>
        <ProjectPageContent params={params} />
      </GenerationProvider>
    </ProjectProvider>
  )
}