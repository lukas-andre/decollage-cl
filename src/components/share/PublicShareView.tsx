'use client'

import { useState, useEffect } from 'react'
import { Heart, Share2, ExternalLink, User, Calendar, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useRouter } from 'next/navigation'
import { shareAnalyticsService } from '@/lib/services/share-analytics.service'
import type { PublicShareData } from '@/types/sharing'
import { CHILEAN_SHARING_TEXT } from '@/types/sharing'

interface PublicShareViewProps {
  shareData: PublicShareData
}

export function PublicShareView({ shareData }: PublicShareViewProps) {
  const router = useRouter()
  const [isReacting, setIsReacting] = useState(false)
  const [reactionCount, setReactionCount] = useState(shareData.reactions.total)

  // Track page view on mount
  useEffect(() => {
    shareAnalyticsService.trackShareView(shareData.share.id, 'project')
  }, [shareData.share.id])

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

  const handleShare = async () => {
    try {
      await navigator.share({
        title: shareData.share.title || shareData.project.name,
        text: shareData.share.description || `Mira esta increíble transformación hecha con Decollage.cl`,
        url: window.location.href
      })

      // Track share event
      await shareAnalyticsService.trackEvent({
        shareType: 'project',
        shareId: shareData.share.id,
        action: 'clicked',
        platform: 'native_share'
      })
    } catch (error) {
      // Fallback to copy to clipboard
      await navigator.clipboard.writeText(window.location.href)
      
      // Track copy event
      await shareAnalyticsService.trackEvent({
        shareType: 'project',
        shareId: shareData.share.id,
        action: 'clicked',
        platform: 'copy_link'
      })
    }
  }

  const handleViewProject = () => {
    // Track conversion
    shareAnalyticsService.trackEvent({
      shareType: 'project',
      shareId: shareData.share.id,
      action: 'converted'
    })

    router.push('/auth/register')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-2xl font-bold text-gray-900">
                🏠 Decollage.cl
              </div>
              <Badge variant="secondary" className="text-xs">
                {CHILEAN_SHARING_TEXT.transformation}
              </Badge>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="gap-2"
              >
                <Share2 size={16} />
                {CHILEAN_SHARING_TEXT.shareButton}
              </Button>
              
              <Button
                size="sm"
                onClick={handleViewProject}
                className="gap-2"
              >
                <ExternalLink size={16} />
                {CHILEAN_SHARING_TEXT.viewProject}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Project Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {shareData.share.title || shareData.project.name}
              </h1>
              
              {shareData.share.description && (
                <p className="text-lg text-gray-600 mb-4">
                  {shareData.share.description}
                </p>
              )}

              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={shareData.project.userAvatarUrl} />
                    <AvatarFallback>
                      <User size={16} />
                    </AvatarFallback>
                  </Avatar>
                  <span>{shareData.project.userDisplayName}</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <Calendar size={16} />
                  <span>
                    {new Date(shareData.share.created_at!).toLocaleDateString('es-CL')}
                  </span>
                </div>
                
                <div className="flex items-center gap-1">
                  <Eye size={16} />
                  <span>{shareData.share.current_views || 0} visualizaciones</span>
                </div>
              </div>
            </div>

            {/* Reaction Button */}
            <div className="flex flex-col items-center gap-2">
              <Button
                variant={shareData.isAuthenticated ? "default" : "outline"}
                size="lg"
                onClick={handleReaction}
                disabled={isReacting}
                className="gap-2 min-w-[120px]"
              >
                <Heart 
                  size={20} 
                  className={reactionCount > 0 ? "fill-current text-red-500" : ""} 
                />
                {CHILEAN_SHARING_TEXT.applaud}
              </Button>
              
              <span className="text-sm text-gray-500">
                {reactionCount} {reactionCount === 1 ? 'aplauso' : 'aplausos'}
              </span>
              
              {!shareData.isAuthenticated && (
                <p className="text-xs text-center text-gray-400 max-w-[120px]">
                  Únete para aplaudir
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Transformations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {shareData.items.map((item, index) => (
            <Card key={item.id} className="overflow-hidden group hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <div className="aspect-square relative overflow-hidden">
                  <img
                    src={item.imageUrl}
                    alt={item.title || `${CHILEAN_SHARING_TEXT.transformation} ${index + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  {/* Before/After indicator */}
                  {item.beforeImageUrl && (
                    <div className="absolute top-2 left-2">
                      <Badge variant="secondary" className="text-xs">
                        {CHILEAN_SHARING_TEXT.beforeAndAfter}
                      </Badge>
                    </div>
                  )}
                </div>
                
                {item.title && (
                  <div className="p-4">
                    <h3 className="font-medium text-gray-900 mb-1">
                      {item.title}
                    </h3>
                    {item.description && (
                      <p className="text-sm text-gray-600">
                        {item.description}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-4">
            ¿Te inspiraste? ¡Crea tu propia transformación!
          </h2>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Únete a miles de chilenos que ya están transformando sus espacios con 
            Decollage. Es fácil, rápido y los resultados son increíbles.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              variant="secondary"
              onClick={handleViewProject}
              className="gap-2"
            >
              <ExternalLink size={20} />
              Comenzar ahora gratis
            </Button>
            
            <Button
              size="lg"
              variant="outline"
              onClick={handleShare}
              className="gap-2 border-white text-white hover:bg-white hover:text-blue-600"
            >
              <Share2 size={20} />
              Compartir esta transformación
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 mb-2">
              🏠 Decollage.cl
            </div>
            <p className="text-gray-600 mb-4">
              Transformamos espacios
            </p>
            <p className="text-sm text-gray-500">
              Diseño chileno • Resultados increíbles
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}