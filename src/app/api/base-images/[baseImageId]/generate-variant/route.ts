import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { virtualStagingService } from '@/lib/ai/virtual-staging'
import { getCloudflareImages } from '@/lib/cloudflare-images'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ baseImageId: string }> }
) {
  const cookieStore = await cookies()
  const { baseImageId } = await params

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
    const { 
      style_id, 
      room_type_id, 
      color_scheme_id,
      custom_prompt,
      dimensions,
      provider = 'gemini' // Default to Gemini for state-of-the-art image generation
    } = body

    if (!style_id) {
      return NextResponse.json(
        { error: 'El estilo es requerido' },
        { status: 400 }
      )
    }

    // Verify base image ownership and get details
    const { data: baseImage, error: baseImageError } = await supabase
      .from('project_images')
      .select('*, project:projects!inner(user_id)')
      .eq('id', baseImageId)
      .single()

    if (baseImageError || !baseImage) {
      return NextResponse.json(
        { error: 'Imagen base no encontrada' },
        { status: 404 }
      )
    }

    if (baseImage.project.user_id !== user.id) {
      return NextResponse.json(
        { error: 'No autorizado para generar variantes' },
        { status: 403 }
      )
    }

    // Get user profile to check tokens
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('tokens_available')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Perfil no encontrado' },
        { status: 404 }
      )
    }

    // Get style details for token cost
    const { data: style, error: styleError } = await supabase
      .from('staging_styles')
      .select('token_cost, base_prompt, name, code')
      .eq('id', style_id)
      .single()

    if (styleError || !style) {
      return NextResponse.json(
        { error: 'Estilo no encontrado' },
        { status: 404 }
      )
    }

    const tokenCost = style.token_cost || 1

    if (profile.tokens_available < tokenCost) {
      return NextResponse.json(
        { error: 'Tokens insuficientes' },
        { status: 402 }
      )
    }

    // Get room type and color scheme details if provided
    let roomType = null
    let colorScheme = null

    if (room_type_id) {
      const { data: rt } = await supabase
        .from('room_types')
        .select('name, code')
        .eq('id', room_type_id)
        .single()
      roomType = rt
    }

    if (color_scheme_id) {
      const { data: cs } = await supabase
        .from('color_schemes')
        .select('name, code, hex_colors')
        .eq('id', color_scheme_id)
        .single()
      colorScheme = cs
    }

    // Build enhanced prompt
    let customInstructions = style.base_prompt
    if (roomType) {
      customInstructions += ` for a ${roomType.name}`
    }
    if (colorScheme) {
      const colorNames = colorScheme.name.toLowerCase()
      customInstructions += ` with ${colorNames} color palette`
    }
    
    // Add user's custom prompt if provided
    if (custom_prompt && custom_prompt.trim()) {
      customInstructions += `. ${custom_prompt.trim()}`
    }
    
    // Add dimensions to instructions if provided
    if (dimensions && (dimensions.width || dimensions.height)) {
      const dimInfo = []
      if (dimensions.width) dimInfo.push(`${dimensions.width}m wide`)
      if (dimensions.height) dimInfo.push(`${dimensions.height}m high`)
      customInstructions += `. Room dimensions: ${dimInfo.join(' by ')}`
    }

    // Create staging generation record
    const { data: generation, error: genError } = await supabase
      .from('staging_generations')
      .insert({
        user_id: user.id,
        project_id: baseImage.project_id,
        project_image_id: baseImageId,
        style_id,
        room_type_id,
        color_scheme_id,
        original_image_url: baseImage.original_image_url,
        original_cloudflare_id: baseImage.original_cloudflare_id,
        prompt_used: customInstructions,
        custom_prompt: custom_prompt || null,
        dimensions: dimensions || null,
        provider: provider,
        generation_params: {
          style_name: style.name,
          room_type_name: roomType?.name,
          color_scheme_name: colorScheme?.name,
          color_palette: colorScheme?.hex_colors,
          dimensions: dimensions || null
        },
        status: 'processing',
        tokens_consumed: tokenCost,
        is_favorite: false,
        started_at: new Date().toISOString()
      })
      .select()
      .single()

    if (genError) {
      console.error('Generation creation error:', genError)
      return NextResponse.json(
        { error: 'Error al crear generación' },
        { status: 500 }
      )
    }

    // Get current tokens_total_used value
    const { data: currentProfile } = await supabase
      .from('profiles')
      .select('tokens_total_used')
      .eq('id', user.id)
      .single()

    // Deduct tokens
    const { error: tokenError } = await supabase
      .from('profiles')
      .update({
        tokens_available: profile.tokens_available - tokenCost,
        tokens_total_used: (currentProfile?.tokens_total_used || 0) + tokenCost
      })
      .eq('id', user.id)

    if (tokenError) {
      console.error('Token deduction error:', tokenError)
      // Delete the generation record if token deduction fails
      await supabase
        .from('staging_generations')
        .delete()
        .eq('id', generation.id)
      
      return NextResponse.json(
        { error: 'Error al procesar tokens' },
        { status: 500 }
      )
    }

    // Create token transaction record
    await supabase
      .from('token_transactions')
      .insert({
        user_id: user.id,
        type: 'consumption',
        amount: -tokenCost,
        balance_before: profile.tokens_available,
        balance_after: profile.tokens_available - tokenCost,
        generation_id: generation.id,
        description: `Generación de diseño ${style.name}`
      })

    // Get current project token usage
    const { data: currentProject } = await supabase
      .from('projects')
      .select('total_tokens_used')
      .eq('id', baseImage.project_id)
      .single()

    // Update project token usage
    await supabase
      .from('projects')
      .update({
        total_tokens_used: (currentProject?.total_tokens_used || 0) + tokenCost,
        updated_at: new Date().toISOString()
      })
      .eq('id', baseImage.project_id)

    // Process generation in background
    processGeneration(
      generation.id,
      baseImage.original_image_url,
      style.code,
      roomType?.code,
      customInstructions,
      user.id,
      provider,
      dimensions,
      colorScheme?.name
    ).catch(error => {
      console.error('Background generation error:', error)
    })

    return NextResponse.json({
      success: true,
      generation: {
        ...generation,
        style,
        room_type: roomType,
        color_scheme: colorScheme
      }
    })
  } catch (error) {
    console.error('Generate variant error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// Background processing function
async function processGeneration(
  generationId: string,
  originalImageUrl: string,
  styleCode: string,
  roomTypeCode: string | undefined,
  customInstructions: string,
  userId: string,
  provider: string = 'gemini',
  dimensions?: { width?: number, height?: number },
  colorScheme?: string
) {
  const startTime = Date.now()
  const cloudflareImages = getCloudflareImages()
  
  // Simple Supabase client - RLS disabled temporarily
  const { createClient } = await import('@supabase/supabase-js')
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  try {
    // Download original image and convert to File object
    const response = await fetch(originalImageUrl)
    if (!response.ok) {
      throw new Error('Failed to fetch original image')
    }
    
    const blob = await response.blob()
    const file = new File([blob], 'original.jpg', { type: 'image/jpeg' })
    
    // Use the virtual staging service with specified provider
    const result = await virtualStagingService.generateStaging({
      originalImage: file,
      style: styleCode,
      roomType: roomTypeCode,
      customInstructions,
      userId,
      generationId,
      options: {
        numberOfImages: 1,
        enhancePrompt: true,
        provider: provider as 'runware' | 'gemini' | 'openrouter',
        dimensions: dimensions,
        colorScheme: colorScheme, // Pass color scheme for better styling
        progressCallback: (progress) => {
          console.log(`Generation ${generationId}: ${progress.step}`)
        }
      }
    })
    
    if (!result.success || (!result.stagedImageDataUrl && !result.stagedImageUrl)) {
      throw new Error(result.error || 'Virtual staging failed')
    }
    
    // Get the image data - either from data URL or by fetching the URL
    let buffer: Buffer
    
    if (result.stagedImageDataUrl) {
      // Convert data URL to buffer
      const base64Data = result.stagedImageDataUrl.split(',')[1]
      buffer = Buffer.from(base64Data, 'base64')
    } else if (result.stagedImageUrl) {
      // Fetch the image from URL
      const imageResponse = await fetch(result.stagedImageUrl)
      if (!imageResponse.ok) {
        throw new Error('Failed to fetch staged image from URL')
      }
      const arrayBuffer = await imageResponse.arrayBuffer()
      buffer = Buffer.from(arrayBuffer)
    } else {
      throw new Error('No staged image data available')
    }
    
    // Upload to Cloudflare
    const uniqueFileName = `staged-${Date.now()}-${generationId}.jpg`
    const uploadResponse = await cloudflareImages.uploadImage(
      buffer,
      uniqueFileName,
      {
        metadata: {
          generationId,
          type: 'staged_image',
          style: styleCode,
          roomType: roomTypeCode || '',
          prompt: customInstructions,
          provider: provider,
          dimensions: dimensions ? JSON.stringify(dimensions) : ''
        }
      }
    )
    
    if (!uploadResponse.success) {
      throw new Error('Failed to upload staged image to Cloudflare')
    }
    
    // Get variant URLs
    const imageUrls = cloudflareImages.getVariantUrls(uploadResponse.result.id)
    
    // Update generation record - RLS disabled temporarily
    const { error: updateError } = await supabase
      .from('staging_generations')
      .update({
        processed_image_url: imageUrls.original,
        processed_cloudflare_id: uploadResponse.result.id,
        status: 'completed',
        completed_at: new Date().toISOString(),
        processing_time_ms: Date.now() - startTime,
        metadata: {
          finalPrompt: result.finalPrompt,
          estimatedCostCLP: result.estimatedCostCLP,
          costBreakdown: result.costBreakdown,
          cloudflare_variants: imageUrls
        }
      })
      .eq('id', generationId)
    
    if (updateError) {
      console.error(`Failed to update generation ${generationId}:`, updateError)
      throw updateError
    }
    
    console.log(`✅ Generation ${generationId} completed successfully!`, {
      cloudflareId: uploadResponse.result.id,
      imageUrl: imageUrls.original,
      processingTime: Date.now() - startTime
    })
    
  } catch (error) {
    console.error(`Generation ${generationId} failed:`, error)
    
    // Update generation record with failure
    await supabase
      .from('staging_generations')
      .update({
        status: 'failed',
        error_message: error instanceof Error ? error.message : 'Unknown error',
        completed_at: new Date().toISOString(),
        processing_time_ms: Date.now() - startTime
      })
      .eq('id', generationId)
  }
}