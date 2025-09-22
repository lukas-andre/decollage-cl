import 'server-only'
import { createHash } from 'crypto'

/**
 * Cloudflare Images integration for image uploads and management
 * Server-only implementation - handles uploads, compression, and URL generation
 */

interface CloudflareImagesConfig {
  accountId: string
  apiToken: string
  deliveryUrl: string
}

interface CloudflareUploadResponse {
  result: {
    id: string
    filename: string
    uploaded: string
    requireSignedURLs: boolean
    variants: string[]
  }
  success: boolean
  errors: unknown[]
  messages: unknown[]
}

interface CloudflareUploadOptions {
  metadata?: Record<string, string>
  requireSignedURLs?: boolean
}

// Helper function to get MIME type from filename
function getMimeTypeFromFileName(fileName: string): string | null {
  if (!fileName) return null

  const extension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'))
  const mimeTypes: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
  }

  return mimeTypes[extension] || null
}

export class CloudflareImages {
  private config: CloudflareImagesConfig

  constructor() {
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID
    const apiToken = process.env.CLOUDFLARE_IMAGES_API_TOKEN
    const deliveryUrl =
      process.env.NEXT_PUBLIC_CLOUDFLARE_IMAGES_URL ||
      'https://imagedelivery.net/EFgJYG7S6MAeNW67qxT6BQ'

    if (!accountId || !apiToken) {
      throw new Error('Cloudflare Images configuration missing')
    }

    this.config = {
      accountId,
      apiToken,
      deliveryUrl,
    }
  }

