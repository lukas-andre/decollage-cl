/**
 * Cost Tracking System for AI Generation
 * Monitors and tracks costs for different AI operations
 */

export interface CostConfig {
  // Cost per token/operation in CLP (Chilean Peso)
  textGeneration: {
    inputTokenCostPer1K: number;
    outputTokenCostPer1K: number;
  };
  imageGeneration: {
    costPerImage: number;
    costPerMegapixel?: number;
  };
  runware: {
    costPerImage: number;
    bytedanceModel: number; // Cost for bytedance:4@1 model
  };
  imageAnalysis: {
    costPerImage: number;
    costPerToken?: number;
  };
  // Premium models might have different costs
  premiumMultiplier: number;
}

export interface OperationCost {
  id: string;
  userId: string;
  operationType: 'text_generation' | 'image_generation' | 'image_analysis' | 'virtual_staging' | 'runware_generation' | 'gemini_generation';
  model: string;
  tokensUsed?: number;
  inputTokens?: number;
  outputTokens?: number;
  imagesGenerated?: number;
  imageDimensions?: { width: number; height: number };
  estimatedCostCLP: number;
  actualCostCLP?: number;
  runwareCostUSD?: number; // Actual cost from Runware API
  geminiCostUSD?: number; // Actual cost from Gemini API
  timestamp: Date;
  generationId?: string;
  metadata?: Record<string, unknown>;
}

export interface GeminiUsageMetadata {
  promptTokenCount: number;    // Total input tokens (text + images)
  candidatesTokenCount: number; // Output tokens (1290 per image)
  totalTokenCount: number;      // Sum of prompt + candidates
}

export interface CostSummary {
  totalOperations: number;
  totalCostCLP: number;
  averageCostPerOperation: number;
  operationBreakdown: {
    textGeneration: { count: number; cost: number };
    imageGeneration: { count: number; cost: number };
    imageAnalysis: { count: number; cost: number };
    virtualStaging: { count: number; cost: number };
    runwareGeneration: { count: number; cost: number };
  };
  dateRange: { from: Date; to: Date };
}

// Current cost configuration based on actual Gemini API pricing (from GEMINI_COST.md)
// Exchange rate: 1 USD = 950 CLP (approximate)
export const USD_TO_CLP = 950;

const COST_CONFIG: CostConfig = {
  textGeneration: {
    // Gemini 2.5 Flash Input: $0.30 per 1M tokens = $0.0003 per 1K tokens
    inputTokenCostPer1K: 0.0003 * USD_TO_CLP, // ~0.285 CLP per 1K input tokens
    // Gemini 2.5 Flash Output: Not used for image generation
    outputTokenCostPer1K: 0.0025 * USD_TO_CLP, // ~2.375 CLP per 1K output tokens (text only)
  },
  imageGeneration: {
    // Gemini 2.5 Flash Image Preview: $0.039 per image (1024x1024)
    costPerImage: 0.039 * USD_TO_CLP, // ~37.05 CLP per generated image
    costPerMegapixel: 0, // Included in base price for Gemini
  },
  imageAnalysis: {
    // Gemini input cost for analyzing images
    costPerImage: 0.0003 * USD_TO_CLP, // ~0.285 CLP per analyzed image
    costPerToken: 0.0003, // USD per 1K tokens
  },
  runware: {
    costPerImage: 0.04 * USD_TO_CLP, // ~38 CLP per image (fallback estimate)
    bytedanceModel: 0.035 * USD_TO_CLP, // ~33.25 CLP per image for bytedance:4@1 model
  },
  premiumMultiplier: 1.5, // 50% premium for high-priority operations
};

export class CostTracker {
  private static instance: CostTracker;
  private operations: OperationCost[] = [];

  private constructor() {}

  static getInstance(): CostTracker {
    if (!CostTracker.instance) {
      CostTracker.instance = new CostTracker();
    }
    return CostTracker.instance;
  }

