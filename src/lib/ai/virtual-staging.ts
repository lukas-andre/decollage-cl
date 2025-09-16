/**
 * Virtual Staging Service
 * Main service that orchestrates the virtual staging process
 */

import { aiClient } from './client';
import { generateStagingPrompt, STAGING_STYLES, ROOM_TYPES } from './prompts';
import { ProgressTracker, aiRateLimiter } from './retry';
import { costTracker } from './cost-tracking';
import type { 
  CustomStyle, 
  BatchGenerationRequest, 
  BatchGenerationResult 
} from './types';

export interface VirtualStagingRequest {
  // Input data
  originalImage: File;
  style?: string;
  roomType?: string;
  environment?: 'interior' | 'exterior' | 'commercial';
  customStyleId?: string;
  customInstructions?: string;
  
  // Options
  options?: {
    numberOfImages?: number;
    aspectRatio?: string;
    enhancePrompt?: boolean;
    quality?: 'fast' | 'balanced' | 'high';
    isPriority?: boolean;
    provider?: 'runware' | 'gemini' | 'openrouter';
    dimensions?: { width?: number; height?: number };
    colorScheme?: string;
    furnitureMode?: string;
    progressCallback?: (progress: { step: string; percentage?: number }) => void;
  };
  
  // User context
  userId: string;
  generationId: string;
}

export interface VirtualStagingResult {
  success: boolean;
  generationId: string;
  
  // Results
  stagedImageDataUrl?: string;
  stagedImageUrl?: string;
  originalImageDataUrl?: string;
  finalPrompt?: string;
  
  // Metadata
  style?: string;
  customStyleId?: string;
  roomType?: string;
  environment?: string;
  processingTime: number;
  provider: 'runware' | 'gemini' | 'openrouter';
  
  // Cost information
  estimatedCostCLP: number;
  costBreakdown: {
    imageGeneration: number;
    total: number;
  };
  
  // Error information
  error?: string;
  warnings?: string[];
}

export interface BatchStagingRequest {
  images: Array<{
    id: string;
    file: File;
  }>;
  style?: string;
  roomType?: string;
  environment?: 'interior' | 'exterior' | 'commercial';
  customStyleId?: string;
  customInstructions?: string;
  options?: {
    quality?: 'fast' | 'balanced' | 'high';
    progressCallback?: (progress: { 
      step: string; 
      percentage?: number;
      currentImage?: number;
      totalImages?: number;
    }) => void;
  };
  userId: string;
}

export interface BatchStagingResult {
  success: boolean;
  results: VirtualStagingResult[];
  errors: Array<{
    imageId: string;
    error: string;
  }>;
  totalProcessed: number;
  successCount: number;
  failureCount: number;
  totalCostCLP: number;
  processingTime: number;
}

export class VirtualStagingService {
  private customStyles: Map<string, CustomStyle> = new Map();

  constructor() {}

