'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function AuthFragmentHandler() {
  const router = useRouter()

  useEffect(() => {
    const handleAuthFragment = async () => {
      // Check for URL fragments (old Supabase redirect format)
      if (typeof window !== 'undefined' && window.location.hash) {
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const accessToken = hashParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token')
        const type = hashParams.get('type')

        if (accessToken && refreshToken) {
          try {
            const supabase = createClient()
            
            // Set the session using the tokens from the fragment
            const { error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            })

            if (!error) {
              // Clear the URL fragment
              window.history.replaceState(null, '', window.location.pathname)
              
              // Redirect based on type
              if (type === 'invite') {
                router.push('/set-password')
              } else if (type === 'recovery') {
                router.push('/reset-password')
              } else {
                router.push('/dashboard')
              }
            }
          } catch (error) {
            console.error('Auth fragment handling error:', error)
            router.push('/auth/auth-code-error')
          }
        }
      }
    }

    handleAuthFragment()
  }, [router])

  return null
}