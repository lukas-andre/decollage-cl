'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
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
  RefreshCw
} from 'lucide-react'
import { BeforeAfterSlider } from './BeforeAfterSlider'
import { uploadImage } from '@/utils/upload'
import { toast } from 'sonner'

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
      await uploadImage(imageToAdd, projectId)

      if (onAddAsBaseImage) {
        onAddAsBaseImage()
      }

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
      <DialogContent className="max-w-[95vw] md:max-w-[85vw] lg:max-w-[80vw] xl:max-w-7xl w-full max-h-[90vh] p-0" showCloseButton={false}>
        <DialogHeader className="p-4 pb-2 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl flex items-center gap-2">
              {mode === 'edit' ? (
                <>
                  <Sparkles className="h-5 w-5 text-[#A3B1A1]" />
                  Editar Diseño
                </>
              ) : (
                <>
                  <Eye className="h-5 w-5" />
                  {viewMode === 'comparison' ? 'Comparación' : 'Vista de Diseño'}
                </>
              )}
            </DialogTitle>
            <div className="flex items-center gap-2">
              {/* Main action buttons always visible */}
              {mode === 'view' && (
                <>
                  {/* Edit Button - Most prominent */}
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

                  {/* View Mode Toggle */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setViewMode(viewMode === 'single' ? 'comparison' : 'single')}
                    className="gap-2"
                  >
                    <ArrowLeftRight className="h-4 w-4" />
                    {viewMode === 'single' ? 'Comparar' : 'Vista Simple'}
                  </Button>

                  {/* Add as Base Image */}
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

                  {/* Download Button */}
                  {viewMode === 'single' ? (
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
                  ) : (
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(originalImage, 'original.jpg')}
                        className="gap-1 px-2"
                      >
                        <Download className="h-3 w-3" />
                        Original
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(currentImage, getFileName())}
                        className="gap-1 px-2"
                      >
                        <Download className="h-3 w-3" />
                        Diseño
                      </Button>
                    </div>
                  )}

                  {/* Quick Share Button */}
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
                </>
              )}

              {mode === 'edit' && (
                <>
                  {/* Back to view button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setMode('view')
                      setPrompt('')
                      setVariations([])
                      setSelectedVariation(null)
                    }}
                    className="gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    Ver
                  </Button>
                </>
              )}

              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8 ml-2"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Metadata or Status */}
          {mode === 'view' && (
            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
              {styleName && <span>Estilo: {styleName}</span>}
              {roomType && <span>• Habitación: {roomType}</span>}
              {colorScheme && <span>• Colores: {colorScheme}</span>}
            </div>
          )}

          {mode === 'edit' && variations.length > 0 && (
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary">
                {variations.length} variaciones generadas
              </Badge>
              {selectedVariation !== null && (
                <Badge className="bg-[#A3B1A1]/10 text-[#A3B1A1] border-[#A3B1A1]">
                  Variación {selectedVariation + 1} seleccionada
                </Badge>
              )}
            </div>
          )}
        </DialogHeader>

        <div className="flex flex-col" style={{ height: 'calc(90vh - 90px)' }}>
          {mode === 'view' ? (
            // View Mode
            <div className="relative flex-1 bg-muted/50">
              {viewMode === 'comparison' ? (
                <div className="relative w-full h-full flex items-center justify-center p-4">
                  <div className="relative w-full h-full max-w-full max-h-full">
                    <BeforeAfterSlider
                      beforeImage={originalImage}
                      afterImage={currentImage}
                      beforeAlt="Original"
                      afterAlt="Diseño Virtual"
                      className="w-full h-full"
                    />
                  </div>
                  <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20">
                    <div className="bg-black/60 text-white text-sm px-4 py-2 rounded-full backdrop-blur-sm">
                      Desliza para comparar
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative w-full h-full">
                  <Image
                    src={showOriginal ? originalImage : currentImage}
                    alt={showOriginal ? "Original" : "Diseño Virtual"}
                    fill
                    className="object-contain"
                    priority
                  />

                  {/* Toggle between original and processed in single view */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                    <Button
                      variant={!showOriginal ? "default" : "secondary"}
                      size="sm"
                      onClick={() => setShowOriginal(false)}
                    >
                      Diseño Virtual
                    </Button>
                    <Button
                      variant={showOriginal ? "default" : "secondary"}
                      size="sm"
                      onClick={() => setShowOriginal(true)}
                    >
                      Original
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            // Edit Mode
            <div className="flex flex-1 overflow-hidden">
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

              {/* Variations Sidebar */}
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
          )}

          {/* Bottom Prompt Bar (Edit Mode Only) */}
          {mode === 'edit' && (
            <div className="border-t px-6 py-4 bg-white">
              <div className="flex gap-3">
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe qué quieres cambiar en esta imagen. Ej: 'Cambia el sofá por uno más moderno en tonos grises', 'Agrega más plantas', 'Hazlo más iluminado'"
                  className="flex-1 min-h-[80px] max-h-[120px] text-sm"
                  disabled={isGenerating}
                />

                <Button
                  onClick={handleGenerate}
                  disabled={!prompt.trim() || isGenerating}
                  className="bg-gradient-to-r from-[#A3B1A1] to-[#C4886F] hover:from-[#A3B1A1]/90 hover:to-[#C4886F]/90 min-w-[140px]"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generando...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generar
                    </>
                  )}
                </Button>
              </div>

              <p className="text-xs text-gray-500 mt-2">
                💡 Describe los cambios que deseas ver en el diseño.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}