import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const cookieStore = await cookies()
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status') || 'active'
  const includePublic = searchParams.get('includePublic') === 'true'

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

    // Build query
    let query = supabase
      .from('projects')
      .select(`
        *,
        images(count)
      `)

    // Add status filter if provided
    if (status !== 'all') {
      query = query.eq('status', status)
    }

    // Add user filter unless including public projects
    if (!includePublic) {
      query = query.eq('user_id', user.id)
    }

    query = query.order('updated_at', { ascending: false })

    const { data: projects, error } = await query

    if (error) {
      console.error('Error fetching projects:', error)
      return NextResponse.json(
        { error: 'Error al obtener proyectos' },
        { status: 500 }
      )
    }

    // For each project, get favorite/latest transformation
    const projectsWithTransformations = await Promise.all(
      (projects || []).map(async (project) => {
        // Get favorite transformation (if exists)
        const { data: favoriteTransformation } = await supabase
          .from('transformations')
          .select(`
            id,
            result_image_url,
            design_styles(name)
          `)
          .eq('project_id', project.id)
          .eq('is_favorite', true)
          .eq('status', 'completed')
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        let latestTransformation = null
        
        // If no favorite, get latest transformation
        if (!favoriteTransformation) {
          const { data } = await supabase
            .from('transformations')
            .select(`
              id,
              result_image_url,
              design_styles(name)
            `)
            .eq('project_id', project.id)
            .eq('status', 'completed')
            .order('created_at', { ascending: false })
            .limit(1)
            .single()
          
          latestTransformation = data
        }

        return {
          ...project,
          featured_transformation: favoriteTransformation || latestTransformation
        }
      })
    )

    return NextResponse.json({ projects: projectsWithTransformations })
  } catch (error) {
    console.error('Projects API error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

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
    const { name, description, project_type = 'personal', space_type, metadata = {} } = body

    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'El nombre del proyecto es requerido' },
        { status: 400 }
      )
    }

    if (name.length > 100) {
      return NextResponse.json(
        { error: 'El nombre del proyecto no puede exceder 100 caracteres' },
        { status: 400 }
      )
    }

    // Generate a slug from the name
    const slug = name.trim().toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')

    // Create project
    const { data: project, error } = await supabase
      .from('projects')
      .insert({
        user_id: user.id,
        name: name.trim(),
        slug: slug || `project-${Date.now()}`,
        description: description?.trim() || null,
        project_type,
        space_type: space_type || null,
        status: 'active',
        completion_percentage: 0,
        is_public: false,
        is_featured: false,
        total_transformations: 0,
        total_inspirations: 0,
        total_views: 0,
        total_likes: 0,
        tags: [],
        metadata,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating project:', error)
      return NextResponse.json(
        { error: 'Error al crear proyecto' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      project,
    })
  } catch (error) {
    console.error('Create project error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}