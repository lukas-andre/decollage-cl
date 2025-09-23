import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionToken, userId } = body

    if (!sessionToken || !userId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Convert anonymous reactions to user reactions
    const { data: anonymousReactions, error: fetchError } = await supabase
      .from('content_reactions')
      .select('*')
      .eq('session_id', sessionToken)
      .is('user_id', null)

    if (fetchError) {
      console.error('Error fetching anonymous reactions:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch anonymous reactions' },
        { status: 500 }
      )
    }

    if (anonymousReactions && anonymousReactions.length > 0) {
      // Update each reaction to link to the user
      for (const reaction of anonymousReactions) {
        // Check if user already has this reaction
        const { data: existingReaction } = await supabase
          .from('content_reactions')
          .select('id')
          .eq('content_id', reaction.content_id)
          .eq('content_type', reaction.content_type)
          .eq('user_id', userId)
          .single()

        if (!existingReaction) {
          // Update the anonymous reaction to user reaction
          await supabase
            .from('content_reactions')
            .update({
              user_id: userId,
              session_id: null
            })
            .eq('id', reaction.id)
        } else {
          // User already has this reaction, delete the anonymous one
          await supabase
            .from('content_reactions')
            .delete()
            .eq('id', reaction.id)
        }
      }
    }

    // Update viewer_sessions to mark conversion
    await supabase
      .from('viewer_sessions')
      .update({
        converted_to_user_id: userId,
        converted_at: new Date().toISOString()
      })
      .eq('session_token', sessionToken)

    // Track conversion in analytics
    await supabase
      .from('analytics_events')
      .insert({
        event_type: 'session_converted',
        user_id: userId,
        session_id: sessionToken,
        metadata: {
          reactions_converted: anonymousReactions?.length || 0,
          timestamp: new Date().toISOString()
        }
      })

    return NextResponse.json({
      success: true,
      converted_reactions: anonymousReactions?.length || 0
    })

  } catch (error) {
    console.error('Session conversion error:', error)
    return NextResponse.json(
      { error: 'Failed to convert session' },
      { status: 500 }
    )
  }
}