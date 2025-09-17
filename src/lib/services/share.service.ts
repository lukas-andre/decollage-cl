import { createClient } from '@/lib/supabase/client'
import type { 
  ShareConfig, 
  ShareResponse, 
  ProjectShare, 
  PublicShareData,
  CreateShareRequest
} from '@/types/sharing'

export class ShareService {
  private supabase = createClient()

  /**
   * Create a new project share
   */
  async createShare(projectId: string, config: ShareConfig, authenticatedSupabase?: any): Promise<ShareResponse> {
    try {
      // Use provided authenticated supabase client or fallback to default
      const supabaseClient = authenticatedSupabase || this.supabase

      // Get current user
      const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
      if (authError || !user) {
        throw new Error('User must be authenticated to create shares')
      }

      // Validate project ownership
      const { data: project, error: projectError } = await supabaseClient
        .from('projects')
        .select('id, name, user_id')
        .eq('id', projectId)
        .eq('user_id', user.id)
        .single()

      if (projectError || !project) {
        throw new Error('Project not found or access denied')
      }

      // Create the share record
      const shareData: any = {
        project_id: projectId,
        created_by: user.id,
        share_type: 'link',
        visibility: config.visibility || 'unlisted',
        title: config.customTitle,
        description: config.customDescription,
        featured_items: config.featured || [],
        expires_at: config.expiresAt?.toISOString(),
        max_views: config.maxViews,
      }

      // Hash password if provided
      if (config.password) {
        const encoder = new TextEncoder()
        const data = encoder.encode(config.password)
        const hashBuffer = await crypto.subtle.digest('SHA-256', data)
        shareData.password_hash = Array.from(new Uint8Array(hashBuffer))
          .map(b => b.toString(16).padStart(2, '0'))
          .join('')
      }

      const { data: share, error: shareError } = await supabaseClient
        .from('project_shares')
        .insert(shareData)
        .select()
        .single()

      if (shareError) {
        throw new Error(`Failed to create share: ${shareError.message}`)
      }

      // Generate share URL (use environment variable or default)
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
      const shareUrl = `${baseUrl}/share/${share.share_token}`
      
      // Generate OG image URL (placeholder for now)
      const ogImageUrl = `/api/og?token=${share.share_token}`

      // Generate basic embed code
      const embedCode = `<iframe src="${shareUrl}" width="800" height="600" frameborder="0"></iframe>`

      return {
        shareUrl,
        shareToken: share.share_token,
        ogImageUrl,
        embedCode
      }
    } catch (error) {
      console.error('Error creating share:', error)
      throw error
    }
  }

  /**
   * Get share data by token (for public viewing)
   */
  async getShareByToken(token: string): Promise<PublicShareData> {
    try {
      // Get share data with project info
      const { data: shareData, error: shareError } = await this.supabase
        .from('project_shares')
        .select(`
          *,
          projects (
            id,
            name,
            description,
            cover_image_url,
            profiles (
              full_name,
              username,
              avatar_url
            )
          )
        `)
        .eq('share_token', token)
        .single()

      if (shareError || !shareData) {
        throw new Error('Share not found')
      }

      if (!shareData.projects) {
        throw new Error('Associated project not found')
      }

      // Check if share is expired
      if (shareData.expires_at && new Date(shareData.expires_at) < new Date()) {
        throw new Error('Share has expired')
      }

      // Check view limits
      if (shareData.max_views && shareData.current_views >= shareData.max_views) {
        throw new Error('Share view limit reached')
      }

      // Update view count
      await this.supabase
        .from('project_shares')
        .update({ 
          current_views: (shareData.current_views || 0) + 1,
          last_viewed_at: new Date().toISOString()
        })
        .eq('id', shareData.id)

      // Get featured items or latest transformations
      const itemIds = shareData.featured_items?.length 
        ? shareData.featured_items 
        : null

      let items: any[] = []
      
      if (itemIds) {
        // Get specific featured items
        const { data: transformations } = await this.supabase
          .from('transformations')
          .select(`
            id,
            result_image_url,
            custom_instructions,
            metadata,
            base_image_id,
            images:images!base_image_id (url)
          `)
          .in('id', itemIds)
          .eq('status', 'completed')

        items = transformations?.map((t: any) => ({
          id: t.id,
          type: 'transformation',
          title: t.custom_instructions || 'Transformación',
          imageUrl: t.result_image_url || '',
          beforeImageUrl: t.images?.url || '',
          metadata: t.metadata
        })) || []
      } else {
        // Get latest transformations from project
        const { data: transformations } = await this.supabase
          .from('transformations')
          .select(`
            id,
            result_image_url,
            custom_instructions,
            metadata,
            base_image_id,
            images:images!base_image_id (url)
          `)
          .eq('project_id', shareData.project_id)
          .eq('status', 'completed')
          .order('created_at', { ascending: false })
          .limit(6)

        items = transformations?.map((t: any) => ({
          id: t.id,
          type: 'transformation',
          title: t.custom_instructions || 'Transformación',
          imageUrl: t.result_image_url || '',
          beforeImageUrl: t.images?.url || '',
          metadata: t.metadata
        })) || []
      }

      // Get reaction counts for the project
      const { data: reactions } = await this.supabase
        .from('content_reactions')
        .select('reaction_type')
        .eq('content_type', 'project')
        .eq('content_id', shareData.project_id)

      const reactionCounts = {
        aplausos: reactions?.filter(r => r.reaction_type === 'aplausos').length || 0,
        total: reactions?.length || 0
      }

      // Check if user is authenticated
      const { data: { user } } = await this.supabase.auth.getUser()

      return {
        share: shareData,
        project: {
          id: shareData.projects?.id || '',
          name: shareData.projects?.name || 'Proyecto sin nombre',
          description: shareData.projects?.description || '',
          coverImageUrl: shareData.projects?.cover_image_url || '',
          userDisplayName: shareData.projects?.profiles?.full_name ||
                           shareData.projects?.profiles?.username ||
                           'Usuario',
          userAvatarUrl: shareData.projects?.profiles?.avatar_url
        },
        items,
        reactions: reactionCounts,
        isAuthenticated: !!user
      }
    } catch (error) {
      console.error('Error getting share:', error)
      throw error
    }
  }

