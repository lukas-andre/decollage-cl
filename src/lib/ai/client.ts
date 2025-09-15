/**
 * Main AI Client
 * Orchestrates between Runware (speed) and Gemini (quality) providers
 */

import { RunwareProvider } from './providers/runware'
import { GeminiProvider } from './providers/gemini'
import type { 
  ImageGenerationResult, 
  StagingRequest,
  CustomStyle,
  BatchGenerationRequest,
  BatchGenerationResult
} from './types'

export interface AIClientOptions {
  preferredProvider?: 'runware' | 'gemini'
  customStyles?: CustomStyle[]
}

export class AIClient {
  private runware: RunwareProvider
  private gemini: GeminiProvider
  private customStyles: Map<string, CustomStyle> = new Map()
  private preferredProvider: 'runware' | 'gemini' = 'runware'

  constructor(options?: AIClientOptions) {
    this.runware = new RunwareProvider()
    this.gemini = new GeminiProvider()
    
    if (options?.preferredProvider) {
      this.preferredProvider = options.preferredProvider
    }
    
    if (options?.customStyles) {
      options.customStyles.forEach(style => {
        this.customStyles.set(style.id, style)
      })
    }
  }

  /**
   * Generate virtual staging with automatic provider selection
   */
  async generateStaging(request: StagingRequest): Promise<ImageGenerationResult> {
    const prompt = this.buildPrompt(request)
    
    // Select provider based on requirements
    const provider = this.selectProvider(request)
    
    try {
      if (provider === 'gemini') {
        return await this.gemini.generateStaging(
          request.imageFile,
          prompt,
          request.options
        )
      } else {
        return await this.runware.generateStaging(
          request.imageFile,
          prompt,
          request.options
        )
      }
    } catch (error) {
      console.error(`${provider} generation failed:`, error)
      
      // Fallback to other provider
      const fallbackProvider = provider === 'runware' ? 'gemini' : 'runware'
      console.log(`Falling back to ${fallbackProvider}...`)
      
      if (fallbackProvider === 'gemini') {
        return await this.gemini.generateStaging(
          request.imageFile,
          prompt,
          request.options
        )
      } else {
        return await this.runware.generateStaging(
          request.imageFile,
          prompt,
          request.options
        )
      }
    }
  }

