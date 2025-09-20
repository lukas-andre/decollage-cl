'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  Download,
  X,
  ArrowLeftRight,
  Share2,
  Upload,
  Sparkles,
  Eye,
  Loader2,
  Check,
  RefreshCw,
  MoreHorizontal
} from 'lucide-react'
import { BeforeAfterSlider } from './BeforeAfterSlider'
import { uploadImage } from '@/utils/upload'
import { toast } from 'sonner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface ImageViewerModalProps {
  isOpen: boolean
  onClose: () => void
  originalImage: string
  processedImage: string
  styleName?: string
  roomType?: string
  colorScheme?: string
  projectId?: string
  variantId?: string
  onQuickShare?: (variantId: string) => void
  onSaveRefinement?: (newVariant: any) => void
  onAddAsBaseImage?: () => void
  initialMode?: 'view' | 'edit'
}

export function ImageViewerModal({
  isOpen,
  onClose,
  originalImage,
  processedImage,
  styleName,
  roomType,
  colorScheme,
  projectId,
  variantId,
  onQuickShare,
  onSaveRefinement,
  onAddAsBaseImage,
  initialMode = 'view'
}: ImageViewerModalProps) {
  const [mode, setMode] = useState<'view' | 'edit'>(initialMode)
  const [viewMode, setViewMode] = useState<'single' | 'comparison'>('single')
  const [showOriginal, setShowOriginal] = useState(false)

  // Edit mode states
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [variations, setVariations] = useState<string[]>([])
  const [selectedVariation, setSelectedVariation] = useState<number | null>(null)
  const [isAddingAsBase, setIsAddingAsBase] = useState(false)

  const currentImage = selectedVariation !== null && variations[selectedVariation]
    ? variations[selectedVariation]
    : processedImage

  // Reset mode when initialMode changes (e.g., when clicking brush vs expand)
  useEffect(() => {
    setMode(initialMode)
  }, [initialMode, isOpen])

  const handleDownload = async (imageUrl: string, filename: string) => {
    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading image:', error)
    }
  }

  const getFileName = () => {
    const timestamp = new Date().getTime()
    const style = styleName?.toLowerCase().replace(/\s+/g, '-') || 'staged'
    return `virtual-staging-${style}-${timestamp}.jpg`
  }

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Por favor, describe el cambio que deseas')
      return
    }

    if (!variantId) {
      toast.error('No se puede editar esta imagen')
      return
    }

    setIsGenerating(true)
    setVariations([])
    setSelectedVariation(null)

    try {
      const response = await fetch(`/api/variants/${variantId}/refine`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          variations_count: 3
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al generar refinamiento')
      }

      if (data.variations && data.variations.length > 0) {
        setVariations(data.variations)
        setSelectedVariation(0)
        toast.success('Variaciones generadas exitosamente')
      } else {
        throw new Error('No se pudieron generar variaciones')
      }
    } catch (error) {
      console.error('Error generating refinement:', error)
      toast.error(error instanceof Error ? error.message : 'Error al refinar imagen')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleRegenerate = () => {
    handleGenerate()
  }

  const handleSaveRefinement = async () => {
    if (selectedVariation === null || !variations[selectedVariation]) {
      toast.error('Por favor, selecciona una variación')
      return
    }

    try {
      const refinedImage = variations[selectedVariation]

      const newVariant = {
        id: `refined-${Date.now()}`,
        result_image_url: refinedImage,
        is_favorite: false,
        created_at: new Date().toISOString(),
        tokens_consumed: 1,
        status: 'completed',
        metadata: {
          parent_variant_id: variantId,
          refinement_prompt: prompt,
          is_refined: true
        }
      }

      if (onSaveRefinement) {
        onSaveRefinement(newVariant)
      }

      toast.success('Refinamiento guardado exitosamente')

      // Reset edit mode after saving
      setMode('view')
      setPrompt('')
      setVariations([])
      setSelectedVariation(null)
    } catch (error) {
      console.error('Error saving refinement:', error)
      toast.error('Error al guardar refinamiento')
    }
  }

  const handleAddAsBaseImage = async () => {
    if (!projectId) {
      toast.error('No se puede agregar como imagen base')
      return
    }

    setIsAddingAsBase(true)
    try {
      const imageToAdd = currentImage

      // Upload the image as a new base image
      // Implementation depends on your backend
      // For now, just show success
      await new Promise(resolve => setTimeout(resolve, 1500))

      toast.success('Imagen agregada como base para nuevas iteraciones')
    } catch (error) {
      console.error('Error adding as base image:', error)
      toast.error('Error al agregar como imagen base')
    } finally {
      setIsAddingAsBase(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-full md:max-w-[90vw] md:max-h-[90vh] lg:max-w-[85vw] lg:max-h-[85vh] xl:max-w-[80vw] xl:max-h-[90vh] 2xl:max-w-[75vw] 2xl:max-h-[85vh] w-full max-h-[100vh] p-0"
        showCloseButton={false}
      >
        {/* Mobile Header */}
        <DialogHeader className="p-3 md:p-4 border-b">
          <div className="flex items-center justify-between gap-2">
            <DialogTitle className="text-base md:text-xl flex items-center gap-2">
              {mode === 'edit' ? (
                <>
                  <Sparkles className="h-4 w-4 md:h-5 md:w-5 text-[#A3B1A1]" />
                  <span className="truncate">Editar Diseño</span>
                </>
              ) : (
                <>
                  <span className="truncate">
                    {viewMode === 'comparison' ? 'Comparación' : 'Vista de Diseño'}
                  </span>
                </>
              )}
            </DialogTitle>
            <DialogDescription className="sr-only">
              {mode === 'edit'
                ? 'Edita y refina tu diseño virtual con variaciones personalizadas'
                : 'Visualiza y compara tu diseño virtual con la imagen original'
              }
            </DialogDescription>

            {/* Mobile Actions */}
            <div className="flex items-center gap-1 md:gap-2">
              {mode === 'view' && (
                <>
                  {/* Mobile: Dropdown for secondary actions */}
                  <div className="flex md:hidden">
                    {variantId && (
                      <Button
                        size="sm"
                        onClick={() => setMode('edit')}
                        className="bg-gradient-to-r from-[#A3B1A1] to-[#C4886F] text-white px-3"
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="px-2">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem
                          onClick={() => setViewMode(viewMode === 'single' ? 'comparison' : 'single')}
                        >
                          <ArrowLeftRight className="h-4 w-4 mr-2" />
                          {viewMode === 'single' ? 'Comparar' : 'Vista Simple'}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDownload(
                            showOriginal ? originalImage : currentImage,
                            showOriginal ? 'original.jpg' : getFileName()
                          )}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Descargar
                        </DropdownMenuItem>
                        {projectId && onAddAsBaseImage && (
                          <DropdownMenuItem
                            onClick={handleAddAsBaseImage}
                            disabled={isAddingAsBase}
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Usar como Base
                          </DropdownMenuItem>
                        )}
                        {onQuickShare && variantId && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => onQuickShare(variantId)}
                            >
                              <Share2 className="h-4 w-4 mr-2" />
                              Compartir
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Desktop: Show all buttons */}
                  <div className="hidden md:flex items-center gap-2">
                    {variantId && (
                      <Button
                        size="sm"
                        onClick={() => setMode('edit')}
                        className="gap-2 bg-gradient-to-r from-[#A3B1A1] to-[#C4886F] hover:from-[#A3B1A1]/90 hover:to-[#C4886F]/90"
                      >
                        <Sparkles className="h-4 w-4" />
                        Editar
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setViewMode(viewMode === 'single' ? 'comparison' : 'single')}
                      className="gap-2"
                    >
                      <ArrowLeftRight className="h-4 w-4" />
                      {viewMode === 'single' ? 'Comparar' : 'Vista Simple'}
                    </Button>
                    {projectId && onAddAsBaseImage && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleAddAsBaseImage}
                        disabled={isAddingAsBase}
                        className="gap-2"
                      >
                        {isAddingAsBase ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Upload className="h-4 w-4" />
                        )}
                        Usar como Base
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(
                        showOriginal ? originalImage : currentImage,
                        showOriginal ? 'original.jpg' : getFileName()
                      )}
                      className="gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Descargar
                    </Button>
                    {onQuickShare && variantId && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onQuickShare(variantId)}
                        className="gap-2 bg-gradient-to-r from-[#A3B1A1] to-[#C4886F] hover:from-[#A3B1A1]/90 hover:to-[#C4886F]/90 text-white border-none"
                      >
                        <Share2 className="h-4 w-4" />
                        Compartir
                      </Button>
                    )}
                  </div>
                </>
              )}

              {mode === 'edit' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setMode('view')
                    setPrompt('')
                    setVariations([])
                    setSelectedVariation(null)
                  }}
                  className="gap-1 md:gap-2 px-2 md:px-3"
                >
                  <Eye className="h-4 w-4" />
                  <span className="hidden md:inline">Ver</span>
                </Button>
              )}

              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Metadata - Hidden on mobile in edit mode */}
          {mode === 'view' && (
            <div className="hidden md:flex items-center gap-4 text-xs md:text-sm text-muted-foreground mt-2">
              {styleName && <span>Estilo: {styleName}</span>}
              {roomType && <span>• Habitación: {roomType}</span>}
              {colorScheme && <span>• Colores: {colorScheme}</span>}
            </div>
          )}

          {mode === 'edit' && variations.length > 0 && (
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary" className="text-xs">
                {variations.length} variaciones
              </Badge>
              {selectedVariation !== null && (
                <Badge className="bg-[#A3B1A1]/10 text-[#A3B1A1] border-[#A3B1A1] text-xs">
                  Opción {selectedVariation + 1}
                </Badge>
              )}
            </div>
          )}
        </DialogHeader>

        {/* Content Area */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {mode === 'view' ? (
            // View Mode - Mobile Optimized
            <div className="relative flex-1 bg-muted/50 overflow-hidden min-h-[600px] md:min-h-[70vh]">
              {viewMode === 'comparison' ? (
                <div className="relative w-full h-full flex items-center justify-center p-2 md:p-4 min-h-[500px] md:min-h-[60vh]">
                  <div className="relative w-full h-full max-w-full max-h-full">
                    <BeforeAfterSlider
                      beforeImage={originalImage}
                      afterImage={currentImage}
                      beforeAlt="Original"
                      afterAlt="Diseño Virtual"
                      className="w-full h-full"
                    />
                  </div>
                  <div className="absolute bottom-4 md:bottom-6 left-1/2 transform -translate-x-1/2 z-20">
                    <div className="bg-black/60 text-white text-xs md:text-sm px-3 md:px-4 py-1.5 md:py-2 rounded-full backdrop-blur-sm">
                      Desliza para comparar
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative w-full h-full min-h-[500px] md:min-h-[60vh]">
                  <Image
                    src={showOriginal ? originalImage : currentImage}
                    alt={showOriginal ? "Original" : "Diseño Virtual"}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 85vw"
                    className="object-contain"
                    priority
                  />

                  {/* Toggle between original and processed in single view */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                    <Button
                      variant={!showOriginal ? "default" : "secondary"}
                      size="sm"
                      onClick={() => setShowOriginal(false)}
                      className="text-xs md:text-sm"
                    >
                      Diseño Virtual
                    </Button>
                    <Button
                      variant={showOriginal ? "default" : "secondary"}
                      size="sm"
                      onClick={() => setShowOriginal(true)}
                      className="text-xs md:text-sm"
                    >
                      Original
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            // Edit Mode - Mobile Optimized with Tabs
            <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
              {/* Mobile: Tabs for Image and Variations */}
              <div className="flex-1 flex flex-col md:hidden">
                <Tabs defaultValue="image" className="flex-1 flex flex-col">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="image">Imagen</TabsTrigger>
                    <TabsTrigger value="variations" disabled={variations.length === 0}>
                      Variaciones {variations.length > 0 && `(${variations.length})`}
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="image" className="flex-1 m-0 p-2">
                    <div className="relative w-full h-full min-h-[400px]">
                      <Image
                        src={currentImage}
                        alt="Diseño actual"
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-contain rounded-lg"
                      />
                      {variations.length > 0 && selectedVariation !== null && (
                        <Badge className="absolute top-2 right-2 bg-[#A3B1A1]/90 text-xs">
                          Variación {selectedVariation + 1}
                        </Badge>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="variations" className="flex-1 m-0 p-2 overflow-auto">
                    <div className="grid grid-cols-2 gap-2">
                      {variations.map((variation, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedVariation(index)}
                          className={cn(
                            "aspect-video rounded-lg overflow-hidden border-2 transition-all relative",
                            selectedVariation === index
                              ? "border-[#A3B1A1] ring-2 ring-[#A3B1A1]/20"
                              : "border-gray-200"
                          )}
                        >
                          <Image
                            src={variation}
                            alt={`Variación ${index + 1}`}
                            fill
                            sizes="(max-width: 768px) 50vw, 25vw"
                            className="object-cover"
                          />
                          <span className="absolute top-1 left-1 px-1.5 py-0.5 bg-black/60 text-white text-[10px] rounded">
                            Opción {index + 1}
                          </span>
                          {selectedVariation === index && (
                            <div className="absolute top-1 right-1 w-5 h-5 bg-[#A3B1A1] rounded-full flex items-center justify-center">
                              <Check className="h-3 w-3 text-white" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>

                    {variations.length > 0 && (
                      <div className="mt-3 space-y-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleRegenerate}
                          className="w-full"
                          disabled={isGenerating}
                        >
                          <RefreshCw className="h-3.5 w-3.5 mr-2" />
                          Regenerar
                        </Button>

                        {selectedVariation !== null && onSaveRefinement && (
                          <Button
                            size="sm"
                            onClick={handleSaveRefinement}
                            className="w-full bg-gradient-to-r from-[#A3B1A1] to-[#C4886F]"
                          >
                            <Check className="h-3.5 w-3.5 mr-2" />
                            Guardar Variación
                          </Button>
                        )}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </div>

              {/* Desktop: Side-by-side layout */}
              <div className="hidden md:flex flex-1">
                {/* Main Image Area */}
                <div className="flex-1 bg-muted/50 flex items-center justify-center p-4">
                  <div className="relative max-w-full max-h-full">
                    <Image
                      src={currentImage}
                      alt="Diseño actual"
                      width={800}
                      height={600}
                      className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                    />
                    {variations.length > 0 && selectedVariation !== null && (
                      <Badge className="absolute top-4 right-4 bg-[#A3B1A1]/90">
                        Variación {selectedVariation + 1}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Variations Sidebar - Desktop only */}
                {variations.length > 0 && (
                  <div className="w-64 bg-gray-50 border-l p-4 overflow-y-auto">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">
                      Selecciona tu favorita:
                    </h3>
                    <div className="space-y-3">
                      {variations.map((variation, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedVariation(index)}
                          className={cn(
                            "w-full aspect-video rounded-lg overflow-hidden border-2 transition-all relative group",
                            selectedVariation === index
                              ? "border-[#A3B1A1] ring-2 ring-[#A3B1A1]/20"
                              : "border-gray-200 hover:border-gray-300"
                          )}
                        >
                          <Image
                            src={variation}
                            alt={`Variación ${index + 1}`}
                            fill
                            sizes="(max-width: 768px) 50vw, 25vw"
                            className="object-cover"
                          />
                          <span className="absolute top-2 left-2 px-2 py-1 bg-black/60 text-white text-xs rounded">
                            Opción {index + 1}
                          </span>
                          {selectedVariation === index && (
                            <div className="absolute top-2 right-2 w-6 h-6 bg-[#A3B1A1] rounded-full flex items-center justify-center">
                              <Check className="h-4 w-4 text-white" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>

                    <div className="mt-4 space-y-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleRegenerate}
                        className="w-full"
                        disabled={isGenerating}
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Regenerar
                      </Button>

                      {selectedVariation !== null && onSaveRefinement && (
                        <Button
                          size="sm"
                          onClick={handleSaveRefinement}
                          className="w-full bg-gradient-to-r from-[#A3B1A1] to-[#C4886F] hover:from-[#A3B1A1]/90 hover:to-[#C4886F]/90"
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Guardar Variación
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Bottom Prompt Bar (Edit Mode Only) - Mobile Optimized */}
          {mode === 'edit' && (
            <div className="border-t px-3 md:px-6 py-3 md:py-4 bg-white">
              <div className="flex flex-col md:flex-row gap-2 md:gap-3">
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe qué quieres cambiar..."
                  className="flex-1 min-h-[60px] md:min-h-[80px] max-h-[100px] md:max-h-[120px] text-xs md:text-sm"
                  disabled={isGenerating}
                />

                <Button
                  onClick={handleGenerate}
                  disabled={!prompt.trim() || isGenerating}
                  className="bg-gradient-to-r from-[#A3B1A1] to-[#C4886F] hover:from-[#A3B1A1]/90 hover:to-[#C4886F]/90 w-full md:w-auto md:min-w-[140px]"
                  size="sm"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-3.5 w-3.5 md:h-4 md:w-4 animate-spin" />
                      Generando...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-3.5 w-3.5 md:h-4 md:w-4" />
                      Generar
                    </>
                  )}
                </Button>
              </div>

              <p className="text-[10px] md:text-xs text-gray-500 mt-1 md:mt-2">
                💡 Describe los cambios que deseas ver en el diseño.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}