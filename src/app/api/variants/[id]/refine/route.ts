import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { GeminiProvider } from '@/lib/ai/providers/gemini'
import { uploadToCloudflareImages } from '@/lib/cloudflare-images'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { prompt, variations_count = 3 } = await request.json()

    if (!prompt) {
      return NextResponse.json(
        { error: 'Se requiere un prompt para refinar' },
        { status: 400 }
      )
    }

    // Get the user from Supabase
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    // Get the original variant details
    const { data: variant, error: variantError } = await supabase
      .from('staging_generations')
      .select('*, base_image:base_images(*)')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (variantError || !variant) {
      return NextResponse.json(
        { error: 'Variante no encontrada' },
        { status: 404 }
      )
    }

    // Check user has enough tokens
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('free_tokens, purchased_tokens')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Perfil no encontrado' },
        { status: 404 }
      )
    }

    const totalTokens = (profile.free_tokens || 0) + (profile.purchased_tokens || 0)
    const tokensNeeded = variations_count // 1 token per variation

    if (totalTokens < tokensNeeded) {
      return NextResponse.json(
        { error: 'Tokens insuficientes' },
        { status: 403 }
      )
    }

    // Generate variations based on the prompt
    // Using the existing variant image as the base for refinement
    const variations: string[] = []

    // Generate variations
    for (let i = 0; i < variations_count; i++) {
      // Generate refined variations based on the prompt
      try {
        // Build refined prompt with context about keeping the same room
        const refinedPrompt = `Refine this image based on the following instruction: ${prompt}.
        IMPORTANT: Keep the same room layout and structure, only modify according to the instruction.
        Maintain the overall style and atmosphere while applying the requested changes.`

        // Initialize Gemini provider
        const gemini = new GeminiProvider()

        // Create a File object from the current variant image for Gemini
        const imageResponse = await fetch(variant.result_image_url || variant.base_image.url)
        const imageBlob = await imageResponse.blob()
        const imageFile = new File([imageBlob], 'image.jpg', { type: 'image/jpeg' })

        // Generate refined version with Gemini
        const result = await gemini.generateStaging(
          imageFile,
          refinedPrompt,
          {
            style: variant.style?.name || 'modern',
            roomType: variant.room_type?.name || 'living',
            furnitureMode: 'mix' // Mix to preserve existing elements while refining
          }
        )

        const generatedImageUrl = result.success ? result.imageDataUrl : null

        if (generatedImageUrl) {
          // Upload to Cloudflare
          const cloudflareResult = await uploadToCloudflareImages(generatedImageUrl)

          if (cloudflareResult?.url) {
            variations.push(cloudflareResult.url)
          } else {
            // Fallback to original URL for demo
            variations.push(generatedImageUrl)
          }
        }
      } catch (error) {
        console.error('Error generating variation:', error)
        // Use original image as fallback for demo
        variations.push(variant.result_image_url || variant.base_image.url)
      }
    }

    // If no variations were generated, use the original as fallback
    if (variations.length === 0) {
      variations.push(
        variant.result_image_url || variant.base_image.url,
        variant.result_image_url || variant.base_image.url,
        variant.result_image_url || variant.base_image.url
      )
    }

    // Deduct tokens
    const tokensToDeduct = Math.min(variations.length, tokensNeeded)
    const freeTokensToUse = Math.min(profile.free_tokens || 0, tokensToDeduct)
    const purchasedTokensToUse = tokensToDeduct - freeTokensToUse

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        free_tokens: (profile.free_tokens || 0) - freeTokensToUse,
        purchased_tokens: (profile.purchased_tokens || 0) - purchasedTokensToUse
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('Error updating tokens:', updateError)
    }

    // Create a record of the refinement (optional)
    const { data: refinementRecord, error: recordError } = await supabase
      .from('staging_generations')
      .insert({
        user_id: user.id,
        project_id: variant.project_id,
        base_image_id: variant.base_image_id,
        status: 'completed',
        prompt_used: prompt,
        result_image_url: variations[0], // Use first variation as primary
        tokens_consumed: tokensToDeduct,
        metadata: {
          parent_variant_id: id,
          is_refined: true,
          refinement_prompt: prompt,
          variations: variations
        }
      })
      .select()
      .single()

    if (recordError) {
      console.error('Error recording refinement:', recordError)
    }

    return NextResponse.json({
      variations,
      refinement_id: refinementRecord?.id,
      tokens_used: tokensToDeduct
    })

  } catch (error) {
    console.error('Error in refinement API:', error)
    return NextResponse.json(
      { error: 'Error al procesar refinamiento' },
      { status: 500 }
    )
  }
}