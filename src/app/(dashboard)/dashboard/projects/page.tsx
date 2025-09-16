'use client'

import { useEffect, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Plus,
  Search,
  Filter,
  Grid,
  List,
  MoreVertical,
  Home,
  Building,
  TreePine,
  Heart,
  Sparkles,
  Camera,
  Clock,
  Eye,
  ArrowRight
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface Project {
  id: string
  name: string
  description: string | null
  status: 'active' | 'completed' | 'archived'
  total_transformations: number
  created_at: string
  updated_at: string
  is_public: boolean
  metadata?: {
    environment_type?: 'interior' | 'exterior' | 'commercial'
  }
  images?: {
    id: string
    url: string
    thumbnail_url: string | null
  }[]
  featured_transformation?: {
    id: string
    result_image_url: string
    design_styles: {
      name: string
    } | null
  } | null
}

const spaceTypes = [
  { value: 'all', label: 'Todos mis espacios', icon: Sparkles, color: 'gradient' },
  { value: 'interior', label: 'Interiores', icon: Home, color: '[#A3B1A1]' },
  { value: 'exterior', label: 'Exteriores', icon: TreePine, color: '[#C4886F]' }
]

export default function MisEspaciosPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('active')
  const [environmentFilter, setEnvironmentFilter] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    fetchProjects()
  }, [statusFilter, environmentFilter])

  // Auto-create project for new users
  useEffect(() => {
    if (!loading && projects.length === 0 && statusFilter === 'active') {
      autoCreateProject()
    }
  }, [loading, projects.length, statusFilter])

  const autoCreateProject = async () => {
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Mi Primer Espacio',
          description: 'Tu primer proyecto de transformación',
          metadata: {
            environment_type: 'interior'
          }
        }),
      })

      const data = await response.json()

      if (response.ok && data.project) {
        window.location.href = `/dashboard/projects/${data.project.id}`
      }
    } catch (error) {
      console.error('Error creating project:', error)
      setShowCreateModal(true)
    }
  }

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/projects?status=${statusFilter}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al cargar espacios')
      }

      let filteredData = data.projects || []

      if (environmentFilter !== 'all') {
        filteredData = filteredData.filter((p: Project) =>
          p.metadata?.environment_type === environmentFilter
        )
      }

      setProjects(filteredData)
    } catch (error) {
      console.error('Error fetching projects:', error)
      toast.error('Error al cargar tus espacios')
    } finally {
      setLoading(false)
    }
  }, [statusFilter, environmentFilter])

  const handleDeleteProject = async (projectId: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Error al eliminar espacio')
      }

      setProjects(prev => prev.filter(p => p.id !== projectId))
      toast.success('Espacio eliminado correctamente')
    } catch (error) {
      console.error('Error deleting project:', error)
      toast.error(error instanceof Error ? error.message : 'Error al eliminar espacio')
    }
  }

  const handleArchiveProject = async (projectId: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'archived' }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Error al archivar espacio')
      }

      if (statusFilter !== 'archived') {
        setProjects(prev => prev.filter(p => p.id !== projectId))
      } else {
        setProjects(prev => prev.map(p =>
          p.id === projectId ? { ...p, status: 'archived' as const } : p
        ))
      }

      toast.success('Espacio archivado correctamente')
    } catch (error) {
      console.error('Error archiving project:', error)
      toast.error(error instanceof Error ? error.message : 'Error al archivar espacio')
    }
  }

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (project.description && project.description.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-CL', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  return (
    <div className="min-h-screen">
      {/* Header - Refined */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-2xl font-light text-[#333333] font-cormorant transition-all duration-500 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}`}>
              Mis Espacios
            </h1>
            <p className={`text-sm text-[#333333]/60 mt-1 font-lato transition-all duration-500 delay-100 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}`}>
              Organiza y transforma cada rincón de tu hogar
            </p>
          </div>

          <Button
            className="bg-[#A3B1A1] hover:bg-[#A3B1A1]/90 text-white transition-all duration-300"
            size="sm"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus className="mr-2 h-3 w-3" />
            Nuevo Espacio
          </Button>
        </div>
      </div>

      {/* Filters Bar - Elegant */}
      <div className={`bg-white border-0 p-5 mb-8 shadow-lg transition-all duration-500 delay-200 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
        <div className="flex flex-col lg:flex-row gap-4 items-center">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar en mis espacios..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 border-[#A3B1A1]/20 focus:border-[#A3B1A1]/40 bg-[#F8F8F8]/50 text-sm"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-3">
            {/* Space Type Filter */}
            <Select value={environmentFilter} onValueChange={setEnvironmentFilter}>
              <SelectTrigger className="w-[180px] border-gray-200/50 focus:border-[#A3B1A1] focus:ring-[#A3B1A1]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {spaceTypes.map(type => {
                  const Icon = type.icon
                  return (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        {type.label}
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px] border-gray-200/50 focus:border-[#A3B1A1] focus:ring-[#A3B1A1]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Activos</SelectItem>
                <SelectItem value="completed">Completados</SelectItem>
                <SelectItem value="archived">Archivados</SelectItem>
              </SelectContent>
            </Select>

            {/* View Mode */}
            <div className="flex border border-[#A3B1A1]/20 overflow-hidden bg-white">
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "rounded-none transition-colors duration-300",
                  viewMode === 'grid' && "bg-[#A3B1A1]/10 text-[#A3B1A1]"
                )}
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "rounded-none transition-colors duration-300",
                  viewMode === 'list' && "bg-[#A3B1A1]/10 text-[#A3B1A1]"
                )}
                onClick={() => setViewMode('list')}
              >
                <List className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className={cn(
          viewMode === 'grid'
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            : "space-y-4"
        )}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-64 bg-white/80 rounded-2xl animate-pulse border border-gray-200/50" />
          ))}
        </div>
      ) : filteredProjects.length === 0 ? (
        <Card className="border-0 shadow-lg bg-white">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-[#A3B1A1]/10 to-[#C4886F]/10 flex items-center justify-center mb-6">
              <Home className="h-8 w-8 text-[#A3B1A1]" />
            </div>

            <h3 className="text-xl font-light text-[#333333] mb-2 font-cormorant">
              {searchQuery || statusFilter !== 'active' || environmentFilter !== 'all'
                ? 'No encontramos espacios'
                : 'Tu primer espacio te espera'
              }
            </h3>

            <p className="text-sm text-[#333333]/60 mb-6 max-w-md font-lato">
              {searchQuery || statusFilter !== 'active' || environmentFilter !== 'all'
                ? 'Intenta ajustar tus filtros de búsqueda'
                : 'Cada gran transformación comienza con un solo espacio. Crea tu primer proyecto y descubre la magia'
              }
            </p>

            {!searchQuery && statusFilter === 'active' && environmentFilter === 'all' && (
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  className="bg-[#A3B1A1] hover:bg-[#A3B1A1]/90 text-white transition-colors duration-300"
                  size="sm"
                  onClick={() => setShowCreateModal(true)}
                >
                  <Sparkles className="mr-2 h-3 w-3" />
                  Crear Mi Primer Espacio
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-[#C4886F]/30 text-[#C4886F] hover:bg-[#C4886F]/10 transition-colors duration-300"
                  onClick={() => window.location.href = '/dashboard/gallery'}
                >
                  <Eye className="mr-2 h-3 w-3" />
                  Ver Inspiración
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <Card
              key={project.id}
              className="group bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-0.5 overflow-hidden cursor-pointer"
              onClick={() => window.location.href = `/dashboard/projects/${project.id}`}
            >
              <div className="relative h-40 bg-gradient-to-br from-[#A3B1A1]/5 to-[#C4886F]/5">
                {project.featured_transformation?.result_image_url ? (
                  <img
                    src={project.featured_transformation.result_image_url}
                    alt={project.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Camera className="h-8 w-8 text-[#A3B1A1]/30" />
                  </div>
                )}

                <div className="absolute top-3 right-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 bg-white/90 hover:bg-white transition-colors duration-300"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => window.location.href = `/dashboard/projects/${project.id}`}>
                        Abrir espacio
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleArchiveProject(project.id)}>
                        Archivar
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDeleteProject(project.id)}
                        className="text-red-600"
                      >
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {project.metadata?.environment_type && (
                  <div className="absolute top-3 left-3">
                    <Badge
                      className={cn(
                        "bg-white/90 border-0 text-[10px] px-2 py-0.5",
                        project.metadata.environment_type === 'interior' && "text-[#A3B1A1]",
                        project.metadata.environment_type === 'exterior' && "text-[#C4886F]"
                      )}
                    >
                      {project.metadata.environment_type === 'interior' && (
                        <>
                          <Home className="mr-1 h-3 w-3" />
                          Interior
                        </>
                      )}
                      {project.metadata.environment_type === 'exterior' && (
                        <>
                          <TreePine className="mr-1 h-3 w-3" />
                          Exterior
                        </>
                      )}
                    </Badge>
                  </div>
                )}
              </div>

              <CardContent className="p-5">
                <div className="mb-3">
                  <h3 className="font-normal text-base text-[#333333] font-cormorant mb-1">
                    {project.name}
                  </h3>
                  {project.description && (
                    <p className="text-xs text-[#333333]/60 font-lato line-clamp-2">
                      {project.description}
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-[10px] text-[#333333]/50 font-lato">
                      <span className="flex items-center gap-1">
                        <Camera className="h-3 w-3" />
                        {project.images?.length || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <Sparkles className="h-3 w-3" />
                        {project.total_transformations}
                      </span>
                    </div>

                    <div className="text-[#A3B1A1] text-xs flex items-center">
                      Clic para abrir
                      <ArrowRight className="ml-1 h-2.5 w-2.5 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#A3B1A1]/10">
                    <div className="flex items-center justify-between text-[10px] text-[#333333]/40 font-lato">
                      <span className="flex items-center gap-1">
                        <Clock className="h-2.5 w-2.5" />
                        {formatDate(project.updated_at)}
                      </span>
                      {project.is_public && (
                        <Badge className="bg-[#C4886F]/10 text-[#C4886F] border-0 text-[9px] px-1.5 py-0">
                          Público
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredProjects.map((project) => (
            <Card
              key={project.id}
              className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
              onClick={() => window.location.href = `/dashboard/projects/${project.id}`}
            >
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#A3B1A1]/10 to-[#C4886F]/5 flex items-center justify-center flex-shrink-0">
                    {project.metadata?.environment_type === 'interior' && <Home className="h-6 w-6 text-[#A3B1A1]" />}
                    {project.metadata?.environment_type === 'exterior' && <TreePine className="h-6 w-6 text-[#C4886F]" />}
                    {!project.metadata?.environment_type && <Sparkles className="h-6 w-6 text-[#A3B1A1]" />}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-normal text-base text-[#333333] font-cormorant">
                          {project.name}
                        </h3>
                        {project.description && (
                          <p className="text-xs text-[#333333]/60 mt-0.5 font-lato">
                            {project.description}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="text-[#A3B1A1] text-xs flex items-center">
                          Clic para abrir
                          <ArrowRight className="ml-1 h-2.5 w-2.5" />
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleArchiveProject(project.id)}>
                              Archivar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDeleteProject(project.id)}
                              className="text-red-600"
                            >
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mt-3 text-[10px] text-[#333333]/50 font-lato">
                      <span className="flex items-center gap-1">
                        <Camera className="h-2.5 w-2.5" />
                        {project.images?.length || 0} imágenes
                      </span>
                      <span className="flex items-center gap-1">
                        <Sparkles className="h-2.5 w-2.5" />
                        {project.total_transformations} transformaciones
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-2.5 w-2.5" />
                        {formatDate(project.updated_at)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* TODO: Add ProjectCreateModal component when needed */}
    </div>
  )
}