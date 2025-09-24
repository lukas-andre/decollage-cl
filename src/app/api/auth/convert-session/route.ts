import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/service-role'

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
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user || user.id !== userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const serviceClient = createServiceRoleClient()

    const { data: anonymousReactions, error: fetchError } = await serviceClient
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

    let convertedCount = 0

    if (anonymousReactions && anonymousReactions.length > 0) {
      for (const reaction of anonymousReactions) {
        const { data: existingReaction, error: existingError } = await serviceClient
          .from('content_reactions')
          .select('id')
          .eq('content_id', reaction.content_id)
          .eq('content_type', reaction.content_type)
          .eq('reaction_type', reaction.reaction_type!)
          .eq('user_id', userId)
          .maybeSingle()

        if (existingError) {
          console.error('Error checking existing reaction:', existingError)
          continue
        }

        if (!existingReaction) {
          const { error: updateError } = await serviceClient
            .from('content_reactions')
            .update({
              user_id: userId,
              session_id: null
            })
            .eq('id', reaction.id)

          if (updateError) {
            console.error('Error updating reaction to user:', updateError)
          } else {
            convertedCount += 1
          }
        } else {
          const { error: deleteError } = await serviceClient
            .from('content_reactions')
            .delete()
            .eq('id', reaction.id)

          if (deleteError) {
            console.error('Error deleting duplicate reaction:', deleteError)
          }
        }
      }
    }

    const conversionTimestamp = new Date().toISOString()

    const { error: viewerSessionError } = await serviceClient
      .from('viewer_sessions')
      .update({
        converted_to_user_id: userId,
        converted_at: conversionTimestamp
      })
      .eq('session_token', sessionToken)

    if (viewerSessionError) {
      console.error('Error updating viewer session conversion:', viewerSessionError)
    }

    // Track conversion analytics
    const { error: analyticsError } = await serviceClient
      .from('analytics_events')
      .insert({
        event_type: 'session_converted',
        user_id: userId,
        session_id: sessionToken,
        metadata: {
          reactions_converted: convertedCount,
          timestamp: conversionTimestamp
        }
      })

    if (analyticsError) {
      console.error('Error tracking conversion analytics:', analyticsError)
    }

    return NextResponse.json({
      success: true,
      converted_reactions: convertedCount
    })

  } catch (error) {
    console.error('Session conversion error:', error)
    return NextResponse.json(
      { error: 'Failed to convert session' },
      { status: 500 }
    )
  }
}
