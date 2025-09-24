import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient, buildBreakdown } from '../helpers'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const contentType = searchParams.get('contentType')
    const contentId = searchParams.get('contentId')

    if (!contentType || !contentId) {
      return NextResponse.json(
        { error: 'contentType and contentId are required' },
        { status: 400 }
      )
    }

    const serviceClient = getServiceClient()

    const { data, error } = await serviceClient.rpc('get_reaction_counts', {
      p_content_type: contentType,
      p_content_id: contentId
    })

    if (error) {
      console.error('[reactions][count][GET] Failed to fetch counts', error)
      return NextResponse.json(
        { error: 'Failed to fetch reaction counts' },
        { status: 500 }
      )
    }

    const breakdown = Array.isArray(data)
      ? buildBreakdown(data as Array<{ reaction_type: string | null; reaction_count: number | null }>)
      : {}

    const total = Object.values(breakdown).reduce((sum, value) => sum + value, 0)

    return NextResponse.json({
      counts: {
        aplausos: breakdown.aplausos || 0,
        total
      },
      breakdown
    })
  } catch (error) {
    console.error('[reactions][count][GET] Unexpected error', error)
    return NextResponse.json(
      { error: 'Unexpected error fetching reaction counts' },
      { status: 500 }
    )
  }
}