  /**
   * Update an existing share
   */
  async updateShare(token: string, updates: Partial<ShareConfig>): Promise<void> {
    try {
      const { data: { user }, error: authError } = await this.supabase.auth.getUser()
      if (authError || !user) {
        throw new Error('User must be authenticated')
      }

      const updateData: any = {}
      
      if (updates.visibility) updateData.visibility = updates.visibility
      if (updates.customTitle !== undefined) updateData.title = updates.customTitle
      if (updates.customDescription !== undefined) updateData.description = updates.customDescription
      if (updates.featured) updateData.featured_items = updates.featured
      if (updates.expiresAt) updateData.expires_at = updates.expiresAt.toISOString()
      if (updates.maxViews) updateData.max_views = updates.maxViews

      // Hash new password if provided
      if (updates.password) {
        const encoder = new TextEncoder()
        const data = encoder.encode(updates.password)
        const hashBuffer = await crypto.subtle.digest('SHA-256', data)
        updateData.password_hash = Array.from(new Uint8Array(hashBuffer))
          .map(b => b.toString(16).padStart(2, '0'))
          .join('')
      }

      const { error } = await this.supabase
        .from('project_shares')
        .update(updateData)
        .eq('share_token', token)
        .eq('created_by', user.id)

      if (error) {
        throw new Error(`Failed to update share: ${error.message}`)
      }
    } catch (error) {
      console.error('Error updating share:', error)
      throw error
    }
  }

  /**
   * Delete a share
   */
  async deleteShare(token: string): Promise<void> {
    try {
      const { data: { user }, error: authError } = await this.supabase.auth.getUser()
      if (authError || !user) {
        throw new Error('User must be authenticated')
      }

      const { error } = await this.supabase
        .from('project_shares')
        .delete()
        .eq('share_token', token)
        .eq('created_by', user.id)

      if (error) {
        throw new Error(`Failed to delete share: ${error.message}`)
      }
    } catch (error) {
      console.error('Error deleting share:', error)
      throw error
    }
  }

  /**
   * Get user's shares
   */
  async getUserShares(): Promise<ProjectShare[]> {
    try {
      const { data: { user }, error: authError } = await this.supabase.auth.getUser()
      if (authError || !user) {
        throw new Error('User must be authenticated')
      }

      const { data: shares, error } = await this.supabase
        .from('project_shares')
        .select(`
          *,
          projects (
            name,
            cover_image_url
          )
        `)
        .eq('created_by', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        throw new Error(`Failed to get shares: ${error.message}`)
      }

      return shares || []
    } catch (error) {
      console.error('Error getting user shares:', error)
      throw error
    }
  }

  /**
   * Generate OG image for share
   */
  async generateOGImage(token: string): Promise<string> {
    try {
      // This would typically call an API route that generates the OG image
      const response = await fetch(`/api/og?token=${token}`)
      if (!response.ok) {
        throw new Error('Failed to generate OG image')
      }
      
      // Return the URL where the image can be accessed
      return `/api/og?token=${token}`
    } catch (error) {
      console.error('Error generating OG image:', error)
      throw error
    }
  }

  /**
   * Validate share password
   */
  async validateSharePassword(token: string, password: string): Promise<boolean> {
    try {
      const { data: share, error } = await this.supabase
        .from('project_shares')
        .select('password_hash')
        .eq('share_token', token)
        .single()

      if (error || !share) {
        throw new Error('Share not found')
      }

      if (!share.password_hash) {
        return true // No password required
      }

      // Hash provided password and compare
      const encoder = new TextEncoder()
      const data = encoder.encode(password)
      const hashBuffer = await crypto.subtle.digest('SHA-256', data)
      const hashedPassword = Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')

      return hashedPassword === share.password_hash
    } catch (error) {
      console.error('Error validating password:', error)
      return false
    }
  }
}

// Export singleton instance
export const shareService = new ShareService()