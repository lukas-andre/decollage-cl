import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/service-role'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const supabase = createServiceRoleClient()

    // Check if user exists in profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('email', email.toLowerCase())
      .maybeSingle()

    let userExists = false
    let hasPassword = false
    let authMethod = 'magic_link'

    if (!profileError && profile) {
      userExists = true

      try {
        // Check auth.users table for password using admin API
        const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers()

        if (!usersError && users) {
          const user = users.find(u => u.email?.toLowerCase() === email.toLowerCase())
          if (user) {
            // Default to no password (magic link)
            hasPassword = false
            authMethod = 'magic_link'

            // Check user metadata for password setup
            if (user.user_metadata?.password_set === true) {
              // User has explicitly set a password after magic link login
              hasPassword = true
              authMethod = 'password'
            } else if (user.user_metadata?.auth_method === 'magic_link') {
              // Explicitly marked as magic link user
              hasPassword = false
              authMethod = 'magic_link'
            } else if (user.app_metadata?.provider === 'email' &&
                       user.app_metadata?.providers?.includes('email') &&
                       user.email_confirmed_at &&
                       !user.user_metadata?.password_set) {
              // Email provider but no password_set flag means magic link
              hasPassword = false
              authMethod = 'magic_link'
            } else if (user.app_metadata?.provider === 'google') {
              // OAuth users
              hasPassword = false
              authMethod = 'google'
            } else {
              // Default to magic link for safety
              hasPassword = false
              authMethod = 'magic_link'
            }
          }
        }
      } catch (error) {
        console.error('Error checking user password status:', error)
        // Default to magic_link for existing users without password info
        hasPassword = false
        authMethod = 'magic_link'
      }
    }

    return NextResponse.json({
      exists: userExists,
      hasPassword,
      authMethod
    })

  } catch (error) {
    console.error('Check user error:', error)
    return NextResponse.json(
      { error: 'Failed to check user status' },
      { status: 500 }
    )
  }
}