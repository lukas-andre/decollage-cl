// Helper function to track conversion events from client
export async function trackGateEvent(
  event_type: 'gate_shown' | 'gate_clicked' | 'auth_started' | 'auth_completed' | 'action_completed',
  action?: string,
  metadata?: Record<string, any>
) {
  try {
    await fetch('/api/analytics/track-gate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event_type,
        action,
        page_url: window.location.href,
        user_agent: navigator.userAgent,
        referrer: document.referrer,
        metadata: {
          timestamp: new Date().toISOString(),
          ...metadata
        }
      })
    })
  } catch (error) {
    console.error('Failed to track gate event:', error)
  }
}