import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ baseImageId: string }> }
) {
  const cookieStore = await cookies()
  const { baseImageId } = await params

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

    // Verify base image ownership
    const { data: baseImage, error: baseImageError } = await supabase
      .from('images')
      .select('*, project:projects(user_id)')
      .eq('id', baseImageId)
      .eq('image_type', 'room')
      .single()

    if (baseImageError || !baseImage) {
      return NextResponse.json(
        { error: 'Imagen base no encontrada' },
        { status: 404 }
      )
    }

    if (baseImage.user_id !== user.id) {
      return NextResponse.json(
        { error: 'No autorizado para ver estas transformaciones' },
        { status: 403 }
      )
    }

    // Fetch all transformations for this base image (all statuses)
    const { data: transformations, error: transformationsError } = await supabase
      .from('transformations')
      .select(`
        *,
        design_styles!style_id(id, name, code),
        color_palettes!palette_id(id, name, code, primary_colors),
        seasonal_themes!season_id(id, name, code)
      `)
      .eq('base_image_id', baseImageId)
      .order('created_at', { ascending: false })

    if (transformationsError) {
      console.error('Error fetching transformations:', transformationsError)
      return NextResponse.json(
        { error: 'Error al obtener transformaciones' },
        { status: 500 }
      )
    }

    // Map the response to match frontend expectations
    const mappedTransformations = (transformations || []).map((t: any) => ({
      ...t,
      style: t.design_styles || null,
      color_palette: t.color_palettes || null,
      seasonal_theme: t.seasonal_themes || null,
      design_styles: undefined,
      color_palettes: undefined,
      seasonal_themes: undefined
    }))

    return NextResponse.json({
      transformations: mappedTransformations
    })
  } catch (error) {
    console.error('Variants API error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}