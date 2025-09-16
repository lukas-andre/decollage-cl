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
      .from('images')
      .select('*, project:projects(user_id)')
      .eq('id', baseImageId)
      .eq('image_type', 'room')
      .single()

    if (baseImageError || !baseImage) {
      return NextResponse.json(
        { error: 'Imagen base no encontrada' },
        { status: 404 }
      )
    }

    if (baseImage.user_id !== user.id) {
      return NextResponse.json(
        { error: 'No autorizado para generar transformaciones' },
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

    // Get style details
    const { data: style, error: styleError } = await supabase
      .from('design_styles')
      .select('base_prompt, name, code')
      .eq('id', style_id)
      .single()

    if (styleError || !style) {
      return NextResponse.json(
        { error: 'Estilo no encontrado' },
        { status: 404 }
      )
    }

    const tokenCost = 1 // Standard token cost for transformations

    if (profile.tokens_available < tokenCost) {
      return NextResponse.json(
        { error: 'Tokens insuficientes' },
        { status: 402 }
      )
    }

    // Get room type and color palette details if provided
    let roomType = null
    let colorPalette = null

    if (room_type_id) {
      const { data: rt } = await supabase
        .from('room_types')
        .select('name, code')
        .eq('id', room_type_id)
        .single()
      roomType = rt
    }

    if (color_scheme_id) {
      const { data: cp } = await supabase
        .from('color_palettes')
        .select('name, code, primary_colors')
        .eq('id', color_scheme_id)
        .single()
      colorPalette = cp
    }

    // Build enhanced prompt
    let customInstructions = style.base_prompt
    if (roomType) {
      customInstructions += ` for a ${roomType.name}`
    }
    if (colorPalette) {
      const colorNames = colorPalette.name.toLowerCase()
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

    // Create transformation record
    const { data: transformation, error: transformationError } = await supabase
      .from('transformations')
      .insert({
        user_id: user.id,
        project_id: baseImage.project_id,
        base_image_id: baseImageId,
        style_id,
        palette_id: color_scheme_id || null,
        prompt_used: customInstructions,
        custom_instructions: custom_prompt || null,
        tokens_consumed: tokenCost,
        status: 'processing',
        is_favorite: false,
        is_shared: false,
        share_count: 0,
        metadata: {
          style_name: style.name,
          room_type_name: roomType?.name,
          color_palette_name: colorPalette?.name,
          color_palette: colorPalette?.primary_colors,
          dimensions: dimensions || null,
          provider: provider
        }
      })
      .select()
      .single()

    if (transformationError) {
      console.error('Transformation creation error:', transformationError)
      return NextResponse.json(
        { error: 'Error al crear transformación' },
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
      // Delete the transformation record if token deduction fails
      await supabase
        .from('transformations')
        .delete()
        .eq('id', transformation.id)
      
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
        description: `Transformación de diseño ${style.name}`
      })

    // Update project transformation count
    if (baseImage.project_id) {
      const { data: currentProject } = await supabase
        .from('projects')
        .select('total_transformations')
        .eq('id', baseImage.project_id)
        .single()

      await supabase
        .from('projects')
        .update({
          total_transformations: (currentProject?.total_transformations || 0) + 1
        })
        .eq('id', baseImage.project_id)
    }

    // Process transformation synchronously
    try {
      const result = await processTransformation(
        transformation.id,
        baseImage.url,
        style.code,
        roomType?.code,
        customInstructions,
        user.id,
        provider,
        dimensions,
        colorPalette?.name
      )

      // Fetch the updated transformation
      const { data: completedTransformation } = await supabase
        .from('transformations')
        .select(`
          *,
          design_styles!style_id(id, name, code),
          color_palettes!palette_id(id, name, code, primary_colors),
          seasonal_themes!season_id(id, name, code)
        `)
        .eq('id', transformation.id)
        .single()

      return NextResponse.json({
        success: true,
        transformation: {
          ...completedTransformation,
          style: completedTransformation?.design_styles || style,
          room_type: roomType,
          color_palette: completedTransformation?.color_palettes || colorPalette,
          design_styles: undefined,
          color_palettes: undefined,
          seasonal_themes: undefined
        }
      })
    } catch (error) {
      console.error('Transformation processing error:', error)
      // Return the initial transformation with failed status
      return NextResponse.json({
        success: false,
        error: error instanceof Error ? error.message : 'Error al procesar la transformación',
        transformation: {
          ...transformation,
          status: 'failed',
          style,
          room_type: roomType,
          color_palette: colorPalette
        }
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Generate variant error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// Processing function (now synchronous)
async function processTransformation(
  transformationId: string,
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
  
  // Service role Supabase client for background operations
  const { createClient } = await import('@supabase/supabase-js')
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
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
      generationId: transformationId,
      options: {
        numberOfImages: 1,
        enhancePrompt: true,
        provider: provider as 'runware' | 'gemini' | 'openrouter',
        dimensions: dimensions,
        colorScheme: colorScheme, // Pass color scheme for better styling
        progressCallback: (progress) => {
          console.log(`Transformation ${transformationId}: ${progress.step}`)
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
    const uniqueFileName = `transformed-${Date.now()}-${transformationId}.jpg`
    const uploadResponse = await cloudflareImages.uploadImage(
      buffer,
      uniqueFileName,
      {
        metadata: {
          transformationId,
          type: 'result_image',
          style: styleCode,
          roomType: roomTypeCode || '',
          prompt: customInstructions,
          provider: provider,
          dimensions: dimensions ? JSON.stringify(dimensions) : ''
        }
      }
    )
    
    if (!uploadResponse.success) {
      throw new Error('Failed to upload transformed image to Cloudflare')
    }
    
    // Get variant URLs
    const imageUrls = cloudflareImages.getVariantUrls(uploadResponse.result.id)
    
    // Update transformation record with service role privileges
    const { error: updateError } = await supabase
      .from('transformations')
      .update({
        result_image_url: imageUrls.original,
        result_cloudflare_id: uploadResponse.result.id,
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
      .eq('id', transformationId)
    
    if (updateError) {
      console.error(`Failed to update transformation ${transformationId}:`, updateError)
      throw updateError
    }
    
    console.log(`✅ Transformation ${transformationId} completed successfully!`, {
      cloudflareId: uploadResponse.result.id,
      imageUrl: imageUrls.original,
      processingTime: Date.now() - startTime
    })

    return {
      success: true,
      cloudflareId: uploadResponse.result.id,
      imageUrl: imageUrls.original,
      processingTime: Date.now() - startTime
    }

  } catch (error) {
    console.error(`Transformation ${transformationId} failed:`, error)

    // Update transformation record with failure
    await supabase
      .from('transformations')
      .update({
        status: 'failed',
        error_message: error instanceof Error ? error.message : 'Unknown error',
        completed_at: new Date().toISOString(),
        processing_time_ms: Date.now() - startTime
      })
      .eq('id', transformationId)

    throw error
  }
}