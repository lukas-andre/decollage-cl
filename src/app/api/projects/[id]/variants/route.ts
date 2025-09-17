import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get variant IDs from query params
    const { searchParams } = new URL(request.url)
    const idsParam = searchParams.get('ids')

    if (!idsParam) {
      return NextResponse.json({ error: 'Missing ids parameter' }, { status: 400 })
    }

    const variantIds = idsParam.split(',').filter(id => id.trim())

    if (variantIds.length === 0) {
      return NextResponse.json({ variants: [] })
    }

    // Verify project ownership
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, user_id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (projectError || !project) {
      return NextResponse.json(
        { error: 'Project not found or access denied' },
        { status: 404 }
      )
    }

    // Fetch variants with style information
    const { data: variants, error: variantsError } = await supabase
      .from('transformations')
      .select(`
        id,
        result_image_url,
        is_favorite,
        created_at,
        tokens_consumed,
        status,
        style:design_styles!transformations_style_id_fkey (
          id,
          name,
          code
        ),
        color_palette:color_palettes!transformations_palette_id_fkey (
          id,
          name,
          code
        ),
        metadata
      `)
      .in('id', variantIds)
      .eq('user_id', user.id)

    if (variantsError) {
      console.error('Error fetching variants:', variantsError)
      return NextResponse.json(
        { error: 'Error fetching variants' },
        { status: 500 }
      )
    }

    return NextResponse.json({ variants: variants || [] })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}