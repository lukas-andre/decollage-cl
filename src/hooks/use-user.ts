import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'

export interface Profile {
  id: string
  email: string
  username: string | null
  full_name: string | null
  avatar_url: string | null
  phone: string | null
  tokens_available: number
  tokens_total_purchased: number
  tokens_total_used: number
  style_personality: Record<string, any>
  color_preferences: Record<string, any>
  design_goals: string[] | null
  home_type: string | null
  is_public: boolean
  instagram_handle: string | null
  pinterest_connected: boolean
  pinterest_user_id: string | null
  onboarding_completed: boolean
  onboarding_step: number
  last_active_at: string | null
  created_at: string
  updated_at: string
  role: 'user' | 'admin' | 'moderator'
  user_type: 'personal' | 'professional' | 'other'
}

export function useUser() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const supabase = createClient()

    const fetchUser = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        
        if (userError) throw userError
        
        setUser(user)

        if (user) {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()

          if (profileError) throw profileError
          
          setProfile(profile)
        }
      } catch (err) {
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user)
          
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()

          if (profile) {
            setProfile(profile)
          }
        } else {
          setUser(null)
          setProfile(null)
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return {
    user,
    profile,
    loading,
    error,
    isAdmin: profile?.role === 'admin',
  }
}