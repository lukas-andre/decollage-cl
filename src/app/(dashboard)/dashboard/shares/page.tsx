'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ShareManagementTable } from '@/components/share/ShareManagementTable'
import { ShareEditModal } from '@/components/share/ShareEditModal'
import { Search, Plus, BarChart3, Share2, Filter } from 'lucide-react'
import { toast } from 'sonner'

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
  created_at: string
  last_viewed_at?: string
  expires_at?: string
  projects: {
    name: string
    cover_image_url?: string
  }
}

interface SharesResponse {
  shares: ProjectShare[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export default function SharesPage() {
  const [shares, setShares] = useState<ProjectShare[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  })
  const [selectedShare, setSelectedShare] = useState<ProjectShare | null>(null)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [visibilityFilter, setVisibilityFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const fetchShares = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        sort_by: sortBy,
        sort_order: sortOrder
      })

      if (visibilityFilter && visibilityFilter !== 'all') {
        params.append('visibility', visibilityFilter)
      }

      const response = await fetch(`/api/shares?${params}`)

      if (!response.ok) {
        throw new Error('Failed to fetch shares')
      }

      const data: SharesResponse = await response.json()

      // Filter by search query client-side for simplicity
      let filteredShares = data.shares
      if (searchQuery) {
        filteredShares = data.shares.filter(share =>
          share.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          share.projects.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      }

      setShares(filteredShares)
      setPagination(data.pagination)
    } catch (error) {
      console.error('Error fetching shares:', error)
      toast.error('Error al cargar los compartidos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchShares()
  }, [pagination.page, visibilityFilter, sortBy, sortOrder])

  useEffect(() => {
    // Debounce search
    const timer = setTimeout(() => {
      fetchShares()
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  const handleEditShare = (share: ProjectShare) => {
    setSelectedShare(share)
    setEditModalOpen(true)
  }

  const handleDeleteShare = async (shareToken: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este enlace compartido?')) {
      return
    }

    try {
      const response = await fetch(`/api/shares/${shareToken}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete share')
      }

      toast.success('Enlace eliminado exitosamente')
      fetchShares()
    } catch (error) {
      console.error('Error deleting share:', error)
      toast.error('Error al eliminar el enlace')
    }
  }

  const handleShareUpdate = () => {
    setEditModalOpen(false)
    setSelectedShare(null)
    fetchShares()
    toast.success('Enlace actualizado exitosamente')
  }

  const totalViews = shares.reduce((sum, share) => sum + (share.current_views || 0), 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Mis Compartidos</h1>
          <p className="text-sm text-gray-600">
            Gestiona todos tus enlaces compartidos y revisa su rendimiento
          </p>
        </div>
        <Button className="sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Compartido
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Enlaces</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#A3B1A1]">{pagination.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Visualizaciones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#C4886F]">{totalViews.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por título o proyecto..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={visibilityFilter} onValueChange={setVisibilityFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filtrar por visibilidad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="public">Público</SelectItem>
                <SelectItem value="unlisted">No listado</SelectItem>
                <SelectItem value="private">Privado</SelectItem>
              </SelectContent>
            </Select>

            <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
              const [newSortBy, newSortOrder] = value.split('-')
              setSortBy(newSortBy)
              setSortOrder(newSortOrder as 'asc' | 'desc')
            }}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at-desc">Más recientes</SelectItem>
                <SelectItem value="created_at-asc">Más antiguos</SelectItem>
                <SelectItem value="current_views-desc">Más vistos</SelectItem>
                <SelectItem value="title-asc">Nombre A-Z</SelectItem>
                <SelectItem value="title-desc">Nombre Z-A</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Shares Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Enlaces Compartidos
          </CardTitle>
          <CardDescription>
            Gestiona y monitorea el rendimiento de tus enlaces compartidos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ShareManagementTable
            shares={shares}
            loading={loading}
            onEdit={handleEditShare}
            onDelete={handleDeleteShare}
            pagination={pagination}
            onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
          />
        </CardContent>
      </Card>

      {/* Edit Modal */}
      {selectedShare && (
        <ShareEditModal
          open={editModalOpen}
          onClose={() => {
            setEditModalOpen(false)
            setSelectedShare(null)
          }}
          share={selectedShare}
          onUpdate={handleShareUpdate}
        />
      )}
    </div>
  )
}