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
import { Copy, ExternalLink, Share2, Lock, Globe, Users, Loader2, X, Eye } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { ShareConfig, ShareResponse } from '@/types/sharing'
import { SharePreview } from './SharePreview'

interface ShareModalProps {
  projectId: string
  projectName: string
  selectedItems?: any[]
  onClose: () => void
  onShareCreated?: (shareData: ShareResponse) => void
  onRemoveItem?: (itemId: string) => void
}

export function ShareModal({
  projectId,
  projectName,
  selectedItems = [],
  onClose,
  onShareCreated,
  onRemoveItem
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
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Compartir {projectName}
          </DialogTitle>
          <DialogDescription className="space-y-2">
            {selectedItems.length > 0 ? (
              <div className="space-y-1">
                <p>Compartiendo {selectedItems.length} diseño{selectedItems.length !== 1 ? 's' : ''} seleccionado{selectedItems.length !== 1 ? 's' : ''}</p>
                <div className="flex flex-wrap gap-1">
                  {selectedItems.slice(0, 3).map((item, i) => (
                    <span key={i} className="text-xs bg-[#A3B1A1]/10 text-[#A3B1A1] px-2 py-1 rounded-full">
                      {item.style?.name || `Diseño ${i + 1}`}
                    </span>
                  ))}
                  {selectedItems.length > 3 && (
                    <span className="text-xs text-muted-foreground">
                      +{selectedItems.length - 3} más
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <p>Comparte tu proyecto completo con otros o insértalo en tu sitio web</p>
            )}
          </DialogDescription>
        </DialogHeader>

        {/* Visual Selection Grid - Show selected images */}
        {selectedItems.length > 0 && (
          <div className="border-b pb-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-sm text-[#A3B1A1]">
                Diseños seleccionados ({selectedItems.length})
              </h4>
              <span className="text-xs text-muted-foreground">
                Haz clic en × para remover
              </span>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
              {selectedItems.map((item, index) => (
                <div
                  key={item.id}
                  className="relative group cursor-pointer aspect-square rounded-lg overflow-hidden bg-muted border-2 border-[#A3B1A1]/20"
                >
                  {item.result_image_url && (
                    <>
                      <Image
                        src={item.result_image_url}
                        alt={item.style?.name || `Diseño ${index + 1}`}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 640px) 25vw, (max-width: 768px) 16vw, 12vw"
                      />

                      {/* Hover overlay with remove button */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                        <div className="flex gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              // View image functionality could be added here
                            }}
                            className="w-6 h-6 bg-white/90 hover:bg-white rounded-full flex items-center justify-center transition-colors"
                          >
                            <Eye className="h-3 w-3 text-gray-700" />
                          </button>

                          {onRemoveItem && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                onRemoveItem(item.id)
                              }}
                              className="w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Remove button - always visible on small screens */}
                      {onRemoveItem && (
                        <button
                          onClick={() => onRemoveItem(item.id)}
                          className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </>
                  )}

                  {/* Style name label */}
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-1 text-center">
                    <span className="truncate block">
                      {item.style?.name || `Diseño ${index + 1}`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!shareResponse ? (
          <div className="flex-1 overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
              {/* Configuration Panel */}
              <div className="space-y-6 overflow-y-auto pr-2">
            {/* Quick Selection - Only show when no items are selected */}
            {selectedItems.length === 0 && (
              <div className="rounded-lg bg-[#A3B1A1]/5 border border-[#A3B1A1]/10 p-4">
                <h4 className="font-medium text-sm mb-3 text-[#A3B1A1]">Selección Rápida</h4>
                <div className="grid grid-cols-1 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onClose()
                      window.dispatchEvent(new CustomEvent('quick-select-best'))
                    }}
                    className="justify-start"
                  >
                    Seleccionar 5 Mejores Diseños
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onClose()
                      window.dispatchEvent(new CustomEvent('quick-select-favorites'))
                    }}
                    className="justify-start"
                  >
                    Seleccionar Todos los Favoritos
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onClose()
                      window.dispatchEvent(new CustomEvent('quick-select-by-style'))
                    }}
                    className="justify-start"
                  >
                    Seleccionar por Estilo
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  O vuelve al proyecto para hacer una selección manual
                </p>
              </div>
            )}

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

              {/* Preview Panel - Only show on larger screens */}
              <div className="hidden lg:block border-l pl-6 overflow-y-auto">
                <SharePreview
                  config={shareConfig}
                  selectedItems={selectedItems}
                  projectName={projectName}
                />
              </div>
            </div>
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