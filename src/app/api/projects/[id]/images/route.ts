import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getCloudflareImages } from '@/lib/cloudflare-images'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const cookieStore = await cookies()
  const { id } = await params

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

    // Get project images with transformations
    const { data: images, error } = await supabase
      .from('images')
      .select(`
        *,
        transformations:transformations!transformations_base_image_id_fkey (
          id,
          status,
          result_image_url,
          tokens_consumed,
          created_at,
          completed_at,
          metadata,
          style_id,
          design_styles (
            name,
            code
          )
        )
      `)
      .eq('project_id', id)
      .order('upload_order', { ascending: true })
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching project images:', error)
      return NextResponse.json(
        { error: 'Error al obtener imágenes del proyecto' },
        { status: 500 }
      )
    }

    return NextResponse.json({ images })
  } catch (error) {
    console.error('Get project images error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const cookieStore = await cookies()
  const cloudflareImages = getCloudflareImages()
  const { id: projectId } = await params

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

    const formData = await request.formData()
    const images = formData.getAll('images') as File[]
    const imageName = formData.get('imageName') as string
    const tags = formData.get('tags') ? JSON.parse(formData.get('tags') as string) : []
    const notes = formData.get('notes') as string || ''

    if (images.length === 0) {
      return NextResponse.json(
        { error: 'Al menos una imagen es requerida' },
        { status: 400 }
      )
    }

    // Validate project exists and user has access
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id')
      .eq('id', projectId)
      .single()

    if (projectError || !project) {
      return NextResponse.json(
        { error: 'Proyecto no encontrado' },
        { status: 404 }
      )
    }

    const results = []
    let uploadOrder = 1

    // Get current max upload order
    const { data: maxOrderResult } = await supabase
      .from('images')
      .select('upload_order')
      .eq('project_id', projectId)
      .order('upload_order', { ascending: false })
      .limit(1)
      .single()

    if (maxOrderResult?.upload_order) {
      uploadOrder = maxOrderResult.upload_order + 1
    }

    for (const image of images) {
      try {
        // Validate image file
        const imageValidation = cloudflareImages.validateImageFile(image)
        if (!imageValidation.valid) {
          results.push({
            fileName: image.name,
            success: false,
            error: imageValidation.error,
          })
          continue
        }

        // Upload to Cloudflare Images
        const uploadResult = await cloudflareImages.uploadImage(
          image,
          cloudflareImages.generateUniqueFilename(image.name, user.id),
          {
            metadata: {
              userId: user.id,
              projectId,
              type: 'project_image',
            }
          }
        )

        if (!uploadResult.success) {
          results.push({
            fileName: image.name,
            success: false,
            error: 'Error al subir imagen',
          })
          continue
        }

        const imageUrls = cloudflareImages.getVariantUrls(uploadResult.result.id)

        // Create image record
        const { data: projectImage, error: insertError } = await supabase
          .from('images')
          .insert({
            user_id: user.id,
            project_id: projectId,
            url: imageUrls.public,
            cloudflare_id: uploadResult.result.id,
            thumbnail_url: imageUrls.thumbnail,
            image_type: 'base',
            source: 'upload',
            name: imageName || image.name,
            description: notes || null,
            tags,
            upload_order: uploadOrder,
            is_primary: uploadOrder === 1,
          })
          .select()
          .single()

        if (insertError) {
          console.error('Error creating project image record:', insertError)
          results.push({
            fileName: image.name,
            success: false,
            error: 'Error al guardar imagen en base de datos',
          })
          continue
        }

        results.push({
          fileName: image.name,
          success: true,
          projectImage,
        })

        uploadOrder++
      } catch (error) {
        console.error('Error processing image:', image.name, error)
        results.push({
          fileName: image.name,
          success: false,
          error: 'Error interno al procesar imagen',
        })
      }
    }

    const successful = results.filter(r => r.success).length
    const failed = results.filter(r => !r.success).length

    return NextResponse.json({
      success: successful > 0,
      message: `${successful} imagen(es) subida(s) exitosamente${failed > 0 ? `, ${failed} fallaron` : ''}`,
      results,
    })
  } catch (error) {
    console.error('Upload project images error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}