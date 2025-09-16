/**
 * Shared types for AI providers
 */

export type AIProvider = 'runware' | 'gemini'

export enum FurnitureMode {
  KEEP_ALL = 'keep_all',
  KEEP_REPOSITION = 'keep_reposition',
  KEEP_ADD_MORE = 'keep_add_more',
  REPLACE_ALL = 'replace_all'
}

export interface ImageGenerationResult {
  success: boolean
  imageUrl?: string
  imageDataUrl?: string
  error?: string
  cost?: number
  provider: AIProvider
  model: string
  processingTime: number
  usageMetadata?: {
    promptTokenCount: number
    candidatesTokenCount: number
    totalTokenCount: number
  }
}

export interface RoomAnalysisResult {
  success: boolean
  analysis?: string
  roomType?: string
  furniture?: string[]
  lighting?: string
  style?: string
  error?: string
  provider: AIProvider
}

export interface ProductPlacementResult {
  success: boolean
  imageUrl?: string
  imageDataUrl?: string
  placedProducts: Array<{ 
    type: string
    position: string
    confidence: number 
  }>
  error?: string
  provider: AIProvider
}

export interface CustomStyle {
  id: string
  name: string
  description?: string
  promptTemplate: string
  category: 'interior' | 'exterior' | 'commercial'
  isPublic?: boolean
  userId?: string
  createdAt?: Date
}

export interface StagingRequest {
  imageFile: File
  style?: string
  roomType?: string
  environment?: 'interior' | 'exterior' | 'commercial'
  customStyleId?: string
  prompt?: string
  options?: {
    numberOfImages?: number
    CFGScale?: number
    enhancePrompt?: boolean
    quality?: 'fast' | 'balanced' | 'high'
    provider?: 'runware' | 'gemini' | 'openrouter'
    dimensions?: { width?: number; height?: number }
    style?: string
    roomType?: string
    colorScheme?: string
    furnitureMode?: FurnitureMode | string
  }
}

export interface BatchGenerationRequest {
  images: Array<{
    id: string
    file: File
  }>
  style?: string
  roomType?: string
  environment?: 'interior' | 'exterior' | 'commercial'
  customStyleId?: string
  options?: {
    numberOfImages?: number
    CFGScale?: number
    enhancePrompt?: boolean
    quality?: 'fast' | 'balanced' | 'high'
    provider?: 'runware' | 'gemini' | 'openrouter'
    dimensions?: { width?: number; height?: number }
    style?: string
    roomType?: string
    colorScheme?: string
    furnitureMode?: FurnitureMode | string
  }
}

export interface BatchGenerationResult {
  success: boolean
  results: ImageGenerationResult[]
  errors: Array<{
    imageId: string
    error: string
  }>
  totalProcessed: number
  successCount: number
  failureCount: number
}

export interface AdvancedSettings {
  density: 'minimalist' | 'balanced' | 'full'
  temperature: 'warm' | 'cool' | 'neutral' | 'monochromatic'
  seed?: string
}