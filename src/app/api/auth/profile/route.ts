import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        },
      },
    }
  )

  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { userType = 'b2c', businessName } = body

    // Check if profile already exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single()

    if (existingProfile) {
      return NextResponse.json({ success: true, message: 'Profile already exists' })
    }

    // Create profile for new user
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        email: user.email!,
        full_name: user.user_metadata?.full_name || null,
        user_type: userType,
        tokens_available: userType === 'b2c' ? 5 : 0, // 5 free tokens for B2C users
        tokens_total_purchased: 0,
        tokens_total_used: 0,
        role: 'user',
      })

    if (profileError) {
      console.error('Error creating profile:', profileError)
      return NextResponse.json(
        { error: 'Error al crear perfil' },
        { status: 500 }
      )
    }

    // If B2B user and business name provided, create business
    if (userType === 'b2b' && businessName) {
      // Create business
      const { data: business, error: businessError } = await supabase
        .from('businesses')
        .insert({
          name: businessName,
          owner_id: user.id,
          subscription_plan: 'trial',
          monthly_staging_limit: 10,
          monthly_staging_used: 0,
        })
        .select()
        .single()

      if (businessError) {
        console.error('Error creating business:', businessError)
        return NextResponse.json(
          { error: 'Error al crear empresa' },
          { status: 500 }
        )
      }

      // Add user as business member
      const { error: memberError } = await supabase
        .from('business_members')
        .insert({
          business_id: business.id,
          user_id: user.id,
          role: 'owner',
        })

      if (memberError) {
        console.error('Error creating business membership:', memberError)
        return NextResponse.json(
          { error: 'Error al crear membresía' },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({
      success: true,
      userType,
      message: 'Perfil creado exitosamente',
    })
  } catch (error) {
    console.error('Profile creation error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function GET() {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        },
      },
    }
  )

  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { exists: false },
        { status: 200 }
      )
    }

    // Check if user is B2B (has business membership)
    const { data: businessMember } = await supabase
      .from('business_members')
      .select(`
        business_id,
        role,
        businesses (
          id,
          name,
          subscription_plan
        )
      `)
      .eq('user_id', user.id)
      .single()

    return NextResponse.json({
      exists: true,
      profile,
      isB2B: !!businessMember,
      business: businessMember?.businesses || null,
    })
  } catch (error) {
    console.error('Profile check error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}