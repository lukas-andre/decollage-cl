import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      event_type,
      action,
      share_token,
      page_url,
      user_agent,
      referrer,
      metadata
    } = body

    if (!event_type) {
      return NextResponse.json(
        { error: 'event_type es requerido' },
        { status: 400 }
      )
    }

    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          },
        },
      }
    )

    // Get current user if authenticated
    const { data: { user } } = await supabase.auth.getUser()

    // Get IP for anonymous tracking
    const ip = request.headers.get('x-forwarded-for') ||
               request.headers.get('x-real-ip') ||
               'unknown'

    // Generate session ID for anonymous users
    const sessionId = user?.id || `anon_${ip}_${Date.now()}`

    // Create tracking event
    const eventData = {
      session_id: sessionId,
      user_id: user?.id || null,
      event_type,
      action: action || null,
      share_token: share_token || null,
      page_url: page_url || request.headers.get('referer'),
      user_agent: user_agent || request.headers.get('user-agent'),
      referrer: referrer || request.headers.get('referer'),
      ip_address: ip,
      metadata: metadata || {},
      created_at: new Date().toISOString()
    }

    // For now, we'll log to console and could later save to a tracking table
    console.log('Conversion Gate Event:', eventData)

    // If we have a conversion_events table, save the event
    // For MVP, we'll track in console and potentially use external analytics

    // You could also send to external analytics services here:
    // - Google Analytics
    // - Mixpanel
    // - PostHog
    // - Custom analytics service

    // Track specific gate events
    if (event_type === 'gate_shown') {
      // Track when login gate is displayed
      console.log(`Login gate shown for action: ${action}`)
    } else if (event_type === 'gate_clicked') {
      // Track when user clicks through gate
      console.log(`Login gate clicked for action: ${action}`)
    } else if (event_type === 'auth_started') {
      // Track when user starts auth process
      console.log(`Auth started for action: ${action}`)
    } else if (event_type === 'auth_completed') {
      // Track when user completes auth
      console.log(`Auth completed for action: ${action}`)
    } else if (event_type === 'action_completed') {
      // Track when user completes the intended action post-auth
      console.log(`Action completed: ${action}`)
    }

    return NextResponse.json({
      success: true,
      session_id: sessionId,
      tracked_at: new Date().toISOString()
    })

  } catch (error) {
    console.error('Gate tracking error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

