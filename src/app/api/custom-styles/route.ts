import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// GET /api/custom-styles - Fetch user's custom styles
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

    // Fetch user's custom styles
    const { data: customStyles, error } = await supabase
      .from('user_custom_styles')
      .select(`
        id,
        style_name,
        base_prompt,
        negative_prompt,
        preview_image_url,
        source_space_code,
        metadata,
        usage_count,
        created_at,
        design_styles:based_on_style_id (
          id,
          name,
          macrocategory
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching custom styles:', error)
      return NextResponse.json(
        { error: 'Error al obtener estilos personalizados' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      customStyles: customStyles || [],
      count: customStyles?.length || 0
    })
  } catch (error) {
    console.error('Custom styles API error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// POST /api/custom-styles - Save new custom style
export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const {
      style_name,
      base_prompt,
      negative_prompt,
      based_on_style_id,
      source_space_code,
      preview_image_url,
      metadata = {}
    } = body

    // Validate required fields
    if (!style_name || !base_prompt) {
      return NextResponse.json(
        { error: 'Nombre del estilo y prompt base son obligatorios' },
        { status: 400 }
      )
    }

    // Insert new custom style
    const { data: customStyle, error } = await supabase
      .from('user_custom_styles')
      .insert({
        user_id: user.id,
        style_name,
        base_prompt,
        negative_prompt,
        based_on_style_id,
        source_space_code,
        preview_image_url,
        metadata,
        usage_count: 0
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating custom style:', error)
      return NextResponse.json(
        { error: 'Error al guardar estilo personalizado' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      customStyle,
      message: 'Estilo personalizado guardado correctamente'
    }, { status: 201 })
  } catch (error) {
    console.error('Custom styles creation error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}