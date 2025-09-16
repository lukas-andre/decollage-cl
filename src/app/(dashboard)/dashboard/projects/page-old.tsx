'use client'

import { useEffect, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
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
import { ProjectCard } from '@/components/projects/ProjectCard'
import { ProjectCreateModal } from '@/components/projects/ProjectCreateModal'
import { 
  Plus, 
  Search, 
  Filter, 
  Grid, 
  List, 
  Download, 
  Archive, 
  Trash2, 
  MoreVertical,
  FileUp,
  Copy,
  FolderOpen,
  Home,
  Building,
  TreePine,
  ChevronDown
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

const environmentTypes = [
  { value: 'all', label: 'Todos los tipos', icon: FolderOpen },
  { value: 'interior', label: 'Interiores', icon: Home },
  { value: 'exterior', label: 'Exteriores', icon: TreePine },
  { value: 'commercial', label: 'Comerciales', icon: Building }
]

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('active')
  const [environmentFilter, setEnvironmentFilter] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedProjects, setSelectedProjects] = useState<string[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)
  const [bulkActionLoading, setBulkActionLoading] = useState(false)

  useEffect(() => {
    fetchProjects()
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          name: 'Mi Primer Proyecto',
          description: 'Proyecto creado automáticamente',
          metadata: {
            environment_type: 'interior'
          }
        }),
      })

      const data = await response.json()
      
      if (response.ok && data.project) {
        // Redirect to the new project
        window.location.href = `/dashboard/projects/${data.project.id}`
      }
    } catch (error) {
      console.error('Error creating project:', error)
      // If auto-create fails, show the modal as fallback
      setShowCreateModal(true)
    }
  }

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/projects?status=${statusFilter}`)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Error al cargar proyectos')
      }

      let filteredData = data.projects || []
      
      // Filter by environment type
      if (environmentFilter !== 'all') {
        filteredData = filteredData.filter((p: Project) => 
          p.metadata?.environment_type === environmentFilter
        )
      }

      setProjects(filteredData)
    } catch (error) {
      console.error('Error fetching projects:', error)
      toast.error('Error al cargar proyectos')
    } finally {
      setLoading(false)
    }
  }, [statusFilter, environmentFilter])

  const handleProjectCreated = (newProject: unknown) => {
    setProjects(prev => [newProject as Project, ...prev])
    setShowCreateModal(false)
  }

  const handleDeleteProject = async (projectId: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Error al eliminar proyecto')
      }

      setProjects(prev => prev.filter(p => p.id !== projectId))
      setSelectedProjects(prev => prev.filter(id => id !== projectId))
      toast.success('Proyecto eliminado correctamente')
    } catch (error) {
      console.error('Error deleting project:', error)
      toast.error(error instanceof Error ? error.message : 'Error al eliminar proyecto')
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
        throw new Error(data.error || 'Error al archivar proyecto')
      }

      if (statusFilter !== 'all' && statusFilter !== 'archived') {
        setProjects(prev => prev.filter(p => p.id !== projectId))
      } else {
        setProjects(prev => prev.map(p => 
          p.id === projectId ? { ...p, status: 'archived' as const } : p
        ))
      }

      setSelectedProjects(prev => prev.filter(id => id !== projectId))
      toast.success('Proyecto archivado correctamente')
    } catch (error) {
      console.error('Error archiving project:', error)
      toast.error(error instanceof Error ? error.message : 'Error al archivar proyecto')
    }
  }

  const handleBulkAction = async (action: 'archive' | 'delete' | 'export' | 'duplicate') => {
    if (selectedProjects.length === 0) {
      toast.error('Selecciona al menos un proyecto')
      return
    }

    setBulkActionLoading(true)

    try {
      switch (action) {
        case 'archive':
          for (const projectId of selectedProjects) {
            await handleArchiveProject(projectId)
          }
          toast.success(`${selectedProjects.length} proyectos archivados`)
          break
        
        case 'delete':
          for (const projectId of selectedProjects) {
            await handleDeleteProject(projectId)
          }
          toast.success(`${selectedProjects.length} proyectos eliminados`)
          break
        
        case 'export':
          toast.info('Preparando exportación...')
          // TODO: Implement bulk export
          break
        
        case 'duplicate':
          toast.info('Duplicando proyectos...')
          // TODO: Implement bulk duplicate
          break
      }

      setSelectedProjects([])
    } catch (error) {
      console.error(`Error in bulk ${action}:`, error)
      toast.error(`Error al ${action} proyectos`)
    } finally {
      setBulkActionLoading(false)
    }
  }

  const toggleProjectSelection = (projectId: string) => {
    setSelectedProjects(prev => 
      prev.includes(projectId) 
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    )
  }

  const selectAllProjects = () => {
    if (selectedProjects.length === filteredProjects.length) {
      setSelectedProjects([])
    } else {
      setSelectedProjects(filteredProjects.map(p => p.id))
    }
  }

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (project.description && project.description.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Mis Proyectos</h1>
              <p className="text-sm text-gray-500 mt-1">
                Organiza y administra tus proyectos de staging virtual
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowTemplates(true)}
              >
                <FileUp className="mr-2 h-4 w-4" />
                Plantillas
              </Button>
              <Button size="sm" onClick={() => setShowCreateModal(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Proyecto
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Filters Bar */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar proyectos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Filters */}
            <div className="flex flex-wrap gap-2">
              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[160px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Activos</SelectItem>
                  <SelectItem value="completed">Completados</SelectItem>
                  <SelectItem value="archived">Archivados</SelectItem>
                  <SelectItem value="all">Todos</SelectItem>
                </SelectContent>
              </Select>

              {/* Environment Type Filter */}
              <Select value={environmentFilter} onValueChange={setEnvironmentFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {environmentTypes.map(type => {
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

              {/* View Mode */}
              <div className="flex rounded-lg border border-gray-200 overflow-hidden">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  className="rounded-none"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  className="rounded-none"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedProjects.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={selectedProjects.length === filteredProjects.length}
                    onCheckedChange={selectAllProjects}
                  />
                  <span className="text-sm text-gray-600">
                    {selectedProjects.length} proyecto{selectedProjects.length !== 1 && 's'} seleccionado{selectedProjects.length !== 1 && 's'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkAction('export')}
                    disabled={bulkActionLoading}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Exportar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkAction('duplicate')}
                    disabled={bulkActionLoading}
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Duplicar
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        disabled={bulkActionLoading}
                      >
                        Más acciones
                        <ChevronDown className="ml-2 h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleBulkAction('archive')}>
                        <Archive className="mr-2 h-4 w-4" />
                        Archivar seleccionados
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => handleBulkAction('delete')}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar seleccionados
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Projects Grid/List */}
        {loading ? (
          <div className={cn(
            viewMode === 'grid' 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              : "space-y-3"
          )}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-48 bg-white rounded-lg animate-pulse border border-gray-200" />
            ))}
          </div>
        ) : filteredProjects.length === 0 ? (
          <Card className="bg-white">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <FolderOpen className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchQuery || statusFilter !== 'active' || environmentFilter !== 'all'
                  ? 'No se encontraron proyectos' 
                  : 'No tienes proyectos aún'
                }
              </h3>
              <p className="text-sm text-gray-500 text-center mb-6 max-w-md">
                {searchQuery || statusFilter !== 'active' || environmentFilter !== 'all'
                  ? 'Intenta ajustar tus filtros de búsqueda'
                  : 'Crea tu primer proyecto para organizar tus generaciones de staging virtual'
                }
              </p>
              {!searchQuery && statusFilter === 'active' && environmentFilter === 'all' && (
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setShowTemplates(true)}>
                    <FileUp className="mr-2 h-4 w-4" />
                    Usar Plantilla
                  </Button>
                  <Button onClick={() => setShowCreateModal(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Crear Proyecto
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProjects.map((project) => (
              <div key={project.id} className="relative">
                {selectedProjects.length > 0 && (
                  <div className="absolute top-3 left-3 z-10">
                    <Checkbox
                      checked={selectedProjects.includes(project.id)}
                      onCheckedChange={() => toggleProjectSelection(project.id)}
                      className="bg-white"
                    />
                  </div>
                )}
                <ProjectCard
                  project={project}
                  onDelete={handleDeleteProject}
                  onArchive={handleArchiveProject}
                  isSelected={selectedProjects.includes(project.id)}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredProjects.map((project) => (
              <Card key={project.id} className="bg-white hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {selectedProjects.length > 0 && (
                      <Checkbox
                        checked={selectedProjects.includes(project.id)}
                        onCheckedChange={() => toggleProjectSelection(project.id)}
                      />
                    )}
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900">{project.name}</h3>
                          {project.description && (
                            <p className="text-sm text-gray-500 mt-1">{project.description}</p>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {project.metadata?.environment_type && (
                            <span className={cn(
                              "px-2 py-1 text-xs font-medium rounded-full",
                              project.metadata.environment_type === 'interior' && "bg-blue-100 text-blue-700",
                              project.metadata.environment_type === 'exterior' && "bg-green-100 text-green-700",
                              project.metadata.environment_type === 'commercial' && "bg-purple-100 text-purple-700"
                            )}>
                              {project.metadata.environment_type === 'interior' && 'Interior'}
                              {project.metadata.environment_type === 'exterior' && 'Exterior'}
                              {project.metadata.environment_type === 'commercial' && 'Comercial'}
                            </span>
                          )}
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => window.location.href = `/dashboard/projects/${project.id}`}>
                                Abrir proyecto
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
                      </div>
                      
                      <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                        <span>{project.images?.length || 0} imágenes</span>
                        <span>{project.total_transformations} transformaciones</span>
                        <span>
                          Actualizado {new Date(project.updated_at).toLocaleDateString('es-CL')}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Create Project Modal */}
        <ProjectCreateModal
          open={showCreateModal}
          onOpenChange={setShowCreateModal}
          onSuccess={handleProjectCreated}
        />

        {/* Templates Modal */}
        {showTemplates && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-2xl max-h-[80vh] overflow-auto">
              <CardHeader>
                <CardTitle>Plantillas de Proyecto</CardTitle>
                <CardDescription>
                  Comienza rápidamente con una plantilla prediseñada
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { name: 'Casa Residencial', type: 'interior', rooms: 6 },
                    { name: 'Departamento Moderno', type: 'interior', rooms: 4 },
                    { name: 'Oficina Corporativa', type: 'commercial', rooms: 8 },
                    { name: 'Local Comercial', type: 'commercial', rooms: 3 },
                    { name: 'Jardín y Terraza', type: 'exterior', rooms: 2 },
                    { name: 'Propiedad Completa', type: 'all', rooms: 10 }
                  ].map((template, i) => (
                    <Card 
                      key={i} 
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => {
                        setShowTemplates(false)
                        setShowCreateModal(true)
                        // TODO: Pre-fill modal with template data
                      }}
                    >
                      <CardContent className="p-4">
                        <h4 className="font-semibold text-sm">{template.name}</h4>
                        <p className="text-xs text-gray-500 mt-1">
                          {template.rooms} espacios • Tipo: {template.type}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <div className="mt-6 flex justify-end">
                  <Button variant="outline" onClick={() => setShowTemplates(false)}>
                    Cancelar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}