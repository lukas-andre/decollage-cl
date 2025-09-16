'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
  Folder, 
  MoreHorizontal, 
  Edit, 
  Archive, 
  Trash2, 
  Calendar,
  Images,
  Coins,
  Home,
  TreePine,
  Building,
  Sparkles,
  RefreshCcw,
  Palette,
  ImageIcon
} from 'lucide-react'
import Image from 'next/image'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
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
  images?: {
    id: string
    url: string
    thumbnail_url: string | null
  }[]
  metadata?: {
    environment_type?: 'interior' | 'exterior' | 'commercial'
    last_style_used?: string
  }
  featured_transformation?: {
    id: string
    result_image_url: string
    design_styles: {
      name: string
    } | null
  } | null
}

interface ProjectCardProps {
  project: Project
  onEdit?: (project: Project) => void
  onDelete?: (projectId: string) => void
  onArchive?: (projectId: string) => void
  onRegenerate?: (projectId: string) => void
  isSelected?: boolean
}

const statusConfig = {
  active: { label: 'Activo', color: 'bg-green-500' },
  completed: { label: 'Completado', color: 'bg-blue-500' },
  archived: { label: 'Archivado', color: 'bg-gray-500' },
}

const environmentIcons = {
  interior: { icon: Home, color: 'text-blue-600', bg: 'bg-blue-100', label: 'Interior' },
  exterior: { icon: TreePine, color: 'text-green-600', bg: 'bg-green-100', label: 'Exterior' },
  commercial: { icon: Building, color: 'text-purple-600', bg: 'bg-purple-100', label: 'Comercial' }
}

export function ProjectCard({ project, onEdit, onDelete, onArchive, onRegenerate, isSelected }: ProjectCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const status = statusConfig[project.status]
  const environment = project.metadata?.environment_type
  const envConfig = environment ? environmentIcons[environment] : null
  const EnvironmentIcon = envConfig?.icon

  return (
    <>
      <Link href={`/dashboard/projects/${project.id}`}>
        <Card className={cn(
          "hover:shadow-lg transition-all hover:scale-[1.02] cursor-pointer group",
          isSelected && "ring-2 ring-primary"
        )}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                  <Folder className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors">
                    {project.name}
                  </CardTitle>
                  {project.description && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {project.description}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {envConfig && (
                  <Badge variant="outline" className={cn("border-0", envConfig.bg)}>
                    <envConfig.icon className={cn("h-3 w-3 mr-1", envConfig.color)} />
                    <span className={cn("text-xs", envConfig.color)}>{envConfig.label}</span>
                  </Badge>
                )}
                
                <Badge 
                  variant="secondary" 
                  className={`${status.color} text-white`}
                >
                  {status.label}
                </Badge>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                      }}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {onEdit && (
                      <DropdownMenuItem 
                        onClick={(e) => {
                          e.stopPropagation()
                          onEdit(project)
                        }}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                    )}
                    {onRegenerate && (
                      <DropdownMenuItem 
                        onClick={(e) => {
                          e.stopPropagation()
                          onRegenerate(project.id)
                        }}
                      >
                        <RefreshCcw className="h-4 w-4 mr-2" />
                        Regenerar Rápido
                      </DropdownMenuItem>
                    )}
                    {onArchive && project.status !== 'archived' && (
                      <DropdownMenuItem 
                        onClick={(e) => {
                          e.stopPropagation()
                          onArchive(project.id)
                        }}
                      >
                        <Archive className="h-4 w-4 mr-2" />
                        Archivar
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    {onDelete && (
                      <DropdownMenuItem 
                        onClick={(e) => {
                          e.stopPropagation()
                          setShowDeleteDialog(true)
                        }}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Eliminar
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-0">
            {/* Featured Transformation Preview */}
            {project.featured_transformation ? (
              <div className="mb-4 relative aspect-video bg-gray-100 rounded-lg overflow-hidden group-hover:ring-2 group-hover:ring-primary/20 transition-all">
                <Image
                  src={project.featured_transformation.result_image_url}
                  alt={`${project.name} - Featured Transformation`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                {project.featured_transformation.design_styles && (
                  <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-md">
                    {project.featured_transformation.design_styles.name}
                  </div>
                )}
              </div>
            ) : (project.images && project.images.length > 0) ? (
              <div className="mb-4 aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center group-hover:from-primary/5 group-hover:to-primary/10 transition-all">
                <div className="text-center text-gray-500">
                  <RefreshCcw className="h-8 w-8 mx-auto mb-2" />
                  <p className="text-sm font-medium">Listo para generar</p>
                  <p className="text-xs">Click para crear diseños</p>
                </div>
              </div>
            ) : (
              <div className="mb-4 aspect-video bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center group-hover:border-primary/40 group-hover:bg-primary/5 transition-all">
                <div className="text-center text-gray-400">
                  <ImageIcon className="h-8 w-8 mx-auto mb-2" />
                  <p className="text-sm font-medium">Sin imágenes</p>
                  <p className="text-xs">Sube fotos para empezar</p>
                </div>
              </div>
            )}
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Images className="h-4 w-4" />
                  <span>{project.images?.length || 0} imagen{(project.images?.length || 0) !== 1 ? 'es' : ''}</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <Sparkles className="h-4 w-4" />
                  <span>{project.total_transformations} transformaciones</span>
                </div>
                
                {project.metadata?.last_style_used && (
                  <div className="flex items-center gap-1">
                    <Palette className="h-4 w-4" />
                    <span className="truncate max-w-[100px]">{project.metadata.last_style_used}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>
                  {formatDistanceToNow(new Date(project.updated_at), { 
                    addSuffix: true,
                    locale: es 
                  })}
                </span>
              </div>
            </div>

            {(project.is_public || (project.images && project.images.length > 0)) && (
              <div className="flex items-center gap-2 mt-2">
                {project.is_public && (
                  <Badge variant="outline" className="text-xs">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Público
                  </Badge>
                )}
                {(project.images && project.images.length > 0) && onRegenerate && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      onRegenerate(project.id)
                    }}
                  >
                    <RefreshCcw className="h-3 w-3 mr-1" />
                    Regenerar
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </Link>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el proyecto 
              &quot;{project.name}&quot; y todas las imágenes asociadas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onDelete?.(project.id)
                setShowDeleteDialog(false)
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}