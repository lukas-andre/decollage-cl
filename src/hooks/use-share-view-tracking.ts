'use client'

import { useEffect, useRef } from 'react'

interface UseShareViewTrackingProps {
  shareToken: string
  enabled?: boolean
}

export function useShareViewTracking({ shareToken, enabled = true }: UseShareViewTrackingProps) {
  const hasTrackedRef = useRef(false)

  useEffect(() => {
    if (!enabled || !shareToken || hasTrackedRef.current) {
      return
    }

    const trackView = async () => {
      try {
        const response = await fetch('/api/shares/track-view', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            shareToken,
            referrer: document.referrer,
            userAgent: navigator.userAgent,
          }),
        })

        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            hasTrackedRef.current = true

            // Dispatch custom event for components that need to update view counts
            window.dispatchEvent(new CustomEvent('shareViewTracked', {
              detail: {
                shareId: data.shareId,
                currentViews: data.currentViews,
                lastViewedAt: data.lastViewedAt
              }
            }))
          }
        }
      } catch (error) {
        console.error('Failed to track share view:', error)
        // Don't retry on error to prevent spam
        hasTrackedRef.current = true
      }
    }

    // Add a small delay to ensure the page is loaded
    const timeoutId = setTimeout(trackView, 100)

    return () => {
      clearTimeout(timeoutId)
    }
  }, [shareToken, enabled])

  return { hasTracked: hasTrackedRef.current }
}