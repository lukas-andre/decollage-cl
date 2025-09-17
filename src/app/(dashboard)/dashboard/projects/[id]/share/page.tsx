'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  ArrowLeft,
  Share2,
  Save,
  Globe,
  Users,
  Lock,
  Copy,
  ExternalLink,
  Edit2,
  Check,
  X,
  Eye,
  Settings
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { ShareConfig, ShareResponse } from '@/types/sharing'

interface Variant {
  id: string
  result_image_url: string | null
  is_favorite: boolean
  created_at: string
  tokens_consumed: number
  status: 'pending' | 'processing' | 'completed' | 'failed'
  style: {
    id: string
    name: string
    code: string
  } | null
}

interface Project {
  id: string
  name: string
  description: string | null
}

export default function SharePreviewPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()

  const [project, setProject] = useState<Project | null>(null)
  const [selectedVariants, setSelectedVariants] = useState<Variant[]>([])
  const [loading, setLoading] = useState(true)

  // Share configuration state
  const [shareConfig, setShareConfig] = useState<ShareConfig>({
    type: 'project',
    visibility: 'unlisted',
    customTitle: '',
    customDescription: '',
    featured: [],
    password: '',
    expiresAt: undefined,
    maxViews: undefined
  })

  // UI state
  const [isPublishing, setIsPublishing] = useState(false)
  const [shareResponse, setShareResponse] = useState<ShareResponse | null>(null)
  const [isDraft, setIsDraft] = useState(true)
  const [editingTitle, setEditingTitle] = useState(false)
  const [editingDescription, setEditingDescription] = useState(false)

  useEffect(() => {
    fetchProjectAndSelections()
  }, [id])

  // Separate effect for client-side localStorage access
  useEffect(() => {
    // This runs only on client side after hydration
    const fetchVariantsFromStorage = async () => {
      if (loading || !project) return

      const selectedIds = getSelectedVariantsFromStorage()
      console.log('Client-side selected IDs:', selectedIds)

      if (selectedIds.length > 0 && selectedVariants.length === 0) {
        try {
          console.log('Fetching variants from client effect:', selectedIds)
          const variantResponse = await fetch(`/api/projects/${id}/variants?ids=${selectedIds.join(',')}`)
          const variantData = await variantResponse.json()

          console.log('Client variant response:', variantData)

          if (variantResponse.ok && variantData.variants) {
            console.log('Setting variants from client effect:', variantData.variants)
            setSelectedVariants(variantData.variants)
            setShareConfig(prev => ({
              ...prev,
              featured: selectedIds
            }))
          }
        } catch (error) {
          console.error('Error fetching variants from client:', error)
        }
      }
    }

    fetchVariantsFromStorage()
  }, [project, loading, id])

  const fetchProjectAndSelections = async () => {
    try {
      setLoading(true)

      // Get project info
      const projectResponse = await fetch(`/api/projects/${id}`)
      const projectData = await projectResponse.json()

      if (!projectResponse.ok) {
        throw new Error(projectData.error || 'Error al cargar proyecto')
      }

      setProject(projectData.project)
      setShareConfig(prev => ({
        ...prev,
        customTitle: projectData.project.name,
        customDescription: projectData.project.description || ''
      }))

      // Get selected variants from localStorage
      const selectedIds = getSelectedVariantsFromStorage()
      console.log('Selected IDs from storage:', selectedIds)

      if (selectedIds.length > 0) {
        console.log('Fetching variants for IDs:', selectedIds)
        // Fetch variant details
        const variantResponse = await fetch(`/api/projects/${id}/variants?ids=${selectedIds.join(',')}`)
        const variantData = await variantResponse.json()

        console.log('Variant response:', variantData)

        if (variantResponse.ok && variantData.variants) {
          console.log('Setting variants:', variantData.variants)
          setSelectedVariants(variantData.variants)
          setShareConfig(prev => ({
            ...prev,
            featured: selectedIds
          }))
        } else {
          console.error('Error fetching variants:', variantData)
        }
      } else {
        console.log('No selected IDs found in localStorage')
      }

    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Error al cargar datos del proyecto')
    } finally {
      setLoading(false)
    }
  }

  const getSelectedVariantsFromStorage = (): string[] => {
    // Only access localStorage on client side
    if (typeof window === 'undefined') return []

    try {
      const stored = localStorage.getItem(`share-selection-${id}`)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Error reading from localStorage:', error)
      return []
    }
  }

  const handlePublishShare = async () => {
    if (!project) return

    setIsPublishing(true)
    try {
      const response = await fetch('/api/shares', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: id,
          config: shareConfig
        })
      })

      if (!response.ok) throw new Error('Failed to create share')

      const data: ShareResponse = await response.json()
      setShareResponse(data)
      setIsDraft(false)

      // Copy to clipboard
      await navigator.clipboard.writeText(data.shareUrl)
      toast.success('Enlace compartido creado y copiado al portapapeles!')

      // Clear localStorage
      localStorage.removeItem(`share-selection-${id}`)

    } catch (error) {
      console.error('Share error:', error)
      toast.error('Error al crear el enlace compartido')
    } finally {
      setIsPublishing(false)
    }
  }

  const handleSaveDraft = () => {
    // Save current state to localStorage as draft
    const draft = {
      config: shareConfig,
      selectedVariants: selectedVariants.map(v => v.id),
      timestamp: Date.now()
    }
    localStorage.setItem(`share-draft-${id}`, JSON.stringify(draft))
    toast.success('Borrador guardado')
  }

  const handleRemoveVariant = (variantId: string) => {
    setSelectedVariants(prev => prev.filter(v => v.id !== variantId))
    setShareConfig(prev => ({
      ...prev,
      featured: prev.featured?.filter(id => id !== variantId) || []
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#A3B1A1] mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando preview...</p>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Proyecto no encontrado</h1>
          <p className="text-muted-foreground mb-4">
            El proyecto que intentas compartir no existe.
          </p>
          <Button asChild>
            <Link href="/dashboard/projects">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a proyectos
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/dashboard/projects/${id}`}>
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>

              <div className="flex items-center gap-2">
                <h1 className="font-semibold">Compartir Proyecto</h1>
                {isDraft && (
                  <Badge variant="outline" className="text-xs">
                    Borrador
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSaveDraft}
                disabled={!isDraft}
              >
                <Save className="h-4 w-4 mr-2" />
                Guardar Borrador
              </Button>

              {shareResponse ? (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      await navigator.clipboard.writeText(shareResponse.shareUrl)
                      toast.success('Enlace copiado!')
                    }}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copiar Enlace
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(shareResponse.shareUrl, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Ver Compartido
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={handlePublishShare}
                  disabled={isPublishing || selectedVariants.length === 0}
                  className="bg-[#A3B1A1] hover:bg-[#A3B1A1]/90"
                >
                  {isPublishing ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  ) : (
                    <Share2 className="h-4 w-4 mr-2" />
                  )}
                  Publicar
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">

        {/* Title Section */}
        <div className="mb-8">
          {editingTitle ? (
            <div className="flex items-center gap-2 mb-2">
              <Input
                value={shareConfig.customTitle || ''}
                onChange={(e) => setShareConfig(prev => ({ ...prev, customTitle: e.target.value }))}
                className="text-3xl font-bold border-none px-0 shadow-none focus-visible:ring-0"
                placeholder="Título de tu proyecto..."
                autoFocus
              />
              <Button size="sm" variant="ghost" onClick={() => setEditingTitle(false)}>
                <Check className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2 mb-2 group">
              <h1 className="text-3xl font-bold text-gray-900">
                {shareConfig.customTitle || 'Sin título'}
              </h1>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setEditingTitle(true)}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Edit2 className="h-4 w-4" />
              </Button>
            </div>
          )}

          {editingDescription ? (
            <div className="flex items-start gap-2">
              <Textarea
                value={shareConfig.customDescription || ''}
                onChange={(e) => setShareConfig(prev => ({ ...prev, customDescription: e.target.value }))}
                className="text-lg border-none px-0 shadow-none focus-visible:ring-0 resize-none"
                placeholder="Agrega una descripción para tu proyecto..."
                rows={3}
                autoFocus
              />
              <Button size="sm" variant="ghost" onClick={() => setEditingDescription(false)}>
                <Check className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-start gap-2 group">
              <p className="text-lg text-gray-600 min-h-[2em]">
                {shareConfig.customDescription || 'Agrega una descripción...'}
              </p>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setEditingDescription(true)}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Edit2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Content Preview */}
        <div className="space-y-8">

          {/* Selected Designs Grid */}
          {selectedVariants.length > 0 ? (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Diseños Seleccionados</h2>
                <Badge variant="outline">
                  {selectedVariants.length} diseño{selectedVariants.length !== 1 ? 's' : ''}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {selectedVariants.map((variant, index) => (
                  <div
                    key={variant.id}
                    className="relative group bg-white rounded-lg border hover:border-[#A3B1A1]/30 transition-colors overflow-hidden"
                  >
                    {variant.result_image_url && (
                      <div className="aspect-[4/3] relative overflow-hidden rounded-t-lg">
                        <Image
                          src={variant.result_image_url}
                          alt={variant.style?.name || `Diseño ${index + 1}`}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />

                        {/* Remove button */}
                        <button
                          onClick={() => handleRemoveVariant(variant.id)}
                          className="absolute top-2 right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    )}

                    <div className="p-4">
                      <h3 className="font-medium text-sm">
                        {variant.style?.name || `Diseño ${index + 1}`}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {variant.tokens_consumed} tokens usados
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
              <Share2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay diseños seleccionados
              </h3>
              <p className="text-gray-600 mb-4">
                Vuelve al proyecto para seleccionar los diseños que quieres compartir
              </p>
              <Button asChild variant="outline">
                <Link href={`/dashboard/projects/${id}`}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver al Proyecto
                </Link>
              </Button>
            </div>
          )}

          <Separator />

          {/* Visibility Settings */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Configuración de Privacidad</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => setShareConfig(prev => ({ ...prev, visibility: 'public' }))}
                className={cn(
                  "p-4 border rounded-lg text-left transition-colors",
                  shareConfig.visibility === 'public'
                    ? "border-[#A3B1A1] bg-[#A3B1A1]/5"
                    : "border-gray-200 hover:border-gray-300"
                )}
              >
                <Globe className="h-5 w-5 text-[#A3B1A1] mb-2" />
                <h3 className="font-medium">Público</h3>
                <p className="text-sm text-muted-foreground">
                  Visible en la galería pública
                </p>
              </button>

              <button
                onClick={() => setShareConfig(prev => ({ ...prev, visibility: 'unlisted' }))}
                className={cn(
                  "p-4 border rounded-lg text-left transition-colors",
                  shareConfig.visibility === 'unlisted'
                    ? "border-[#A3B1A1] bg-[#A3B1A1]/5"
                    : "border-gray-200 hover:border-gray-300"
                )}
              >
                <Users className="h-5 w-5 text-[#A3B1A1] mb-2" />
                <h3 className="font-medium">No listado</h3>
                <p className="text-sm text-muted-foreground">
                  Solo accesible con el enlace
                </p>
              </button>

              <button
                onClick={() => setShareConfig(prev => ({ ...prev, visibility: 'private' }))}
                className={cn(
                  "p-4 border rounded-lg text-left transition-colors",
                  shareConfig.visibility === 'private'
                    ? "border-[#A3B1A1] bg-[#A3B1A1]/5"
                    : "border-gray-200 hover:border-gray-300"
                )}
              >
                <Lock className="h-5 w-5 text-[#A3B1A1] mb-2" />
                <h3 className="font-medium">Privado</h3>
                <p className="text-sm text-muted-foreground">
                  Requiere contraseña
                </p>
              </button>
            </div>

            {shareConfig.visibility === 'private' && (
              <div className="mt-4">
                <Input
                  type="password"
                  placeholder="Contraseña de acceso"
                  value={shareConfig.password || ''}
                  onChange={(e) => setShareConfig(prev => ({ ...prev, password: e.target.value }))}
                  className="max-w-md"
                />
              </div>
            )}
          </div>

          {/* Live Preview */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Vista Previa</h2>

            <div className="border rounded-lg overflow-hidden bg-gray-50">
              <div className="bg-white border-b px-4 py-2 flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 text-center text-sm text-muted-foreground">
                  decollage.cl/share/preview
                </div>
              </div>

              <div className="p-6 bg-white min-h-[400px]">
                <div className="max-w-2xl mx-auto">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    {shareConfig.customTitle || project.name}
                  </h1>
                  {shareConfig.customDescription && (
                    <p className="text-gray-600 mb-6">
                      {shareConfig.customDescription}
                    </p>
                  )}

                  {selectedVariants.length > 0 && (
                    <div className="grid grid-cols-2 gap-4">
                      {selectedVariants.slice(0, 4).map((variant, index) => (
                        <div key={variant.id} className="aspect-square relative rounded-lg overflow-hidden">
                          {variant.result_image_url && (
                            <Image
                              src={variant.result_image_url}
                              alt={variant.style?.name || `Diseño ${index + 1}`}
                              fill
                              className="object-cover"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}