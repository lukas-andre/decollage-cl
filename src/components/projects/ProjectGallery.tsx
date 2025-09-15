'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { 
  Play, 
  Palette, 
  Download, 
  Eye,
  Loader2,
  Clock,
  CheckCircle,
  AlertCircle,
  Coins
} from 'lucide-react'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { BeforeAfterSlider } from '@/components/projects/BeforeAfterSlider'

interface ProjectImage {
  id: string
  original_image_url: string
  image_name: string
  tags: string[]
  notes: string
  status: 'uploaded' | 'processing' | 'completed' | 'failed'
  upload_order: number
  created_at: string
  staging_generation?: {
    id: string
    status: string
    processed_image_url: string | null
    tokens_consumed: number
    created_at: string
    completed_at: string | null
    metadata: Record<string, unknown>
    staging_styles?: {
      name: string
      code: string
    }
  }
}

interface ProjectGalleryProps {
  projectId: string
  images: ProjectImage[]
  onImageGenerated?: () => void
}

interface GenerateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  image: ProjectImage | null
  onGenerate: (style: string, roomType?: string, instructions?: string) => Promise<void>
}

const statusConfig = {
  uploaded: { 
    label: 'Subida', 
    color: 'bg-blue-500',
    icon: Clock
  },
  processing: { 
    label: 'Procesando', 
    color: 'bg-yellow-500',
    icon: Loader2
  },
  completed: { 
    label: 'Completada', 
    color: 'bg-green-500',
    icon: CheckCircle
  },
  failed: { 
    label: 'Error', 
    color: 'bg-red-500',
    icon: AlertCircle
  },
}

interface StagingStyle {
  id: string
  name: string
  code: string
  description?: string
}

interface RoomType {
  id: string
  name: string
  essential_furniture: string[]
  specific_instructions: string
}

