import { createClient } from '@/lib/supabase/client'
import type { ShareAnalyticsData, ShareStats, ShareAnalytics } from '@/types/sharing'

export class ShareAnalyticsService {
  private supabase = createClient()

  /**
   * Track a share analytics event
   */
  async trackEvent(data: ShareAnalyticsData): Promise<void> {
    try {
      // Get current user (optional for analytics)
      const { data: { user } } = await this.supabase.auth.getUser()
      
      // Get browser and device info
      const userAgent = navigator.userAgent
      const deviceInfo = this.parseUserAgent(userAgent)
      
      // Get approximate location (if possible)
      const locationInfo = await this.getLocationInfo()

      const analyticsData = {
        share_type: data.shareType,
        share_id: data.shareId,
        user_id: user?.id || null,
        platform: data.platform,
        action: data.action,
        referrer: data.referrer || document.referrer,
        utm_source: data.utmSource,
        utm_medium: data.utmMedium,
        utm_campaign: data.utmCampaign,
        user_agent: userAgent,
        device_type: data.deviceType || deviceInfo.deviceType,
        browser: data.browser || deviceInfo.browser,
        os: data.os || deviceInfo.os,
        country_code: data.countryCode || locationInfo.countryCode,
        ip_address: locationInfo.ipAddress,
      }

      const { error } = await this.supabase
        .from('share_analytics')
        .insert(analyticsData)

      if (error) {
        console.error('Failed to track analytics event:', error)
        // Don't throw error - analytics failures shouldn't break the app
      }
    } catch (error) {
      console.error('Error tracking analytics event:', error)
      // Silently fail - analytics is not critical
    }
  }

