import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { shareService } from '@/lib/services/share.service'
import { shareAnalyticsService } from '@/lib/services/share-analytics.service'
import type { ShareConfig } from '@/types/sharing'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { projectId, config } = await request.json()

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      )
    }

    // Create the share
    const shareResponse = await shareService.createShare(projectId, config as ShareConfig, supabase)

    // Track the share creation
    await shareAnalyticsService.trackShareCreation(projectId, 'project', 'web')

    return NextResponse.json(shareResponse)
  } catch (error) {
    console.error('Share creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create share' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    // If token is provided, get specific share (public view)
    if (token) {
      const shareData = await shareService.getShareByToken(token)
      return NextResponse.json(shareData)
    }

    // Otherwise, get user's shares (dashboard view)
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Parse query parameters for filtering
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const projectId = searchParams.get('project_id')
    const visibility = searchParams.get('visibility')
    const sortBy = searchParams.get('sort_by') || 'created_at'
    const sortOrder = searchParams.get('sort_order') || 'desc'

    // Build query
    let query = supabase
      .from('project_shares')
      .select(`
        *,
        projects (
          name,
          cover_image_url
        )
      `)
      .eq('created_by', user.id)

    // Apply filters
    if (projectId) {
      query = query.eq('project_id', projectId)
    }
    if (visibility) {
      query = query.eq('visibility', visibility)
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' })

    // Apply pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    const { data: shares, error, count } = await query

    if (error) {
      throw new Error(`Failed to fetch shares: ${error.message}`)
    }

    return NextResponse.json({
      shares: shares || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })
  } catch (error) {
    console.error('Share fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch shares' },
      { status: 500 }
    )
  }
}