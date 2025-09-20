'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface UserProfile {
  id: string
  email: string
  username?: string
  full_name?: string
  avatar_url?: string
  phone?: string
  tokens_available?: number
  tokens_total_purchased?: number
  tokens_total_used?: number
  style_personality?: any
  color_preferences?: any
  design_goals?: string[]
  home_type?: string
  is_public?: boolean
  instagram_handle?: string
  pinterest_connected?: boolean
  onboarding_completed?: boolean
  role?: string
  user_type?: string
  created_at?: string
  updated_at?: string
}

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  const fetchProfile = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('No user found')
        return
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileError) {
        setError(profileError.message)
        return
      }

      setProfile(profile)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return { error: 'No user found' }

      const { error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (error) {
        return { error: error.message }
      }

      // Refresh profile data
      await fetchProfile()
      return { success: true }
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Update failed' }
    }
  }

  const getDisplayName = () => {
    if (!profile) return 'Usuario'
    return profile.full_name || profile.username || profile.email?.split('@')[0] || 'Usuario'
  }

  const getFirstName = () => {
    if (!profile) return 'Usuario'
    const fullName = profile.full_name
    if (fullName) {
      return fullName.split(' ')[0]
    }
    return profile.username || profile.email?.split('@')[0] || 'Usuario'
  }

  useEffect(() => {
    fetchProfile()
  }, [])

  return {
    profile,
    loading,
    error,
    updateProfile,
    refreshProfile: fetchProfile,
    getDisplayName,
    getFirstName
  }
}