import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

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

    // Get user's current token balance
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('tokens_available')
      .eq('id', user.id)
      .single()

    if (profileError) {
      return NextResponse.json(
        { error: 'Error al obtener los tokens' },
        { status: 500 }
      )
    }

    // Get token transaction history
    const { data: transactions, error: transactionError } = await supabase
      .from('token_transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20)

    if (transactionError) {
      return NextResponse.json(
        { error: 'Error al obtener las transacciones' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      balance: profile?.tokens_available || 0,
      transactions: transactions || [],
    })
  } catch {
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// Consume tokens (for generation)
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
    const { amount, description, type = 'consumption' } = body

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Cantidad de tokens inválida' },
        { status: 400 }
      )
    }

    // Get current token balance
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('tokens_available')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Error al obtener el perfil' },
        { status: 500 }
      )
    }

    // Check if user has enough tokens
    if (type === 'consumption' && profile.tokens_available < amount) {
      return NextResponse.json(
        { error: 'Tokens insuficientes' },
        { status: 400 }
      )
    }

    // Calculate new balance
    const newBalance = type === 'consumption' 
      ? profile.tokens_available - amount
      : profile.tokens_available + amount

    // Start transaction
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ 
        tokens_available: newBalance,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (updateError) {
      return NextResponse.json(
        { error: 'Error al actualizar los tokens' },
        { status: 500 }
      )
    }

    // Record transaction
    const { error: transactionError } = await supabase
      .from('token_transactions')
      .insert({
        user_id: user.id,
        type,
        amount: type === 'consumption' ? -amount : amount,
        description: description || `${type === 'consumption' ? 'Consumo' : 'Adición'} de tokens`,
        created_at: new Date().toISOString(),
      })

    if (transactionError) {
      // Rollback token update if transaction recording fails
      await supabase
        .from('profiles')
        .update({ tokens_available: profile.tokens_available })
        .eq('id', user.id)
      
      return NextResponse.json(
        { error: 'Error al registrar la transacción' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      newBalance,
      transaction: {
        type,
        amount,
        description,
        timestamp: new Date().toISOString(),
      },
    })
  } catch {
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}