import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { virtualStagingService } from '@/lib/ai/virtual-staging'
import { getCloudflareImages } from '@/lib/cloudflare-images'

export async function POST(request: NextRequest) {
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
    const image = formData.get('image') as File | null
    const style = formData.get('style') as string | null
    const roomType = (formData.get('roomType') as string | null) || undefined
    const customInstructions = (formData.get('customInstructions') as string | null) || undefined
    const tokensRequired = 10 // Each generation costs 10 tokens

    if (!image || !style) {
      return NextResponse.json(
        { error: 'Imagen y estilo son requeridos' },
        { status: 400 }
      )
    }

    // Validate image file
    const imageValidation = cloudflareImages.validateImageFile(image)
    if (!imageValidation.valid) {
      return NextResponse.json(
        { error: imageValidation.error },
        { status: 400 }
      )
    }

    // Check user's token balance
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('tokens_available')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      console.error('Profile not found for user:', user.id, profileError)
      return NextResponse.json(
        { error: 'Perfil no encontrado. Por favor contacta al administrador.' },
        { status: 404 }
      )
    }

    if (profile.tokens_available < tokensRequired) {
      return NextResponse.json(
        { error: 'Tokens insuficientes' },
        { status: 400 }
      )
    }

    // Get style ID from database
    const { data: styleData } = await supabase
      .from('design_styles')
      .select('id')
      .eq('code', style)
      .single()

    // First upload the original image to create an images record
    const originalImageUpload = await cloudflareImages.uploadImage(
      image,
      cloudflareImages.generateUniqueFilename(image.name, user.id),
      {
        metadata: {
          userId: user.id,
          type: 'base',
        }
      }
    )

    if (!originalImageUpload.success) {
      return NextResponse.json(
        { error: 'Error al subir imagen' },
        { status: 500 }
      )
    }

    const originalImageUrls = cloudflareImages.getVariantUrls(originalImageUpload.result.id)

    // Create base image record
    const { data: baseImage, error: imageError } = await supabase
      .from('images')
      .insert({
        user_id: user.id,
        url: originalImageUrls.public,
        cloudflare_id: originalImageUpload.result.id,
        thumbnail_url: originalImageUrls.thumbnail,
        image_type: 'base',
        source: 'upload',
        name: image.name,
        is_primary: true,
      })
      .select()
      .single()

    if (imageError) {
      return NextResponse.json(
        { error: 'Error al crear registro de imagen' },
        { status: 500 }
      )
    }

    // Create transformation record
    const { data: transformation, error: transformationError } = await supabase
      .from('transformations')
      .insert({
        user_id: user.id,
        base_image_id: baseImage.id,
        style_id: styleData?.id,
        prompt_used: customInstructions,
        custom_instructions: customInstructions,
        tokens_consumed: tokensRequired,
        status: 'pending',
        is_favorite: false,
        is_shared: false,
        share_count: 0,
        metadata: {
          roomType: roomType || null,
          originalFilename: image.name,
        },
      })
      .select()
      .single()

    if (transformationError) {
      return NextResponse.json(
        { error: 'Error al crear la transformación' },
        { status: 500 }
      )
    }

    // Process in background to avoid timeout
    // In production, this should be handled by a queue system
    process.nextTick(async () => {
      try {
        // Update status to processing
        await supabase
          .from('transformations')
          .update({
            status: 'processing',
          })
          .eq('id', transformation.id)

        // Original image already uploaded, proceed with staging generation

        // Generate virtual staging using AI
        const stagingResult = await virtualStagingService.generateStaging({
          originalImage: image,
          style,
          roomType,
          customInstructions,
          userId: user.id,
          generationId: transformation.id,
          options: {
            numberOfImages: 1,
            progressCallback: (progress) => {
              console.log(`Transformation ${transformation.id} progress:`, progress)
            }
          }
        })

        if (!stagingResult.success) {
          throw new Error(stagingResult.error || 'AI staging generation failed')
        }

        // Upload staged image to Cloudflare
        const stagedImageBlob = await fetch(stagingResult.stagedImageDataUrl!).then(r => r.blob())
        const stagedImageUpload = await cloudflareImages.uploadImage(
          stagedImageBlob,
          cloudflareImages.generateUniqueFilename(`staged_${image.name}`, user.id),
          {
            metadata: {
            userId: user.id,
            transformationId: transformation.id,
            type: 'result',
            style,
            roomType: roomType || '',
            aiCost: stagingResult.estimatedCostCLP.toString(),
            }
          }
        )

        if (!stagedImageUpload.success) {
          throw new Error('Failed to upload staged image')
        }

        const stagedImageUrls = cloudflareImages.getVariantUrls(stagedImageUpload.result.id)

        // Update transformation record with success
        await supabase
          .from('transformations')
          .update({
            result_image_url: stagedImageUrls.public,
            result_cloudflare_id: stagedImageUpload.result.id,
            prompt_used: stagingResult.finalPrompt,
            status: 'completed',
            completed_at: new Date().toISOString(),
            processing_time_ms: stagingResult.processingTime,
            metadata: {
              finalPrompt: stagingResult.finalPrompt,
              processingTime: stagingResult.processingTime,
              costBreakdown: stagingResult.costBreakdown,
              warnings: stagingResult.warnings,
              style,
              roomType: roomType || null,
              customInstructions: customInstructions || null,
              originalFilename: image.name,
            },
          })
          .eq('id', transformation.id)

        // Deduct tokens from user
        await supabase
          .from('profiles')
          .update({ 
            tokens_available: profile.tokens_available - tokensRequired,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id)

        // Record token transaction
        await supabase
          .from('token_transactions')
          .insert({
            user_id: user.id,
            type: 'consumption',
            amount: -tokensRequired,
            description: `Generación de staging - ${style}${roomType ? ` (${roomType})` : ''}`,
            transformation_id: transformation.id,
            created_at: new Date().toISOString(),
            metadata: {
              aiCost: stagingResult.estimatedCostCLP,
              processingTime: stagingResult.processingTime,
            }
          })

        console.log('Virtual staging completed successfully:', {
          transformationId: transformation.id,
          style,
          roomType,
          processingTime: stagingResult.processingTime,
          cost: stagingResult.estimatedCostCLP
        })

      } catch (error) {
        console.error('Error processing generation:', error)
        
        // Update transformation record with error
        await supabase
          .from('transformations')
          .update({
            status: 'failed',
            completed_at: new Date().toISOString(),
            error_message: error instanceof Error ? error.message : 'Unknown error',
            metadata: {
              error: error instanceof Error ? error.message : 'Unknown error'
            }
          })
          .eq('id', transformation.id)
      }
    })

    return NextResponse.json({
      success: true,
      transformationId: transformation.id,
      status: 'processing',
      message: 'Transformación iniciada',
    })
  } catch (error) {
    console.error('Generation error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// Get transformation status
export async function GET(request: NextRequest) {
  const cookieStore = await cookies()
  const { searchParams } = new URL(request.url)
  const transformationId = searchParams.get('id')

  if (!transformationId) {
    return NextResponse.json(
      { error: 'ID de transformación requerido' },
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

    // Get transformation details
    const { data: transformation, error: transformationError } = await supabase
      .from('transformations')
      .select(`
        *,
        base_image:images!transformations_base_image_id_fkey(
          url,
          cloudflare_id
        ),
        design_styles(
          name,
          code
        )
      `)
      .eq('id', transformationId)
      .eq('user_id', user.id) // Ensure user owns the transformation
      .single()

    if (transformationError || !transformation) {
      return NextResponse.json(
        { error: 'Transformación no encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      id: transformation.id,
      status: transformation.status,
      style: transformation.design_styles?.code,
      styleName: transformation.design_styles?.name,
      originalImageUrl: transformation.base_image?.url,
      resultImageUrl: transformation.result_image_url,
      tokensConsumed: transformation.tokens_consumed,
      createdAt: transformation.created_at,
      completedAt: transformation.completed_at,
      processingTimeMs: transformation.processing_time_ms,
      errorMessage: transformation.error_message,
      metadata: transformation.metadata,
    })
  } catch {
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}