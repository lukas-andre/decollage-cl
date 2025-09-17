'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Copy, ExternalLink, Share2, Lock, Globe, Users, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { ShareConfig, ShareResponse } from '@/types/sharing'

interface ShareModalProps {
  projectId: string
  projectName: string
  selectedItems?: any[]
  onClose: () => void
  onShareCreated?: (shareData: ShareResponse) => void
}

export function ShareModal({
  projectId,
  projectName,
  selectedItems = [],
  onClose,
  onShareCreated
}: ShareModalProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [shareConfig, setShareConfig] = useState<ShareConfig>({
    type: 'project',
    visibility: 'unlisted',
    customTitle: projectName,
    customDescription: '',
    featured: selectedItems.map(item => item.id),
    password: '',
    expiresAt: undefined,
    maxViews: undefined
  })
  const [shareResponse, setShareResponse] = useState<ShareResponse | null>(null)

  const handleCreateShare = async () => {
    setIsCreating(true)
    try {
      const response = await fetch('/api/shares', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          config: {
            ...shareConfig,
            featured: selectedItems.map(item => item.id)
          }
        })
      })

      if (!response.ok) throw new Error('Failed to create share')

      const data: ShareResponse = await response.json()
      setShareResponse(data)
      onShareCreated?.(data)

      // Auto-copy to clipboard
      await navigator.clipboard.writeText(data.shareUrl)
      toast.success('¡Enlace copiado al portapapeles!')
    } catch (error) {
      console.error('Share error:', error)
      toast.error('Error al crear el enlace compartido')
    } finally {
      setIsCreating(false)
    }
  }

  const handleCopyLink = async () => {
    if (shareResponse) {
      await navigator.clipboard.writeText(shareResponse.shareUrl)
      toast.success('¡Enlace copiado!')
    }
  }

  const handleCopyEmbed = async () => {
    if (shareResponse?.embedCode) {
      await navigator.clipboard.writeText(shareResponse.embedCode)
      toast.success('¡Código de inserción copiado!')
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Compartir {projectName}
          </DialogTitle>
          <DialogDescription>
            {selectedItems.length > 0
              ? `Compartiendo ${selectedItems.length} elementos seleccionados`
              : 'Comparte tu proyecto con otros o insértalo en tu sitio web'}
          </DialogDescription>
        </DialogHeader>

        {!shareResponse ? (
          <div className="space-y-6">
            {/* Visibility Settings */}
            <div className="space-y-3">
              <Label>Visibilidad</Label>
              <Select
                value={shareConfig.visibility}
                onValueChange={(value: any) =>
                  setShareConfig(prev => ({ ...prev, visibility: value }))
                }
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
            </div>

            {/* Custom Title */}
            <div className="space-y-2">
              <Label htmlFor="share-title">Título personalizado (opcional)</Label>
              <Input
                id="share-title"
                value={shareConfig.customTitle || ''}
                onChange={(e) =>
                  setShareConfig(prev => ({ ...prev, customTitle: e.target.value }))
                }
                placeholder="Mi increíble transformación"
              />
            </div>

            {/* Custom Description */}
            <div className="space-y-2">
              <Label htmlFor="share-description">Descripción (opcional)</Label>
              <Textarea
                id="share-description"
                value={shareConfig.customDescription || ''}
                onChange={(e) =>
                  setShareConfig(prev => ({ ...prev, customDescription: e.target.value }))
                }
                placeholder="Describe tu proyecto..."
                rows={3}
              />
            </div>

            {/* Password Protection (for private shares) */}
            {shareConfig.visibility === 'private' && (
              <div className="space-y-2">
                <Label htmlFor="share-password">Contraseña de acceso</Label>
                <Input
                  id="share-password"
                  type="password"
                  value={shareConfig.password || ''}
                  onChange={(e) =>
                    setShareConfig(prev => ({ ...prev, password: e.target.value }))
                  }
                  placeholder="Ingresa una contraseña segura"
                />
              </div>
            )}

            {/* Advanced Options */}
            <div className="space-y-3">
              <Label>Opciones avanzadas</Label>

              {/* Expiration */}
              <div className="flex items-center justify-between">
                <Label htmlFor="expires" className="text-sm text-muted-foreground">
                  Establecer fecha de expiración
                </Label>
                <Input
                  id="expires"
                  type="datetime-local"
                  className="w-auto"
                  onChange={(e) => {
                    const date = e.target.value ? new Date(e.target.value) : undefined
                    setShareConfig(prev => ({ ...prev, expiresAt: date }))
                  }}
                />
              </div>

              {/* View Limit */}
              <div className="flex items-center justify-between">
                <Label htmlFor="max-views" className="text-sm text-muted-foreground">
                  Límite de visualizaciones
                </Label>
                <Input
                  id="max-views"
                  type="number"
                  className="w-24"
                  placeholder="∞"
                  min="1"
                  value={shareConfig.maxViews || ''}
                  onChange={(e) =>
                    setShareConfig(prev => ({
                      ...prev,
                      maxViews: e.target.value ? parseInt(e.target.value) : undefined
                    }))
                  }
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button onClick={handleCreateShare} disabled={isCreating}>
                {isCreating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creando...
                  </>
                ) : (
                  <>
                    <Share2 className="h-4 w-4 mr-2" />
                    Crear enlace
                  </>
                )}
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Share Success */}
            <div className="rounded-lg bg-green-50 dark:bg-green-950/20 p-4 border border-green-200 dark:border-green-800">
              <p className="text-sm text-green-800 dark:text-green-200 mb-3">
                ¡Tu proyecto ha sido compartido exitosamente!
              </p>

              <Tabs defaultValue="link">
                <TabsList className="grid grid-cols-2 w-full">
                  <TabsTrigger value="link">Enlace</TabsTrigger>
                  <TabsTrigger value="embed">Insertar</TabsTrigger>
                </TabsList>

                <TabsContent value="link" className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Input
                      readOnly
                      value={shareResponse.shareUrl}
                      className="font-mono text-sm"
                    />
                    <Button size="icon" variant="outline" onClick={handleCopyLink}>
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => window.open(shareResponse.shareUrl, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="embed" className="space-y-3">
                  {shareResponse.embedCode && (
                    <div className="space-y-2">
                      <Textarea
                        readOnly
                        value={shareResponse.embedCode}
                        className="font-mono text-xs"
                        rows={3}
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCopyEmbed}
                        className="w-full"
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copiar código
                      </Button>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>

            {/* Social Sharing */}
            <div className="space-y-3">
              <Label>Compartir en redes sociales</Label>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const text = shareConfig.customTitle || projectName
                    const url = `https://wa.me/?text=${encodeURIComponent(`${text} ${shareResponse.shareUrl}`)}`
                    window.open(url, '_blank')
                  }}
                >
                  WhatsApp
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareResponse.shareUrl)}&text=${encodeURIComponent(shareConfig.customTitle || projectName)}`
                    window.open(url, '_blank')
                  }}
                >
                  Twitter
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareResponse.shareUrl)}`
                    window.open(url, '_blank')
                  }}
                >
                  Facebook
                </Button>
              </div>
            </div>

            <DialogFooter>
              <Button onClick={onClose}>
                Cerrar
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}