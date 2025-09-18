'use client'

import { useState, useEffect } from 'react'
import { Heart, Share2, ArrowRight, Download, User, Calendar, Eye, Sparkles, Home, Palette } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useRouter } from 'next/navigation'
import { shareAnalyticsService } from '@/lib/services/share-analytics.service'
import type { PublicShareData } from '@/types/sharing'
import { CHILEAN_SHARING_TEXT } from '@/types/sharing'
import Link from 'next/link'
import { ColorPalette } from './ColorPalette'
import { TransformationCarousel } from './TransformationCarousel'
import { cn } from '@/lib/utils'

interface PublicShareViewProps {
  shareData: PublicShareData
}

export function PublicShareView({ shareData }: PublicShareViewProps) {
  const router = useRouter()
  const [isReacting, setIsReacting] = useState(false)
  const [reactionCount, setReactionCount] = useState(shareData.reactions.total)
  const [showCTA, setShowCTA] = useState(false)
  // Track page view on mount
  useEffect(() => {
    shareAnalyticsService.trackShareView(shareData.share.id, 'project')
  }, [shareData.share.id])

  // Show CTA after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowCTA(true)
    }, 5000)

    return () => clearTimeout(timer)
  }, [])

  const handleReaction = async () => {
    if (!shareData.isAuthenticated) {
      // Redirect to login with return URL
      const returnUrl = encodeURIComponent(window.location.href)
      router.push(`/auth/login?redirect=${returnUrl}`)
      return
    }

    try {
      setIsReacting(true)
      // Track reaction
      await shareAnalyticsService.trackEvent({
        shareType: 'project',
        shareId: shareData.share.id,
        action: 'clicked',
        platform: 'reaction'
      })

      // Optimistically update count
      setReactionCount(prev => prev + 1)
    } catch (error) {
      console.error('Error adding reaction:', error)
    } finally {
      setIsReacting(false)
    }
  }

  const trackEngagement = async (eventType: string) => {
    try {
      await fetch('/api/share/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shareToken: shareData.share.share_token,
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
    const message = shareData.share.whatsapp_message || `¡Mira esta transformación increíble! ${shareUrl}`
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
    trackEngagement('reshare')
  }

  const handleDownload = async (imageUrl: string, itemTitle?: string) => {
    if (imageUrl) {
      const link = document.createElement('a')
      link.href = imageUrl
      link.download = `decollage-${itemTitle || shareData.project.name || 'design'}.jpg`
      link.click()
      trackEngagement('download')
    }
  }


  return (
    <div className="min-h-screen bg-white">
      {/* Elegant Header with subtle shadow */}
      <header className="bg-white/95 backdrop-blur-sm border-b border-gray-100/50 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-6 flex items-center justify-between">
          <Link href="/" className="flex items-center group">
            <span
              className="text-3xl lg:text-4xl font-light text-[#333333] tracking-wider transition-all duration-500 group-hover:tracking-wide"
              style={{ fontFamily: 'Cormorant, serif' }}
            >
              Decollage
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="default"
              onClick={handleShare}
              className="px-6 py-3 border border-[#333333] text-[#333333] hover:bg-[#333333] hover:text-white transition-all duration-500 rounded-none"
            >
              <Share2 className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline font-light" style={{ fontFamily: 'Lato, sans-serif' }}>Compartir</span>
            </Button>
            <Button
              size="default"
              className="px-6 py-3 bg-[#A3B1A1] hover:bg-[#A3B1A1]/90 text-white transition-all duration-500 rounded-none shadow-lg hover:shadow-xl"
              asChild
            >
              <Link href="/auth/register">
                <Sparkles className="w-4 h-4 mr-2" />
                <span style={{ fontFamily: 'Lato, sans-serif' }}>Crear mi espacio</span>
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {/* Side-by-side Layout: Carousel + Project Info */}
        <section className="py-12 lg:py-20">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16 items-start">

              {/* Carousel Section - Takes 3/5 of the width */}
              <div className="lg:col-span-3">
                <TransformationCarousel
                  items={shareData.items.map(item => ({
                    id: item.id,
                    title: item.title,
                    description: item.description,
                    imageUrl: item.imageUrl,
                    beforeImageUrl: item.beforeImageUrl,
                    style: (item.metadata as any)?.style || undefined,
                    room: (item.metadata as any)?.room || undefined
                  }))}
                  autoPlay={true}
                  interval={6000}
                />
              </div>

              {/* Project Info Section - Takes 2/5 of the width */}
              <div className="lg:col-span-2 lg:sticky lg:top-32">
                <div className="space-y-8">
                  <div>
                    <h1
                      className="text-4xl lg:text-5xl font-light text-[#333333] mb-4 tracking-wide"
                      style={{ fontFamily: 'Cormorant, serif' }}
                    >
                      {shareData.share.title || shareData.project.name}
                    </h1>

                    {shareData.share.description && (
                      <p
                        className="text-lg text-gray-600 font-light leading-relaxed"
                        style={{ fontFamily: 'Lato, sans-serif' }}
                      >
                        {shareData.share.description}
                      </p>
                    )}
                  </div>

                  {/* Meta Information - Vertical Stack */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12 ring-2 ring-[#A3B1A1]/20">
                        <AvatarImage src={shareData.project.userAvatarUrl} />
                        <AvatarFallback className="bg-[#A3B1A1]/10">
                          <User size={20} className="text-[#A3B1A1]" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-xs text-gray-500 font-light uppercase tracking-widest" style={{ fontFamily: 'Lato, sans-serif' }}>Creado por</p>
                        <p className="font-light text-[#333333]" style={{ fontFamily: 'Lato, sans-serif' }}>
                          {shareData.project.userDisplayName}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-[#A3B1A1]" />
                        <div>
                          <p className="text-xs text-gray-500 font-light uppercase tracking-widest" style={{ fontFamily: 'Lato, sans-serif' }}>Publicado</p>
                          <p className="text-sm font-light text-[#333333]" style={{ fontFamily: 'Lato, sans-serif' }}>
                            {new Date(shareData.share.created_at!).toLocaleDateString('es-CL', {
                              month: 'short',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Eye className="w-5 h-5 text-[#A3B1A1]" />
                        <div>
                          <p className="text-xs text-gray-500 font-light uppercase tracking-widest" style={{ fontFamily: 'Lato, sans-serif' }}>Vistas</p>
                          <p className="text-sm font-light text-[#333333]" style={{ fontFamily: 'Lato, sans-serif' }}>
                            {(shareData.share.current_views || 0).toLocaleString('es-CL')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Reaction & Share Buttons */}
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <Button
                        variant="ghost"
                        size="lg"
                        onClick={handleReaction}
                        disabled={isReacting}
                        className="w-full group py-4 border-2 border-[#333333] text-[#333333] hover:bg-[#333333] hover:text-white transition-all duration-500 rounded-none"
                      >
                        <Heart
                          size={20}
                          className={cn(
                            "mr-3 transition-all duration-500",
                            reactionCount > 0 ? "fill-current text-[#C4886F]" : "group-hover:scale-110"
                          )}
                        />
                        <span style={{ fontFamily: 'Lato, sans-serif' }}>
                          {CHILEAN_SHARING_TEXT.applaud}
                        </span>
                      </Button>

                      <Button
                        variant="ghost"
                        size="lg"
                        onClick={handleShare}
                        className="w-full group py-4 border-2 border-[#A3B1A1] text-[#A3B1A1] hover:bg-[#A3B1A1] hover:text-white transition-all duration-500 rounded-none"
                      >
                        <Share2 className="w-5 h-5 mr-3 group-hover:scale-110 transition-all duration-500" />
                        <span style={{ fontFamily: 'Lato, sans-serif' }}>Compartir transformación</span>
                      </Button>
                    </div>

                    <div className="text-center pt-4 border-t border-gray-100">
                      <p className="text-gray-500 font-light" style={{ fontFamily: 'Lato, sans-serif' }}>
                        <span className="text-xl font-light text-[#C4886F]">{reactionCount}</span> {reactionCount === 1 ? 'aplauso' : 'aplausos'}
                      </p>

                      {!shareData.isAuthenticated && (
                        <p className="text-xs text-gray-400 font-light italic mt-2" style={{ fontFamily: 'Lato, sans-serif' }}>
                          Únete para aplaudir
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Magazine-Style Grid Gallery */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            {/* Section Title */}
            <div className="text-center mb-16">
              <h2
                className="text-4xl lg:text-6xl font-light text-[#333333] mb-4 tracking-wide"
                style={{ fontFamily: 'Cormorant, serif' }}
              >
                Cada Espacio, Una Historia
              </h2>
              <p
                className="text-lg text-gray-600 font-light"
                style={{ fontFamily: 'Lato, sans-serif' }}
              >
                Explora cada transformación en detalle
              </p>
            </div>

            {/* Magazine Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
              {shareData.items.map((item, index) => (
                <div
                  key={item.id}
                  className={cn(
                    "group",
                    index === 0 && "lg:col-span-2", // First item spans full width
                    index % 3 === 1 && "lg:row-span-2" // Every third item is taller
                  )}
                >
                  <div className="space-y-6">
                    {/* Image Container with Elegant Hover */}
                    <div
                      className={cn(
                        "relative overflow-hidden bg-[#F8F8F8] shadow-2xl",
                        index === 0 ? "aspect-[21/9]" : "aspect-[4/3]"
                      )}
                    >
                      {/* Before Image (hidden by default) */}
                      {item.beforeImageUrl && (
                        <img
                          src={item.beforeImageUrl}
                          alt="Antes"
                          className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                        />
                      )}

                      {/* After Image */}
                      <img
                        src={item.imageUrl}
                        alt={item.title || `Transformación ${index + 1}`}
                        className={cn(
                          "w-full h-full object-cover transition-all duration-700",
                          item.beforeImageUrl && "group-hover:opacity-0"
                        )}
                      />

                      {/* Elegant Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />


                      {/* Hover Indicator for Before/After */}
                      {item.beforeImageUrl && (
                        <div className="absolute bottom-6 left-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                          <p className="text-white text-sm font-light tracking-widest" style={{ fontFamily: 'Lato, sans-serif' }}>
                            {/* Show opposite state on hover */}
                            MOSTRANDO: ANTES
                          </p>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="absolute bottom-6 right-6 flex gap-3 opacity-0 group-hover:opacity-100 transition-all duration-500">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDownload(item.imageUrl, item.title)}
                          className="bg-white/90 backdrop-blur-sm hover:bg-white text-[#333333] h-10 w-10 rounded-none shadow-lg"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="space-y-4">
                      {/* Title */}
                      {item.title && (
                        <h3
                          className="text-2xl lg:text-3xl font-light text-[#333333] tracking-wide"
                          style={{ fontFamily: 'Cormorant, serif' }}
                        >
                          {item.title}
                        </h3>
                      )}

                      {/* Description */}
                      {item.description && (
                        <p
                          className="text-gray-600 font-light leading-relaxed"
                          style={{ fontFamily: 'Lato, sans-serif' }}
                        >
                          {item.description}
                        </p>
                      )}

                      {/* Color Palette with elegant presentation */}
                      <div className="pt-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Palette className="w-4 h-4 text-[#A3B1A1]" />
                          <span
                            className="text-sm text-gray-500 font-light tracking-widest uppercase"
                            style={{ fontFamily: 'Lato, sans-serif' }}
                          >
                            Paleta de colores
                          </span>
                        </div>
                        <ColorPalette
                          imageUrl={item.imageUrl}
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Elegant CTA Section with Chilean Touch */}
        {showCTA && (
          <section className="relative bg-gradient-to-b from-white via-[#F8F8F8] to-white py-24 overflow-hidden">
            {/* Decorative Elements */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-0 left-0 w-96 h-96 bg-[#A3B1A1] rounded-full blur-3xl" />
              <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#C4886F] rounded-full blur-3xl" />
            </div>

            <div className="relative max-w-6xl mx-auto px-6 lg:px-12 text-center">
              {/* Main Headline */}
              <h2
                className="text-5xl lg:text-7xl font-light text-[#333333] mb-8 tracking-wide leading-tight"
                style={{ fontFamily: 'Cormorant, serif' }}
              >
                Hay un hogar soñado<br />
                <span className="text-[#A3B1A1]">dentro de tus propias paredes</span>
              </h2>

              {/* Subheadline */}
              <p
                className="text-xl lg:text-2xl text-gray-600 mb-16 max-w-3xl mx-auto font-light leading-relaxed"
                style={{ fontFamily: 'Lato, sans-serif' }}
              >
                Únete a miles de chilenas y chilenos que están transformando sus espacios
                con <span className="text-[#C4886F] font-normal">confianza y creatividad</span>.
              </p>

              {/* Feature Pills */}
              <div className="flex flex-wrap justify-center gap-4 mb-16">
                <Badge
                  className="bg-white border border-[#A3B1A1]/20 text-[#333333] px-6 py-3 shadow-lg"
                  style={{ fontFamily: 'Lato, sans-serif' }}
                >
                  <Sparkles className="w-4 h-4 mr-2 text-[#A3B1A1]" />
                  Transformación instantánea
                </Badge>
                <Badge
                  className="bg-white border border-[#C4886F]/20 text-[#333333] px-6 py-3 shadow-lg"
                  style={{ fontFamily: 'Lato, sans-serif' }}
                >
                  <Home className="w-4 h-4 mr-2 text-[#C4886F]" />
                  Estilos chilenos auténticos
                </Badge>
                <Badge
                  className="bg-white border border-[#A3B1A1]/20 text-[#333333] px-6 py-3 shadow-lg"
                  style={{ fontFamily: 'Lato, sans-serif' }}
                >
                  <Palette className="w-4 h-4 mr-2 text-[#A3B1A1]" />
                  Paletas curadas
                </Badge>
              </div>

              {/* CTA Buttons with enhanced styling */}
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Button
                  size="lg"
                  className="group px-12 py-6 bg-[#A3B1A1] hover:bg-[#A3B1A1]/90 text-white transition-all duration-500 rounded-none shadow-2xl hover:shadow-3xl transform hover:-translate-y-1"
                  asChild
                >
                  <Link href="/auth/register">
                    <Sparkles className="w-5 h-5 mr-3 group-hover:rotate-12 transition-transform duration-500" />
                    <span className="text-lg" style={{ fontFamily: 'Lato, sans-serif' }}>Descubre tu hogar soñado</span>
                    <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform duration-300" />
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="group px-12 py-6 border-2 border-[#333333] text-[#333333] hover:bg-[#333333] hover:text-white transition-all duration-500 rounded-none"
                  asChild
                >
                  <Link href="/galeria">
                    <span className="text-lg" style={{ fontFamily: 'Lato, sans-serif' }}>Ver más transformaciones</span>
                    <ArrowRight className="w-5 h-5 ml-3 opacity-0 group-hover:opacity-100 transition-all duration-300" />
                  </Link>
                </Button>
              </div>

              {/* Trust Indicator */}
              <p
                className="mt-12 text-sm text-gray-500 font-light italic"
                style={{ fontFamily: 'Lato, sans-serif' }}
              >
                Más de 5,000 espacios transformados en todo Chile
              </p>
            </div>
          </section>
        )}
      </main>
    </div>
  )
}