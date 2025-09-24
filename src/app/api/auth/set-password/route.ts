import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/service-role'

export async function POST(request: NextRequest) {
  try {
    const { password, confirmPassword } = await request.json()

    if (!password || !confirmPassword) {
      return NextResponse.json(
        { error: 'Password and confirmation are required' },
        { status: 400 }
      )
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: 'Las contraseñas no coinciden' },
        { status: 400 }
      )
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 8 caracteres' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Debes iniciar sesión para establecer una contraseña' },
        { status: 401 }
      )
    }

    // Update user password and metadata
    const { error: updateError } = await supabase.auth.updateUser({
      password: password,
      data: {
        password_set: true,
        auth_method: 'password'
      }
    })

    if (updateError) {
      console.error('Error updating password:', updateError)
      return NextResponse.json(
        { error: updateError.message },
        { status: 400 }
      )
    }

    // Update profile to indicate user now has a password
    const serviceClient = createServiceRoleClient()
    const { error: profileError } = await serviceClient
      .from('profiles')
      .update({
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)

    if (profileError) {
      console.error('Error updating profile:', profileError)
    }

    return NextResponse.json({
      success: true,
      message: 'Contraseña establecida exitosamente'
    })

  } catch (error) {
    console.error('Set password error:', error)
    return NextResponse.json(
      { error: 'Error al establecer la contraseña' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    // Check if user has password set
    const serviceClient = createServiceRoleClient()

    // Check auth method from user metadata
    const hasPassword = user.app_metadata?.provider === 'email' || false

    return NextResponse.json({
      hasPassword,
      authMethod: hasPassword ? 'password' : 'magic_link',
      email: user.email
    })

  } catch (error) {
    console.error('Get password status error:', error)
    return NextResponse.json(
      { error: 'Error al verificar el estado de la contraseña' },
      { status: 500 }
    )
  }
}