  /**
   * Get share statistics for a specific share
   */
  async getShareStats(shareId: string, shareType: string): Promise<ShareStats> {
    try {
      const { data: { user }, error: authError } = await this.supabase.auth.getUser()
      if (authError || !user) {
        throw new Error('User must be authenticated')
      }

      // Verify user owns this share
      if (shareType === 'project') {
        const { data: share } = await this.supabase
          .from('project_shares')
          .select('created_by')
          .eq('id', shareId)
          .single()

        if (!share || share.created_by !== user.id) {
          throw new Error('Access denied')
        }
      }

      // Get basic stats
      const { data: analytics, error: analyticsError } = await this.supabase
        .from('share_analytics')
        .select('*')
        .eq('share_type', shareType)
        .eq('share_id', shareId)

      if (analyticsError) {
        throw new Error(`Failed to get analytics: ${analyticsError.message}`)
      }

      if (!analytics) {
        return {
          totalViews: 0,
          totalClicks: 0,
          totalShares: 0,
          conversionRate: 0,
          topPlatforms: [],
          recentActivity: []
        }
      }

      // Calculate stats
      const totalViews = analytics.filter(a => a.action === 'viewed').length
      const totalClicks = analytics.filter(a => a.action === 'clicked').length
      const totalShares = analytics.filter(a => a.action === 'created').length
      const conversions = analytics.filter(a => a.action === 'converted').length
      
      const conversionRate = totalViews > 0 ? (conversions / totalViews) * 100 : 0

      // Calculate top platforms
      const platformCounts = analytics.reduce((acc, item) => {
        if (item.platform) {
          acc[item.platform] = (acc[item.platform] || 0) + 1
        }
        return acc
      }, {} as Record<string, number>)

      const topPlatforms = Object.entries(platformCounts)
        .map(([platform, count]) => ({
          platform,
          count: count as number,
          percentage: ((count as number) / analytics.length) * 100
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)

      // Get recent activity
      const recentActivity = analytics
        .sort((a, b) => new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime())
        .slice(0, 20)

      return {
        totalViews,
        totalClicks,
        totalShares,
        conversionRate,
        topPlatforms,
        recentActivity
      }
    } catch (error) {
      console.error('Error getting share stats:', error)
      throw error
    }
  }

  /**
   * Get user's overall analytics dashboard
   */
  async getUserAnalytics(): Promise<{
    totalShares: number
    totalViews: number
    totalEngagement: number
    topPerformingShares: Array<{
      shareId: string
      projectName: string
      views: number
      clicks: number
      platform: string
    }>
  }> {
    try {
      const { data: { user }, error: authError } = await this.supabase.auth.getUser()
      if (authError || !user) {
        throw new Error('User must be authenticated')
      }

      // Get user's shares
      const { data: shares } = await this.supabase
        .from('project_shares')
        .select(`
          id,
          share_token,
          current_views,
          projects:projects!project_id (name)
        `)
        .eq('created_by', user.id)

      if (!shares) {
        return {
          totalShares: 0,
          totalViews: 0,
          totalEngagement: 0,
          topPerformingShares: []
        }
      }

      const shareIds = shares.map(s => s.id)
      
      // Get analytics for user's shares
      const { data: analytics } = await this.supabase
        .from('share_analytics')
        .select('*')
        .eq('share_type', 'project')
        .in('share_id', shareIds)

      const totalViews = analytics?.filter(a => a.action === 'viewed').length || 0
      const totalEngagement = analytics?.filter(a => ['clicked', 'converted'].includes(a.action)).length || 0

      // Calculate top performing shares
      const sharePerformance = shareIds.map(shareId => {
        const shareAnalytics = analytics?.filter(a => a.share_id === shareId) || []
        const share = shares.find(s => s.id === shareId)
        
        return {
          shareId,
          projectName: (share as any)?.projects?.name || 'Project',
          views: shareAnalytics.filter(a => a.action === 'viewed').length,
          clicks: shareAnalytics.filter(a => a.action === 'clicked').length,
          platform: shareAnalytics[0]?.platform || 'direct'
        }
      })

      const topPerformingShares = sharePerformance
        .sort((a, b) => (b.views + b.clicks) - (a.views + a.clicks))
        .slice(0, 5)

      return {
        totalShares: shares.length,
        totalViews,
        totalEngagement,
        topPerformingShares
      }
    } catch (error) {
      console.error('Error getting user analytics:', error)
      throw error
    }
  }

  /**
   * Track share creation
   */
  async trackShareCreation(shareId: string, shareType: string, platform?: string): Promise<void> {
    await this.trackEvent({
      shareType,
      shareId,
      action: 'created',
      platform
    })
  }

  /**
   * Track share view
   */
  async trackShareView(shareId: string, shareType: string, referrer?: string): Promise<void> {
    await this.trackEvent({
      shareType,
      shareId,
      action: 'viewed',
      referrer
    })
  }

  /**
   * Track share click
   */
  async trackShareClick(shareId: string, shareType: string, platform?: string): Promise<void> {
    await this.trackEvent({
      shareType,
      shareId,
      action: 'clicked',
      platform
    })
  }

  /**
   * Track conversion (user signup from shared content)
   */
  async trackConversion(shareId: string, shareType: string): Promise<void> {
    await this.trackEvent({
      shareType,
      shareId,
      action: 'converted'
    })
  }

  /**
   * Parse user agent to extract device info
   */
  private parseUserAgent(userAgent: string): {
    deviceType: string
    browser: string
    os: string
  } {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)
    const isTablet = /iPad|Android(?=.*tablet)/i.test(userAgent)
    
    let deviceType = 'desktop'
    if (isTablet) deviceType = 'tablet'
    else if (isMobile) deviceType = 'mobile'

    let browser = 'unknown'
    if (userAgent.includes('Chrome')) browser = 'chrome'
    else if (userAgent.includes('Firefox')) browser = 'firefox'
    else if (userAgent.includes('Safari')) browser = 'safari'
    else if (userAgent.includes('Edge')) browser = 'edge'

    let os = 'unknown'
    if (userAgent.includes('Windows')) os = 'windows'
    else if (userAgent.includes('Mac')) os = 'macos'
    else if (userAgent.includes('Linux')) os = 'linux'
    else if (userAgent.includes('Android')) os = 'android'
    else if (userAgent.includes('iOS')) os = 'ios'

    return { deviceType, browser, os }
  }

  /**
   * Get approximate location info (respecting privacy)
   */
  private async getLocationInfo(): Promise<{
    countryCode?: string
    ipAddress?: string
  }> {
    try {
      // In production, you might use a service like ipapi.co or similar
      // For now, return empty to respect privacy
      return {}
    } catch (error) {
      return {}
    }
  }

  /**
   * Parse UTM parameters from URL
   */
  static parseUTMParameters(url: string): {
    utmSource?: string
    utmMedium?: string
    utmCampaign?: string
  } {
    try {
      const urlObj = new URL(url)
      return {
        utmSource: urlObj.searchParams.get('utm_source') || undefined,
        utmMedium: urlObj.searchParams.get('utm_medium') || undefined,
        utmCampaign: urlObj.searchParams.get('utm_campaign') || undefined,
      }
    } catch (error) {
      return {}
    }
  }
}

// Export singleton instance
export const shareAnalyticsService = new ShareAnalyticsService()