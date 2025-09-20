import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { shareAnalyticsService } from '@/lib/services/share-analytics.service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { shareToken, referrer, userAgent } = body

    if (!shareToken) {
      return NextResponse.json(
        { error: 'Share token is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Use the database function to safely increment view count
    const { data: viewResult, error: viewError } = await supabase
      .rpc('increment_share_view_count', {
        share_token_param: shareToken
      })

    if (viewError) {
      console.error('Error incrementing view count:', viewError)
      return NextResponse.json(
        { error: 'Failed to track view' },
        { status: 500 }
      )
    }

    if (!viewResult.success) {
      return NextResponse.json(
        { error: viewResult.error },
        { status: 400 }
      )
    }

    // Track analytics in parallel (don't block on this)
    const analyticsPromise = (async () => {
      try {
        // Create a client-side supabase instance for analytics
        const { createClient: createClientSide } = await import('@/lib/supabase/client')
        const analyticsSupabase = createClientSide()

        // Get browser and device info from user agent
        const deviceInfo = parseUserAgent(userAgent)

        // Insert analytics record
        await analyticsSupabase
          .from('share_analytics')
          .insert({
            share_type: 'project',
            share_id: viewResult.share_id,
            user_id: null, // Anonymous view
            platform: 'web',
            action: 'viewed',
            referrer: referrer || '',
            user_agent: userAgent || '',
            device_type: deviceInfo.deviceType,
            browser: deviceInfo.browser,
            os: deviceInfo.os,
            country_code: null,
            ip_address: null
          })
      } catch (error) {
        console.error('Analytics tracking failed (non-blocking):', error)
        // Don't throw - analytics failures shouldn't break view counting
      }
    })()

    // Don't await analytics to keep response fast
    analyticsPromise.catch(() => {}) // Prevent unhandled promise rejection

    return NextResponse.json({
      success: true,
      shareId: viewResult.share_id,
      currentViews: viewResult.current_views,
      lastViewedAt: viewResult.last_viewed_at
    })

  } catch (error) {
    console.error('View tracking error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper function to parse user agent
function parseUserAgent(userAgent: string = ''): {
  deviceType: string
  browser: string
  os: string
} {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)
  const isTablet = /iPad|Android(?=.*tablet)/i.test(userAgent)

  let deviceType = 'desktop'
  if (isTablet) deviceType = 'tablet'
  else if (isMobile) deviceType = 'mobile'

  let browser = 'unknown'
  if (userAgent.includes('Chrome')) browser = 'chrome'
  else if (userAgent.includes('Firefox')) browser = 'firefox'
  else if (userAgent.includes('Safari')) browser = 'safari'
  else if (userAgent.includes('Edge')) browser = 'edge'

  let os = 'unknown'
  if (userAgent.includes('Windows')) os = 'windows'
  else if (userAgent.includes('Mac')) os = 'macos'
  else if (userAgent.includes('Linux')) os = 'linux'
  else if (userAgent.includes('Android')) os = 'android'
  else if (userAgent.includes('iOS')) os = 'ios'

  return { deviceType, browser, os }
}