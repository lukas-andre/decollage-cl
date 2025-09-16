import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { virtualStagingService } from '@/lib/ai/virtual-staging'
import { getCloudflareImages } from '@/lib/cloudflare-images'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; imageId: string }> }
) {
  const cookieStore = await cookies()
  const cloudflareImages = getCloudflareImages()
  const { id: projectId, imageId } = await params

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
    const { style, roomType, customInstructions } = body
    const tokensRequired = 10 // Each generation costs 10 tokens

    if (!style) {
      return NextResponse.json(
        { error: 'Estilo es requerido' },
        { status: 400 }
      )
    }

    // Get project image
    const { data: projectImage, error: projectImageError } = await supabase
      .from('images')
      .select(`
        *,
        projects!inner (
          id,
          user_id
        )
      `)
      .eq('id', imageId)
      .eq('project_id', projectId)
      .single()

    if (projectImageError || !projectImage) {
      return NextResponse.json(
        { error: 'Imagen no encontrada' },
        { status: 404 }
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

    // Create transformation record
    const { data: transformation, error: transformationError } = await supabase
      .from('transformations')
      .insert({
        user_id: user.id,
        project_id: projectId,
        base_image_id: imageId,
        style_id: styleData?.id,
        custom_instructions: customInstructions,
        tokens_consumed: tokensRequired,
        status: 'pending',
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (transformationError) {
      console.error('Error creating transformation:', transformationError)
      return NextResponse.json(
        { error: 'Error al crear la transformación' },
        { status: 500 }
      )
    }

    // Note: In new schema, we don't need to update image status
    // The transformation status tracks the processing state

    // Process in background to avoid timeout
    process.nextTick(async () => {
      try {
        // Update transformation status to processing
        await supabase
          .from('transformations')
          .update({
            status: 'processing',
          })
          .eq('id', transformation.id)

        // Download original image from Cloudflare
        const imageResponse = await fetch(projectImage.url)
        const imageBlob = await imageResponse.blob()
        const imageFile = new File([imageBlob], 'original.jpg', { type: imageBlob.type })

        // Generate virtual staging using AI
        const stagingResult = await virtualStagingService.generateStaging({
          originalImage: imageFile,
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
          cloudflareImages.generateUniqueFilename(`staged_${projectImage.name || 'image'}.jpg`, user.id),
          {
            metadata: {
              userId: user.id,
              projectId,
              transformationId: transformation.id,
              type: 'staged',
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
              originalImageUrl: projectImage.url,
              originalCloudflareId: projectImage.cloudflare_id,
            },
          })
          .eq('id', transformation.id)

        // Note: In new schema, image status is tracked via transformations

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
            balance_before: profile.tokens_available,
            balance_after: profile.tokens_available - tokensRequired,
            transformation_id: transformation.id,
            description: `Generación de staging - Proyecto: ${projectImage.name || 'Sin nombre'}`,
            created_at: new Date().toISOString(),
          })

        console.log('Project image staging completed successfully:', {
          transformationId: transformation.id,
          projectId,
          imageId,
          style,
          roomType,
          processingTime: stagingResult.processingTime,
          cost: stagingResult.estimatedCostCLP
        })

      } catch (error) {
        console.error('Error processing project image generation:', error)
        
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

        // Note: In new schema, transformation status tracks the processing state
      }
    })

    return NextResponse.json({
      success: true,
      transformationId: transformation.id,
      status: 'processing',
      message: 'Transformación iniciada para imagen del proyecto',
    })
  } catch (error) {
    console.error('Project image generation error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}