import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { EmailOtpType } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/dashboard/projects'
  const redirect_to = searchParams.get('redirect_to')

  console.log('🔐 Auth callback:', { 
    hasCode: !!code, 
    hasTokenHash: !!token_hash, 
    type, 
    next,
    redirect_to
  })

  // Handle recovery/magic link tokens (new Supabase flow)
  if (token_hash && type) {
    const supabase = await createClient()

    try {
      const { error } = await supabase.auth.verifyOtp({
        type,
        token_hash,
      })

      if (!error) {
        console.log('✅ Email verification successful')
        
        // Get the authenticated user
        const { data: { user } } = await supabase.auth.getUser()
        
        if (user) {
          // Check if user has a profile to determine user type
          const { data: profile } = await supabase
            .from('profiles')
            .select('user_type')
            .eq('id', user.id)
            .single()

          // If no profile exists, create one (default to B2C)
          if (!profile) {
            await supabase
              .from('profiles')
              .insert({
                id: user.id,
                email: user.email!,
                full_name: user.user_metadata?.full_name || null,
                user_type: 'b2c',
                tokens_available: 5, // 5 free tokens for new B2C users
                tokens_total_purchased: 0,
                tokens_total_used: 0,
                role: 'user',
              })
            
            return NextResponse.redirect(`${origin}/dashboard/projects`)
          }

          // Check if user is B2B (has business membership)
          const { data: businessMember } = await supabase
            .from('business_members')
            .select('business_id')
            .eq('user_id', user.id)
            .single()

          // Determine redirect path based on type
          let redirectPath = '/dashboard/projects' // Default for B2C
          
          if (type === 'recovery') {
            redirectPath = '/reset-password'
          } else if (type === 'invite') {
            redirectPath = '/set-password' // New user needs to set password
          } else if (type === 'signup' || type === 'email' || type === 'magiclink') {
            // For signup verification, check user type
            redirectPath = profile?.user_type === 'b2b' && businessMember 
              ? '/dashboard' 
              : '/dashboard/projects'
          }

          return NextResponse.redirect(`${origin}${redirectPath}`)
        }
      }
    } catch (error) {
      console.error('OTP verification error:', error)
    }
  }

  // Handle OAuth code exchange (Google login, etc)
  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      console.log('✅ OAuth successful')
      
      // Get the authenticated user to determine redirect
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // Check if user has a profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('user_type')
          .eq('id', user.id)
          .single()

        // If no profile exists, create one (default to B2C)
        if (!profile) {
          await supabase
            .from('profiles')
            .insert({
              id: user.id,
              email: user.email!,
              full_name: user.user_metadata?.full_name || null,
              user_type: 'b2c',
              tokens_available: 5, // 5 free tokens for new B2C users
              tokens_total_purchased: 0,
              tokens_total_used: 0,
              role: 'user',
            })
          
          return NextResponse.redirect(`${origin}/dashboard/projects`)
        }

        // Check if B2B user
        const { data: businessMember } = await supabase
          .from('business_members')
          .select('business_id')
          .eq('user_id', user.id)
          .single()

        const redirectPath = profile?.user_type === 'b2b' && businessMember 
          ? '/dashboard' 
          : '/dashboard/projects'
        
        return NextResponse.redirect(`${origin}${redirectPath}`)
      }
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}