  /**
   * Generate virtual staging for a single image
   */
  async generateStaging(request: VirtualStagingRequest): Promise<VirtualStagingResult> {
    const startTime = Date.now();
    const progressTracker = new ProgressTracker(request.options?.progressCallback);
    const warnings: string[] = [];

    // Initialize result
    const result: VirtualStagingResult = {
      success: false,
      generationId: request.generationId,
      style: request.style,
      customStyleId: request.customStyleId,
      roomType: request.roomType,
      environment: request.environment,
      processingTime: 0,
      provider: request.options?.provider || 'runware', // Default to Runware for actual generation
      estimatedCostCLP: 0,
      costBreakdown: {
        imageGeneration: 0,
        total: 0,
      },
    };

    try {
      // Step 1: Validate inputs
      progressTracker.update('Validating input', 10);
      await this.validateRequest(request);

      // Step 2: Wait for rate limit if necessary
      progressTracker.update('Checking rate limits', 20);
      await aiRateLimiter.waitForToken();

      // Step 3: Estimate costs
      progressTracker.update('Calculating costs', 30);
      const costEstimate = this.estimateCosts(request);
      result.estimatedCostCLP = costEstimate.total;
      result.costBreakdown = costEstimate;

      // Step 4: Generate staged image using AI client
      progressTracker.update('Generating staged image', 50);
      
      const generationResult = await aiClient.generateStaging({
        imageFile: request.originalImage,
        style: request.style,
        roomType: request.roomType,
        environment: request.environment,
        customStyleId: request.customStyleId,
        prompt: request.customInstructions,
        options: {
          numberOfImages: request.options?.numberOfImages || 1,
          enhancePrompt: request.options?.enhancePrompt,
          quality: request.options?.quality,
          provider: request.options?.provider || 'gemini', // Default to Gemini for best quality
          dimensions: request.options?.dimensions,
          style: request.style, // Pass style for Gemini's prompt building
          roomType: request.roomType, // Pass room type for better context
          colorScheme: request.options?.colorScheme, // Pass color scheme if available
          furnitureMode: request.options?.furnitureMode, // Pass furniture preservation mode
        },
      });

      if (!generationResult.success) {
        throw new Error(generationResult.error || 'Image generation failed');
      }

      // Step 5: Process results
      progressTracker.update('Processing results', 90);
      
      // Store the results
      if (generationResult.imageDataUrl) {
        result.stagedImageDataUrl = generationResult.imageDataUrl;
      } else if (generationResult.imageUrl) {
        result.stagedImageUrl = generationResult.imageUrl;
      }
      
      result.provider = generationResult.provider;
      result.success = true;
      result.warnings = warnings;

      // Step 6: Track costs with Gemini metadata if available
      progressTracker.update('Finalizing', 100);
      
      // If we have Gemini usage metadata, calculate exact costs
      if (generationResult.usageMetadata && generationResult.provider === 'gemini') {
        const geminiCost = costTracker.calculateGeminiCost(generationResult.usageMetadata);
        result.estimatedCostCLP = geminiCost.totalCostCLP;
        result.costBreakdown = {
          imageGeneration: geminiCost.outputCostCLP,
          total: geminiCost.totalCostCLP
        };
        
        // Track with exact cost
        costTracker.trackOperation({
          userId: request.userId,
          operationType: 'gemini_generation',
          model: `${generationResult.provider}-${generationResult.model}`,
          inputTokens: generationResult.usageMetadata.promptTokenCount,
          outputTokens: generationResult.usageMetadata.candidatesTokenCount,
          estimatedCostCLP: geminiCost.totalCostCLP,
          geminiCostUSD: geminiCost.totalCostUSD,
          generationId: request.generationId,
          imagesGenerated: geminiCost.imagesGenerated,
          metadata: {
            usageMetadata: generationResult.usageMetadata,
            costBreakdown: {
              inputCostUSD: geminiCost.inputCostUSD,
              outputCostUSD: geminiCost.outputCostUSD,
              costPerImageUSD: geminiCost.costPerImageUSD
            }
          }
        });
      } else {
        // Track with estimated cost
        costTracker.trackOperation({
          userId: request.userId,
          operationType: 'virtual_staging',
          model: generationResult.provider,
          estimatedCostCLP: result.estimatedCostCLP,
          generationId: request.generationId,
          imagesGenerated: 1,
        });
      }

    } catch (error) {
      console.error('Virtual staging error:', error);
      result.error = error instanceof Error ? error.message : 'Unknown error occurred';
      result.warnings = warnings;

      // Track failed generation
      costTracker.trackOperation({
        userId: request.userId,
        operationType: 'virtual_staging',
        model: 'runware',
        estimatedCostCLP: 0,
        generationId: request.generationId,
      });
    }

    result.processingTime = Date.now() - startTime;
    return result;
  }

