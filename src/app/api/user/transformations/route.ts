import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const cookieStore = await cookies()
  const { searchParams } = new URL(request.url)
  const projectId = searchParams.get('projectId')
  const status = searchParams.get('status') || 'all'
  const limit = parseInt(searchParams.get('limit') || '50')
  const offset = parseInt(searchParams.get('offset') || '0')

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        },
      },
    }
  )

  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    // Build query for user's transformations
    let query = supabase
      .from('transformations')
      .select(`
        *,
        project:projects(id, name),
        base_image:images!transformations_base_image_id_fkey(id, url, thumbnail_url, name),
        design_styles!style_id(id, name, code),
        color_palettes!palette_id(id, name, code, primary_colors),
        seasonal_themes!season_id(id, name, code)
      `)
      .eq('user_id', user.id)

    // Filter by status if specified
    if (status !== 'all') {
      query = query.eq('status', status)
    }

    // Filter by project if specified
    if (projectId) {
      query = query.eq('project_id', projectId)
    }

    // Add pagination and ordering
    query = query
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false })

    const { data: transformations, error, count } = await query

    if (error) {
      console.error('Error fetching transformations:', error)
      return NextResponse.json(
        { error: 'Error al obtener transformaciones' },
        { status: 500 }
      )
    }

    // Process transformations to clean up the structure
    const processedTransformations = (transformations || []).map(t => ({
      ...t,
      style: t.design_styles || null,
      color_palette: t.color_palettes || null,
      seasonal_theme: t.seasonal_themes || null,
      design_styles: undefined,
      color_palettes: undefined,
      seasonal_themes: undefined
    }))

    // Get total count for pagination
    const { count: totalCount } = await supabase
      .from('transformations')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    // Calculate statistics
    const { data: stats } = await supabase
      .from('transformations')
      .select('status, tokens_consumed')
      .eq('user_id', user.id)

    const statistics = {
      total: totalCount || 0,
      completed: stats?.filter(s => s.status === 'completed').length || 0,
      processing: stats?.filter(s => s.status === 'processing').length || 0,
      failed: stats?.filter(s => s.status === 'failed').length || 0,
      totalTokensUsed: stats?.reduce((sum, s) => sum + (s.tokens_consumed || 0), 0) || 0
    }

    return NextResponse.json({
      transformations: processedTransformations,
      total: totalCount || 0,
      hasMore: (totalCount || 0) > offset + limit,
      statistics
    })
  } catch (error) {
    console.error('User transformations API error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}