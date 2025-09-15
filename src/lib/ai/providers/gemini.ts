/**
 * Google Gemini AI Provider
 * High-quality virtual staging using Gemini 2.5 Flash Image Preview
 * Now with native image generation capabilities!
 */

import type { ImageGenerationResult, AIProvider } from '../types'

interface GeminiConfig {
  apiKey: string
  apiUrl: string
  model: string
  maxPromptLength: number
}

interface GeminiImagePart {
  inline_data: {
    mime_type: string
    data: string
  }
}

interface GeminiTextPart {
  text: string
}

interface GeminiInlineData {
  inlineData: {
    mimeType: string
    data: string
  }
}

type GeminiPart = GeminiTextPart | GeminiImagePart | GeminiInlineData

export class GeminiProvider {
  private config: GeminiConfig
  readonly provider: AIProvider = 'gemini'

  constructor(config?: Partial<GeminiConfig>) {
    this.config = {
      apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY || '',
      apiUrl: 'https://generativelanguage.googleapis.com/v1beta/models',
      model: 'gemini-2.5-flash-image-preview', // Use the new image generation model
      maxPromptLength: 2000,
      ...config
    }

    if (!this.config.apiKey) {
      throw new Error('GEMINI_API_KEY or GOOGLE_AI_API_KEY environment variable is required')
    }
    
    console.log('✨ Gemini 2.5 Flash Image Preview initialized - State-of-the-art image generation enabled!')
  }

