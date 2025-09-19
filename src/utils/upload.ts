import { createClient } from '@/lib/supabase/client'

export async function uploadImage(imageUrl: string, projectId: string): Promise<string> {
  try {
    // Fetch the image
    const response = await fetch(imageUrl)
    const blob = await response.blob()

    // Create a File object from the blob
    const timestamp = Date.now()
    const filename = `refined-base-${projectId}-${timestamp}.jpg`
    const file = new File([blob], filename, { type: 'image/jpeg' })

    // Create FormData
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', 'generation')

    // Upload using the existing API endpoint
    const uploadResponse = await fetch('/api/images/upload', {
      method: 'POST',
      body: formData
    })

    if (!uploadResponse.ok) {
      const error = await uploadResponse.json()
      throw new Error(error.error || 'Error uploading image')
    }

    const uploadResult = await uploadResponse.json()

    // Store base image reference for the project
    const supabase = createClient()
    const { error: dbError } = await supabase
      .from('base_images')
      .insert({
        project_id: projectId,
        url: uploadResult.urls.original,
        cloudflare_id: uploadResult.imageId,
        width: uploadResult.dimensions.width,
        height: uploadResult.dimensions.height,
        size: blob.size,
        created_at: new Date().toISOString()
      })

    if (dbError) {
      console.error('Error saving base image reference:', dbError)
      // Don't throw here, the image is already uploaded
    }

    return uploadResult.urls.original
  } catch (error) {
    console.error('Error uploading image:', error)
    throw error
  }
}

export async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const response = await fetch(dataUrl)
  return response.blob()
}