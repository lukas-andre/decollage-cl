import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { virtualStagingService } from '@/lib/ai/virtual-staging'

export async function GET(request: NextRequest) {
  try {
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
    
    // Check if user is authenticated
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

    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get('category')
    const isActive = searchParams.get('active') !== 'false'

    // Build query
    let query = supabase
      .from('design_styles')
      .select('*')
      .eq('is_active', isActive)
      .order('sort_order', { ascending: true })

    // Apply category filter if provided
    if (category && category !== 'all') {
      query = query.eq('category', category)
    }

    const { data: dbStyles, error } = await query

    if (error) {
      console.error('Error fetching styles:', error)
      return NextResponse.json(
        { error: 'Error al obtener estilos' },
        { status: 500 }
      )
    }

    // Get AI-defined styles
    const stylesObject = virtualStagingService.getAvailableStyles()
    const aiStyles = Object.values(stylesObject).map(style => ({
      id: `ai_${style.id}`,
      name: style.name,
      name_en: style.name, // English name same as name for AI styles
      code: style.id,
      category: 'ai_generated',
      description: style.description,
      base_prompt: style.keywords.join(', '),
      negative_prompt: null,
      example_images: [],
      inspiration_keywords: style.keywords,
      usage_count: 0,
      is_featured: false,
      is_seasonal: false,
      is_trending: false,
      is_active: true,
      sort_order: 999,
      created_at: new Date().toISOString(),
    }))

    // Combine database styles with AI styles, removing duplicates by code
    const dbStyleCodes = new Set((dbStyles || []).map(style => style.code))
    const uniqueAiStyles = aiStyles.filter(aiStyle => !dbStyleCodes.has(aiStyle.code))
    const allStyles = [...(dbStyles || []), ...uniqueAiStyles]

    return NextResponse.json({ styles: allStyles })
  } catch (error) {
    console.error('Error in GET /api/styles:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
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
    
    // Check if user is authenticated and is admin
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

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single() as { data: { role: string } | null; error: unknown }

    if (profileError || !profile || profile.role !== 'admin') {
      return NextResponse.json(
        { error: 'Acceso denegado' },
        { status: 403 }
      )
    }

    // Get request body
    const body = await request.json()
    const { 
      name, 
      name_en, 
      code, 
      category, 
      description, 
      base_prompt, 
      negative_prompt, 
      example_images, 
      inspiration_keywords,
      is_featured,
      is_seasonal,
      is_trending,
      sort_order
    } = body

    // Validate required fields
    if (!name || !code || !base_prompt) {
      return NextResponse.json(
        { error: 'Campos requeridos faltantes' },
        { status: 400 }
      )
    }

    // Insert new style
    const { data: newStyle, error } = await supabase
      .from('design_styles')
      .insert({
        name,
        name_en: name_en || null,
        code,
        category: category || null,
        description: description || null,
        base_prompt,
        negative_prompt: negative_prompt || null,
        example_images: example_images || [],
        inspiration_keywords: inspiration_keywords || null,
        usage_count: 0,
        is_featured: is_featured || false,
        is_seasonal: is_seasonal || false,
        is_trending: is_trending || false,
        sort_order: sort_order || 100,
        is_active: true,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating style:', error)
      return NextResponse.json(
        { error: 'Error al crear estilo' },
        { status: 500 }
      )
    }

    // Log admin action
    await supabase.from('admin_logs').insert({
      admin_id: user.id,
      action: 'create_style',
      entity_type: 'design_styles',
      entity_id: newStyle.id,
      new_data: newStyle,
    })

    return NextResponse.json({ style: newStyle })
  } catch (error) {
    console.error('Error in POST /api/styles:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}