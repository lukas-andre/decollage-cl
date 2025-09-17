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
    const shareResponse = await shareService.createShare(projectId, config as ShareConfig)

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

    if (!token) {
      return NextResponse.json(
        { error: 'Share token is required' },
        { status: 400 }
      )
    }

    const shareData = await shareService.getShareByToken(token)

    return NextResponse.json(shareData)
  } catch (error) {
    console.error('Share fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch share' },
      { status: 500 }
    )
  }
}