  /**
   * Generate virtual staging for multiple images (batch)
   */
  async generateBatchStaging(request: BatchStagingRequest): Promise<BatchStagingResult> {
    const startTime = Date.now();
    const progressCallback = request.options?.progressCallback;
    
    // Update progress
    if (progressCallback) {
      progressCallback({
        step: 'Starting batch generation',
        percentage: 0,
        currentImage: 0,
        totalImages: request.images.length
      });
    }

    // Use AI client's batch generation
    const batchResult = await aiClient.generateBatch({
      images: request.images,
      style: request.style,
      roomType: request.roomType,
      environment: request.environment,
      customStyleId: request.customStyleId,
      options: {
        quality: request.options?.quality
      }
    });

    // Convert to staging results
    const stagingResults: VirtualStagingResult[] = [];
    let totalCost = 0;

    batchResult.results.forEach((result, index) => {
      const stagingResult: VirtualStagingResult = {
        success: result.success,
        generationId: request.images[index].id,
        stagedImageDataUrl: result.imageDataUrl,
        stagedImageUrl: result.imageUrl,
        style: request.style,
        customStyleId: request.customStyleId,
        roomType: request.roomType,
        environment: request.environment,
        processingTime: result.processingTime,
        provider: result.provider,
        estimatedCostCLP: this.convertToCLP(result.cost || 0),
        costBreakdown: {
          imageGeneration: this.convertToCLP(result.cost || 0),
          total: this.convertToCLP(result.cost || 0)
        },
        error: result.error
      };
      
      stagingResults.push(stagingResult);
      totalCost += stagingResult.estimatedCostCLP;

      // Update progress
      if (progressCallback) {
        progressCallback({
          step: 'Processing images',
          percentage: Math.round(((index + 1) / request.images.length) * 100),
          currentImage: index + 1,
          totalImages: request.images.length
        });
      }
    });

    // Track batch costs
    costTracker.trackOperation({
      userId: request.userId,
      operationType: 'virtual_staging',
      model: 'batch',
      estimatedCostCLP: totalCost,
      imagesGenerated: request.images.length,
    });

    return {
      success: batchResult.success,
      results: stagingResults,
      errors: batchResult.errors,
      totalProcessed: batchResult.totalProcessed,
      successCount: batchResult.successCount,
      failureCount: batchResult.failureCount,
      totalCostCLP: totalCost,
      processingTime: Date.now() - startTime
    };
  }

  /**
   * Add a custom style
   */
  addCustomStyle(style: CustomStyle): void {
    this.customStyles.set(style.id, style);
    aiClient.addCustomStyle(style);
  }

  /**
   * Get all custom styles
   */
  getCustomStyles(): CustomStyle[] {
    return Array.from(this.customStyles.values());
  }

  /**
   * Validate the staging request
   */
  private async validateRequest(request: VirtualStagingRequest): Promise<void> {
    // Validate image file
    if (!request.originalImage) {
      throw new Error('No image file provided');
    }

    // Check file size (max 10MB)
    if (request.originalImage.size > 10 * 1024 * 1024) {
      throw new Error('Image file size exceeds 10MB limit');
    }

    // Check file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(request.originalImage.type)) {
      throw new Error('Invalid image type. Supported: JPEG, PNG, WebP');
    }

    // Validate style
    if (!request.style && !request.customStyleId) {
      throw new Error('Either style or customStyleId must be provided');
    }
  }

  /**
   * Estimate costs for the generation
   */
  private estimateCosts(request: VirtualStagingRequest): { 
    imageGeneration: number; 
    total: number; 
  } {
    // Base cost per image in CLP
    const baseCostCLP = 100; // ~$0.10 USD
    
    // Add premium for high quality
    let multiplier = 1;
    if (request.options?.quality === 'high') {
      multiplier = 1.5;
    }
    
    // Multiple images cost
    const numberOfImages = request.options?.numberOfImages || 1;
    const imageGeneration = baseCostCLP * numberOfImages * multiplier;
    
    return {
      imageGeneration,
      total: imageGeneration
    };
  }

  /**
   * Convert USD to CLP
   */
  private convertToCLP(usd: number): number {
    const exchangeRate = 1000; // Approximate USD to CLP
    return Math.round(usd * exchangeRate);
  }

  /**
   * Get available styles
   */
  getAvailableStyles() {
    return STAGING_STYLES;
  }

  /**
   * Get available room types
   */
  getAvailableRoomTypes() {
    return ROOM_TYPES;
  }
}

// Export singleton instance
export const virtualStagingService = new VirtualStagingService();