'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { useShareViewTracking } from '@/hooks/use-share-view-tracking'
import { ArrowRight, Download, Share2, User, Calendar } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import Link from 'next/link'
import type { Database } from '@/types/database.types'
import type { PublicShareData } from '@/types/sharing'
import { ColorPalette } from './ColorPalette'
import { InteractionBar } from './InteractionBar'
import { triggerAuth } from '@/hooks/use-auth-modal'
import { createClient } from '@/lib/supabase/client'

type ProjectShare = Database['public']['Tables']['project_shares']['Row']
type Transformation = Database['public']['Tables']['transformations']['Row'] & {
  base_image?: {
    url: string
    cloudflare_id: string | null
  } | null
}
type Project = Database['public']['Tables']['projects']['Row']

interface QuickShareViewProps {
  shareData: PublicShareData
  generation: Transformation
}

export function QuickShareView({ shareData, generation }: QuickShareViewProps) {
  const { share, project } = shareData
  const [sliderPosition, setSliderPosition] = useState(50)
  const [isDragging, setIsDragging] = useState(false)
  const [showCTA, setShowCTA] = useState(false)
  const [imageOrientation, setImageOrientation] = useState<'horizontal' | 'vertical' | 'square'>('horizontal')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [reactionCount, setReactionCount] = useState(0)

  // Track view using the new hook
  useShareViewTracking({
    shareToken: share.share_token || share.slug || ''
  })

  // Check authentication status and listen for changes
  useEffect(() => {
    const supabase = createClient()

    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setIsAuthenticated(!!user)
    }

    // Always check client-side auth state
    checkAuth()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session?.user)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Show CTA after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowCTA(true)
    }, 5000)

    return () => clearTimeout(timer)
  }, [])

  // Detect image orientation
  useEffect(() => {
    if (generation.result_image_url) {
      const img = new Image()
      img.onload = () => {
        const aspectRatio = img.width / img.height
        if (aspectRatio > 1.1) {
          setImageOrientation('horizontal')
        } else if (aspectRatio < 0.9) {
          setImageOrientation('vertical')
        } else {
          setImageOrientation('square')
        }
      }
      img.src = generation.result_image_url
    }
  }, [generation.result_image_url])

  const handleMouseDown = () => {
    setIsDragging(true)
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return

    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percentage = (x / rect.width) * 100
    setSliderPosition(Math.min(100, Math.max(0, percentage)))
  }

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0]
    const rect = e.currentTarget.getBoundingClientRect()
    const x = touch.clientX - rect.left
    const percentage = (x / rect.width) * 100
    setSliderPosition(Math.min(100, Math.max(0, percentage)))
  }

  const trackEngagement = async (eventType: string) => {
    try {
      await fetch('/api/share/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shareToken: share.share_token,
          eventType,
          eventData: {}
        })
      })
    } catch (error) {
      console.error('Error tracking engagement:', error)
    }
  }

  const handleShare = () => {
    const shareUrl = window.location.href
    const message = share.whatsapp_message || `¡Mira esta transformación increíble! ${shareUrl}`
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
    trackEngagement('reshare')
  }

  const handleDownload = async () => {
    if (!isAuthenticated) {
      // Track gate impression for download
      await fetch('/api/analytics/track-gate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_type: 'gate_shown',
          action: 'download',
          share_token: share.share_token,
          metadata: {
            image_url: generation.result_image_url,
            project_name: project.name
          }
        })
      })

      // Trigger auth modal with download context
      triggerAuth('download', {
        shareToken: share.share_token || undefined,
        imageUrl: generation.result_image_url || undefined,
        title: project.name || 'design',
        metadata: {
          originalImageUrl: generation.result_image_url
        }
      })
      return
    }

    if (generation.result_image_url) {
      const link = document.createElement('a')
      link.href = generation.result_image_url
      link.download = `decollage-${project.name || 'design'}.jpg`
      link.click()
      trackEngagement('download')
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <span className="text-2xl sm:text-3xl font-light text-[#333333] tracking-wide" style={{ fontFamily: 'Cormorant, serif' }}>
              Decollage
            </span>
          </Link>
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              className="px-4 py-2 border border-[#333333] text-[#333333] hover:bg-[#333333] hover:text-white transition-all duration-300 rounded-none"
            >
              <Share2 className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Compartir</span>
            </Button>
            <Button
              size="sm"
              className="px-4 py-2 bg-[#A3B1A1] hover:bg-[#A3B1A1]/90 text-white transition-all duration-300 rounded-none"
              asChild
            >
              <Link href="/auth/signup">
                <span className="text-sm sm:text-base">Crear mi espacio</span>
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto">
        {/* Before/After Slider */}
        <div className={`overflow-hidden bg-white ${
          imageOrientation === 'vertical'
            ? 'h-[80vh] max-w-2xl mx-auto'
            : imageOrientation === 'square'
            ? 'h-[70vh] max-w-4xl mx-auto'
            : 'h-[70vh]'
        }`}>
          <div
            className="relative h-full cursor-ew-resize select-none"
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onMouseMove={handleMouseMove}
            onTouchMove={handleTouchMove}
          >
            {/* Original Image */}
            {generation.base_image?.url ? (
              <img
                src={generation.base_image.url}
                alt="Antes"
                className={`absolute inset-0 w-full h-full ${
                  imageOrientation === 'vertical' ? 'object-contain' : 'object-cover'
                }`}
              />
            ) : (
              <div className="absolute inset-0 w-full h-full bg-[#F8F8F8] flex items-center justify-center">
                <p className="text-gray-400 font-light" style={{ fontFamily: 'Lato, sans-serif' }}>
                  Imagen original no disponible
                </p>
              </div>
            )}

            {/* Generated Image with Clip */}
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
            >
              {generation.result_image_url && (
                <img
                  src={generation.result_image_url}
                  alt="Después"
                  className={`absolute inset-0 w-full h-full ${
                    imageOrientation === 'vertical' ? 'object-contain' : 'object-cover'
                  }`}
                />
              )}
            </div>

            {/* Slider Line */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-white"
              style={{ left: `${sliderPosition}%` }}
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white flex items-center justify-center shadow-lg">
                <div className="w-1 h-4 bg-[#333333]"></div>
              </div>
            </div>

            {/* Labels */}
            <div className="absolute bottom-8 left-8">
              <div className="bg-black/90 text-white px-6 py-3 text-sm font-light tracking-widest" style={{ fontFamily: 'Lato, sans-serif' }}>
                ANTES
              </div>
            </div>
            <div className="absolute bottom-8 right-8">
              <div className="bg-[#A3B1A1] text-white px-6 py-3 text-sm font-light tracking-widest" style={{ fontFamily: 'Lato, sans-serif' }}>
                DESPUÉS
              </div>
            </div>

          </div>
        </div>

        {/* Author Info & Color Palette */}
        {generation.result_image_url && (
          <div className="bg-white p-12">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Author Information - Left Side */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-3xl font-light text-[#333333] mb-2 tracking-wide" style={{ fontFamily: 'Cormorant, serif' }}>
                    {generation.metadata && typeof generation.metadata === 'object' && 'style_name' in generation.metadata
                      ? generation.metadata.style_name as string
                      : 'Transformación'
                    }
                  </h3>

                  {/* User Info with Avatar */}
                  <div className="flex items-center gap-4 mt-4">
                    <Avatar className="h-12 w-12 ring-2 ring-[#A3B1A1]/20">
                      <AvatarImage src={project.userAvatarUrl} />
                      <AvatarFallback className="bg-[#A3B1A1]/10">
                        <User size={20} className="text-[#A3B1A1]" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-xs text-gray-500 font-light uppercase tracking-widest" style={{ fontFamily: 'Lato, sans-serif' }}>Creado por</p>
                      <p className="font-light text-[#333333]" style={{ fontFamily: 'Lato, sans-serif' }}>
                        {project.userDisplayName}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-gray-100">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-[#A3B1A1]" />
                      <div>
                        <p className="text-xs text-gray-500 font-light uppercase tracking-widest" style={{ fontFamily: 'Lato, sans-serif' }}>Publicado</p>
                        <p className="text-sm font-light text-[#333333]" style={{ fontFamily: 'Lato, sans-serif' }}>
                          {share.created_at && new Date(share.created_at).toLocaleDateString('es-CL', {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <span className="text-gray-600 font-light" style={{ fontFamily: 'Lato, sans-serif' }}>Estilo</span>
                    <span className="text-[#333333] font-light" style={{ fontFamily: 'Lato, sans-serif' }}>
                      {generation.metadata && typeof generation.metadata === 'object' && 'style_name' in generation.metadata
                        ? generation.metadata.style_name as string
                        : 'Personalizado'
                      }
                    </span>
                  </div>
                </div>

                {/* Social Interactions */}
                <div className="pt-6 border-t border-gray-100">
                  <InteractionBar
                    shareId={share.id}
                    shareToken={share.share_token || share.slug || ''}
                    initialLikes={(share.engagement_metrics as any)?.likes || reactionCount || 0}
                    initialComments={(share.engagement_metrics as any)?.comments || 0}
                    initialSaves={(share.engagement_metrics as any)?.saves || 0}
                    isAuthenticated={isAuthenticated}
                    onShare={handleShare}
                    onDownload={handleDownload}
                    orientation="horizontal"
                    showLabels={true}
                    className="justify-start"
                  />
                </div>

              </div>

              {/* Color Palette - Right Side */}
              <div>
                <ColorPalette
                  imageUrl={generation.result_image_url}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        )}


        {/* CTA Section */}
        {showCTA && (
          <div className="bg-[#F8F8F8] p-16 text-center">
            <h2 className="text-4xl font-light text-[#333333] mb-6 tracking-wide" style={{ fontFamily: 'Cormorant, serif' }}>
              Hay un hogar soñado dentro de tus propias paredes
            </h2>
            <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto font-light leading-relaxed" style={{ fontFamily: 'Lato, sans-serif' }}>
              Únete a miles de chilenas y chilenos que están transformando sus espacios con confianza y creatividad.
              Descubre su potencial con la magia de Decollage.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button
                size="lg"
                className="px-8 py-4 bg-[#A3B1A1] hover:bg-[#A3B1A1]/90 text-white transition-all duration-300 rounded-none"
                asChild
              >
                <Link href="/auth/signup">
                  <span style={{ fontFamily: 'Lato, sans-serif' }}>Descubre tu hogar soñado</span>
                  <ArrowRight className="w-4 h-4 ml-3" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="px-8 py-4 border border-[#333333] text-[#333333] hover:bg-[#333333] hover:text-white transition-all duration-300 rounded-none"
                asChild
              >
                <Link href="/signup">
                  <span style={{ fontFamily: 'Lato, sans-serif' }}>Ver más transformaciones</span>
                </Link>
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}