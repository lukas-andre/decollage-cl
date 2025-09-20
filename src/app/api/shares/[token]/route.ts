import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { shareService } from '@/lib/services/share.service'
import type { ShareConfig } from '@/types/sharing'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get share details for the authenticated user
    const { data: share, error } = await supabase
      .from('project_shares')
      .select(`
        *,
        projects (
          name,
          cover_image_url,
          description
        )
      `)
      .eq('share_token', token)
      .eq('created_by', user.id)
      .single()

    if (error || !share) {
      return NextResponse.json(
        { error: 'Share not found or access denied' },
        { status: 404 }
      )
    }

    return NextResponse.json(share)
  } catch (error) {
    console.error('Get share error:', error)
    return NextResponse.json(
      { error: 'Failed to get share' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const updates = await request.json()

    // Use the existing shareService method
    await shareService.updateShare(token, updates as Partial<ShareConfig>)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Update share error:', error)
    return NextResponse.json(
      { error: 'Failed to update share' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Use the existing shareService method
    await shareService.deleteShare(token)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete share error:', error)
    return NextResponse.json(
      { error: 'Failed to delete share' },
      { status: 500 }
    )
  }
}