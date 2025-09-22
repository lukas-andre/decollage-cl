import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getCloudflareImages } from '@/lib/cloudflare-images'

// Helper function to get MIME type from filename
function getMimeTypeFromFileName(fileName: string): string | null {
  if (!fileName) return null

  const extension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'))
  const mimeTypes: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
  }

  return mimeTypes[extension] || null
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const cookieStore = await cookies()
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

  const cloudflareImages = getCloudflareImages()

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

    // Verify project ownership
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, user_id')
      .eq('id', projectId)
      .single()

    if (projectError || !project) {
      return NextResponse.json(
        { error: 'Proyecto no encontrado' },
        { status: 404 }
      )
    }

    if (project.user_id !== user.id) {
      return NextResponse.json(
        { error: 'No autorizado para este proyecto' },
        { status: 403 }
      )
    }

    const formData = await request.formData()
    const fileEntry = formData.get('file')
    const name = formData.get('name') as string | null

    if (!fileEntry) {
      return NextResponse.json(
        { error: 'No se proporcionó archivo' },
        { status: 400 }
      )
    }

    // Convert to Buffer for Node.js compatibility
    let fileBuffer: Buffer
    let fileName: string
    let fileSize: number

    if (typeof File !== 'undefined' && fileEntry instanceof File) {
      // Browser/newer Node.js with File support
      fileBuffer = Buffer.from(await fileEntry.arrayBuffer())
      fileName = fileEntry.name
      fileSize = fileEntry.size
    } else if (fileEntry instanceof Blob) {
      // Fallback for Blob
      fileBuffer = Buffer.from(await fileEntry.arrayBuffer())
      fileName = name || 'upload.jpg'
      fileSize = fileEntry.size
    } else {
      // Handle other cases (should not happen normally)
      return NextResponse.json(
        { error: 'Formato de archivo no válido' },
        { status: 400 }
      )
    }

    // Validate image file using Cloudflare validation
    const validation = cloudflareImages.validateImageFile({
      name: fileName,
      size: fileSize,
      type: getMimeTypeFromFileName(fileName) || undefined
    })
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    // Get image dimensions
    const dimensions = await cloudflareImages.getImageDimensions(fileBuffer)

    // Compress image if needed
    let imageToUpload: Buffer = fileBuffer
    if (fileSize > 5 * 1024 * 1024) { // If larger than 5MB, compress it
      try {
        imageToUpload = await cloudflareImages.compressImage(fileBuffer)
      } catch (error) {
        console.warn('Could not compress image, uploading original:', error)
        imageToUpload = fileBuffer
      }
    }

    // Generate unique filename
    const uniqueFileName = cloudflareImages.generateUniqueFilename(fileName, user.id)

    // Upload to Cloudflare Images
    const uploadResponse = await cloudflareImages.uploadImage(
      imageToUpload,
      uniqueFileName,
      {
        metadata: {
          userId: user.id,
          projectId,
          type: 'project_base_image',
          originalName: fileName,
          uploadedAt: new Date().toISOString(),
          width: dimensions.width.toString(),
          height: dimensions.height.toString(),
        },
      }
    )

    if (!uploadResponse.success) {
      console.error('Cloudflare upload error:', uploadResponse.errors)
      return NextResponse.json(
        { error: 'Error al subir la imagen' },
        { status: 500 }
      )
    }

    // Get variant URLs
    const imageUrls = cloudflareImages.getVariantUrls(uploadResponse.result.id)

    // Get current image count for ordering
    const { count } = await supabase
      .from('images')
      .select('*', { count: 'exact', head: true })
      .eq('project_id', projectId)

    // Create images record
    const { data: projectImage, error: dbError } = await supabase
      .from('images')
      .insert({
        user_id: user.id,
        project_id: projectId,
        url: imageUrls.original,
        cloudflare_id: uploadResponse.result.id,
        thumbnail_url: imageUrls.thumbnail,
        image_type: 'room',
        source: 'upload',
        name: name || fileName.split('.')[0], // Use filename without extension as default name
        upload_order: (count || 0) + 1,
        is_primary: (count || 0) === 0 // First image is primary
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      // Try to delete uploaded file from Cloudflare
      await cloudflareImages.deleteImage(uploadResponse.result.id)
      
      return NextResponse.json(
        { error: 'Error al guardar información de la imagen' },
        { status: 500 }
      )
    }

    // Update project updated_at timestamp
    await supabase
      .from('projects')
      .update({ 
        updated_at: new Date().toISOString()
      })
      .eq('id', projectId)

    return NextResponse.json({
      success: true,
      projectImage: {
        ...projectImage,
        // Include URLs for immediate display (these are already in the record)
        url: imageUrls.original,
        thumbnail_url: imageUrls.thumbnail,
      },
      urls: imageUrls,
      dimensions
    })
  } catch (error) {
    console.error('Upload image error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}