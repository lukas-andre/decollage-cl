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
      .from('staging_styles')
      .select('id')
      .eq('code', style)
      .single()

    // Create staging generation record
    const { data: generation, error: generationError } = await supabase
      .from('staging_generations')
      .insert({
        user_id: user.id,
        style_id: styleData?.id,
        original_image_url: '', // Will be updated after upload
        processed_image_url: '', // Will be updated after generation (changed from staged_image_url)
        user_prompt: customInstructions,
        tokens_consumed: tokensRequired,
        status: 'pending',
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (generationError) {
      return NextResponse.json(
        { error: 'Error al crear la generación' },
        { status: 500 }
      )
    }

    // Process in background to avoid timeout
    // In production, this should be handled by a queue system
    process.nextTick(async () => {
      try {
        // Update status to processing
        await supabase
          .from('staging_generations')
          .update({
            status: 'processing',
            updated_at: new Date().toISOString(),
          })
          .eq('id', generation.id)

        // Upload original image to Cloudflare
        const originalImageUpload = await cloudflareImages.uploadImage(
          image,
          cloudflareImages.generateUniqueFilename(image.name, user.id),
          {
            metadata: {
              userId: user.id,
              generationId: generation.id,
              type: 'original',
            }
          }
        )

        if (!originalImageUpload.success) {
          throw new Error('Failed to upload original image')
        }

        const originalImageUrls = cloudflareImages.getVariantUrls(originalImageUpload.result.id)

        // Generate virtual staging using AI
        const stagingResult = await virtualStagingService.generateStaging({
          originalImage: image,
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
          cloudflareImages.generateUniqueFilename(`staged_${image.name}`, user.id),
          {
            metadata: {
              userId: user.id,
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
            original_image_url: originalImageUrls.public,
            original_cloudflare_id: originalImageUpload.result.id,
            processed_image_url: stagedImageUrls.public, // Changed from staged_image_url
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
            generation_id: generation.id,
            created_at: new Date().toISOString(),
            metadata: {
              aiCost: stagingResult.estimatedCostCLP,
              processingTime: stagingResult.processingTime,
            }
          })

        console.log('Virtual staging completed successfully:', {
          generationId: generation.id,
          style,
          roomType,
          processingTime: stagingResult.processingTime,
          cost: stagingResult.estimatedCostCLP
        })

      } catch (error) {
        console.error('Error processing generation:', error)
        
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
      }
    })

    return NextResponse.json({
      success: true,
      generationId: generation.id,
      status: 'processing',
      message: 'Generación iniciada',
    })
  } catch (error) {
    console.error('Generation error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// Get generation status
export async function GET(request: NextRequest) {
  const cookieStore = await cookies()
  const { searchParams } = new URL(request.url)
  const generationId = searchParams.get('id')

  if (!generationId) {
    return NextResponse.json(
      { error: 'ID de generación requerido' },
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

    // Get generation details
    const { data: generation, error: generationError } = await supabase
      .from('staging_generations')
      .select('*')
      .eq('id', generationId)
      .eq('user_id', user.id) // Ensure user owns the generation
      .single()

    if (generationError || !generation) {
      return NextResponse.json(
        { error: 'Generación no encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      id: generation.id,
      status: generation.status,
      style: generation.style_id,
      originalImageUrl: generation.original_image_url,
      stagedImageUrl: generation.processed_image_url, // Changed from staged_image_url
      tokensUsed: generation.tokens_consumed, // Changed from tokens_used
      createdAt: generation.created_at,
      updatedAt: generation.completed_at || generation.created_at,
      errorMessage: generation.error_message,
    })
  } catch {
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}