  /**
   * Batch generation for multiple images
   */
  async generateBatch(request: BatchGenerationRequest): Promise<BatchGenerationResult> {
    const results: ImageGenerationResult[] = []
    const errors: Array<{ imageId: string; error: string }> = []
    
    // Process in parallel with concurrency limit
    const concurrencyLimit = 3
    const chunks = []
    
    for (let i = 0; i < request.images.length; i += concurrencyLimit) {
      chunks.push(request.images.slice(i, i + concurrencyLimit))
    }
    
    for (const chunk of chunks) {
      const chunkResults = await Promise.allSettled(
        chunk.map(image => 
          this.generateStaging({
            imageFile: image.file,
            style: request.style,
            roomType: request.roomType,
            customStyleId: request.customStyleId,
            options: request.options
          })
        )
      )
      
      chunkResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          results.push(result.value)
        } else {
          errors.push({
            imageId: chunk[index].id,
            error: result.reason?.message || 'Generation failed'
          })
        }
      })
    }
    
    return {
      success: errors.length === 0,
      results,
      errors,
      totalProcessed: results.length + errors.length,
      successCount: results.length,
      failureCount: errors.length
    }
  }

  /**
   * Add or update a custom style
   */
  addCustomStyle(style: CustomStyle): void {
    this.customStyles.set(style.id, style)
  }

  /**
   * Get all custom styles
   */
  getCustomStyles(): CustomStyle[] {
    return Array.from(this.customStyles.values())
  }

  /**
   * Remove a custom style
   */
  removeCustomStyle(styleId: string): boolean {
    return this.customStyles.delete(styleId)
  }

  /**
   * Test provider connections
   */
  async testConnections(): Promise<{
    runware: boolean
    gemini: boolean
  }> {
    const [runware, gemini] = await Promise.allSettled([
      this.runware.testConnection(),
      this.gemini.testConnection(),
    ])

    return {
      runware: runware.status === 'fulfilled' && runware.value,
      gemini: gemini.status === 'fulfilled' && gemini.value,
    }
  }

  /**
   * Get information about all providers
   */
  getProvidersInfo() {
    return {
      runware: this.runware.getInfo(),
      gemini: this.gemini.getInfo(),
    }
  }

  /**
   * Select the best provider for the request
   */
  private selectProvider(request: StagingRequest): 'runware' | 'gemini' {
    // If provider is explicitly specified, use it
    if (request.options?.provider && ['runware', 'gemini'].includes(request.options.provider)) {
      return request.options.provider as 'runware' | 'gemini'
    }
    
    // Use Gemini as default for state-of-the-art image generation
    // Gemini 2.5 Flash now supports native image generation!
    if (request.customStyleId || request.options?.quality === 'high') {
      return 'gemini'
    }
    
    // Use Gemini for all room types - it handles them well
    if (request.roomType) {
      return 'gemini'
    }
    
    // Default to Gemini for best quality image generation
    return 'gemini'
  }

  /**
   * Build prompt with custom style injection
   */
  private buildPrompt(request: StagingRequest): string {
    let prompt = ''
    
    // Check for custom style
    if (request.customStyleId) {
      const customStyle = this.customStyles.get(request.customStyleId)
      if (customStyle) {
        prompt = this.applyCustomStyle(customStyle, request)
      }
    } else {
      // Build default prompt
      prompt = this.buildDefaultPrompt(
        request.style || 'modern',
        request.roomType,
        request.environment
      )
    }
    
    // Add custom prompt if provided
    if (request.prompt) {
      prompt += `. ${request.prompt}`
    }
    
    // Add dimensions if provided
    if (request.options?.dimensions) {
      const { width, height } = request.options.dimensions
      if (width || height) {
        const dimInfo = []
        if (width) dimInfo.push(`${width}m wide`)
        if (height) dimInfo.push(`${height}m high`)
        prompt += `. Room dimensions: ${dimInfo.join(' by ')}`
      }
    }
    
    return prompt
  }

  /**
   * Apply custom style to generate prompt
   */
  private applyCustomStyle(style: CustomStyle, request: StagingRequest): string {
    let prompt = style.promptTemplate
    
    // Replace variables in template
    if (request.roomType) {
      prompt = prompt.replace(/\{roomType\}/g, request.roomType.replace('_', ' '))
    }
    
    if (request.environment) {
      prompt = prompt.replace(/\{environment\}/g, request.environment)
    }
    
    // Add quality modifiers
    prompt += ' Professional staging, photorealistic quality, high resolution.'
    
    return prompt
  }

  /**
   * Build default prompt if none provided
   */
  private buildDefaultPrompt(
    style: string, 
    roomType?: string, 
    environment?: string
  ): string {
    const room = roomType?.replace('_', ' ') || 'space'
    const env = environment || 'interior'
    
    if (env === 'exterior') {
      return `Transform this outdoor ${room} into a beautiful ${style} landscape design. Professional staging with natural lighting, photorealistic quality.`
    } else if (env === 'commercial') {
      return `Transform this commercial ${room} into a professional ${style} business space. Modern staging, clean lines, photorealistic quality.`
    }
    
    return `Transform this ${room} into a beautiful ${style} interior. Professional staging, perfect lighting, photorealistic quality.`
  }

  /**
   * Set preferred provider
   */
  setPreferredProvider(provider: 'runware' | 'gemini'): void {
    this.preferredProvider = provider
  }
}

// Export singleton instance
export const aiClient = new AIClient()