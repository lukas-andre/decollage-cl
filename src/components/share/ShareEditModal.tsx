'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { DatePicker } from '@/components/ui/date-picker'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Save,
  Loader2,
  Globe,
  Users,
  Lock,
  Calendar,
  Eye,
  Share2,
  BarChart3,
  Copy,
  ExternalLink
} from 'lucide-react'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

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
  max_views?: number
  projects: {
    name: string
    cover_image_url?: string
  }
}

interface ShareEditModalProps {
  open: boolean
  onClose: () => void
  share: ProjectShare
  onUpdate: () => void
}

export function ShareEditModal({ open, onClose, share, onUpdate }: ShareEditModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    customTitle: share.title || '',
    customDescription: share.description || '',
    visibility: share.visibility,
    password: '',
    expiresAt: share.expires_at ? new Date(share.expires_at) : undefined,
    maxViews: share.max_views || undefined
  })

  const handleSave = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/shares/${share.share_token}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        throw new Error('Failed to update share')
      }

      onUpdate()
    } catch (error) {
      console.error('Update error:', error)
      toast.error('Error al actualizar el enlace')
    } finally {
      setLoading(false)
    }
  }

  const copyShareLink = async () => {
    const baseUrl = window.location.origin
    const shareUrl = share.slug
      ? `${baseUrl}/share/${share.slug}`
      : `${baseUrl}/share/${share.share_token}`

    try {
      await navigator.clipboard.writeText(shareUrl)
      toast.success('¡Enlace copiado!')
    } catch (error) {
      toast.error('Error al copiar el enlace')
    }
  }

  const getVisibilityInfo = (visibility: string) => {
    switch (visibility) {
      case 'public':
        return {
          icon: <Globe className="h-4 w-4" />,
          label: 'Público',
          description: 'Visible en la galería pública y buscadores'
        }
      case 'unlisted':
        return {
          icon: <Users className="h-4 w-4" />,
          label: 'No listado',
          description: 'Solo accesible con el enlace directo'
        }
      case 'private':
        return {
          icon: <Lock className="h-4 w-4" />,
          label: 'Privado',
          description: 'Requiere contraseña para acceder'
        }
      default:
        return {
          icon: <Users className="h-4 w-4" />,
          label: 'No listado',
          description: 'Solo accesible con el enlace directo'
        }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Editar Enlace Compartido
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
            {/* Edit Form */}
            <div className="space-y-6 overflow-y-auto pr-2">
              {/* Basic Information */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título</Label>
                  <Input
                    id="title"
                    value={formData.customTitle}
                    onChange={(e) => setFormData(prev => ({ ...prev, customTitle: e.target.value }))}
                    placeholder="Título del enlace compartido"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descripción (opcional)</Label>
                  <Textarea
                    id="description"
                    value={formData.customDescription}
                    onChange={(e) => setFormData(prev => ({ ...prev, customDescription: e.target.value }))}
                    placeholder="Describe tu proyecto..."
                    rows={3}
                  />
                </div>
              </div>

              {/* Visibility Settings */}
              <div className="space-y-4">
                <Label>Visibilidad</Label>
                <Select
                  value={formData.visibility}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, visibility: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        <span>Público - Visible en la galería</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="unlisted">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>No listado - Solo con enlace</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="private">
                      <div className="flex items-center gap-2">
                        <Lock className="h-4 w-4" />
                        <span>Privado - Requiere contraseña</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-blue-800">
                    {getVisibilityInfo(formData.visibility).icon}
                    <span className="font-medium">{getVisibilityInfo(formData.visibility).label}</span>
                  </div>
                  <p className="text-sm text-blue-600 mt-1">
                    {getVisibilityInfo(formData.visibility).description}
                  </p>
                </div>
              </div>

              {/* Password Protection */}
              {formData.visibility === 'private' && (
                <div className="space-y-2">
                  <Label htmlFor="password">Nueva contraseña (opcional)</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Dejar vacío para mantener la actual"
                  />
                </div>
              )}

              {/* Access Limits */}
              <div className="space-y-4">
                <Label>Límites de acceso</Label>

                <div className="space-y-2">
                  <Label htmlFor="maxViews">Máximo de visualizaciones (opcional)</Label>
                  <Input
                    id="maxViews"
                    type="number"
                    min="1"
                    value={formData.maxViews || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      maxViews: e.target.value ? parseInt(e.target.value) : undefined
                    }))}
                    placeholder="Sin límite"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Fecha de expiración (opcional)</Label>
                  <DatePicker
                    selected={formData.expiresAt}
                    onSelect={(date) => setFormData(prev => ({ ...prev, expiresAt: date }))}
                    placeholder="Sin fecha de expiración"
                  />
                </div>
              </div>
            </div>

            {/* Analytics & Preview */}
            <div className="border-l pl-6 overflow-y-auto space-y-6">
              {/* Analytics Cards */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Rendimiento</h4>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Eye className="h-6 w-6 text-[#A3B1A1]" />
                      <div>
                        <p className="text-2xl font-bold text-[#A3B1A1]">
                          {share.current_views || 0}
                        </p>
                        <p className="text-sm text-gray-600">Visualizaciones</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Share Info */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Información del enlace</h4>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span>Creado {formatDistanceToNow(new Date(share.created_at), {
                      addSuffix: true,
                      locale: es
                    })}</span>
                  </div>

                  {share.last_viewed_at && (
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-gray-400" />
                      <span>Último acceso {formatDistanceToNow(new Date(share.last_viewed_at), {
                        addSuffix: true,
                        locale: es
                      })}</span>
                    </div>
                  )}
                </div>

                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Share2 className="h-4 w-4" />
                    <span className="text-sm font-medium">Enlace compartido</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      readOnly
                      value={share.slug
                        ? `${window.location.origin}/share/${share.slug}`
                        : `${window.location.origin}/share/${share.share_token}`
                      }
                      className="text-xs font-mono"
                    />
                    <Button size="sm" variant="outline" onClick={copyShareLink}>
                      <Copy className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const shareUrl = share.slug
                          ? `${window.location.origin}/share/${share.slug}`
                          : `${window.location.origin}/share/${share.share_token}`
                        window.open(shareUrl, '_blank')
                      }}
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Guardar cambios
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}