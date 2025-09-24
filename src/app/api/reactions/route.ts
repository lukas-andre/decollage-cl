import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/types/database.types'
import { getServiceClient, buildBreakdown } from './helpers'

const TABLE_NAME = 'content_reactions'

type ContentReaction = Database['public']['Tables']['content_reactions']['Row']

type ReactionAction = 'add' | 'remove'

type ReactionPayload = {
  action: ReactionAction
  contentType: string
  contentId: string
  reactionType?: string
  sessionId?: string
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const contentType = searchParams.get('contentType')
    const contentId = searchParams.get('contentId')
    const sessionId = searchParams.get('sessionId') || undefined

    if (!contentType || !contentId) {
      return NextResponse.json(
        { error: 'contentType and contentId are required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const serviceClient = getServiceClient()
    const query = serviceClient
      .from(TABLE_NAME)
      .select('*')
      .eq('content_type', contentType)
      .eq('content_id', contentId)
      .eq('reaction_type', 'aplausos')
      .limit(1)

    if (user?.id) {
      query.eq('user_id', user.id)
    } else if (sessionId) {
      query.eq('session_id', sessionId)
    } else {
      return NextResponse.json({ reaction: null })
    }

    const { data, error } = await query.maybeSingle<ContentReaction>()

    if (error) {
      console.error('[reactions][GET] Failed to fetch reaction', error)
      return NextResponse.json(
        { error: 'Failed to fetch reaction' },
        { status: 500 }
      )
    }

    return NextResponse.json({ reaction: data })
  } catch (error) {
    console.error('[reactions][GET] Unexpected error', error)
    return NextResponse.json(
      { error: 'Unexpected error fetching reactions' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ReactionPayload
    const {
      action,
      contentType,
      contentId,
      reactionType = 'aplausos',
      sessionId
    } = body

    if (!action || !contentType || !contentId) {
      return NextResponse.json(
        { error: 'action, contentType, and contentId are required' },
        { status: 400 }
      )
    }

    if (!['add', 'remove'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user && !sessionId) {
      return NextResponse.json(
        { error: 'sessionId is required for anonymous reactions' },
        { status: 400 }
      )
    }

    const identifier = {
      userId: user?.id,
      sessionId: user ? null : sessionId
    }

    const serviceClient = getServiceClient()

    const baseFilter = serviceClient
      .from(TABLE_NAME)
      .select('*')
      .eq('content_type', contentType)
      .eq('content_id', contentId)
      .eq('reaction_type', reactionType)
      .limit(1)

    if (identifier.userId) {
      baseFilter.eq('user_id', identifier.userId)
    } else if (identifier.sessionId) {
      baseFilter.eq('session_id', identifier.sessionId)
    }

    const { data: existingReaction, error: fetchError } = await baseFilter.maybeSingle<ContentReaction>()

    if (fetchError) {
      console.error('[reactions][POST] Failed to fetch existing reaction', fetchError)
      return NextResponse.json(
        { error: 'Failed to process reaction' },
        { status: 500 }
      )
    }

    if (action === 'add') {
      if (existingReaction) {
        // Reaction already exists; treat as success to keep client state in sync
      } else {
        const insertPayload: Database['public']['Tables']['content_reactions']['Insert'] = {
          content_type: contentType,
          content_id: contentId,
          reaction_type: reactionType,
          user_id: identifier.userId || null,
          session_id: identifier.sessionId || null
        }

        const { error: insertError } = await serviceClient
          .from(TABLE_NAME)
          .insert(insertPayload)

        if (insertError) {
          console.error('[reactions][POST] Failed to insert reaction', insertError)
          return NextResponse.json(
            { error: 'Failed to add reaction' },
            { status: 500 }
          )
        }
      }
    } else if (action === 'remove') {
      const deleteQuery = serviceClient
        .from(TABLE_NAME)
        .delete()
        .eq('content_type', contentType)
        .eq('content_id', contentId)
        .eq('reaction_type', reactionType)

      if (identifier.userId) {
        deleteQuery.eq('user_id', identifier.userId)
      } else if (identifier.sessionId) {
        deleteQuery.eq('session_id', identifier.sessionId)
      }

      const { error: deleteError } = await deleteQuery
      if (deleteError) {
        console.error('[reactions][POST] Failed to remove reaction', deleteError)
        return NextResponse.json(
          { error: 'Failed to remove reaction' },
          { status: 500 }
        )
      }
    }

    const { data: countsData, error: countsError } = await serviceClient
      .rpc('get_reaction_counts', {
        p_content_type: contentType,
        p_content_id: contentId
      })

    if (countsError) {
      console.error('[reactions][POST] Failed to fetch counts', countsError)
      return NextResponse.json(
        { error: 'Failed to fetch updated counts' },
        { status: 500 }
      )
    }

    const breakdown = Array.isArray(countsData)
      ? buildBreakdown(countsData as Array<{ reaction_type: string | null; reaction_count: number | null }>)
      : {}

    const total = Object.values(breakdown).reduce((sum, value) => sum + value, 0)

    return NextResponse.json({
      success: true,
      breakdown,
      counts: {
        aplausos: breakdown.aplausos || 0,
        total
      }
    })
  } catch (error) {
    console.error('[reactions][POST] Unexpected error', error)
    return NextResponse.json(
      { error: 'Unexpected error processing reaction' },
      { status: 500 }
    )
  }
}
