/**
 * App Settings Management
 * Handles configurable application settings stored in the database
 */

import { createClient } from '@/lib/supabase/client'

export type AppSettingKey = 
  | 'initial_tokens'
  | 'token_cost_per_generation'
  | 'max_generations_per_day'
  | 'maintenance_mode'

type AppSettingValue = string | number | boolean;

export interface AppSetting {
  key: AppSettingKey
  value: AppSettingValue
  description?: string
  created_at?: string
  updated_at?: string
}

export const DEFAULT_SETTINGS: Record<AppSettingKey, AppSettingValue> = {
  initial_tokens: 30,
  token_cost_per_generation: 5,
  max_generations_per_day: 50,
  maintenance_mode: false
}

export class AppSettings {
  private static instance: AppSettings
  private cache: Map<string, AppSettingValue> = new Map()
  private cacheTimeout = 5 * 60 * 1000 // 5 minutes
  private lastFetch = 0

  private constructor() {}

  static getInstance(): AppSettings {
    if (!AppSettings.instance) {
      AppSettings.instance = new AppSettings()
    }
    return AppSettings.instance
  }

  /**
   * Get a setting value by key
   */
  async get<T = AppSettingValue>(key: AppSettingKey): Promise<T> {
    // Check cache first
    if (this.isCacheValid() && this.cache.has(key)) {
      return this.cache.get(key) as T
    }

    // Fetch from database
    await this.refreshCache()
    
    // Return value or default
    return (this.cache.get(key) ?? DEFAULT_SETTINGS[key]) as T
  }

  /**
   * Get all settings
   */
  async getAll(): Promise<Record<AppSettingKey, AppSettingValue>> {
    if (!this.isCacheValid()) {
      await this.refreshCache()
    }

    const settings: Record<string, AppSettingValue> = {}
    
    // Combine cached values with defaults
    for (const key of Object.keys(DEFAULT_SETTINGS) as AppSettingKey[]) {
      settings[key] = this.cache.has(key) 
        ? this.cache.get(key)! 
        : DEFAULT_SETTINGS[key]
    }

    return settings as Record<AppSettingKey, AppSettingValue>
  }

  /**
   * Update a setting (admin only)
   */
  async update(key: AppSettingKey, value: AppSettingValue): Promise<boolean> {
    const supabase = createClient()

    const { error } = await supabase
      .from('app_settings')
      .upsert({
        key,
        value,
        updated_at: new Date().toISOString()
      })

    if (error) {
      console.error('Failed to update setting:', error)
      return false
    }

    // Update cache
    this.cache.set(key, value)
    return true
  }

  /**
   * Refresh the cache from database
   */
  private async refreshCache(): Promise<void> {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('app_settings')
      .select('*')

    if (error) {
      console.error('Failed to fetch settings:', error)
      return
    }

    // Clear and repopulate cache
    this.cache.clear()
    for (const setting of data || []) {
      this.cache.set(setting.key, setting.value)
    }
    
    this.lastFetch = Date.now()
  }

  /**
   * Check if cache is still valid
   */
  private isCacheValid(): boolean {
    return Date.now() - this.lastFetch < this.cacheTimeout
  }

  /**
   * Clear the cache (useful after updates)
   */
  clearCache(): void {
    this.cache.clear()
    this.lastFetch = 0
  }
}

// Export singleton instance
export const appSettings = AppSettings.getInstance()