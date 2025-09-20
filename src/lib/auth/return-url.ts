import { AuthAction } from '@/hooks/use-auth-modal'

export interface ReturnUrlData {
  url: string
  action?: AuthAction
  shareToken?: string
  itemId?: string
  metadata?: Record<string, any>
}

const RETURN_URL_KEY = 'auth_return_url'
const ACTION_DATA_KEY = 'auth_action_data'

/**
 * Store return URL and action data before redirecting to auth
 */
export function setReturnUrl(data: ReturnUrlData): void {
  if (typeof window === 'undefined') return

  try {
    sessionStorage.setItem(RETURN_URL_KEY, data.url)

    if (data.action || data.shareToken || data.itemId || data.metadata) {
      sessionStorage.setItem(ACTION_DATA_KEY, JSON.stringify({
        action: data.action,
        shareToken: data.shareToken,
        itemId: data.itemId,
        metadata: data.metadata,
      }))
    }
  } catch (error) {
    console.error('Failed to store return URL:', error)
  }
}

/**
 * Get stored return URL and action data
 */
export function getReturnUrl(): ReturnUrlData | null {
  if (typeof window === 'undefined') return null

  try {
    const url = sessionStorage.getItem(RETURN_URL_KEY)
    const actionDataStr = sessionStorage.getItem(ACTION_DATA_KEY)

    if (!url) return null

    let actionData = {}
    if (actionDataStr) {
      try {
        actionData = JSON.parse(actionDataStr)
      } catch {
        // Invalid JSON, ignore
      }
    }

    return {
      url,
      ...actionData
    }
  } catch (error) {
    console.error('Failed to get return URL:', error)
    return null
  }
}

/**
 * Clear stored return URL and action data
 */
export function clearReturnUrl(): void {
  if (typeof window === 'undefined') return

  try {
    sessionStorage.removeItem(RETURN_URL_KEY)
    sessionStorage.removeItem(ACTION_DATA_KEY)
  } catch (error) {
    console.error('Failed to clear return URL:', error)
  }
}

/**
 * Execute the intended action after successful authentication
 */
export async function executePostAuthAction(
  action?: AuthAction,
  data?: Record<string, any>
): Promise<boolean> {
  if (!action) return false

  try {
    switch (action) {
      case 'like':
        return await executeLikeAction(data)

      case 'download':
        return await executeDownloadAction(data)

      case 'save':
        return await executeSaveAction(data)

      case 'share':
        return await executeShareAction(data)

      case 'create-design':
        // Navigate to creation flow
        window.location.href = '/dashboard/projects/new'
        return true

      case 'view-gallery':
        // Navigate to gallery
        window.location.href = '/gallery'
        return true

      default:
        return false
    }
  } catch (error) {
    console.error('Failed to execute post-auth action:', error)
    return false
  }
}

/**
 * Execute like action
 */
async function executeLikeAction(data?: Record<string, any>): Promise<boolean> {
  if (!data?.shareToken && !data?.itemId) return false

  try {
    const response = await fetch('/api/shares/like', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        shareToken: data.shareToken,
        itemId: data.itemId,
      }),
    })

    if (response.ok) {
      // Show success toast or update UI
      showActionSuccess('¡Guardado en tus favoritos!')
      return true
    }
  } catch (error) {
    console.error('Like action failed:', error)
  }

  return false
}

/**
 * Execute download action
 */
async function executeDownloadAction(data?: Record<string, any>): Promise<boolean> {
  if (!data?.imageUrl) return false

  try {
    // Create download link
    const link = document.createElement('a')
    link.href = data.imageUrl
    link.download = `decollage-${data.title || 'design'}.jpg`
    link.click()

    // Track download
    await fetch('/api/analytics/track-gate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event_type: 'action_completed',
        action: 'download',
        metadata: {
          imageUrl: data.imageUrl,
          title: data.title,
        },
      }),
    })

    showActionSuccess('¡Imagen descargada exitosamente!')
    return true
  } catch (error) {
    console.error('Download action failed:', error)
  }

  return false
}

/**
 * Execute save action
 */
async function executeSaveAction(data?: Record<string, any>): Promise<boolean> {
  if (!data?.shareToken && !data?.itemId) return false

  try {
    const response = await fetch('/api/shares/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        shareToken: data.shareToken,
        itemId: data.itemId,
      }),
    })

    if (response.ok) {
      showActionSuccess('¡Guardado en tu biblioteca!')
      return true
    }
  } catch (error) {
    console.error('Save action failed:', error)
  }

  return false
}

/**
 * Execute share action
 */
async function executeShareAction(data?: Record<string, any>): Promise<boolean> {
  try {
    const shareUrl = data?.shareUrl || window.location.href
    const message = data?.message || `¡Mira esta transformación increíble! ${shareUrl}`

    // Open WhatsApp share
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')

    // Track share
    await fetch('/api/analytics/track-gate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event_type: 'action_completed',
        action: 'share',
        metadata: {
          shareUrl,
          platform: 'whatsapp',
        },
      }),
    })

    showActionSuccess('¡Compartido exitosamente!')
    return true
  } catch (error) {
    console.error('Share action failed:', error)
  }

  return false
}

/**
 * Show success message to user
 */
function showActionSuccess(message: string): void {
  // Could integrate with toast library like sonner
  if (typeof window !== 'undefined') {
    // For now, show a simple alert
    // In production, you'd want to use a proper toast notification
    const event = new CustomEvent('showToast', {
      detail: { message, type: 'success' }
    })
    window.dispatchEvent(event)
  }
}

/**
 * Build return URL with action parameters
 */
export function buildReturnUrl(
  baseUrl: string,
  action?: AuthAction,
  params?: Record<string, string>
): string {
  const url = new URL(baseUrl)

  if (action) {
    url.searchParams.set('action', action)
  }

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value)
    })
  }

  return url.toString()
}