  /**
   * Generate virtual staging using Gemini's native image generation
   * Supports both text-to-image and image-to-image (editing)
   */
  async generateStaging(
    imageFile: File | null,
    prompt: string,
    options?: {
      numberOfImages?: number
      temperature?: number
      enhancePrompt?: boolean
      style?: string
      roomType?: string
      colorScheme?: string
    }
  ): Promise<ImageGenerationResult> {
    const startTime = Date.now()

    try {
      // Build the parts array based on whether we have an input image
      const parts: GeminiPart[] = []

      if (imageFile) {
        // Image-to-image editing mode
        const buffer = Buffer.from(await imageFile.arrayBuffer())
        const base64 = buffer.toString('base64')
        const mimeType = imageFile.type || 'image/jpeg'

        // Create a detailed prompt for virtual staging
        // Ensure custom prompts don't override window preservation
        const safePrompt = this.sanitizeCustomPrompt(prompt)
        const stagingPrompt = this.buildStagingPrompt(safePrompt, options)
        
        parts.push(
          { text: stagingPrompt },
          {
            inlineData: {
              mimeType: mimeType,
              data: base64
            }
          } as GeminiInlineData
        )
      } else {
        // Text-to-image generation mode
        const enhancedPrompt = this.buildTextToImagePrompt(prompt, options)
        parts.push({ text: enhancedPrompt })
      }

      // Call Gemini API with the new endpoint
      const response = await fetch(
        `${this.config.apiUrl}/${this.config.model}:generateContent`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': this.config.apiKey
          },
          body: JSON.stringify({
            contents: [{
              parts
            }],
            generationConfig: {
              temperature: options?.temperature || 0.7, // Slightly lower for more controlled output
              topK: 40,
              topP: 0.95,
              candidateCount: 1
            },
            safetySettings: [
              {
                category: "HARM_CATEGORY_HARASSMENT",
                threshold: "BLOCK_ONLY_HIGH"
              },
              {
                category: "HARM_CATEGORY_HATE_SPEECH",
                threshold: "BLOCK_ONLY_HIGH"
              },
              {
                category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                threshold: "BLOCK_ONLY_HIGH"
              },
              {
                category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                threshold: "BLOCK_ONLY_HIGH"
              }
            ]
          })
        }
      )

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Gemini API error:', response.status, errorText)
        throw new Error(`Gemini API request failed: ${response.status} - ${errorText}`)
      }

      const data = await response.json()

      // Extract generated image from response
      if (data.candidates && data.candidates[0]?.content?.parts) {
        const parts = data.candidates[0].content.parts
        
        // Log usage metadata and calculate costs
        if (data.usageMetadata) {
          const { promptTokenCount, candidatesTokenCount, totalTokenCount } = data.usageMetadata
          
          // Calculate costs based on Gemini pricing
          const inputCostUSD = (promptTokenCount / 1_000_000) * 0.30
          const imagesGenerated = Math.round(candidatesTokenCount / 1290)
          const outputCostUSD = imagesGenerated * 0.039
          const totalCostUSD = inputCostUSD + outputCostUSD
          
          console.log('💰 Gemini Image Generation Cost Analysis:')
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
          console.log(`📊 Token Usage:`)
          console.log(`   • Prompt tokens: ${promptTokenCount.toLocaleString()}`)
          console.log(`   • Output tokens: ${candidatesTokenCount.toLocaleString()} (${imagesGenerated} image${imagesGenerated > 1 ? 's' : ''})`)
          console.log(`   • Total tokens: ${totalTokenCount.toLocaleString()}`)
          console.log('')
          console.log(`💵 Cost Breakdown (USD):`)
          console.log(`   • Input cost: $${inputCostUSD.toFixed(6)}`)
          console.log(`   • Output cost: $${outputCostUSD.toFixed(4)} (${imagesGenerated} × $0.039)`)
          console.log(`   • TOTAL COST: $${totalCostUSD.toFixed(4)}`)
          console.log(`   • Cost per image: $${(totalCostUSD / imagesGenerated).toFixed(4)}`)
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
        }
        
        console.log('Gemini image generation response:', {
          candidatesCount: data.candidates.length,
          partsCount: parts.length,
          modelUsed: this.config.model,
          usageMetadata: data.usageMetadata
        })
        
        // Look for image data in response
        for (const part of parts) {
          // Handle both response formats
          const imageData = part.inlineData || part.inline_data
          
          if (imageData?.data) {
            console.log('🎨 Successfully generated image with Gemini!', {
              mimeType: imageData.mimeType || imageData.mime_type,
              dataLength: imageData.data.length
            })
            
            // Calculate actual cost from usage metadata
            let actualCostUSD = 0.039 // Default to per-image cost
            if (data.usageMetadata) {
              const { promptTokenCount, candidatesTokenCount } = data.usageMetadata
              const inputCostUSD = (promptTokenCount / 1_000_000) * 0.30
              const imagesGenerated = Math.round(candidatesTokenCount / 1290)
              const outputCostUSD = imagesGenerated * 0.039
              actualCostUSD = inputCostUSD + outputCostUSD
            }

            return {
              success: true,
              imageDataUrl: `data:${imageData.mimeType || imageData.mime_type || 'image/png'};base64,${imageData.data}`,
              cost: actualCostUSD,
              provider: this.provider,
              model: this.config.model,
              processingTime: Date.now() - startTime,
              usageMetadata: data.usageMetadata
            }
          }
        }
      }

      throw new Error('No image generated in Gemini response')

    } catch (error) {
      console.error('Gemini generation error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Gemini generation failed',
        provider: this.provider,
        model: this.config.model,
        processingTime: Date.now() - startTime
      }
    }
  }

  /**
   * Sanitize custom prompts to prevent overriding critical preservation rules
   */
  private sanitizeCustomPrompt(prompt: string): string {
    // List of keywords that might override window preservation
    const dangerousPatterns = [
      /change.*window/gi,
      /modify.*window/gi,
      /add.*curtain/gi,
      /add.*blind/gi,
      /cover.*window/gi,
      /replace.*window/gi,
      /new.*window/gi,
      /different.*window/gi,
      /alter.*window/gi,
      /transform.*window/gi
    ]
    
    let sanitized = prompt
    
    // Remove or neutralize dangerous instructions
    dangerousPatterns.forEach(pattern => {
      if (pattern.test(sanitized)) {
        console.warn(`⚠️ Removing potentially harmful instruction from prompt: ${pattern}`)
        sanitized = sanitized.replace(pattern, '')
      }
    })
    
    // Add explicit preservation reminder if windows are mentioned
    if (/window/i.test(sanitized) && !/preserve.*window/i.test(sanitized)) {
      sanitized += ' (Note: Windows must be preserved exactly as shown in original)'
    }
    
    return sanitized.trim()
  }

  /**
   * Build staging prompt for image-to-image transformation
   */
  private buildStagingPrompt(basePrompt: string, options?: any): string {
    const style = options?.style || 'Modern'
    const roomType = options?.roomType || 'auto-detect'
    const colorScheme = options?.colorScheme || 'neutral tones'
    
    return `Create a picture of this empty room transformed into a professionally staged ${roomType} space.

CRITICAL RULES - YOU MUST FOLLOW:
1. DO NOT MODIFY WINDOWS - Keep all windows EXACTLY as they are (same size, position, frame, glass, view)
2. DO NOT CHANGE WINDOW TREATMENTS - No curtains, blinds, or coverings unless already present
3. PRESERVE ALL ARCHITECTURAL FEATURES - Maintain exact room shape, walls, ceiling, doors, moldings
4. NATURAL FURNITURE PLACEMENT - Only add furniture that fits naturally in visible space
5. PARTIAL ROOM VIEWS - If room is partially visible, only furnish the visible area naturally
6. DO NOT FORCE FURNITURE - Don't squeeze furniture where it doesn't fit naturally

STYLE SPECIFICATIONS:
- Design Style: ${style} interior design aesthetic
- Color Palette: ${colorScheme}
- Custom Requirements: ${basePrompt || 'None'}

STAGING GUIDELINES:
- Add ${style.toLowerCase()} furniture appropriate for a ${roomType}
- Use realistic proportions and spacing between furniture
- Ensure natural traffic flow and accessibility
- Place furniture only where it would naturally fit
- For partial room views: Stage only what's visible, don't force complete room sets
- Maintain photorealistic quality with proper shadows and reflections
- Keep original lighting conditions and natural light from windows
- Professional real estate photography quality

REMEMBER: 
- Windows must remain UNTOUCHED - same exact appearance as original
- Only add furniture that fits naturally in the space shown
- Less is more - better to have fewer pieces placed naturally than forcing everything

Generate a single, professionally staged image that looks natural and realistic.`
  }

  /**
   * Build prompt for text-to-image generation
   */
  private buildTextToImagePrompt(basePrompt: string, options?: any): string {
    const style = options?.style || 'Modern'
    const roomType = options?.roomType || 'living room'
    const colorScheme = options?.colorScheme || 'warm neutral tones'
    
    return `Create a picture of a professionally staged ${roomType} interior.

IMPORTANT DESIGN PRINCIPLES:
1. REALISTIC WINDOWS - Include windows with natural light, proper glass reflections
2. NATURAL FURNITURE ARRANGEMENT - Space furniture realistically, don't overcrowd
3. PROPER SCALE - All furniture must be proportionally correct to room size
4. AUTHENTIC PERSPECTIVE - Use realistic camera angle (eye-level, wide-angle lens)
5. BALANCED COMPOSITION - Don't force all furniture into view if unnatural

SPECIFICATIONS:
- Room Type: ${roomType}
- Design Style: ${style} interior design
- Color Scheme: ${colorScheme}
- Special Requirements: ${basePrompt || 'None'}

QUALITY STANDARDS:
- Photorealistic rendering with accurate lighting and shadows
- Natural daylight coming through windows (if present)
- ${style.toLowerCase()} furniture and decor elements
- Professional real estate photography quality
- Proper depth of field and focus
- Realistic textures and materials
- Natural furniture spacing with clear walkways
- Balanced composition without overcrowding

COMPOSITION NOTES:
- Use a natural viewing angle (typically 5-6 feet high)
- Wide-angle perspective but not distorted
- Show a realistic portion of the room
- Better to show less furniture placed naturally than forcing everything
- Maintain visual balance and harmony

Generate a single, photorealistic staged interior that looks professionally photographed.`
  }

  /**
   * Batch generation support with the new model
   */
  async generateBatch(
    images: File[],
    prompt: string,
    options?: {
      temperature?: number
      enhancePrompt?: boolean
      style?: string
    }
  ): Promise<ImageGenerationResult[]> {
    // Process images sequentially to avoid rate limits
    const results: ImageGenerationResult[] = []

    for (const image of images) {
      const result = await this.generateStaging(image, prompt, options)
      results.push(result)
      
      // Add delay between requests to avoid rate limiting
      if (images.indexOf(image) < images.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1500))
      }
    }

    return results
  }

  /**
   * Generate image from text only (no input image)
   */
  async generateFromText(
    prompt: string,
    options?: {
      style?: string
      roomType?: string
      colorScheme?: string
      temperature?: number
    }
  ): Promise<ImageGenerationResult> {
    return this.generateStaging(null, prompt, options)
  }

  /**
   * Apply custom style to prompt
   */
  applyCustomStyle(basePrompt: string, styleTemplate: string): string {
    // Replace placeholders in style template
    let finalPrompt = styleTemplate
      .replace(/\{basePrompt\}/g, basePrompt)
      .replace(/\{quality\}/g, 'photorealistic, high-resolution, professional photography')
    
    // Add critical preservation rules
    finalPrompt = this.addPreservationRules(finalPrompt)
    
    // Add Gemini-specific optimizations for image generation
    finalPrompt += ' Create a single, beautiful staged interior image.'
    
    return finalPrompt
  }

  /**
   * Add preservation rules to any prompt to ensure windows and architecture are maintained
   */
  private addPreservationRules(prompt: string): string {
    const preservationRules = `

CRITICAL PRESERVATION RULES:
- DO NOT modify or change any windows (keep exact same size, frame, glass, view)
- DO NOT add window treatments unless specifically requested
- PRESERVE all architectural features exactly as shown
- ONLY add furniture that fits naturally in the visible space
- For partial room views, only stage what's visible
- Maintain natural proportions and spacing

${prompt}`
    
    return preservationRules
  }

  /**
   * Test connection to Gemini API
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.config.apiUrl}/${this.config.model}:generateContent`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': this.config.apiKey
          },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: 'Create a simple test image of a red circle on white background' }]
            }]
          })
        }
      )
      
      if (response.ok) {
        console.log('✅ Gemini connection test successful - Image generation ready!')
        return true
      }
      
      console.error('❌ Gemini connection test failed:', response.status)
      return false
    } catch (error) {
      console.error('❌ Gemini connection test error:', error)
      return false
    }
  }

  /**
   * Get provider information
   */
  getInfo() {
    return {
      provider: this.provider,
      model: this.config.model,
      capabilities: [
        'text_to_image',
        'image_to_image',
        'virtual_staging',
        'high_quality_generation',
        'custom_styles',
        'batch_processing',
        'interior_design',
        'exterior_design',
        'commercial_spaces',
        'multi_image_composition',
        'style_transfer',
        'high_fidelity_text_rendering'
      ],
      notes: 'Google Gemini 2.5 Flash - State-of-the-art image generation with SynthID watermark',
      maxBatchSize: 3,
      estimatedProcessingTime: '10-20 seconds',
      costPerImage: 0.04 // Estimated USD based on Gemini pricing
    }
  }
}