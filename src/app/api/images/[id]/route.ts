import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { getCloudflareImages } from '@/lib/cloudflare-images'

interface TransformationData {
  user_id: string;
  result_cloudflare_id: string | null;
  base_image: {
    cloudflare_id: string | null;
  } | null;
}

// GET image details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const cloudflareImages = getCloudflareImages()
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

    // Get image details from Cloudflare
    const imageDetails = await cloudflareImages.getImage(id)
    
    // Get variant URLs
    const urls = cloudflareImages.getVariantUrls(id)

    return NextResponse.json({
      success: true,
      image: imageDetails,
      urls,
    })
  } catch (error) {
    console.error('Error in GET /api/images/[id]:', error)
    return NextResponse.json(
      { error: 'Error al obtener detalles de la imagen' },
      { status: 500 }
    )
  }
}

// DELETE image
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const cloudflareImages = getCloudflareImages()
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

    // Check if user owns the image (verify in database)
    const { data: transformation, error: transformationError } = await supabase
      .from('transformations')
      .select(`
        user_id,
        result_cloudflare_id,
        base_image:images!transformations_base_image_id_fkey(
          cloudflare_id
        )
      `)
      .or(`result_cloudflare_id.eq.${id}`)
      .single() as { data: TransformationData | null; error: unknown }

    if (transformationError || !transformation) {
      return NextResponse.json(
        { error: 'No tienes permisos para eliminar esta imagen' },
        { status: 403 }
      )
    }

    if (transformation.user_id !== user.id) {
      return NextResponse.json(
        { error: 'No tienes permisos para eliminar esta imagen' },
        { status: 403 }
      )
    }

    // Delete from Cloudflare
    const deleted = await cloudflareImages.deleteImage(id)

    if (!deleted) {
      return NextResponse.json(
        { error: 'Error al eliminar la imagen' },
        { status: 500 }
      )
    }

    // Update database record
    if (transformation.base_image?.cloudflare_id === id) {
      // Update the base image record
      const { error: updateError } = await supabase
        .from('images')
        .update({ 
          cloudflare_id: null,
          url: '' 
        })
        .eq('cloudflare_id', id)
      
      if (updateError) {
        console.error('Database update error:', updateError)
      }
    } else if (transformation.result_cloudflare_id === id) {
      // Update the transformation record
      const { error: updateError } = await supabase
        .from('transformations')
        .update({ 
          result_cloudflare_id: null,
          result_image_url: null 
        })
        .eq('result_cloudflare_id', id)
      
      if (updateError) {
        console.error('Database update error:', updateError)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Imagen eliminada exitosamente',
    })
  } catch (error) {
    console.error('Error in DELETE /api/images/[id]:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// PATCH - Update image metadata
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const cloudflareImages = getCloudflareImages()
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

    const body = await request.json()
    const { metadata } = body

    if (!metadata) {
      return NextResponse.json(
        { error: 'No se proporcionaron metadatos' },
        { status: 400 }
      )
    }

    // Update metadata in Cloudflare
    const updated = await cloudflareImages.updateImageMetadata(id, {
      ...metadata,
      updatedBy: user.id,
      updatedAt: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      image: updated.result,
    })
  } catch (error) {
    console.error('Error in PATCH /api/images/[id]:', error)
    return NextResponse.json(
      { error: 'Error al actualizar metadatos' },
      { status: 500 }
    )
  }
}