function GenerateDialog({ open, onOpenChange, image, onGenerate }: GenerateDialogProps) {
  const [selectedStyle, setSelectedStyle] = useState('')
  const [selectedRoomType, setSelectedRoomType] = useState('')
  const [instructions, setInstructions] = useState('')
  const [generating, setGenerating] = useState(false)
  const [stagingStyles, setStagingStyles] = useState<StagingStyle[]>([])
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (open) {
      fetchData()
    }
  }, [open])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch styles and room types in parallel
      const [stylesResponse, roomTypesResponse] = await Promise.all([
        fetch('/api/styles'),
        fetch('/api/room-types')
      ])

      if (stylesResponse.ok) {
        const stylesData = await stylesResponse.json()
        setStagingStyles(stylesData.styles || [])
      }

      if (roomTypesResponse.ok) {
        const roomTypesData = await roomTypesResponse.json()
        setRoomTypes(roomTypesData.roomTypes || [])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Error al cargar estilos y tipos de habitación')
    } finally {
      setLoading(false)
    }
  }

  const handleGenerate = async () => {
    if (!selectedStyle) {
      toast.error('Selecciona un estilo')
      return
    }

    try {
      setGenerating(true)
      await onGenerate(selectedStyle, selectedRoomType, instructions)
      onOpenChange(false)
      setSelectedStyle('')
      setSelectedRoomType('')
      setInstructions('')
    } catch (error) {
      console.error('Generation error:', error)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Generar staging virtual</DialogTitle>
          <DialogDescription>
            Configura los parámetros para generar el staging de &quot;{image?.image_name}&quot;
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Estilo *</label>
            <Select value={selectedStyle} onValueChange={setSelectedStyle}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un estilo" />
              </SelectTrigger>
              <SelectContent>
                {loading ? (
                  <SelectItem value="loading" disabled>Cargando...</SelectItem>
                ) : (
                  stagingStyles.map((style, index) => (
                    <SelectItem key={`${style.code}-${index}`} value={style.code}>
                      {style.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Tipo de habitación</label>
            <Select value={selectedRoomType} onValueChange={setSelectedRoomType}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona tipo (opcional)" />
              </SelectTrigger>
              <SelectContent>
                {loading ? (
                  <SelectItem value="loading" disabled>Cargando...</SelectItem>
                ) : (
                  roomTypes.map((room, index) => (
                    <SelectItem key={`${room.id}-${index}`} value={room.id}>
                      {room.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Instrucciones personalizadas</label>
            <textarea
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Especificaciones adicionales..."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              disabled={generating}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={generating}
          >
            Cancelar
          </Button>
          <Button onClick={handleGenerate} disabled={generating || !selectedStyle || loading}>
            {generating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generando...
              </>
            ) : (
              <>
                <Palette className="mr-2 h-4 w-4" />
                Generar (10 tokens)
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function ProjectGallery({ 
  projectId, 
  images, 
  onImageGenerated 
}: ProjectGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<ProjectImage | null>(null)
  const [showGenerateDialog, setShowGenerateDialog] = useState(false)
  const [viewingImage, setViewingImage] = useState<ProjectImage | null>(null)

  const handleGenerate = async (imageId: string, style: string, roomType?: string, instructions?: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/images/${imageId}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          style,
          roomType: roomType || undefined,
          customInstructions: instructions || undefined,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Error al generar staging')
      }

      toast.success(result.message || 'Generación iniciada')
      onImageGenerated?.()
    } catch (error) {
      console.error('Generate error:', error)
      toast.error(error instanceof Error ? error.message : 'Error al generar staging')
      throw error
    }
  }

  const openGenerateDialog = (image: ProjectImage) => {
    setSelectedImage(image)
    setShowGenerateDialog(true)
  }

  const downloadImage = async (url: string, filename: string) => {
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)
    } catch (error) {
      console.error('Download error:', error)
      toast.error('Error al descargar imagen')
    }
  }

  if (images.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
          <Eye className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No hay imágenes en este proyecto</h3>
        <p className="text-muted-foreground">
          Sube algunas imágenes para comenzar a generar staging virtual.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {images.map((image) => {
          const status = statusConfig[image.status]
          const StatusIcon = status.icon

          return (
            <Card key={image.id} className="overflow-hidden">
              <div className="relative aspect-video bg-muted">
                {image.staging_generation?.processed_image_url ? (
                  // Show before/after comparison for completed generations
                  <BeforeAfterSlider
                    beforeImage={image.original_image_url}
                    afterImage={image.staging_generation.processed_image_url}
                    beforeAlt="Original"
                    afterAlt="Staging virtual"
                  />
                ) : (
                  // Show original image only
                  <Image
                    src={image.original_image_url}
                    alt={image.image_name}
                    fill
                    className="object-cover"
                  />
                )}
                
                {/* Status overlay */}
                <div className="absolute top-2 left-2">
                  <Badge className={`${status.color} text-white gap-1`}>
                    <StatusIcon 
                      className={`h-3 w-3 ${
                        status.icon === Loader2 ? 'animate-spin' : ''
                      }`} 
                    />
                    {status.label}
                  </Badge>
                </div>

                {/* Actions overlay */}
                <div className="absolute top-2 right-2 flex gap-1">
                  {image.staging_generation?.processed_image_url && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => downloadImage(
                        image.staging_generation!.processed_image_url!,
                        `staged_${image.image_name}.jpg`
                      )}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setViewingImage(image)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate" title={image.image_name}>
                      {image.image_name}
                    </h3>
                    {image.staging_generation?.staging_styles && (
                      <p className="text-sm text-muted-foreground">
                        {image.staging_generation.staging_styles.name}
                      </p>
                    )}
                  </div>
                  
                  {image.staging_generation?.tokens_consumed && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Coins className="h-3 w-3" />
                      {image.staging_generation.tokens_consumed}
                    </div>
                  )}
                </div>

                {image.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {image.tags.slice(0, 2).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {image.tags.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{image.tags.length - 2}
                      </Badge>
                    )}
                  </div>
                )}

                <div className="flex justify-between items-center text-xs text-muted-foreground mb-3">
                  <span>
                    {formatDistanceToNow(new Date(image.created_at), { 
                      addSuffix: true,
                      locale: es 
                    })}
                  </span>
                  {image.staging_generation?.completed_at && (
                    <span>
                      Completado {formatDistanceToNow(new Date(image.staging_generation.completed_at), { 
                        addSuffix: true,
                        locale: es 
                      })}
                    </span>
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex gap-2">
                  {!image.staging_generation && image.status !== 'processing' && (
                    <Button
                      size="sm"
                      onClick={() => openGenerateDialog(image)}
                      className="flex-1"
                    >
                      <Play className="mr-2 h-4 w-4" />
                      Generar staging
                    </Button>
                  )}
                  
                  {image.status === 'failed' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openGenerateDialog(image)}
                      className="flex-1"
                    >
                      <Play className="mr-2 h-4 w-4" />
                      Reintentar
                    </Button>
                  )}

                  {image.staging_generation?.status === 'completed' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openGenerateDialog(image)}
                      className="flex-1"
                    >
                      <Palette className="mr-2 h-4 w-4" />
                      Nuevo estilo
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Generate Dialog */}
      <GenerateDialog
        open={showGenerateDialog}
        onOpenChange={setShowGenerateDialog}
        image={selectedImage}
        onGenerate={async (style, roomType, instructions) => {
          if (selectedImage) {
            await handleGenerate(selectedImage.id, style, roomType, instructions)
          }
        }}
      />

      {/* Image Viewer Dialog */}
      {viewingImage && (
        <Dialog open={!!viewingImage} onOpenChange={() => setViewingImage(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>{viewingImage.image_name}</DialogTitle>
              {viewingImage.notes && (
                <DialogDescription>{viewingImage.notes}</DialogDescription>
              )}
            </DialogHeader>

            <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
              {viewingImage.staging_generation?.processed_image_url ? (
                <BeforeAfterSlider
                  beforeImage={viewingImage.original_image_url}
                  afterImage={viewingImage.staging_generation.processed_image_url}
                  beforeAlt="Original"
                  afterAlt="Staging virtual"
                />
              ) : (
                <Image
                  src={viewingImage.original_image_url}
                  alt={viewingImage.image_name}
                  fill
                  className="object-contain"
                />
              )}
            </div>

            {viewingImage.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {viewingImage.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}