  /**
   * Calculate estimated cost for text generation
   */
  calculateTextGenerationCost(params: {
    inputTokens: number;
    outputTokens: number;
    model: string;
    isPremium?: boolean;
  }): number {
    const { inputTokens, outputTokens, isPremium = false } = params;
    
    const inputCost = (inputTokens / 1000) * COST_CONFIG.textGeneration.inputTokenCostPer1K;
    const outputCost = (outputTokens / 1000) * COST_CONFIG.textGeneration.outputTokenCostPer1K;
    const baseCost = inputCost + outputCost;
    
    return isPremium ? baseCost * COST_CONFIG.premiumMultiplier : baseCost;
  }

  /**
   * Calculate Gemini-specific cost based on usage metadata
   * Following the exact pricing model from GEMINI_COST.md
   */
  calculateGeminiCost(usageMetadata: GeminiUsageMetadata): {
    inputCostUSD: number;
    outputCostUSD: number;
    totalCostUSD: number;
    inputCostCLP: number;
    outputCostCLP: number;
    totalCostCLP: number;
    imagesGenerated: number;
    costPerImageUSD: number;
  } {
    // Calculate input cost: $0.30 per 1M tokens
    const inputCostUSD = (usageMetadata.promptTokenCount / 1_000_000) * 0.30;
    
    // Calculate output cost: $0.039 per image (1290 tokens per image)
    const imagesGenerated = Math.round(usageMetadata.candidatesTokenCount / 1290);
    const outputCostUSD = imagesGenerated * 0.039;
    
    // Total cost
    const totalCostUSD = inputCostUSD + outputCostUSD;
    
    // Log detailed cost breakdown
    console.log('💰 Gemini Image Generation Cost Breakdown:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📊 Token Usage:`);
    console.log(`   • Input tokens: ${usageMetadata.promptTokenCount.toLocaleString()}`);
    console.log(`   • Output tokens: ${usageMetadata.candidatesTokenCount.toLocaleString()} (${imagesGenerated} image${imagesGenerated > 1 ? 's' : ''})`);
    console.log(`   • Total tokens: ${usageMetadata.totalTokenCount.toLocaleString()}`);
    console.log('');
    console.log(`💵 Cost in USD:`);
    console.log(`   • Input cost: $${inputCostUSD.toFixed(6)}`);
    console.log(`   • Output cost: $${outputCostUSD.toFixed(4)} (${imagesGenerated} × $0.039)`);
    console.log(`   • TOTAL: $${totalCostUSD.toFixed(4)}`);
    console.log(`   • Per image: $${(totalCostUSD / imagesGenerated).toFixed(4)}`);
    console.log('');
    console.log(`💱 Cost in CLP (1 USD = ${USD_TO_CLP} CLP):`);
    console.log(`   • Input cost: ${formatCostCLP(inputCostUSD * USD_TO_CLP)}`);
    console.log(`   • Output cost: ${formatCostCLP(outputCostUSD * USD_TO_CLP)}`);
    console.log(`   • TOTAL: ${formatCostCLP(totalCostUSD * USD_TO_CLP)}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    return {
      inputCostUSD,
      outputCostUSD,
      totalCostUSD,
      inputCostCLP: inputCostUSD * USD_TO_CLP,
      outputCostCLP: outputCostUSD * USD_TO_CLP,
      totalCostCLP: totalCostUSD * USD_TO_CLP,
      imagesGenerated,
      costPerImageUSD: totalCostUSD / imagesGenerated
    };
  }

  /**
   * Calculate estimated cost for image generation
   */
  calculateImageGenerationCost(params: {
    numberOfImages: number;
    dimensions?: { width: number; height: number };
    model: string;
    isPremium?: boolean;
    provider?: 'gemini' | 'runware';
    usageMetadata?: GeminiUsageMetadata;
  }): number {
    const { numberOfImages, dimensions, isPremium = false, provider = 'gemini', usageMetadata } = params;
    
    let baseCost: number;
    
    // If we have Gemini usage metadata, use exact calculation
    if (provider === 'gemini' && usageMetadata) {
      const geminiCost = this.calculateGeminiCost(usageMetadata);
      baseCost = geminiCost.totalCostCLP;
    } else if (provider === 'runware') {
      // Use Runware pricing
      baseCost = numberOfImages * COST_CONFIG.runware.costPerImage;
      
      // Special pricing for bytedance model
      if (params.model === 'bytedance:4@1') {
        baseCost = numberOfImages * COST_CONFIG.runware.bytedanceModel;
      }
    } else {
      // Use Gemini estimated pricing
      baseCost = numberOfImages * COST_CONFIG.imageGeneration.costPerImage;
      
      // Log estimated cost
      console.log(`💰 Gemini Estimated Cost (${numberOfImages} image${numberOfImages > 1 ? 's' : ''}):`);
      console.log(`   • Cost per image: $0.039 USD / ${formatCostCLP(COST_CONFIG.imageGeneration.costPerImage)}`);
      console.log(`   • Total: $${(numberOfImages * 0.039).toFixed(4)} USD / ${formatCostCLP(baseCost)}`);
    }
    
    return isPremium ? baseCost * COST_CONFIG.premiumMultiplier : baseCost;
  }

  /**
   * Calculate estimated cost for image analysis
   */
  calculateImageAnalysisCost(params: {
    numberOfImages: number;
    outputTokens?: number;
    model: string;
    isPremium?: boolean;
  }): number {
    const { numberOfImages, outputTokens = 0, isPremium = false } = params;
    
    const imageCost = numberOfImages * COST_CONFIG.imageAnalysis.costPerImage;
    const tokenCost = (outputTokens / 1000) * (COST_CONFIG.imageAnalysis.costPerToken || 0);
    const baseCost = imageCost + tokenCost;
    
    return isPremium ? baseCost * COST_CONFIG.premiumMultiplier : baseCost;
  }

  /**
   * Calculate estimated cost for complete virtual staging operation
   */
  calculateVirtualStagingCost(params: {
    roomAnalysis?: boolean;
    imageGeneration: boolean;
    numberOfImages?: number;
    imageDimensions?: { width: number; height: number };
    isPremium?: boolean;
    provider?: 'gemini' | 'runware';
  }): number {
    const { roomAnalysis = true, imageGeneration = true, numberOfImages = 1, imageDimensions, isPremium = false, provider = 'runware' } = params;
    
    let totalCost = 0;
    
    // Cost for room analysis (still using Gemini)
    if (roomAnalysis) {
      totalCost += this.calculateImageAnalysisCost({
        numberOfImages: 1,
        outputTokens: 200, // Estimated tokens for room analysis
        model: 'gemini-2.5-flash-lite',
        isPremium
      });
    }
    
    // Cost for image generation
    if (imageGeneration) {
      const model = provider === 'runware' ? 'bytedance:4@1' : 'gemini-2.5-flash-image-preview';
      totalCost += this.calculateImageGenerationCost({
        numberOfImages,
        dimensions: imageDimensions,
        model,
        isPremium,
        provider
      });
    }
    
    return totalCost;
  }

  /**
   * Track an AI operation cost
   */
  trackOperation(operation: Omit<OperationCost, 'id' | 'timestamp'>): string {
    const operationWithId: OperationCost = {
      ...operation,
      id: `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date()
    };
    
    this.operations.push(operationWithId);
    
    // In production, this should be saved to database
    this.saveToDatabase(operationWithId);
    
    return operationWithId.id;
  }

  /**
   * Track virtual staging operation
   */
  trackVirtualStaging(params: {
    userId: string;
    generationId: string;
    roomAnalysisCost?: number;
    imageGenerationCost: number;
    totalTokensUsed?: number;
    imageDimensions?: { width: number; height: number };
    runwareCostUSD?: number;
    metadata?: Record<string, unknown>;
  }): string {
    const { userId, generationId, roomAnalysisCost = 0, imageGenerationCost, totalTokensUsed, imageDimensions, runwareCostUSD, metadata } = params;
    
    const totalCost = roomAnalysisCost + imageGenerationCost;
    const provider = metadata?.aiProvider as string || 'runware';
    const model = metadata?.model as string || 'bytedance:4@1';
    
    return this.trackOperation({
      userId,
      operationType: 'virtual_staging',
      model: `${provider}-${model}`,
      tokensUsed: totalTokensUsed,
      imagesGenerated: 1,
      imageDimensions,
      estimatedCostCLP: totalCost,
      runwareCostUSD,
      generationId,
      metadata: {
        roomAnalysisCost,
        imageGenerationCost,
        provider,
        ...metadata
      }
    });
  }

  /**
   * Get cost summary for a user
   */
  getUserCostSummary(userId: string, dateRange?: { from: Date; to: Date }): CostSummary {
    let userOperations = this.operations.filter(op => op.userId === userId);
    
    if (dateRange) {
      userOperations = userOperations.filter(op => 
        op.timestamp >= dateRange.from && op.timestamp <= dateRange.to
      );
    }
    
    const summary: CostSummary = {
      totalOperations: userOperations.length,
      totalCostCLP: 0,
      averageCostPerOperation: 0,
      operationBreakdown: {
        textGeneration: { count: 0, cost: 0 },
        imageGeneration: { count: 0, cost: 0 },
        imageAnalysis: { count: 0, cost: 0 },
        virtualStaging: { count: 0, cost: 0 },
        runwareGeneration: { count: 0, cost: 0 },
      },
      dateRange: dateRange || {
        from: userOperations[0]?.timestamp || new Date(),
        to: new Date()
      }
    };
    
    for (const operation of userOperations) {
      const cost = operation.actualCostCLP || operation.estimatedCostCLP;
      summary.totalCostCLP += cost;
      
      // Map operation types from underscore_case to camelCase
      const typeMap: Record<string, keyof typeof summary.operationBreakdown> = {
        'text_generation': 'textGeneration',
        'image_generation': 'imageGeneration',
        'image_analysis': 'imageAnalysis',
        'virtual_staging': 'virtualStaging',
        'runware_generation': 'runwareGeneration',
      };
      
      const breakdownKey = typeMap[operation.operationType];
      if (breakdownKey) {
        const breakdown = summary.operationBreakdown[breakdownKey];
        breakdown.count += 1;
        breakdown.cost += cost;
      }
    }
    
    summary.averageCostPerOperation = summary.totalOperations > 0 
      ? summary.totalCostCLP / summary.totalOperations 
      : 0;
    
    return summary;
  }

  /**
   * Get platform-wide cost statistics
   */
  getPlatformCostSummary(dateRange?: { from: Date; to: Date }): CostSummary & {
    userCount: number;
    averageCostPerUser: number;
  } {
    let operations = this.operations;
    
    if (dateRange) {
      operations = operations.filter(op => 
        op.timestamp >= dateRange.from && op.timestamp <= dateRange.to
      );
    }
    
    const uniqueUsers = new Set(operations.map(op => op.userId));
    const baseSummary = this.getUserCostSummary('', dateRange);
    baseSummary.totalOperations = operations.length;
    baseSummary.totalCostCLP = operations.reduce((total, op) => 
      total + (op.actualCostCLP || op.estimatedCostCLP), 0
    );
    
    // Recalculate breakdown for all operations
    baseSummary.operationBreakdown = {
      textGeneration: { count: 0, cost: 0 },
      imageGeneration: { count: 0, cost: 0 },
      imageAnalysis: { count: 0, cost: 0 },
      virtualStaging: { count: 0, cost: 0 },
      runwareGeneration: { count: 0, cost: 0 },
    };
    
    for (const operation of operations) {
      const cost = operation.actualCostCLP || operation.estimatedCostCLP;
      
      // Map operation types from underscore_case to camelCase
      const typeMap: Record<string, keyof typeof baseSummary.operationBreakdown> = {
        'text_generation': 'textGeneration',
        'image_generation': 'imageGeneration',
        'image_analysis': 'imageAnalysis',
        'virtual_staging': 'virtualStaging',
        'runware_generation': 'runwareGeneration',
      };
      
      const breakdownKey = typeMap[operation.operationType];
      if (breakdownKey) {
        const breakdown = baseSummary.operationBreakdown[breakdownKey];
        breakdown.count += 1;
        breakdown.cost += cost;
      }
    }
    
    return {
      ...baseSummary,
      userCount: uniqueUsers.size,
      averageCostPerUser: uniqueUsers.size > 0 ? baseSummary.totalCostCLP / uniqueUsers.size : 0,
      averageCostPerOperation: baseSummary.totalOperations > 0 
        ? baseSummary.totalCostCLP / baseSummary.totalOperations 
        : 0
    };
  }

  /**
   * Update actual cost after operation completion
   */
  updateActualCost(operationId: string, actualCostCLP: number): void {
    const operation = this.operations.find(op => op.id === operationId);
    if (operation) {
      operation.actualCostCLP = actualCostCLP;
      this.saveToDatabase(operation);
    }
  }

  /**
   * Get cost estimate for upcoming operation
   */
  estimateOperationCost(params: {
    operationType: 'virtual_staging' | 'image_generation' | 'image_analysis';
    numberOfImages?: number;
    imageDimensions?: { width: number; height: number };
    includeRoomAnalysis?: boolean;
    isPremium?: boolean;
    provider?: 'gemini' | 'runware';
  }): number {
    const { operationType, numberOfImages = 1, imageDimensions, includeRoomAnalysis = true, isPremium = false, provider = 'runware' } = params;
    
    switch (operationType) {
      case 'virtual_staging':
        return this.calculateVirtualStagingCost({
          roomAnalysis: includeRoomAnalysis,
          imageGeneration: true,
          numberOfImages,
          imageDimensions,
          isPremium,
          provider
        });
      
      case 'image_generation':
        const model = provider === 'runware' ? 'bytedance:4@1' : 'gemini-2.5-flash-image-preview';
        return this.calculateImageGenerationCost({
          numberOfImages,
          dimensions: imageDimensions,
          model,
          isPremium,
          provider
        });
      
      case 'image_analysis':
        return this.calculateImageAnalysisCost({
          numberOfImages,
          outputTokens: 200,
          model: 'gemini-2.5-flash-lite',
          isPremium
        });
      
      default:
        return 0;
    }
  }

  /**
   * Save operation to database (placeholder - implement with your database)
   */
  private async saveToDatabase(operation: OperationCost): Promise<void> {
    // In production, implement database save
    // This could use Supabase or another database
    console.log('Cost tracking - operation saved:', {
      id: operation.id,
      type: operation.operationType,
      cost: operation.estimatedCostCLP,
      userId: operation.userId
    });
  }

  /**
   * Get current cost configuration
   */
  getCostConfig(): CostConfig {
    return { ...COST_CONFIG };
  }

  /**
   * Update cost configuration (admin function)
   */
  updateCostConfig(newConfig: Partial<CostConfig>): void {
    Object.assign(COST_CONFIG, newConfig);
  }

  /**
   * Clear operations (mainly for testing)
   */
  clearOperations(): void {
    this.operations = [];
  }
}

// Export singleton instance
export const costTracker = CostTracker.getInstance();

// Helper functions for common calculations
export const calculateTokensFromText = (text: string): number => {
  // Rough estimation: 1 token ≈ 4 characters for Spanish/English
  return Math.ceil(text.length / 4);
};

export const formatCostCLP = (cost: number): string => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(cost);
};

export const convertCLPToUSD = (clp: number, exchangeRate = 800): number => {
  return clp / exchangeRate;
};

export const convertUSDToCLP = (usd: number, exchangeRate = 800): number => {
  return usd * exchangeRate;
};