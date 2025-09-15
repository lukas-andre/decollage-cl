import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import type { Database } from '@/types/database'

interface GenerationData {
  id: string;
  original_cloudflare_id: string | null;
  processed_cloudflare_id: string | null;
  original_image_url: string | null;
  staged_image_url: string | null;
}

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    
    const supabase = createServerClient<Database>(
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
    const imageUrl = searchParams.get('url')
    const filename = searchParams.get('filename') || 'virtual-staging-image.jpg'

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'URL de imagen no proporcionada' },
        { status: 400 }
      )
    }

    // Verify that the URL is from Cloudflare Images
    const cloudflareUrl = process.env.NEXT_PUBLIC_CLOUDFLARE_IMAGES_URL
    if (cloudflareUrl && !imageUrl.startsWith(cloudflareUrl)) {
      return NextResponse.json(
        { error: 'URL de imagen inválida' },
        { status: 400 }
      )
    }

    // Fetch the image from Cloudflare
    const imageResponse = await fetch(imageUrl)
    
    if (!imageResponse.ok) {
      return NextResponse.json(
        { error: 'Error al obtener la imagen' },
        { status: 500 }
      )
    }

    const imageBlob = await imageResponse.blob()
    
    // Get the content type from the response
    const contentType = imageResponse.headers.get('content-type') || 'image/jpeg'
    
    // Create response with appropriate headers for download
    return new NextResponse(imageBlob, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    })
  } catch (error) {
    console.error('Error in GET /api/images/download:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// Batch download endpoint
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    
    const supabase = createServerClient<Database>(
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
    const { imageIds } = body

    if (!imageIds || !Array.isArray(imageIds) || imageIds.length === 0) {
      return NextResponse.json(
        { error: 'No se proporcionaron IDs de imagen' },
        { status: 400 }
      )
    }

    // Verify user owns these images
    const { data: generations, error } = await supabase
      .from('staging_generations')
      .select('id, original_cloudflare_id, processed_cloudflare_id, original_image_url, staged_image_url')
      .eq('user_id', user.id)
      .or(
        imageIds
          .map(id => `original_cloudflare_id.eq.${id},processed_cloudflare_id.eq.${id}`)
          .join(',')
      ) as { data: GenerationData[] | null; error: unknown }

    if (error || !generations || generations.length === 0) {
      return NextResponse.json(
        { error: 'No tienes permisos para descargar estas imágenes' },
        { status: 403 }
      )
    }

    // Prepare download URLs
    const downloadUrls = generations.flatMap(gen => {
      const urls = []
      if (gen.original_cloudflare_id && imageIds.includes(gen.original_cloudflare_id)) {
        urls.push({
          id: gen.original_cloudflare_id,
          url: gen.original_image_url,
          type: 'original',
        })
      }
      if (gen.processed_cloudflare_id && imageIds.includes(gen.processed_cloudflare_id)) {
        urls.push({
          id: gen.processed_cloudflare_id,
          url: gen.staged_image_url,
          type: 'staged',
        })
      }
      return urls
    })

    return NextResponse.json({
      success: true,
      downloads: downloadUrls,
    })
  } catch (error) {
    console.error('Error in POST /api/images/download:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}