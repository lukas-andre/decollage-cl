import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const cookieStore = await cookies()
  const { searchParams } = new URL(request.url)
  const projectId = searchParams.get('projectId')
  const imageType = searchParams.get('type') || 'room'
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

    // Build query for user's images
    let query = supabase
      .from('images')
      .select(`
        *,
        project:projects(id, name),
        transformations:transformations!transformations_base_image_id_fkey(count)
      `)
      .eq('user_id', user.id)

    // Filter by image type
    if (imageType !== 'all') {
      query = query.eq('image_type', imageType)
    }

    // Filter by project if specified
    if (projectId) {
      query = query.eq('project_id', projectId)
    }

    // Add pagination
    query = query
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false })

    const { data: images, error, count } = await query

    if (error) {
      console.error('Error fetching user images:', error)
      return NextResponse.json(
        { error: 'Error al obtener imágenes' },
        { status: 500 }
      )
    }

    // Process images to include transformation count
    const processedImages = (images || []).map(img => ({
      ...img,
      transformation_count: img.transformations?.[0]?.count || 0,
      transformations: undefined
    }))

    // Get total count for pagination
    const { count: totalCount } = await supabase
      .from('images')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('image_type', imageType)

    return NextResponse.json({
      images: processedImages,
      total: totalCount || 0,
      hasMore: (totalCount || 0) > offset + limit
    })
  } catch (error) {
    console.error('User images API error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// DELETE endpoint to remove an image
export async function DELETE(request: NextRequest) {
  const cookieStore = await cookies()
  const { searchParams } = new URL(request.url)
  const imageId = searchParams.get('id')

  if (!imageId) {
    return NextResponse.json(
      { error: 'ID de imagen requerido' },
      { status: 400 }
    )
  }

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

    // Check if image belongs to user
    const { data: image } = await supabase
      .from('images')
      .select('cloudflare_id')
      .eq('id', imageId)
      .eq('user_id', user.id)
      .single()

    if (!image) {
      return NextResponse.json(
        { error: 'Imagen no encontrada' },
        { status: 404 }
      )
    }

    // Delete from database (will cascade delete transformations)
    const { error: deleteError } = await supabase
      .from('images')
      .delete()
      .eq('id', imageId)

    if (deleteError) {
      console.error('Error deleting image:', deleteError)
      return NextResponse.json(
        { error: 'Error al eliminar imagen' },
        { status: 500 }
      )
    }

    // Delete from Cloudflare if ID exists
    if (image.cloudflare_id) {
      const { getCloudflareImages } = await import('@/lib/cloudflare-images')
      const cloudflareImages = getCloudflareImages()
      await cloudflareImages.deleteImage(image.cloudflare_id)
    }

    return NextResponse.json({
      success: true,
      message: 'Imagen eliminada correctamente'
    })
  } catch (error) {
    console.error('Delete image error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}