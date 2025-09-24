'use client'

import {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback
} from 'react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { triggerAuth } from '@/hooks/use-auth-modal'
import { cn } from '@/lib/utils'
import {
  Heart,
  MessageSquare,
  Bookmark,
  Share2,
  Download
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

const CONTENT_TYPE = 'share'

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
  const supabase = useMemo(() => createClient(), [])
  const [likes, setLikes] = useState(initialLikes)
  const [hasLiked, setHasLiked] = useState(!!userReaction)
  const [isLiking, setIsLiking] = useState(false)
  const [isLoadingReactions, setIsLoadingReactions] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [authState, setAuthState] = useState(isAuthenticated)
  const [userId, setUserId] = useState<string | null>(null)
  const [saves, setSaves] = useState(initialSaves)
  const [hasSaved, setHasSaved] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const sessionTokenRef = useRef<string | null>(null)
  const refreshTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const getSessionToken = useCallback(() => {
    if (typeof window === 'undefined') return null

    if (!sessionTokenRef.current) {
      let token = localStorage.getItem('anonymousSession')
      if (!token) {
        token = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        localStorage.setItem('anonymousSession', token)
      }
      sessionTokenRef.current = token
    }

    return sessionTokenRef.current
  }, [])

  const fetchReactionCounts = useCallback(async () => {
    try {
      const response = await fetch(`/api/reactions/count?contentType=${CONTENT_TYPE}&contentId=${shareId}`, {
        cache: 'no-store'
      })

      if (!response.ok) {
        throw new Error('Failed to fetch reaction counts')
      }

      const data = await response.json()
      setLikes(data?.counts?.aplausos ?? 0)
    } catch (error) {
      console.error('Error fetching reaction counts:', error)
    }
  }, [shareId])

  const fetchUserReaction = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        contentType: CONTENT_TYPE,
        contentId: shareId
      })

      const sessionToken = getSessionToken()
      if (sessionToken) {
        params.set('sessionId', sessionToken)
      }

      const response = await fetch(`/api/reactions?${params.toString()}`, {
        cache: 'no-store'
      })

      if (!response.ok) {
        throw new Error('Failed to fetch user reaction')
      }

      const data = await response.json()
      setHasLiked(!!data?.reaction && data.reaction.reaction_type === 'aplausos')
    } catch (error) {
      console.error('Error fetching user reaction:', error)
    }
  }, [shareId, getSessionToken])

  const scheduleCountsRefresh = useCallback(() => {
    if (refreshTimeoutRef.current) return

    refreshTimeoutRef.current = setTimeout(async () => {
      refreshTimeoutRef.current = null
      await fetchReactionCounts()
    }, 250)
  }, [fetchReactionCounts])

  useEffect(() => {
    let isMounted = true

    const initialize = async () => {
      setIsLoadingReactions(true)
      setErrorMessage(null)
      getSessionToken()

      try {
        await Promise.all([fetchUserReaction(), fetchReactionCounts()])
      } catch (error) {
        console.error('Error loading reaction state:', error)
        if (isMounted) {
          setErrorMessage('No pudimos cargar los aplausos. Intenta nuevamente.')
        }
      } finally {
        if (isMounted) {
          setIsLoadingReactions(false)
        }
      }
    }

    initialize()

    return () => {
      isMounted = false
    }
  }, [fetchReactionCounts, fetchUserReaction, getSessionToken])

  useEffect(() => {
    let isActive = true

    const syncAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!isActive) return

      setAuthState(!!user)
      setUserId(user?.id ?? null)
    }

    syncAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null
      setAuthState(!!currentUser)
      setUserId(currentUser?.id ?? null)
      fetchUserReaction()
      fetchReactionCounts()
    })

    return () => {
      isActive = false
      subscription.unsubscribe()
    }
  }, [supabase, fetchReactionCounts, fetchUserReaction])

  useEffect(() => {
    const sessionToken = getSessionToken()

    const channel = supabase
      .channel(`reactions:${CONTENT_TYPE}:${shareId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'content_reactions',
        filter: `content_type=eq.${CONTENT_TYPE}`
      }, payload => {
        const newRecord = payload.new as {
          content_type?: string
          content_id?: string
          reaction_type?: string | null
          user_id?: string | null
          session_id?: string | null
        } | null

        const oldRecord = payload.old as {
          content_type?: string
          content_id?: string
          reaction_type?: string | null
          user_id?: string | null
          session_id?: string | null
        } | null

        const relevant = newRecord || oldRecord

        if (!relevant) return
        if (relevant.content_type !== CONTENT_TYPE) return
        if (relevant.content_id !== shareId) return
        if (relevant.reaction_type !== 'aplausos') return

        const eventType = payload.eventType.toUpperCase()

        const matchesCurrentActor = Boolean(
          (userId && (newRecord?.user_id === userId || oldRecord?.user_id === userId)) ||
          (sessionToken && (newRecord?.session_id === sessionToken || oldRecord?.session_id === sessionToken))
        )

        if (matchesCurrentActor) {
          if (eventType === 'INSERT') {
            setHasLiked(true)
          }
          if (eventType === 'DELETE') {
            setHasLiked(false)
          }
        }

        scheduleCountsRefresh()
      })
      .subscribe()

    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current)
        refreshTimeoutRef.current = null
      }
      supabase.removeChannel(channel)
    }
  }, [supabase, shareId, scheduleCountsRefresh, getSessionToken, userId])

  const handleLike = async () => {
    // Allow anonymous reactions with session token
    const sessionToken = getSessionToken()
    const canReact = authState || sessionToken

    if (!canReact) {
      try {
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
      } catch (error) {
        console.error('Error tracking gate event:', error)
      }

      triggerAuth('like', {
        shareToken,
        itemId: shareId,
        metadata: {
          currentLikes: likes
        }
      })
      return
    }

    // Prevent multiple simultaneous clicks
    if (isLiking || isLoadingReactions) {
      console.log('Reaction in progress, skipping click')
      return
    }

    setIsLiking(true)
    setErrorMessage(null)

    const previousState = {
      likes,
      hasLiked
    }

    // Determine the action based on current state
    const nextAction = hasLiked ? 'remove' : 'add'

    // Optimistic UI update
    setHasLiked(!hasLiked)
    setLikes(prev => Math.max(0, prev + (nextAction === 'add' ? 1 : -1)))

    try {
      const response = await fetch('/api/reactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: nextAction,
          contentType: CONTENT_TYPE,
          contentId: shareId,
          reactionType: 'aplausos',
          sessionId: sessionToken
        })
      })

      const payload = await response.json()

      if (!response.ok) {
        throw new Error(payload?.error || 'Failed to update reaction')
      }

      // Update counts from server response
      if (payload?.counts) {
        setLikes(payload.counts.aplausos ?? previousState.likes)
      }

      // Visual feedback for successful like
      if (nextAction === 'add') {
        const button = document.querySelector('[data-reaction="like"]')
        button?.classList.add('animate-pulse')
        setTimeout(() => {
          button?.classList.remove('animate-pulse')
        }, 600)
      }

      // Fetch fresh state to ensure synchronization
      await fetchUserReaction()
    } catch (error) {
      console.error('Error handling like:', error)
      setErrorMessage('No pudimos actualizar tu aplauso. Intenta nuevamente.')

      // Revert optimistic updates
      setLikes(previousState.likes)
      setHasLiked(previousState.hasLiked)

      // Refresh state from server
      await Promise.all([
        fetchReactionCounts(),
        fetchUserReaction()
      ])
    } finally {
      // Add a small delay before allowing next click to prevent rapid clicking
      setTimeout(() => {
        setIsLiking(false)
      }, 300)
    }
  }

  const handleSave = async () => {
    if (!authState) {
      try {
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
      } catch (error) {
        console.error('Error tracking gate event:', error)
      }

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
    if (!authState) {
      fetch('/api/analytics/track-gate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_type: 'gate_shown',
          action: 'comment',
          share_token: shareToken
        })
      }).catch(error => console.error('Error tracking gate event:', error))

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
        disabled={isLiking || isLoadingReactions}
        data-reaction="like"
        className={cn(
          buttonClass,
          'border border-gray-200 hover:border-[#C4886F] hover:bg-[#C4886F]/10',
          hasLiked && 'bg-[#C4886F]/10 border-[#C4886F]'
        )}
        aria-busy={isLiking || isLoadingReactions}
        aria-pressed={hasLiked}
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
            {likes > 0 ? likes.toLocaleString('es-CL') : (isLoadingReactions ? 'Cargando…' : 'Aplaudir')}
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

      {errorMessage && (
        <span className="sr-only">{errorMessage}</span>
      )}
    </div>
  )
}
