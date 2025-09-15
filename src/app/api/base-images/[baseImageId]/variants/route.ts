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

    // Verify base image ownership through project
    const { data: baseImage, error: baseImageError } = await supabase
      .from('project_images')
      .select('*, project:projects!inner(user_id)')
      .eq('id', baseImageId)
      .single()

    if (baseImageError || !baseImage) {
      return NextResponse.json(
        { error: 'Imagen base no encontrada' },
        { status: 404 }
      )
    }

    if (baseImage.project.user_id !== user.id) {
      return NextResponse.json(
        { error: 'No autorizado para ver estas variantes' },
        { status: 403 }
      )
    }

    // Fetch all variants for this base image (all statuses)
    const { data: variants, error: variantsError } = await supabase
      .from('staging_generations')
      .select(`
        *,
        staging_styles!staging_generations_style_id_fkey(id, name, code),
        room_types!staging_generations_room_type_id_fkey(id, name, code),
        color_schemes!staging_generations_color_scheme_id_fkey(id, name, code, hex_colors)
      `)
      .eq('project_image_id', baseImageId)
      .order('created_at', { ascending: false })

    if (variantsError) {
      console.error('Error fetching variants:', variantsError)
      return NextResponse.json(
        { error: 'Error al obtener variantes' },
        { status: 500 }
      )
    }

    // Map the response to match frontend expectations
    const mappedVariants = (variants || []).map((v: any) => ({
      ...v,
      style: v.staging_styles || null,
      room_type: v.room_types || null,
      color_scheme: v.color_schemes || null,
      staging_styles: undefined,
      room_types: undefined,
      color_schemes: undefined
    }))

    return NextResponse.json({
      variants: mappedVariants
    })
  } catch (error) {
    console.error('Variants API error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}