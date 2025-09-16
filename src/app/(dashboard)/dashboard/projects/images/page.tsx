'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  ArrowLeft,
  Upload,
  Search,
  Filter,
  Grid3x3,
  List,
  Download,
  Trash2,
  Eye,
  FolderOpen,
  Image as ImageIcon,
  MoreVertical,
  Calendar,
  Sparkles,
  Copy,
  RefreshCw,
  Loader2
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface UserImage {
  id: string
  url: string
  thumbnail_url?: string
  cloudflare_id?: string
  name?: string
  description?: string
  image_type: string
  created_at: string
  tags?: string[]
  room_type?: string
  project?: {
    id: string
    name: string
  }
  transformation_count: number
}

export default function ProjectImagesPage() {
  const [images, setImages] = useState<UserImage[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProject, setSelectedProject] = useState<string>('all')
  const [selectedType, setSelectedType] = useState<string>('room')
  const [projects, setProjects] = useState<Array<{id: string, name: string}>>([])
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean
    image?: UserImage
  }>({ isOpen: false })
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set())
  const [bulkMode, setBulkMode] = useState(false)
  const [totalImages, setTotalImages] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [offset, setOffset] = useState(0)
  const limit = 50

  useEffect(() => {
    fetchImages()
    fetchProjects()
  }, [selectedProject, selectedType, offset])

  const fetchImages = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        type: selectedType,
        limit: limit.toString(),
        offset: offset.toString()
      })

      if (selectedProject !== 'all') {
        params.append('projectId', selectedProject)
      }

      const response = await fetch(`/api/user/images?${params}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al cargar imágenes')
      }

      setImages(data.images || [])
      setTotalImages(data.total || 0)
      setHasMore(data.hasMore || false)
    } catch (error) {
      console.error('Error fetching images:', error)
      toast.error('Error al cargar imágenes')
    } finally {
      setLoading(false)
    }
  }

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects?status=all')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al cargar proyectos')
      }

      setProjects(data.projects?.map((p: { id: string; name: string }) => ({
        id: p.id,
        name: p.name
      })) || [])
    } catch (error) {
      console.error('Error fetching projects:', error)
    }
  }

  const handleDeleteImage = async (image: UserImage) => {
    try {
      const response = await fetch(`/api/user/images?id=${image.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Error al eliminar imagen')
      }

      toast.success('Imagen eliminada correctamente')
      fetchImages()
    } catch (error) {
      console.error('Error deleting image:', error)
      toast.error('Error al eliminar imagen')
    }
  }

  const handleBulkDelete = async () => {
    if (selectedImages.size === 0) {
      toast.error('Selecciona al menos una imagen')
      return
    }

    try {
      const deletePromises = Array.from(selectedImages).map(id =>
        fetch(`/api/user/images?id=${id}`, { method: 'DELETE' })
      )

      await Promise.all(deletePromises)

      toast.success(`${selectedImages.size} imágenes eliminadas`)
      setSelectedImages(new Set())
      setBulkMode(false)
      fetchImages()
    } catch (error) {
      console.error('Error deleting images:', error)
      toast.error('Error al eliminar imágenes')
    }
  }

  const handleDownloadImage = async (image: UserImage) => {
    try {
      const response = await fetch(image.url)
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${image.name || 'image'}-${Date.now()}.jpg`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success('Imagen descargada')
    } catch (error) {
      console.error('Error downloading image:', error)
      toast.error('Error al descargar imagen')
    }
  }

  const toggleImageSelection = (imageId: string) => {
    const newSelection = new Set(selectedImages)
    if (newSelection.has(imageId)) {
      newSelection.delete(imageId)
    } else {
      newSelection.add(imageId)
    }
    setSelectedImages(newSelection)
  }

  const filteredImages = images.filter(image => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        image.name?.toLowerCase().includes(query) ||
        image.description?.toLowerCase().includes(query) ||
        image.tags?.some(tag => tag.toLowerCase().includes(query))
      )
    }
    return true
  })

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <ImageIcon className="h-8 w-8" />
            Mi Biblioteca de Imágenes
          </h1>
          <p className="text-muted-foreground mt-1">
            Gestiona todas tus imágenes en un solo lugar
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-lg px-3 py-1">
            {totalImages} {totalImages === 1 ? 'imagen' : 'imágenes'}
          </Badge>
          <Button asChild>
            <Link href="/dashboard/projects">
              <Upload className="mr-2 h-4 w-4" />
              Subir Nueva
            </Link>
          </Button>
        </div>
      </div>

      {/* Filters and Controls */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, descripción o etiquetas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={selectedProject} onValueChange={setSelectedProject}>
            <SelectTrigger className="w-[200px]">
              <FolderOpen className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Todos los proyectos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los proyectos</SelectItem>
              {projects.map(project => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-[150px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="room">Habitaciones</SelectItem>
              <SelectItem value="inspiration">Inspiración</SelectItem>
              <SelectItem value="result">Resultados</SelectItem>
              <SelectItem value="all">Todos</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2 ml-auto">
            {bulkMode && (
              <>
                <Badge variant="secondary">
                  {selectedImages.size} seleccionadas
                </Badge>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleBulkDelete}
                  disabled={selectedImages.size === 0}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Eliminar
                </Button>
              </>
            )}
            <Button
              variant={bulkMode ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setBulkMode(!bulkMode)
                setSelectedImages(new Set())
              }}
            >
              {bulkMode ? 'Cancelar' : 'Seleccionar'}
            </Button>
            <div className="border-l h-6 mx-2" />
            <Button
              variant="outline"
              size="icon"
              onClick={() => setViewMode('grid')}
              className={cn(viewMode === 'grid' && 'bg-muted')}
            >
              <Grid3x3 className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setViewMode('list')}
              className={cn(viewMode === 'list' && 'bg-muted')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Images Grid/List */}
      <Card className="p-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredImages.length === 0 ? (
          <div className="text-center py-12">
            <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No se encontraron imágenes</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery
                ? 'Intenta con otros términos de búsqueda'
                : 'Sube tu primera imagen para comenzar'}
            </p>
            {!searchQuery && (
              <Button asChild>
                <Link href="/dashboard/projects">
                  <Upload className="mr-2 h-4 w-4" />
                  Subir imagen
                </Link>
              </Button>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filteredImages.map((image) => (
              <div
                key={image.id}
                className={cn(
                  "group relative aspect-square rounded-lg overflow-hidden bg-muted cursor-pointer transition-all",
                  bulkMode && "hover:ring-2 hover:ring-primary",
                  selectedImages.has(image.id) && "ring-2 ring-primary"
                )}
                onClick={() => bulkMode && toggleImageSelection(image.id)}
              >
                <Image
                  src={image.thumbnail_url || image.url}
                  alt={image.name || 'Imagen'}
                  fill
                  className="object-cover"
                />

                {/* Selection Checkbox */}
                {bulkMode && (
                  <div className="absolute top-2 left-2 z-10">
                    <input
                      type="checkbox"
                      checked={selectedImages.has(image.id)}
                      onChange={() => toggleImageSelection(image.id)}
                      className="h-4 w-4 rounded border-gray-300"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                )}

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                  <div className="w-full">
                    <p className="text-white text-xs font-medium truncate">
                      {image.name || 'Sin nombre'}
                    </p>
                    {image.project && (
                      <p className="text-white/70 text-xs truncate">
                        {image.project.name}
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions Menu */}
                {!bulkMode && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 bg-white/90 hover:bg-white h-8 w-8"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => window.open(image.url, '_blank')}>
                        <Eye className="h-4 w-4 mr-2" />
                        Ver imagen
                      </DropdownMenuItem>
                      {image.project && (
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/projects/${image.project.id}`}>
                            <FolderOpen className="h-4 w-4 mr-2" />
                            Ir al proyecto
                          </Link>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => handleDownloadImage(image)}>
                        <Download className="h-4 w-4 mr-2" />
                        Descargar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigator.clipboard.writeText(image.url)}>
                        <Copy className="h-4 w-4 mr-2" />
                        Copiar URL
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => setDeleteDialog({ isOpen: true, image })}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}

                {/* Transformation Badge */}
                {image.transformation_count > 0 && (
                  <Badge
                    variant="secondary"
                    className="absolute bottom-2 right-2 text-xs"
                  >
                    <Sparkles className="h-3 w-3 mr-1" />
                    {image.transformation_count}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredImages.map((image) => (
              <div
                key={image.id}
                className={cn(
                  "flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors",
                  selectedImages.has(image.id) && "bg-muted"
                )}
              >
                {bulkMode && (
                  <input
                    type="checkbox"
                    checked={selectedImages.has(image.id)}
                    onChange={() => toggleImageSelection(image.id)}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                )}

                <div className="relative h-16 w-16 rounded overflow-hidden flex-shrink-0">
                  <Image
                    src={image.thumbnail_url || image.url}
                    alt={image.name || 'Imagen'}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">
                    {image.name || 'Sin nombre'}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {image.project && (
                      <span className="truncate">
                        <FolderOpen className="h-3 w-3 inline mr-1" />
                        {image.project.name}
                      </span>
                    )}
                    <span>
                      <Calendar className="h-3 w-3 inline mr-1" />
                      {format(new Date(image.created_at), 'dd MMM yyyy', { locale: es })}
                    </span>
                    {image.transformation_count > 0 && (
                      <span>
                        <Sparkles className="h-3 w-3 inline mr-1" />
                        {image.transformation_count} transformaciones
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => window.open(image.url, '_blank')}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDownloadImage(image)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  {!bulkMode && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteDialog({ isOpen: true, image })}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {hasMore && (
          <div className="flex justify-center mt-6 gap-2">
            <Button
              variant="outline"
              disabled={offset === 0}
              onClick={() => setOffset(Math.max(0, offset - limit))}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              disabled={!hasMore}
              onClick={() => setOffset(offset + limit)}
            >
              Siguiente
            </Button>
          </div>
        )}
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteDialog.isOpen}
        onOpenChange={(open) => !open && setDeleteDialog({ isOpen: false })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar imagen?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La imagen y todas sus transformaciones serán eliminadas permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteDialog.image) {
                  handleDeleteImage(deleteDialog.image)
                }
                setDeleteDialog({ isOpen: false })
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}