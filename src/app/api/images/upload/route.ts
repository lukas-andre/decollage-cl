import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { getCloudflareImages } from '@/lib/cloudflare-images'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const cloudflareImages = getCloudflareImages()
    
    // Check if user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    // Get form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as string || 'generation'
    
    if (!file) {
      return NextResponse.json(
        { error: 'No se proporcionó ningún archivo' },
        { status: 400 }
      )
    }

    // Validate image file
    const validation = cloudflareImages.validateImageFile(file)
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    // Get image dimensions
    const dimensions = await cloudflareImages.getImageDimensions(file)

    // Compress image if needed
    let imageToUpload: File | Buffer = file
    if (file.size > 5 * 1024 * 1024) { // If larger than 5MB, compress it
      try {
        imageToUpload = await cloudflareImages.compressImage(file)
      } catch (error) {
        console.warn('Could not compress image, uploading original:', error)
        imageToUpload = file
      }
    }

    // Generate unique filename
    const uniqueFileName = cloudflareImages.generateUniqueFilename(file.name, user.id)

    // Upload to Cloudflare Images
    const uploadResponse = await cloudflareImages.uploadImage(
      imageToUpload,
      uniqueFileName,
      {
        metadata: {
          userId: user.id,
          type,
          originalName: file.name,
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

    // Store image reference in database 
    const { error: dbError } = await supabase
      .from('images')
      .insert({
        user_id: user.id,
        url: imageUrls.original,
        cloudflare_id: uploadResponse.result.id,
        thumbnail_url: imageUrls.thumbnail,
        image_type: type === 'generation' ? 'base' : type,
        source: 'upload',
        name: file.name,
        analysis_data: {
          dimensions,
          originalFilename: file.name,
          uploadedAt: new Date().toISOString(),
        },
        is_primary: type === 'generation',
      })

    if (dbError) {
      console.error('Database error:', dbError)
      // Try to delete the uploaded image
      await cloudflareImages.deleteImage(uploadResponse.result.id)
      return NextResponse.json(
        { error: 'Error al guardar la referencia de imagen' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      imageId: uploadResponse.result.id,
      urls: imageUrls,
      dimensions,
    })
  } catch (error) {
    console.error('Error in POST /api/images/upload:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// Direct upload URL for client-side uploads
export async function GET() {
  try {
    const supabase = await createClient()
    const cloudflareImages = getCloudflareImages()
    
    // Check if user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    // Create direct upload URL
    const directUpload = await cloudflareImages.createDirectUploadUrl({
      userId: user.id,
      createdAt: new Date().toISOString(),
    })

    return NextResponse.json({
      uploadURL: directUpload.uploadURL,
      imageId: directUpload.id,
    })
  } catch (error) {
    console.error('Error in GET /api/images/upload:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}