  /**
   * Upload an image directly to Cloudflare Images
   */
  async uploadImage(
    file: File | Buffer | Blob,
    fileName: string,
    options: CloudflareUploadOptions = {}
  ): Promise<CloudflareUploadResponse> {
    const formData = new FormData()

    // Handle different input types
    if (typeof File !== 'undefined' && file instanceof File) {
      // Browser environment with File support
      formData.append('file', file)
    } else if (file instanceof Buffer) {
      // Node.js environment with Buffer
      const mimeType = getMimeTypeFromFileName(fileName) || 'image/jpeg'
      // Create a Blob from Buffer (Blob is available in Node.js 16+)
      const blob = new Blob([new Uint8Array(file)], { type: mimeType })
      formData.append('file', blob, fileName || 'upload')
    } else if (typeof Blob !== 'undefined' && file instanceof Blob) {
      // Blob is available (Node.js 16+ or browser)
      const mimeType =
        file.type || getMimeTypeFromFileName(fileName) || 'image/jpeg'
      const blob = new Blob([file], { type: mimeType })
      formData.append('file', blob, fileName || 'upload')
    } else {
      // Fallback for any other type
      formData.append('file', file as any, fileName || 'upload')
    }

    // Add metadata if provided - Cloudflare expects JSON string
    if (options.metadata && Object.keys(options.metadata).length > 0) {
      formData.append('metadata', JSON.stringify(options.metadata))
    }

    if (options.requireSignedURLs !== undefined) {
      formData.append('requireSignedURLs', String(options.requireSignedURLs))
    }

    try {
      const response = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${this.config.accountId}/images/v1`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.config.apiToken}`,
          },
          body: formData,
        }
      )

      const data = (await response.json()) as CloudflareUploadResponse

      if (!data.success) {
        console.error('Cloudflare upload failed', data.errors, {
          fileName,
          metadata: options.metadata,
        })
        throw new Error(
          `Cloudflare upload failed: ${JSON.stringify(data.errors)}`
        )
      }

      console.log('Image uploaded to Cloudflare', {
        cloudflareId: data.result.id,
        fileName: data.result.filename,
        variants: data.result.variants,
      })

      return data
    } catch (error) {
      console.error('Cloudflare upload error', error, {
        fileName,
        metadata: options.metadata,
      })
      throw error
    }
  }

  /**
   * Upload an image from a URL to Cloudflare Images
   */
  async uploadFromUrl(
    imageUrl: string,
    options: CloudflareUploadOptions = {}
  ): Promise<CloudflareUploadResponse> {
    const formData = new FormData()
    formData.append('url', imageUrl)

    // Add metadata if provided - Cloudflare expects JSON string
    if (options.metadata && Object.keys(options.metadata).length > 0) {
      formData.append('metadata', JSON.stringify(options.metadata))
    }

    if (options.requireSignedURLs !== undefined) {
      formData.append('requireSignedURLs', String(options.requireSignedURLs))
    }

    try {
      const response = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${this.config.accountId}/images/v1`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.config.apiToken}`,
          },
          body: formData,
        }
      )

      const data = (await response.json()) as CloudflareUploadResponse

      if (!data.success) {
        console.error('Cloudflare URL upload failed', data.errors, {
          imageUrl,
          metadata: options.metadata,
        })
        throw new Error(
          `Cloudflare URL upload failed: ${JSON.stringify(data.errors)}`
        )
      }

      console.log('Image uploaded from URL to Cloudflare', {
        cloudflareId: data.result.id,
        sourceUrl: imageUrl,
        variants: data.result.variants,
      })

      return data
    } catch (error) {
      console.error('Cloudflare URL upload error', error, {
        imageUrl,
        metadata: options.metadata,
      })
      throw error
    }
  }

  /**
   * Delete an image from Cloudflare Images
   */
  async deleteImage(imageId: string): Promise<boolean> {
    try {
      const response = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${this.config.accountId}/images/v1/${imageId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${this.config.apiToken}`,
          },
        }
      )

      const data = await response.json()

      if (!data.success) {
        console.error('Cloudflare delete failed', data.errors, {
          imageId,
        })
        return false
      }

      console.log('Image deleted from Cloudflare', {
        cloudflareId: imageId,
      })

      return true
    } catch (error) {
      console.error('Cloudflare delete error', error, {
        imageId,
      })
      return false
    }
  }

  /**
   * Get image details from Cloudflare
   */
  async getImage(imageId: string): Promise<unknown> {
    try {
      const response = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${this.config.accountId}/images/v1/${imageId}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${this.config.apiToken}`,
          },
        }
      )

      const data = await response.json()

      if (!data.success) {
        console.error('Cloudflare get image failed', data.errors, {
          imageId,
        })
        return null
      }

      return data.result
    } catch (error) {
      console.error('Cloudflare get image error', error, {
        imageId,
      })
      return null
    }
  }

  /**
   * Generate delivery URLs for different variants
   */
  getDeliveryUrl(imageId: string, variant: string = 'public'): string {
    return `${this.config.deliveryUrl}/${imageId}/${variant}`
  }

  /**
   * Get all available variants for an image
   */
  getVariantUrls(imageId: string): Record<string, string> {
    return {
      public: this.getDeliveryUrl(imageId, 'public'),
      thumbnail: this.getDeliveryUrl(imageId, 'w=150,h=150,fit=cover'),
      preview: this.getDeliveryUrl(imageId, 'w=800,h=600,fit=scale-down'),
      gallery: this.getDeliveryUrl(imageId, 'w=400,h=300,fit=cover'),
      original: this.getDeliveryUrl(imageId, 'public'),
    }
  }

  /**
   * Create a direct upload URL for client-side uploads
   */
  async createDirectUploadUrl(
    metadata?: Record<string, string>
  ): Promise<{ uploadURL: string; id: string }> {
    const body: Record<string, unknown> = {
      requireSignedURLs: false,
      metadata,
    }

    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${this.config.accountId}/images/v2/direct_upload`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.config.apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    )

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to create direct upload URL: ${error}`)
    }

    const data = await response.json()
    return data.result
  }

  /**
   * Compress image using Sharp (server-side only)
   */
  async compressImage(file: File | Buffer | Blob, maxWidth: number = 2048): Promise<Buffer> {
    try {
      const sharp = (await import('sharp')).default
      let buffer: Buffer

      if (file instanceof Buffer) {
        buffer = file
      } else if (typeof File !== 'undefined' && file instanceof File) {
        buffer = Buffer.from(await file.arrayBuffer())
      } else if (typeof Blob !== 'undefined' && file instanceof Blob) {
        buffer = Buffer.from(await file.arrayBuffer())
      } else {
        throw new Error('Unsupported file type for compression')
      }

      return await sharp(buffer)
        .resize(maxWidth, undefined, {
          withoutEnlargement: true,
          fit: 'inside'
        })
        .jpeg({ quality: 90 })
        .toBuffer()
    } catch (error) {
      console.error('Failed to compress image:', error)
      throw new Error(`Failed to compress image: ${error}`)
    }
  }

  /**
   * Get image dimensions using Sharp (server-side only)
   */
  async getImageDimensions(file: File | Buffer | Blob): Promise<{ width: number; height: number }> {
    try {
      const sharp = (await import('sharp')).default
      let buffer: Buffer

      if (file instanceof Buffer) {
        buffer = file
      } else if (typeof File !== 'undefined' && file instanceof File) {
        buffer = Buffer.from(await file.arrayBuffer())
      } else if (typeof Blob !== 'undefined' && file instanceof Blob) {
        buffer = Buffer.from(await file.arrayBuffer())
      } else {
        throw new Error('Unsupported file type for getting dimensions')
      }

      const metadata = await sharp(buffer).metadata()

      return {
        width: metadata.width || 0,
        height: metadata.height || 0,
      }
    } catch (error) {
      console.error('Failed to get image dimensions:', error)
      throw new Error(`Failed to get image dimensions: ${error}`)
    }
  }

  /**
   * Update image metadata
   */
  async updateImageMetadata(imageId: string, metadata: Record<string, string>) {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${this.config.accountId}/images/v1/${imageId}`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${this.config.apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ metadata }),
      }
    )

    if (!response.ok) {
      throw new Error(`Failed to update image metadata: ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * Validate image file
   */
  validateImageFile(file: File | { type?: string; size: number; name?: string }): { valid: boolean; error?: string } {
    const MAX_SIZE = 10 * 1024 * 1024 // 10MB
    const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']

    // Get file type either from file.type or from filename
    let fileType = file.type
    if (!fileType && file.name) {
      const mimeType = getMimeTypeFromFileName(file.name)
      if (mimeType) fileType = mimeType
    }

    if (fileType && !ALLOWED_TYPES.includes(fileType)) {
      return {
        valid: false,
        error: 'Formato de archivo no soportado. Por favor usa JPG, PNG, WebP o GIF.',
      }
    }

    if (file.size > MAX_SIZE) {
      return {
        valid: false,
        error: 'El archivo es demasiado grande. El tamaño máximo es 10MB.',
      }
    }

    return { valid: true }
  }

  /**
   * Generate a unique filename
   */
  generateUniqueFilename(originalName: string, userId?: string): string {
    const timestamp = Date.now()
    const hash = createHash('md5')
      .update(`${userId || 'anonymous'}-${timestamp}`)
      .digest('hex')
      .substring(0, 8)
    const extension = originalName.split('.').pop() || 'jpg'
    return `${timestamp}-${hash}.${extension}`
  }
}

// Singleton instance
let cloudflareImagesInstance: CloudflareImages | null = null

export function getCloudflareImages(): CloudflareImages {
  if (!cloudflareImagesInstance) {
    cloudflareImagesInstance = new CloudflareImages()
  }
  return cloudflareImagesInstance
}

// Export types
export type { CloudflareUploadResponse, CloudflareUploadOptions }