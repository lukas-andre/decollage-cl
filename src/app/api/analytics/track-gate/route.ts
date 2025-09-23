import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      event_type,
      action,
      share_token,
      email,
      metadata
    } = body

    // Get anonymous session from headers or create one
    const anonymousSession = request.headers.get('x-anonymous-session') ||
      `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Track the gate event
    const { error } = await supabase
      .from('analytics_events')
      .insert({
        event_type: `auth_gate_${event_type}`,
        event_action: action,
        user_id: user?.id,
        session_id: anonymousSession,
        metadata: {
          share_token,
          email,
          ...metadata,
          timestamp: new Date().toISOString(),
          referrer: request.headers.get('referer'),
          user_agent: request.headers.get('user-agent')
        }
      })

    if (error) {
      console.error('Error tracking gate event:', error)
      // Don't fail the request if analytics fails
    }

    // If this is a magic link sent event, also track conversion funnel
    if (event_type === 'magic_link_sent' && email) {
      await supabase
        .from('auth_conversion_funnel')
        .insert({
          email,
          action_type: action,
          share_token,
          session_id: anonymousSession,
          status: 'email_sent',
          metadata
        })
    }

    return NextResponse.json({
      success: true,
      session_id: anonymousSession
    })

  } catch (error) {
    console.error('Track gate error:', error)
    return NextResponse.json(
      { error: 'Failed to track event' },
      { status: 500 }
    )
  }
}