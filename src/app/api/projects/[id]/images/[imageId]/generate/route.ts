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
      .from('project_images')
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
      .from('staging_styles')
      .select('id')
      .eq('code', style)
      .single()

    // Create staging generation record
    const { data: generation, error: generationError } = await supabase
      .from('staging_generations')
      .insert({
        user_id: user.id,
        project_id: projectId,
        project_image_id: imageId,
        style_id: styleData?.id,
        original_image_url: projectImage.original_image_url,
        user_prompt: customInstructions,
        tokens_consumed: tokensRequired,
        status: 'pending',
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (generationError) {
      console.error('Error creating generation:', generationError)
      return NextResponse.json(
        { error: 'Error al crear la generación' },
        { status: 500 }
      )
    }

    // Update project image status and link to generation
    await supabase
      .from('project_images')
      .update({
        staging_generation_id: generation.id,
        status: 'processing',
      })
      .eq('id', imageId)

    // Process in background to avoid timeout
    process.nextTick(async () => {
      try {
        // Update generation status to processing
        await supabase
          .from('staging_generations')
          .update({
            status: 'processing',
            started_at: new Date().toISOString(),
          })
          .eq('id', generation.id)

        // Download original image from Cloudflare
        const imageResponse = await fetch(projectImage.original_image_url)
        const imageBlob = await imageResponse.blob()
        const imageFile = new File([imageBlob], 'original.jpg', { type: imageBlob.type })

        // Generate virtual staging using AI
        const stagingResult = await virtualStagingService.generateStaging({
          originalImage: imageFile,
          style,
          roomType,
          customInstructions,
          userId: user.id,
          generationId: generation.id,
          options: {
            numberOfImages: 1,
            progressCallback: (progress) => {
              console.log(`Generation ${generation.id} progress:`, progress)
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
          cloudflareImages.generateUniqueFilename(`staged_${projectImage.image_name || 'image'}.jpg`, user.id),
          {
            metadata: {
              userId: user.id,
              projectId,
              generationId: generation.id,
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

        // Update generation record with success
        await supabase
          .from('staging_generations')
          .update({
            original_cloudflare_id: projectImage.original_cloudflare_id,
            processed_image_url: stagedImageUrls.public,
            processed_cloudflare_id: stagedImageUpload.result.id,
            prompt_used: stagingResult.finalPrompt,
            status: 'completed',
            completed_at: new Date().toISOString(),
            processing_time_ms: stagingResult.processingTime,
            metadata: {
              finalPrompt: stagingResult.finalPrompt,
              processingTime: stagingResult.processingTime,
              costBreakdown: stagingResult.costBreakdown,
              warnings: stagingResult.warnings,
            },
            generation_params: {
              style,
              roomType: roomType || null,
              customInstructions: customInstructions || null,
            }
          })
          .eq('id', generation.id)

        // Update project image status
        await supabase
          .from('project_images')
          .update({
            status: 'completed',
          })
          .eq('id', imageId)

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
            description: `Generación de staging - Proyecto: ${projectImage.image_name || 'Sin nombre'}`,
            created_at: new Date().toISOString(),
          })

        console.log('Project image staging completed successfully:', {
          generationId: generation.id,
          projectId,
          imageId,
          style,
          roomType,
          processingTime: stagingResult.processingTime,
          cost: stagingResult.estimatedCostCLP
        })

      } catch (error) {
        console.error('Error processing project image generation:', error)
        
        // Update generation record with error
        await supabase
          .from('staging_generations')
          .update({
            status: 'failed',
            completed_at: new Date().toISOString(),
            error_message: error instanceof Error ? error.message : 'Unknown error',
            metadata: {
              error: error instanceof Error ? error.message : 'Unknown error'
            }
          })
          .eq('id', generation.id)

        // Update project image status
        await supabase
          .from('project_images')
          .update({
            status: 'failed',
          })
          .eq('id', imageId)
      }
    })

    return NextResponse.json({
      success: true,
      generationId: generation.id,
      status: 'processing',
      message: 'Generación iniciada para imagen del proyecto',
    })
  } catch (error) {
    console.error('Project image generation error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}