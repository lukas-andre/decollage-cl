import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET() {
  const cookieStore = await cookies()

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

    // Fetch all design data in parallel
    const [stylesResult, roomTypesResult, colorPalettesResult, seasonalThemesResult] = await Promise.all([
      supabase
        .from('design_styles')
        .select('*')
        .eq('is_active', true)
        .order('sort_order'),
      
      supabase
        .from('room_types')
        .select('*')
        .eq('is_active', true)
        .order('sort_order'),
      
      supabase
        .from('color_palettes')
        .select('*')
        .eq('is_active', true)
        .order('sort_order'),
        
      supabase
        .from('seasonal_themes')
        .select('*')
        .eq('is_active', true)
        .order('sort_order'),
    ])

    if (stylesResult.error) {
      console.error('Error fetching styles:', stylesResult.error)
      return NextResponse.json(
        { error: 'Error al obtener estilos' },
        { status: 500 }
      )
    }

    if (roomTypesResult.error) {
      console.error('Error fetching room types:', roomTypesResult.error)
      return NextResponse.json(
        { error: 'Error al obtener tipos de habitación' },
        { status: 500 }
      )
    }

    if (colorPalettesResult.error) {
      console.error('Error fetching color palettes:', colorPalettesResult.error)
      return NextResponse.json(
        { error: 'Error al obtener paletas de color' },
        { status: 500 }
      )
    }

    if (seasonalThemesResult.error) {
      console.error('Error fetching seasonal themes:', seasonalThemesResult.error)
      return NextResponse.json(
        { error: 'Error al obtener temas estacionales' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      styles: stylesResult.data || [],
      roomTypes: roomTypesResult.data || [],
      colorPalettes: colorPalettesResult.data || [],
      seasonalThemes: seasonalThemesResult.data || [],
    })
  } catch (error) {
    console.error('Design data API error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}