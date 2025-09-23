'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { triggerAuth } from '@/hooks/use-auth-modal'
import { cn } from '@/lib/utils'
import {
  Heart,
  MessageSquare,
  Bookmark,
  Share2,
  Eye,
  Download,
  Sparkles
} from 'lucide-react'

interface InteractionBarProps {
  shareId: string
  shareToken: string
  initialLikes?: number
  initialComments?: number
  initialSaves?: number
  userReaction?: string
  isAuthenticated: boolean
  onShare?: () => void
  onDownload?: () => void
  orientation?: 'horizontal' | 'vertical'
  showLabels?: boolean
  className?: string
}

export function InteractionBar({
  shareId,
  shareToken,
  initialLikes = 0,
  initialComments = 0,
  initialSaves = 0,
  userReaction,
  isAuthenticated,
  onShare,
  onDownload,
  orientation = 'horizontal',
  showLabels = true,
  className
}: InteractionBarProps) {
  const [likes, setLikes] = useState(initialLikes)
  const [hasLiked, setHasLiked] = useState(!!userReaction)
  const [isLiking, setIsLiking] = useState(false)
  const [saves, setSaves] = useState(initialSaves)
  const [hasSaved, setHasSaved] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Get anonymous session token
  const getSessionToken = () => {
    if (typeof window === 'undefined') return null
    let token = localStorage.getItem('anonymousSession')
    if (!token) {
      token = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem('anonymousSession', token)
    }
    return token
  }

  const handleLike = async () => {
    if (!isAuthenticated) {
      // Track interaction attempt
      await fetch('/api/analytics/track-gate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_type: 'gate_shown',
          action: 'like',
          share_token: shareToken,
          metadata: {
            current_likes: likes,
            has_liked: hasLiked
          }
        })
      })

      // Trigger auth modal
      triggerAuth('like', {
        shareToken,
        itemId: shareId,
        metadata: {
          currentLikes: likes
        }
      })
      return
    }

    setIsLiking(true)
    try {
      const supabase = createClient()
      const sessionToken = getSessionToken()

      if (hasLiked) {
        // Remove like
        await supabase
          .from('content_reactions')
          .delete()
          .eq('content_id', shareId)
          .eq('content_type', 'share')
          .eq(isAuthenticated ? 'user_id' : 'session_id',
             isAuthenticated ? (await supabase.auth.getUser()).data.user?.id : sessionToken)

        setLikes(prev => Math.max(0, prev - 1))
        setHasLiked(false)
      } else {
        // Add like
        const { data: { user } } = await supabase.auth.getUser()

        await supabase
          .from('content_reactions')
          .insert({
            content_type: 'share',
            content_id: shareId,
            user_id: user?.id,
            session_id: !user ? sessionToken : null,
            reaction_type: 'aplausos'
          })

        setLikes(prev => prev + 1)
        setHasLiked(true)

        // Animate the heart
        const button = document.querySelector('[data-reaction="like"]')
        button?.classList.add('animate-pulse')
        setTimeout(() => {
          button?.classList.remove('animate-pulse')
        }, 600)
      }
    } catch (error) {
      console.error('Error handling like:', error)
    } finally {
      setIsLiking(false)
    }
  }

  const handleSave = async () => {
    if (!isAuthenticated) {
      // Track interaction attempt
      await fetch('/api/analytics/track-gate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_type: 'gate_shown',
          action: 'save',
          share_token: shareToken,
          metadata: {
            current_saves: saves,
            has_saved: hasSaved
          }
        })
      })

      // Trigger auth modal
      triggerAuth('save', {
        shareToken,
        itemId: shareId,
        metadata: {
          currentSaves: saves
        }
      })
      return
    }

    setIsSaving(true)
    try {
      // TODO: Implement save to collection logic
      setHasSaved(!hasSaved)
      setSaves(prev => hasSaved ? Math.max(0, prev - 1) : prev + 1)
    } catch (error) {
      console.error('Error handling save:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleComment = () => {
    if (!isAuthenticated) {
      // Track interaction attempt
      fetch('/api/analytics/track-gate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_type: 'gate_shown',
          action: 'comment',
          share_token: shareToken
        })
      })

      // Trigger auth modal
      triggerAuth('comment', {
        shareToken,
        itemId: shareId
      })
      return
    }

    // TODO: Open comment section or modal
    console.log('Open comments')
  }

  const containerClass = cn(
    'flex items-center',
    orientation === 'vertical' ? 'flex-col space-y-2' : 'flex-row space-x-2',
    className
  )

  const buttonClass = cn(
    'group transition-all duration-300',
    orientation === 'vertical' ? 'w-full' : ''
  )

  return (
    <div className={containerClass}>
      {/* Like Button */}
      <Button
        variant="ghost"
        size={showLabels ? 'default' : 'icon'}
        onClick={handleLike}
        disabled={isLiking}
        data-reaction="like"
        className={cn(
          buttonClass,
          'border border-gray-200 hover:border-[#C4886F] hover:bg-[#C4886F]/10',
          hasLiked && 'bg-[#C4886F]/10 border-[#C4886F]'
        )}
      >
        <Heart
          className={cn(
            'h-4 w-4 transition-all duration-300',
            showLabels && 'mr-2',
            hasLiked ? 'fill-[#C4886F] text-[#C4886F]' : 'text-gray-600 group-hover:text-[#C4886F]'
          )}
        />
        {showLabels && (
          <span className="font-lato text-sm">
            {likes > 0 ? likes.toLocaleString('es-CL') : 'Aplaudir'}
          </span>
        )}
      </Button>

      {/* Comment Button */}
      <Button
        variant="ghost"
        size={showLabels ? 'default' : 'icon'}
        onClick={handleComment}
        className={cn(
          buttonClass,
          'border border-gray-200 hover:border-[#A3B1A1] hover:bg-[#A3B1A1]/10'
        )}
      >
        <MessageSquare
          className={cn(
            'h-4 w-4 text-gray-600 group-hover:text-[#A3B1A1] transition-colors duration-300',
            showLabels && 'mr-2'
          )}
        />
        {showLabels && (
          <span className="font-lato text-sm">
            {initialComments > 0 ? initialComments.toLocaleString('es-CL') : 'Comentar'}
          </span>
        )}
      </Button>

      {/* Save Button */}
      <Button
        variant="ghost"
        size={showLabels ? 'default' : 'icon'}
        onClick={handleSave}
        disabled={isSaving}
        className={cn(
          buttonClass,
          'border border-gray-200 hover:border-[#333333] hover:bg-[#333333]/10',
          hasSaved && 'bg-[#333333]/10 border-[#333333]'
        )}
      >
        <Bookmark
          className={cn(
            'h-4 w-4 transition-all duration-300',
            showLabels && 'mr-2',
            hasSaved ? 'fill-[#333333] text-[#333333]' : 'text-gray-600 group-hover:text-[#333333]'
          )}
        />
        {showLabels && (
          <span className="font-lato text-sm">
            {saves > 0 ? saves.toLocaleString('es-CL') : 'Guardar'}
          </span>
        )}
      </Button>

      {/* Share Button */}
      {onShare && (
        <Button
          variant="ghost"
          size={showLabels ? 'default' : 'icon'}
          onClick={onShare}
          className={cn(
            buttonClass,
            'border border-gray-200 hover:border-[#A3B1A1] hover:bg-[#A3B1A1]/10'
          )}
        >
          <Share2
            className={cn(
              'h-4 w-4 text-gray-600 group-hover:text-[#A3B1A1] transition-colors duration-300',
              showLabels && 'mr-2'
            )}
          />
          {showLabels && <span className="font-lato text-sm">Compartir</span>}
        </Button>
      )}

      {/* Download Button */}
      {onDownload && (
        <Button
          variant="ghost"
          size={showLabels ? 'default' : 'icon'}
          onClick={onDownload}
          className={cn(
            buttonClass,
            'border border-gray-200 hover:border-gray-400 hover:bg-gray-100'
          )}
        >
          <Download
            className={cn(
              'h-4 w-4 text-gray-600 group-hover:text-gray-800 transition-colors duration-300',
              showLabels && 'mr-2'
            )}
          />
          {showLabels && <span className="font-lato text-sm">Descargar</span>}
        </Button>
      )}
    </div>
  )
}