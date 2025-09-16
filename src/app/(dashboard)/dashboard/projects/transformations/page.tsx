'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sparkles,
  Clock,
  FolderOpen,
  Download,
  Eye,
  Heart,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2,
  Image as ImageIcon,
  Calendar,
  Filter,
  Search,
  TrendingUp,
  Palette
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { ReactCompareSlider, ReactCompareSliderImage } from 'react-compare-slider'

interface Transformation {
  id: string
  user_id: string
  project_id?: string
  base_image_id?: string
  result_image_url?: string
  result_cloudflare_id?: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  error_message?: string
  tokens_consumed: number
  processing_time_ms?: number
  is_favorite: boolean
  rating?: number
  created_at: string
  completed_at?: string
  prompt_used?: string
  custom_instructions?: string
  project?: {
    id: string
    name: string
  }
  base_image?: {
    id: string
    url: string
    thumbnail_url?: string
    name?: string
  }
  style?: {
    id: string
    name: string
    code: string
  }
  color_palette?: {
    id: string
    name: string
    code: string
    primary_colors: string[]
  }
  metadata?: any
}

export default function TransformationsHistoryPage() {
  const [transformations, setTransformations] = useState<Transformation[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProject, setSelectedProject] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [projects, setProjects] = useState<Array<{id: string, name: string}>>([])
  const [statistics, setStatistics] = useState({
    total: 0,
    completed: 0,
    processing: 0,
    failed: 0,
    totalTokensUsed: 0
  })
  const [selectedTransformation, setSelectedTransformation] = useState<Transformation | null>(null)
  const [showComparison, setShowComparison] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [offset, setOffset] = useState(0)
  const limit = 20

  useEffect(() => {
    fetchTransformations()
    fetchProjects()
  }, [selectedProject, selectedStatus, offset])

  const fetchTransformations = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        status: selectedStatus,
        limit: limit.toString(),
        offset: offset.toString()
      })

      if (selectedProject !== 'all') {
        params.append('projectId', selectedProject)
      }

      const response = await fetch(`/api/user/transformations?${params}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al cargar transformaciones')
      }

      setTransformations(data.transformations || [])
      setStatistics(data.statistics || {
        total: 0,
        completed: 0,
        processing: 0,
        failed: 0,
        totalTokensUsed: 0
      })
      setHasMore(data.hasMore || false)
    } catch (error) {
      console.error('Error fetching transformations:', error)
      toast.error('Error al cargar historial de transformaciones')
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

  const handleToggleFavorite = async (transformationId: string) => {
    try {
      const response = await fetch(`/api/variants/${transformationId}/favorite`, {
        method: 'PATCH'
      })

      if (!response.ok) {
        throw new Error('Error al actualizar favorito')
      }

      setTransformations(prev => prev.map(t =>
        t.id === transformationId
          ? { ...t, is_favorite: !t.is_favorite }
          : t
      ))

      const transformation = transformations.find(t => t.id === transformationId)
      toast.success(
        transformation?.is_favorite
          ? 'Removido de favoritos'
          : 'Agregado a favoritos'
      )
    } catch (error) {
      console.error('Error toggling favorite:', error)
      toast.error('Error al actualizar favorito')
    }
  }

  const handleDownloadImage = async (imageUrl: string, styleName?: string) => {
    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `transformation-${styleName || 'result'}-${Date.now()}.jpg`
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'processing':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completada'
      case 'processing':
        return 'Procesando'
      case 'failed':
        return 'Fallida'
      default:
        return 'Pendiente'
    }
  }

  const filteredTransformations = transformations.filter(t => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        t.style?.name.toLowerCase().includes(query) ||
        t.project?.name.toLowerCase().includes(query) ||
        t.custom_instructions?.toLowerCase().includes(query)
      )
    }
    return true
  })

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Sparkles className="h-8 w-8" />
          Historial de Transformaciones
        </h1>
        <p className="text-muted-foreground mt-1">
          Revisa todas tus creaciones y su evolución
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-2xl font-bold">{statistics.total}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-muted-foreground/20" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Completadas</p>
              <p className="text-2xl font-bold text-green-600">{statistics.completed}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600/20" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">En Proceso</p>
              <p className="text-2xl font-bold text-blue-600">{statistics.processing}</p>
            </div>
            <Loader2 className="h-8 w-8 text-blue-600/20 animate-spin" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Fallidas</p>
              <p className="text-2xl font-bold text-red-600">{statistics.failed}</p>
            </div>
            <XCircle className="h-8 w-8 text-red-600/20" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Tokens Usados</p>
              <p className="text-2xl font-bold">{statistics.totalTokensUsed}</p>
            </div>
            <Sparkles className="h-8 w-8 text-muted-foreground/20" />
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por estilo, proyecto o instrucciones..."
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

          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-[150px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="completed">Completadas</SelectItem>
              <SelectItem value="processing">En Proceso</SelectItem>
              <SelectItem value="failed">Fallidas</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Transformations List */}
      <Card className="p-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredTransformations.length === 0 ? (
          <div className="text-center py-12">
            <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No se encontraron transformaciones</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery
                ? 'Intenta con otros términos de búsqueda'
                : 'Crea tu primera transformación para comenzar'}
            </p>
            {!searchQuery && (
              <Button asChild>
                <Link href="/dashboard/projects">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Crear transformación
                </Link>
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTransformations.map((transformation) => (
              <div
                key={transformation.id}
                className="flex items-center gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                {/* Thumbnail */}
                <div className="relative h-24 w-24 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                  {transformation.result_image_url && transformation.status === 'completed' ? (
                    <Image
                      src={transformation.result_image_url}
                      alt="Resultado"
                      fill
                      className="object-cover"
                    />
                  ) : transformation.base_image?.thumbnail_url || transformation.base_image?.url ? (
                    <Image
                      src={transformation.base_image.thumbnail_url || transformation.base_image.url}
                      alt="Original"
                      fill
                      className="object-cover opacity-50"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <ImageIcon className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}

                  {/* Status Overlay */}
                  {transformation.status !== 'completed' && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      {getStatusIcon(transformation.status)}
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium truncate">
                      {transformation.style?.name || 'Sin estilo'}
                    </h3>
                    {transformation.is_favorite && (
                      <Heart className="h-4 w-4 text-red-500 fill-current" />
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                    {transformation.project && (
                      <span className="flex items-center gap-1">
                        <FolderOpen className="h-3 w-3" />
                        {transformation.project.name}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(transformation.created_at), 'dd MMM yyyy, HH:mm', { locale: es })}
                    </span>
                    {transformation.tokens_consumed > 0 && (
                      <span className="flex items-center gap-1">
                        <Sparkles className="h-3 w-3" />
                        {transformation.tokens_consumed} tokens
                      </span>
                    )}
                  </div>

                  {transformation.custom_instructions && (
                    <p className="text-xs text-muted-foreground truncate">
                      "{transformation.custom_instructions}"
                    </p>
                  )}

                  {transformation.color_palette && (
                    <div className="flex items-center gap-2 mt-2">
                      <Palette className="h-3 w-3 text-muted-foreground" />
                      <div className="flex gap-1">
                        {transformation.color_palette.primary_colors.slice(0, 4).map((color, i) => (
                          <div
                            key={i}
                            className="w-4 h-4 rounded border"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {transformation.color_palette.name}
                      </span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Badge variant={
                    transformation.status === 'completed' ? 'default' :
                    transformation.status === 'processing' ? 'secondary' :
                    transformation.status === 'failed' ? 'destructive' :
                    'outline'
                  }>
                    {getStatusIcon(transformation.status)}
                    <span className="ml-1">{getStatusText(transformation.status)}</span>
                  </Badge>

                  {transformation.status === 'completed' && transformation.result_image_url && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedTransformation(transformation)
                          setShowComparison(true)
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDownloadImage(
                          transformation.result_image_url!,
                          transformation.style?.name
                        )}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleToggleFavorite(transformation.id)}
                      >
                        <Heart className={cn(
                          "h-4 w-4",
                          transformation.is_favorite && "fill-current text-red-500"
                        )} />
                      </Button>
                    </>
                  )}

                  {transformation.project && (
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/dashboard/projects/${transformation.project.id}`}>
                        Ver proyecto
                      </Link>
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

      {/* Comparison Modal */}
      {showComparison && selectedTransformation && selectedTransformation.base_image && selectedTransformation.result_image_url && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setShowComparison(false)}>
          <div className="bg-white rounded-lg max-w-6xl max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold">Comparación: {selectedTransformation.style?.name}</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowComparison(false)}>
                <XCircle className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-4">
              <ReactCompareSlider
                itemOne={
                  <ReactCompareSliderImage
                    src={selectedTransformation.base_image.url}
                    alt="Original"
                  />
                }
                itemTwo={
                  <ReactCompareSliderImage
                    src={selectedTransformation.result_image_url}
                    alt="Transformado"
                  />
                }
                style={{ height: '600px', width: '100%' }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}