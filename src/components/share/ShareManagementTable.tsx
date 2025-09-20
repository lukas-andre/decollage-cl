'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  Copy,
  ExternalLink,
  Edit,
  Trash2,
  MoreHorizontal,
  Eye,
  Share2,
  Calendar,
  Globe,
  Users,
  Lock
} from 'lucide-react'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import Image from 'next/image'

interface ProjectShare {
  id: string
  share_token: string
  share_type: string
  visibility: 'public' | 'unlisted' | 'private'
  title: string
  description?: string
  slug?: string
  current_views: number
  conversion_count: number
  engagement_count: number
  created_at: string
  last_viewed_at?: string
  expires_at?: string
  projects: {
    name: string
    cover_image_url?: string
  }
}

interface ShareManagementTableProps {
  shares: ProjectShare[]
  loading: boolean
  onEdit: (share: ProjectShare) => void
  onDelete: (shareToken: string) => void
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  onPageChange: (page: number) => void
}

export function ShareManagementTable({
  shares,
  loading,
  onEdit,
  onDelete,
  pagination,
  onPageChange
}: ShareManagementTableProps) {
  const [selectedShares, setSelectedShares] = useState<string[]>([])

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedShares(shares.map(share => share.id))
    } else {
      setSelectedShares([])
    }
  }

  const handleSelectShare = (shareId: string, checked: boolean) => {
    if (checked) {
      setSelectedShares(prev => [...prev, shareId])
    } else {
      setSelectedShares(prev => prev.filter(id => id !== shareId))
    }
  }

  const copyShareLink = async (share: ProjectShare) => {
    const baseUrl = window.location.origin
    const shareUrl = share.slug
      ? `${baseUrl}/share/${share.slug}`
      : `${baseUrl}/share/${share.share_token}`

    try {
      await navigator.clipboard.writeText(shareUrl)
      toast.success('¡Enlace copiado al portapapeles!')
    } catch (error) {
      toast.error('Error al copiar el enlace')
    }
  }

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case 'public':
        return <Globe className="h-4 w-4" />
      case 'unlisted':
        return <Users className="h-4 w-4" />
      case 'private':
        return <Lock className="h-4 w-4" />
      default:
        return <Users className="h-4 w-4" />
    }
  }

  const getVisibilityLabel = (visibility: string) => {
    switch (visibility) {
      case 'public':
        return 'Público'
      case 'unlisted':
        return 'No listado'
      case 'private':
        return 'Privado'
      default:
        return 'No listado'
    }
  }

  const getVisibilityColor = (visibility: string) => {
    switch (visibility) {
      case 'public':
        return 'bg-green-100 text-green-800'
      case 'unlisted':
        return 'bg-blue-100 text-blue-800'
      case 'private':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-100 animate-pulse rounded-lg" />
        ))}
      </div>
    )
  }

  if (shares.length === 0) {
    return (
      <div className="text-center py-12">
        <Share2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No tienes enlaces compartidos
        </h3>
        <p className="text-gray-600 mb-4">
          Cuando compartas un proyecto, aparecerá aquí para que puedas gestionarlo.
        </p>
        <Button>
          <Share2 className="h-4 w-4 mr-2" />
          Crear primer enlace
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Bulk Actions */}
      {selectedShares.length > 0 && (
        <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <span className="text-sm text-blue-800">
            {selectedShares.length} enlace{selectedShares.length !== 1 ? 's' : ''} seleccionado{selectedShares.length !== 1 ? 's' : ''}
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              selectedShares.forEach(shareId => {
                const share = shares.find(s => s.id === shareId)
                if (share) onDelete(share.share_token)
              })
              setSelectedShares([])
            }}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Eliminar seleccionados
          </Button>
        </div>
      )}

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={selectedShares.length === shares.length}
                onCheckedChange={handleSelectAll}
              />
            </TableHead>
            <TableHead>Proyecto / Título</TableHead>
            <TableHead>Visibilidad</TableHead>
            <TableHead>Vistas</TableHead>
            <TableHead>Fechas</TableHead>
            <TableHead className="w-20">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {shares.map((share) => (
            <TableRow key={share.id}>
              <TableCell>
                <Checkbox
                  checked={selectedShares.includes(share.id)}
                  onCheckedChange={(checked) => handleSelectShare(share.id, checked as boolean)}
                />
              </TableCell>

              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    {share.projects.cover_image_url ? (
                      <Image
                        src={share.projects.cover_image_url}
                        alt={share.title}
                        width={48}
                        height={48}
                        className="rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-[#A3B1A1]/10 rounded-lg flex items-center justify-center">
                        <Share2 className="h-6 w-6 text-[#A3B1A1]" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-900 truncate">
                      {share.title}
                    </p>
                    <p className="text-sm text-gray-600 truncate">
                      {share.projects.name}
                    </p>
                  </div>
                </div>
              </TableCell>

              <TableCell>
                <Badge
                  variant="secondary"
                  className={`${getVisibilityColor(share.visibility)} flex items-center gap-1 w-fit`}
                >
                  {getVisibilityIcon(share.visibility)}
                  {getVisibilityLabel(share.visibility)}
                </Badge>
              </TableCell>

              <TableCell>
                <div className="flex items-center gap-1 text-sm">
                  <Eye className="h-3 w-3 text-[#A3B1A1]" />
                  <span className="font-medium">{share.current_views || 0}</span>
                  <span className="text-gray-500">vistas</span>
                </div>
              </TableCell>

              <TableCell>
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDistanceToNow(new Date(share.created_at), {
                      addSuffix: true,
                      locale: es
                    })}
                  </div>
                  {share.last_viewed_at && (
                    <div className="text-xs text-gray-500">
                      Último: {formatDistanceToNow(new Date(share.last_viewed_at), {
                        addSuffix: true,
                        locale: es
                      })}
                    </div>
                  )}
                </div>
              </TableCell>

              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => copyShareLink(share)}>
                      <Copy className="h-4 w-4 mr-2" />
                      Copiar enlace
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        const baseUrl = window.location.origin
                        const shareUrl = share.slug
                          ? `${baseUrl}/share/${share.slug}`
                          : `${baseUrl}/share/${share.share_token}`
                        window.open(shareUrl, '_blank')
                      }}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Abrir enlace
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit(share)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDelete(share.share_token)}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <p className="text-sm text-gray-600">
            Mostrando {((pagination.page - 1) * pagination.limit) + 1} a{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} de{' '}
            {pagination.total} enlaces
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
            >
              Anterior
            </Button>
            <span className="text-sm">
              Página {pagination.page} de {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}