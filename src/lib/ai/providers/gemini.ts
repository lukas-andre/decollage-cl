/**
 * Google Gemini AI Provider
 * High-quality virtual staging using Gemini 2.5 Flash Image Preview
 * Now with native image generation capabilities!
 */

import type { ImageGenerationResult, AIProvider } from '../types'
import { FurnitureMode } from '../types'

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
   * Sanitize and translate custom prompts to ensure everything is in English
   */
  private sanitizeCustomPrompt(prompt: string): string {
    let sanitized = prompt

    // Remove redundant window preservation instructions since they're already covered
    sanitized = sanitized
      .replace(/conserva la ventana donde esta/gi, '')
      .replace(/conserva.*ventana/gi, '')
      .replace(/mantén.*ventana/gi, '')
      .replace(/preserve.*window/gi, '')

    // Comprehensive Spanish to English translations
    const spanishToEnglish: Record<string, string> = {
      // Room types
      'cocina': 'kitchen',
      'baño': 'bathroom',
      'dormitorio': 'bedroom',
      'living': 'living room',
      'comedor': 'dining room',
      'oficina': 'office',
      'terraza': 'terrace',
      'jardín': 'garden',

      // Design terms
      'moderno': 'modern',
      'clásico': 'classic',
      'minimalista': 'minimalist',
      'rústico': 'rustic',
      'costero': 'coastal',
      'contemporáneo': 'contemporary',

      // Common phrases
      'termina el baño': 'complete the bathroom design',
      'termina el': 'complete the',
      'termina la': 'complete the',
      'transforma en': 'transform into',
      'transforma este': 'transform this',
      'transforma esta': 'transform this',
      'hermoso': 'beautiful',
      'hermosa': 'beautiful',
      'diseño interior': 'interior design',
      'diseño de interiores': 'interior design',
      'iluminación perfecta': 'perfect lighting',
      'calidad fotorrealística': 'photorealistic quality',
      'profesional staging': 'professional staging',
      'colores claros': 'light colors',
      'texturas naturales': 'natural textures',
      'elementos inspirados': 'inspired elements',
      'elementos del': 'elements of',
      'para una': 'for a',
      'para un': 'for a',
      'donde esta': 'as is',
      'con': 'with',
      'sin': 'without',
      'muy': 'very',
      'mucho': 'much',
      'poco': 'little',
      'grande': 'large',
      'pequeño': 'small',
      'pequeña': 'small',
      'amplio': 'spacious',
      'amplia': 'spacious',
      'luminoso': 'bright',
      'luminosa': 'bright',
      'oscuro': 'dark',
      'oscura': 'dark',
      'cálido': 'warm',
      'cálida': 'warm',
      'frío': 'cool',
      'fría': 'cool',
      'acogedor': 'cozy',
      'acogedora': 'cozy',
      'elegante': 'elegant',
      'sofisticado': 'sophisticated',
      'sofisticada': 'sophisticated'
    }

    // Apply translations
    Object.keys(spanishToEnglish).forEach(spanish => {
      const regex = new RegExp(spanish, 'gi')
      sanitized = sanitized.replace(regex, spanishToEnglish[spanish])
    })

    // Clean up any remaining Spanish articles and prepositions
    sanitized = sanitized
      .replace(/\bel\b/gi, 'the')
      .replace(/\bla\b/gi, 'the')
      .replace(/\blos\b/gi, 'the')
      .replace(/\blas\b/gi, 'the')
      .replace(/\bun\b/gi, 'a')
      .replace(/\buna\b/gi, 'a')
      .replace(/\bunos\b/gi, 'some')
      .replace(/\bunas\b/gi, 'some')
      .replace(/\bde\b/gi, 'of')
      .replace(/\ben\b/gi, 'in')
      .replace(/\by\b/gi, 'and')

    // Remove excessive punctuation and repetitive phrases
    sanitized = sanitized
      .replace(/\.{2,}/g, '.')
      .replace(/\s+/g, ' ')
      .trim()

    return sanitized
  }

  /**
   * Build staging prompt for image-to-image transformation
   */
  private buildStagingPrompt(basePrompt: string, options?: any): string {
    const style = options?.style || 'Modern'
    const roomType = options?.roomType || 'auto-detect'
    const colorScheme = options?.colorScheme || 'a complementary and tasteful palette'
    const furnitureMode = options?.furnitureMode || FurnitureMode.REPLACE_ALL

    // Check if this is an exterior space (facade or garden)
    const isExterior = this.isExteriorSpace(roomType)

    if (isExterior) {
      return this.buildExteriorStagingPrompt(basePrompt, style, roomType, colorScheme)
    }

    // Translate to English for model consistency
    const roomTypeEnglish = this.getRoomTypeTranslation(roomType)
    const styleEnglish = this.getStyleTranslation(style)

    // Sanitize the user's custom prompt to remove redundant instructions
    const sanitizedCustomPrompt = this.sanitizeCustomPrompt(basePrompt)

    // Get the simplified furniture instructions
    const furnitureInstructions = this.getFurnitureInstructions(furnitureMode)

    // Get extra preservation reminders for problematic room types
    const preservationReminder = this.getPreservationReminder(roomType)

    // Assemble the new, concise prompt
    const prompt = `**CRITICAL RULES - DO NOT VIOLATE UNDER ANY CIRCUMSTANCE:**

🛑 **ABSOLUTE PRESERVATION REQUIREMENTS:**
1. **NEVER modify walls** - Keep ALL walls exactly where they are. Do not move, remove, add, or cover any walls.
2. **NEVER change windows** - Windows must stay EXACTLY the same size, shape, and position. Do not make them bigger, smaller, or block them.
3. **NEVER alter perspective** - Keep the EXACT same camera angle and viewpoint. Do not rotate, shift, or change the perspective.
4. **NEVER create new structures** - Do not add walls, columns, beams, or any structural elements that don't exist.
5. **NEVER block openings** - Keep all doorways, windows, and openings completely visible and unobstructed.

✅ **YOUR TASK:**
You are doing VIRTUAL STAGING - this means you ONLY add/change:
- Furniture (sofas, chairs, tables, beds, etc.)
- Decorations (art, plants, lamps, rugs, etc.)
- Window treatments (curtains/blinds that match the ${styleEnglish} style)
- Wall colors/paint (but NOT wall structure)
- Accessories and styling elements

🎨 **Design Requirements:**
* **Room Type:** ${roomTypeEnglish} (even if image looks different, treat it as ${roomTypeEnglish})
* **Design Style:** ${styleEnglish}
* **Color Palette:** ${colorScheme}
* **Special Request:** "${sanitizedCustomPrompt || 'Apply the selected style beautifully'}"

${furnitureInstructions}

${preservationReminder}

📷 **IMPORTANT:**
- If the room doesn't look like a typical ${roomTypeEnglish}, still preserve ALL structural elements
- Focus on making it beautiful through decoration ONLY
- Think of this like decorating a real room - you cannot knock down walls or change windows!

**Generate a single photorealistic image following these rules exactly.**`

    // Log the new, cleaner prompt for debugging
    console.log('🎨 NEW CONCISE GEMINI PROMPT:')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📋 Frontend Options Received:')
    console.log(`   • Style (Original): ${style}`)
    console.log(`   • Style (English): ${styleEnglish}`)
    console.log(`   • Room Type (Original): ${roomType}`)
    console.log(`   • Room Type (English): ${roomTypeEnglish}`)
    console.log(`   • Color Scheme: ${colorScheme}`)
    console.log(`   • Furniture Mode: ${furnitureMode}`)
    console.log(`   • Custom Prompt (Original): ${basePrompt || 'None'}`)
    console.log(`   • Custom Prompt (Sanitized): ${sanitizedCustomPrompt || 'None'}`)
    console.log('')
    console.log('📝 COMPLETE PROMPT BEING SENT TO GEMINI:')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(prompt.trim())
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    return prompt.trim()
  }

  /**
   * Check if the room type is an exterior space
   */
  private isExteriorSpace(roomType: string): boolean {
    return roomType === 'fachada' || roomType === 'jardin'
  }

  /**
   * Translate Spanish room type codes to English for better AI understanding
   */
  private getRoomTypeTranslation(roomCode: string): string {
    const translations: Record<string, string> = {
      // Interior rooms
      'bano': 'bathroom',
      'bano_visitas': 'powder room',
      'bodega': 'storage room',
      'cocina': 'kitchen',
      'comedor': 'dining room',
      'dormitorio': 'bedroom',
      'dormitorio_ninos': 'kids room',
      'dormitorio_principal': 'master bedroom',
      'entrada': 'entrance',
      'home_office': 'home office',
      'living': 'living room',
      'logia': 'utility room',
      'pieza_bebe': 'nursery',
      'pieza_nina': 'girl room',
      'pieza_nino': 'boy room',
      'quincho': 'BBQ area',
      'sala_estar': 'family room',
      'sala_juegos': 'playroom',
      'terraza': 'terrace',
      // Exterior spaces
      'fachada': 'facade',
      'jardin': 'garden',
      // Legacy/fallback
      'dormitorio_infantil': 'children bedroom',
      'salon': 'living room',
      'oficina': 'home office',
      'escritorio': 'home office',
      'estudio': 'study room',
      'biblioteca': 'library',
      'vestidor': 'walk-in closet',
      'lavanderia': 'laundry room',
      'pasillo': 'hallway',
      'escalera': 'staircase',
      'balcon': 'balcony',
      'patio': 'patio',
      'antejarding': 'front yard',
      'recepcion': 'reception',
      'sala_espera': 'waiting room',
      'consultorio': 'office',
      'tienda': 'retail store'
    }

    return translations[roomCode] || roomCode.replace(/_/g, ' ')
  }

  /**
   * Validate style compatibility with room type and provide appropriate fallback
   */
  private validateStyleForRoom(style: string, roomType: string): string {
    const isExteriorRoom = this.isExteriorSpace(roomType)

    // Garden/exterior styles should only apply to exterior spaces
    const gardenStyles = ['jardin_zen', 'jardin_mediterraneo', 'jardin_moderno', 'jardin_campo_ingles', 'jardin_tropical', 'jardin_seco', 'huerto_urbano', 'jardin_plantas_nativas']
    const facadeStyles = ['fachada_moderna', 'fachada_tradicional', 'fachada_colonial', 'fachada_minimalista', 'fachada_rustica', 'fachada_industrial', 'fachada_contemporanea', 'fachada_chilena']

    if (gardenStyles.includes(style) && !isExteriorRoom) {
      console.warn(`⚠️ Garden style "${style}" applied to interior room "${roomType}". Switching to modern interior style.`)
      return 'moderno'
    }

    if (facadeStyles.includes(style) && roomType !== 'fachada') {
      console.warn(`⚠️ Facade style "${style}" applied to non-facade room "${roomType}". Switching to modern interior style.`)
      return 'moderno'
    }

    // For children's rooms, prefer child-friendly styles if available
    const childRooms = ['pieza_nino', 'pieza_nina', 'pieza_bebe', 'sala_juegos', 'dormitorio_infantil']
    const childStyles = ['aventura_exploracion', 'princesa_moderna', 'montessori_chileno', 'mundo_colores', 'espacio_compartido', 'bebe_sereno']

    if (childRooms.includes(roomType)) {
      // If it's already a child style, keep it
      if (childStyles.includes(style)) {
        return style
      }
      // If it's a garden/facade style on a child room, switch to child-appropriate style
      if (gardenStyles.includes(style) || facadeStyles.includes(style)) {
        console.warn(`⚠️ Exterior style "${style}" applied to children's room "${roomType}". Switching to child-appropriate style.`)
        return 'aventura_exploracion' // Default child style
      }
    }

    return style
  }

  /**
   * Translate Spanish style codes to English for better AI understanding
   * Uses the name_en field from the database when available
   */
  private getStyleTranslation(styleCode: string): string {
    // Comprehensive translations matching database values
    const translations: Record<string, string> = {
      // Regional styles
      'boho_valparaiso': 'Valparaiso Bohemian',
      'etnico_mapuche': 'Contemporary Mapuche Ethnic',
      'mediterraneo_chileno': 'Chilean Coastal Mediterranean',
      'mediterraneo_hacienda': 'Hacienda Mediterranean',
      'rustico_sur': 'Southern Rustic',
      'rustico_patagonico': 'Patagonian Rustic',
      'sur_chilote': 'Magical Chiloé',
      'modernismo_andino': 'Andean Modernism',
      'minimalista_santiago': 'Andean Minimalist',

      // Classic styles
      'romantico_frances': 'French Romantic',
      'campestre_frances': 'French Country',
      'colonial_britanico': 'British Colonial',
      'reina_ana': 'Queen Anne',
      'neoclasico': 'Neoclassical',
      'arts_crafts': 'Arts & Crafts',
      'victoriano': 'Victorian',

      // Modern styles
      'contemporaneo_global': 'Contemporary',
      'escandinavo_global': 'Scandinavian',
      'minimalismo_global': 'Minimalist',
      'modern_farmhouse_global': 'Modern Farmhouse',
      'moderno_clasico': 'Modern Classic',
      'moderno_costero': 'Modern Coastal',
      'nordico_adaptado': 'Adapted Nordic',
      'transicional_global': 'Transitional',
      'brutalismo': 'Brutalism',
      'industrial_global': 'Industrial',
      'industrial_urbano': 'Urban Industrial',
      'mid_century_modern': 'Mid-Century Modern',

      // Lifestyle styles
      'bohemio_global': 'Bohemian',
      'cottagecore_global': 'Cottagecore',
      'dark_academia_global': 'Dark Academia',
      'eclectico_global': 'Eclectic',
      'glam_global': 'Glam',
      'maximalismo_global': 'Maximalism',
      'shabby_chic_global': 'Shabby Chic',

      // Nature styles
      'costero_global': 'Coastal',
      'tropical_global': 'Tropical',
      'biofilico_global': 'Biophilic',
      'wabi_sabi_global': 'Wabi-Sabi',

      // Hybrid styles
      'alpino_chic': 'Alpine Chic',
      'americana_global': 'Americana',
      'desierto_moderno': 'Desert Modern',
      'dopamine_decor': 'Dopamine Decor',
      'japandi_global': 'Japandi',
      'organico_moderno': 'Organic Modern',
      'rustico_moderno_global': 'Rustic Modern',

      // Historic/Luxury styles
      'art_deco': 'Art Deco',
      'art_nouveau': 'Art Nouveau',
      'gotico': 'Gothic',

      // Global/Regional styles
      'marroqui_global': 'Moroccan',
      'mediterraneo_global': 'Mediterranean',
      'suroeste_global': 'Southwestern',
      'toscano_global': 'Tuscan',

      // Children's styles
      'mundo_colores': 'World of Colors',
      'montessori_chileno': 'Chilean Montessori',
      'espacio_compartido': 'Shared Sibling Space',
      'bebe_sereno': 'Serene Nursery',
      'aventura_exploracion': 'Adventure & Exploration',
      'princesa_moderna': 'Modern Princess',

      // Garden styles
      'jardin_zen': 'Japanese Zen Garden',
      'jardin_mediterraneo': 'Rustic Mediterranean Garden',
      'jardin_moderno': 'Modern Sculptural Garden',
      'jardin_campo_ingles': 'English Cottage Garden',
      'jardin_tropical': 'Lush Tropical Garden',
      'jardin_seco': 'Dry Climate Xeriscape',
      'huerto_urbano': 'Urban Edible Garden',
      'jardin_nativo_chileno': 'Native Chilean Wild Garden',

      // Facade styles
      'fachada_colonial_chilena': 'Chilean Hacienda Colonial Facade',
      'fachada_moderna_concreto': 'Modern Concrete and Wood Facade',
      'fachada_valparaiso': 'Valparaíso Port-Style Facade',
      'fachada_industrial_loft': 'Industrial Loft Facade',
      'fachada_surena_tejuelas': 'Southern Chilean Wood Shingle Facade',
      'fachada_mediterranea_costera': 'Coastal Mediterranean Facade',
      'fachada_tudor': 'Tudor Style Facade',
      'fachada_brutalista': 'Brutalist Facade',

      // Custom
      'personalizado': 'Custom'
    }

    // Return the translation or clean up the code as fallback
    return translations[styleCode] || styleCode.replace(/_/g, ' ')
  }

  /**
   * Get room-specific requirements and considerations
   */
  private getRoomSpecificRequirements(roomType: string): string {
    const roomTypeEnglish = this.getRoomTypeTranslation(roomType)
    const requirements: Record<string, string> = {
      'bano': `BATHROOM-SPECIFIC REQUIREMENTS:
- Maintain all plumbing fixtures in their current positions
- Use waterproof and moisture-resistant materials
- Ensure proper ventilation considerations
- Include appropriate bathroom furniture: vanity, mirror, towel storage, shower curtain/glass
- Focus on spa-like, clean, and functional design
- Consider tile, stone, or waterproof surfaces`,

      'bano_visitas': `GUEST BATHROOM-SPECIFIC REQUIREMENTS:
- Maintain all plumbing fixtures in their current positions
- Create a welcoming, hotel-like atmosphere
- Include guest-appropriate amenities: hand towels, soap dispenser, small decor
- Keep design sophisticated but not overly personal
- Ensure easy maintenance and cleaning`,

      'pieza_nino': `BOY BEDROOM-SPECIFIC REQUIREMENTS:
- Create age-appropriate, adventurous, and educational environment
- Include study area with desk and good lighting
- Provide adequate storage for toys, clothes, and books
- Use durable, child-safe materials and furniture
- Consider growth adaptability - furniture that can evolve
- Focus on inspiring creativity and learning`,

      'pieza_nina': `GIRL BEDROOM-SPECIFIC REQUIREMENTS:
- Create inspiring, comfortable, and personalized environment
- Include study/creative area with good lighting
- Provide adequate storage for clothes, accessories, and personal items
- Use safe, age-appropriate materials and colors
- Consider growth adaptability - timeless design elements
- Focus on both beauty and functionality`,

      'pieza_bebe': `BABY NURSERY-SPECIFIC REQUIREMENTS:
- Prioritize safety above all - no sharp edges, secure furniture
- Include essential nursery furniture: crib, changing area, comfortable chair
- Ensure blackout capabilities for proper sleep
- Use non-toxic, hypoallergenic materials only
- Create a calm, soothing atmosphere with soft colors
- Provide adequate storage for baby items and supplies`,

      'sala_juegos': `PLAYROOM-SPECIFIC REQUIREMENTS:
- Prioritize safety with soft surfaces and rounded edges
- Include ample storage for toys and games
- Create different activity zones: reading, building, creative play
- Use durable, easy-to-clean surfaces and materials
- Ensure good lighting for various activities
- Focus on organization and accessibility for children`,

      'dormitorio_infantil': `CHILDREN'S BEDROOM-SPECIFIC REQUIREMENTS:
- Create a balanced environment for sleep, play, and study
- Include age-appropriate furniture with safety considerations
- Provide organized storage solutions for various items
- Use durable, child-safe materials and finishes
- Consider adaptability as children grow
- Focus on both comfort and developmental support`,

      'cocina': `KITCHEN-SPECIFIC REQUIREMENTS:
- Maintain the kitchen work triangle (sink, stove, refrigerator)
- Ensure all appliances and fixtures remain in current positions
- Focus on functionality, storage, and food preparation areas
- Use appropriate materials: countertops, backsplash, cabinetry
- Ensure proper lighting for cooking and food preparation
- Create an inviting space for both cooking and socializing`,

      'comedor': `DINING ROOM-SPECIFIC REQUIREMENTS:
- Center design around dining table as focal point
- Ensure proper seating capacity and comfortable circulation
- Include appropriate storage for dining items (buffet, china cabinet)
- Create ambiance suitable for meals and entertaining
- Consider lighting for both dining and social activities
- Focus on elegance and hospitality`
    }

    return requirements[roomType] || `${roomTypeEnglish.toUpperCase()}-SPECIFIC REQUIREMENTS:
- Design specifically for ${roomTypeEnglish} functionality and use
- Include appropriate furniture and fixtures for a ${roomTypeEnglish}
- Ensure the design serves the primary purpose of a ${roomTypeEnglish}
- Consider the typical activities that occur in a ${roomTypeEnglish}`
  }

  /**
   * Build specialized staging prompt for exterior spaces (facades and gardens)
   */
  private buildExteriorStagingPrompt(
    basePrompt: string,
    style: string,
    roomType: string,
    colorScheme: string
  ): string {
    const isFacade = roomType === 'fachada'
    const spaceType = isFacade ? 'facade' : 'garden'
    const spaceDescription = isFacade ? 'facade/exterior' : 'garden/landscape'
    const styleEnglish = this.getStyleTranslation(style)

    const prompt = `**CRITICAL RULES FOR EXTERIOR TRANSFORMATION:**

🛑 **NEVER VIOLATE THESE RULES:**
1. **Keep EXACT building shape** - Do not change the building's size, height, or proportions
2. **Preserve ALL windows and doors** - Keep them exactly where they are, same size
3. **Maintain perspective** - Use the EXACT same camera angle
4. **No structural changes** - Only change colors, materials, and decorative elements

✅ **Transform this ${spaceDescription} with ${styleEnglish} design:

CRITICAL PRESERVATION RULES FOR EXTERIOR SPACES - ABSOLUTELY MANDATORY:
${isFacade ? this.getFacadePreservationRules() : this.getGardenPreservationRules()}

DESIGN TRANSFORMATION FOR ${spaceType.toUpperCase()}:
${isFacade ? this.getFacadeDesignInstructions(style, colorScheme) : this.getGardenDesignInstructions(style, colorScheme)}

CUSTOM REQUIREMENTS:
${basePrompt || 'Apply the selected style while respecting preservation rules'}

QUALITY STANDARDS:
- Photorealistic rendering with accurate lighting and shadows
- Natural outdoor lighting conditions (daylight, golden hour, or appropriate time)
- High-resolution architectural/landscape photography quality
- Proper depth of field and perspective
- Realistic textures and materials appropriate for Chilean climate
- Professional exterior design photography composition
- Weather-appropriate design choices for Chilean seasons

CHILEAN CONTEXT CONSIDERATIONS:
- Mediterranean climate compatibility
- Local architectural styles and materials
- Native and adapted plant species (for gardens)
- Chilean cultural aesthetic preferences
- Sustainable and climate-appropriate design choices

Generate a single, photorealistic ${spaceDescription} transformation that looks professionally designed and photographed.`

    // Log exterior-specific prompt details
    console.log(`🏡 EXTERIOR SPACE PROMPT GENERATION - ${spaceType.toUpperCase()}:`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('🌿 Exterior Options Applied:')
    console.log(`   • Space Type: ${spaceType}`)
    console.log(`   • Style: ${style}`)
    console.log(`   • Color Scheme: ${colorScheme}`)
    console.log(`   • Custom Requirements: ${basePrompt || 'None'}`)
    console.log('')
    console.log('📝 EXTERIOR PROMPT SENT TO GEMINI:')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(prompt)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    return prompt
  }

  /**
   * Get preservation rules specific to facade transformations
   */
  private getFacadePreservationRules(): string {
    return `1. PRESERVE BUILDING STRUCTURE - Keep the exact same building shape, roofline, and overall architecture
2. MAINTAIN WINDOW POSITIONS - Do not move, resize, or change window locations or proportions
3. PRESERVE DOOR LOCATIONS - Keep all doors in their current positions and sizes
4. RESPECT STRUCTURAL ELEMENTS - Maintain columns, beams, architectural details exactly as shown
5. KEEP BUILDING PROPORTIONS - Do not alter the building's height, width, or overall dimensions
6. PRESERVE EXISTING HARDSCAPE - Keep driveways, walkways, and permanent structures as they are
7. MAINTAIN BUILDING FOUNDATION - Do not change the ground level or foundation appearance
8. RESPECT UTILITY ELEMENTS - Keep visible utility connections, meters, etc. in their current state

ALLOWED FACADE CHANGES:
- Exterior wall colors, paint, and finishes
- Exterior materials and textures (while maintaining structural integrity)
- Window frames and door finishes (keeping same sizes and positions)
- Landscaping around the building perimeter
- Lighting fixtures and architectural accents
- Decorative elements that don't alter structure
- Porch/entrance styling within existing framework`
  }

  /**
   * Get preservation rules specific to garden/landscape transformations
   */
  private getGardenPreservationRules(): string {
    return `1. PRESERVE EXISTING STRUCTURES - Keep all permanent structures (walls, fences, buildings) exactly as shown
2. MAINTAIN HARDSCAPE ELEMENTS - Preserve existing patios, decks, walkways, and paved areas
3. RESPECT PROPERTY BOUNDARIES - Do not extend beyond visible property lines
4. KEEP ELEVATION CHANGES - Maintain existing slopes, retaining walls, and grade changes
5. PRESERVE UTILITIES - Keep visible utilities, sprinkler systems, outdoor fixtures in place
6. MAINTAIN ACCESS WAYS - Preserve existing paths and functional circulation routes
7. RESPECT MATURE TREES - Keep large, established trees unless specifically noted for removal
8. PRESERVE VIEWS - Maintain important sight lines and views

ALLOWED GARDEN CHANGES:
- Plant selection and arrangement (respecting mature trees)
- Garden bed designs and layouts
- Decorative landscaping elements (rocks, decorative features)
- Outdoor furniture and moveable elements
- Lighting and irrigation improvements
- Ground cover and lawn alternatives
- Garden art and decorative accessories
- Seasonal plantings and flower arrangements`
  }

  /**
   * Get design instructions specific to facade transformations
   */
  private getFacadeDesignInstructions(style: string, colorScheme: string): string {
    return `- Apply ${style} architectural style to exterior finishes and materials
- Use ${colorScheme} color palette for exterior paint, trim, and accents
- Focus on exterior materials: siding, brick, stone, stucco, metal, wood treatments
- Enhance architectural details: trim, moldings, decorative elements, hardware
- Update lighting fixtures to complement the ${style} style
- Improve entrance area styling and curb appeal
- Add appropriate landscaping elements around building perimeter
- Consider Chilean climate-appropriate materials and finishes
- Ensure color choices work well with natural Chilean light conditions
- Focus on creating strong architectural character and curb appeal
- Balance modern updates with respect for existing architectural integrity`
  }

  /**
   * Get design instructions specific to garden/landscape transformations
   */
  private getGardenDesignInstructions(style: string, colorScheme: string): string {
    return `- Create a ${style} landscape design using ${colorScheme} color harmony
- Select plants appropriate for Chilean Mediterranean climate
- Design garden beds, borders, and planting arrangements in ${style} aesthetic
- Include appropriate hardscape elements: pathways, patios, garden structures
- Add outdoor furniture and accessories that complement the ${style} style
- Consider seasonal interest and year-round visual appeal
- Incorporate water features, garden art, or focal points as appropriate
- Plan for proper plant spacing and mature growth patterns
- Use native and adapted plant species suitable for local climate
- Create functional outdoor living spaces within the landscape design
- Balance formal and informal elements according to ${style} principles
- Ensure sustainable and low-maintenance design approaches`
  }

  /**
   * Add critical preservation reminder for problematic cases
   */
  private getPreservationReminder(roomType: string): string {
    // Extra reminders for rooms where AI tends to modify structures
    const problematicRooms = ['cocina', 'kitchen', 'bano', 'bathroom', 'terraza', 'terrace', 'balcon', 'balcony']
    const roomTypeNormalized = roomType.toLowerCase()

    if (problematicRooms.includes(roomTypeNormalized)) {
      return `
⚠️ **EXTRA CRITICAL FOR ${roomType.toUpperCase()}:**
- This room often has windows/openings - DO NOT block or modify them
- Kitchen/bathroom fixtures stay EXACTLY where they are
- If there's a large window or glass door, it must remain FULLY visible
- Counters and cabinets can be restyled but NOT moved or resized
- The room layout and structure is PERMANENT - only decoration changes`
    }

    return ''
  }

  /**
   * Get furniture-specific instructions based on preservation mode
   */
  private getFurnitureInstructions(furnitureMode: string): string {
    switch (furnitureMode) {
      case FurnitureMode.KEEP_ALL:
        return `**Furniture Mode: Keep Existing**. Keep all original furniture in its exact position. Your changes are purely decorative (e.g., wall color, art, plants).`;
  
      case FurnitureMode.KEEP_REPOSITION:
        return `**Furniture Mode: Keep & Reposition**. Use all the original furniture pieces but rearrange them for an optimal layout. Do not add or remove items.`;
  
      case FurnitureMode.KEEP_ADD_MORE:
        return `**Furniture Mode: Keep & Add**. Keep the original furniture as is. Add new, complementary items that match the requested style to enhance the space.`;
  
      case FurnitureMode.MIX:
        return `**Furniture Mode: Smart Mix**. Creatively blend old and new. You may remove some original items and add new ones to create a harmonious design.`;
  
      case FurnitureMode.REPLACE_ALL:
      default:
        return `**Furniture Mode: Complete Redesign**. Remove all original furniture. Design a completely new layout with new pieces that fit the requested style.`;
    }
  }

  /**
   * Build prompt for text-to-image generation
   */
  private buildTextToImagePrompt(basePrompt: string, options?: any): string {
    const style = options?.style || 'Modern'
    const roomType = options?.roomType || 'living room'
    const colorScheme = options?.colorScheme || 'warm neutral tones'

    // Check if this is an exterior space for text-to-image generation
    const isExterior = this.isExteriorSpace(roomType)

    if (isExterior) {
      return this.buildExteriorTextToImagePrompt(basePrompt, style, roomType, colorScheme)
    }

    const roomTypeEnglish = this.getRoomTypeTranslation(roomType)
    const styleEnglish = this.getStyleTranslation(style)

    return `Create a picture of a professionally staged ${roomTypeEnglish} interior.

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
   * Build text-to-image prompt for exterior spaces (facades and gardens)
   */
  private buildExteriorTextToImagePrompt(
    basePrompt: string,
    style: string,
    roomType: string,
    colorScheme: string
  ): string {
    const isFacade = roomType === 'fachada'
    const spaceType = isFacade ? 'facade' : 'garden'
    const spaceDescription = isFacade ? 'house facade/exterior' : 'garden/landscape'

    return `Create a picture of a professionally designed ${spaceDescription}.

IMPORTANT DESIGN PRINCIPLES FOR ${spaceType.toUpperCase()}:
${isFacade ? this.getFacadeTextToImagePrinciples() : this.getGardenTextToImagePrinciples()}

SPECIFICATIONS:
- Space Type: ${spaceDescription}
- Design Style: ${style} ${isFacade ? 'architectural' : 'landscape'} design
- Color Scheme: ${colorScheme}
- Special Requirements: ${basePrompt || 'None'}

QUALITY STANDARDS:
- Photorealistic rendering with accurate outdoor lighting and shadows
- Natural daylight or golden hour lighting conditions
- High-resolution ${isFacade ? 'architectural' : 'landscape'} photography quality
- Proper perspective and composition
- Realistic textures and materials appropriate for Chilean climate
- Professional ${isFacade ? 'real estate' : 'landscape'} photography composition
- Weather-appropriate design choices

CHILEAN CONTEXT:
- Mediterranean climate compatibility
- Local architectural styles and materials common in Chile
${isFacade ? '- Traditional Chilean house design elements' : '- Native and adapted plant species suitable for Chilean gardens'}
- Cultural aesthetic preferences for Chilean homeowners
- Sustainable design appropriate for Chilean environment

COMPOSITION NOTES:
- Use a natural viewing angle and perspective
- Wide-angle view but not distorted
- Show a realistic and complete view of the ${spaceDescription}
- Professional photography composition with good balance
- Maintain visual harmony and aesthetic appeal

Generate a single, photorealistic ${spaceDescription} that looks professionally designed and photographed.`
  }

  /**
   * Get design principles for facade text-to-image generation
   */
  private getFacadeTextToImagePrinciples(): string {
    return `1. REALISTIC ARCHITECTURE - Create believable house proportions and architectural elements
2. PROPER SCALE - All architectural elements must be proportionally correct
3. AUTHENTIC PERSPECTIVE - Use realistic camera angle for house photography
4. NATURAL LIGHTING - Proper exterior lighting with shadows and highlights
5. COMPLETE COMPOSITION - Show the full facade view with appropriate context
6. STRUCTURAL INTEGRITY - Ensure the building looks structurally sound and realistic
7. CONTEXTUAL LANDSCAPING - Include appropriate surrounding landscape elements
8. MATERIAL AUTHENTICITY - Use realistic building materials and finishes`
  }

  /**
   * Get design principles for garden text-to-image generation
   */
  private getGardenTextToImagePrinciples(): string {
    return `1. NATURAL LANDSCAPING - Create believable garden proportions and plant arrangements
2. PROPER PLANT SCALE - All plants and landscape elements must be proportionally correct
3. REALISTIC PERSPECTIVE - Use natural garden photography viewpoint
4. OUTDOOR LIGHTING - Proper natural lighting with realistic shadows
5. SEASONAL APPROPRIATENESS - Plants and garden should look seasonally appropriate
6. ECOLOGICAL BALANCE - Create a realistic and sustainable landscape design
7. FUNCTIONAL DESIGN - Include pathways, seating, and usable outdoor spaces
8. CLIMATE COMPATIBILITY - Use plants and materials suitable for the climate shown`
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