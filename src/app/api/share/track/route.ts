import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/types/database.types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { shareToken, eventType, eventData } = body

    if (!shareToken || !eventType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Get or create viewer session
    const { cookies: getCookies } = await import('next/headers')
    const cookieStore = await getCookies()
    let sessionId = cookieStore.get('viewer_session_id')?.value
    
    if (!sessionId) {
      sessionId = crypto.randomUUID()
      // Note: Setting cookies in route handlers requires middleware or client-side
      // For now, we'll just use the generated ID
    }

    // Get share ID from token
    const { data: share } = await supabase
      .from('project_shares')
      .select('id')
      .eq('share_token', shareToken)
      .single()

    if (!share) {
      return NextResponse.json(
        { error: 'Share not found' },
        { status: 404 }
      )
    }

    // Track the engagement event
    const { error: eventError } = await supabase
      .from('share_engagement_events')
      .insert({
        share_id: share.id,
        session_id: sessionId,
        event_type: eventType,
        event_data: eventData || {}
      })

    if (eventError) {
      console.error('Error tracking engagement:', eventError)
      return NextResponse.json(
        { error: 'Failed to track engagement' },
        { status: 500 }
      )
    }

    // Update engagement metrics on the share
    if (eventType === 'slider_interaction' || eventType === 'reshare') {
      const { data: currentShare } = await supabase
        .from('project_shares')
        .select('engagement_count')
        .eq('id', share.id)
        .single()

      const { error: updateError } = await supabase
        .from('project_shares')
        .update({
          engagement_count: (currentShare?.engagement_count || 0) + 1
        })
        .eq('id', share.id)

      if (updateError) {
        console.error('Error updating engagement count:', updateError)
      }
    }

    // Check if this is a conversion event
    if (eventType === 'signup_click' || eventType === 'trial_start') {
      // Create conversion record
      const { error: conversionError } = await supabase
        .from('share_conversions')
        .insert({
          share_id: share.id,
          viewer_session_id: sessionId,
          conversion_type: eventType === 'signup_click' ? 'signup' : 'trial',
          conversion_data: eventData || {}
        })

      if (!conversionError) {
        // Update conversion count on the share
        const { data: shareData } = await supabase
          .from('project_shares')
          .select('conversion_count')
          .eq('id', share.id)
          .single()

        await supabase
          .from('project_shares')
          .update({
            conversion_count: (shareData?.conversion_count || 0) + 1
          })
          .eq('id', share.id)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in share tracking:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}