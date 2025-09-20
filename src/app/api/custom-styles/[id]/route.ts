import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// DELETE /api/custom-styles/[id] - Delete a custom style
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
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

    if (!id) {
      return NextResponse.json(
        { error: 'ID del estilo es obligatorio' },
        { status: 400 }
      )
    }

    // Verify the custom style belongs to the user before deleting
    const { data: existingStyle, error: fetchError } = await supabase
      .from('user_custom_styles')
      .select('id, user_id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !existingStyle) {
      return NextResponse.json(
        { error: 'Estilo personalizado no encontrado' },
        { status: 404 }
      )
    }

    // Delete the custom style
    const { error: deleteError } = await supabase
      .from('user_custom_styles')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (deleteError) {
      console.error('Error deleting custom style:', deleteError)
      return NextResponse.json(
        { error: 'Error al eliminar estilo personalizado' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Estilo personalizado eliminado correctamente'
    })
  } catch (error) {
    console.error('Custom style deletion error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// PUT /api/custom-styles/[id] - Update a custom style
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
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

    if (!id) {
      return NextResponse.json(
        { error: 'ID del estilo es obligatorio' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const {
      style_name,
      base_prompt,
      negative_prompt,
      preview_image_url,
      metadata = {},
      is_public = false
    } = body

    // Verify the custom style belongs to the user
    const { data: existingStyle, error: fetchError } = await supabase
      .from('user_custom_styles')
      .select('id, user_id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !existingStyle) {
      return NextResponse.json(
        { error: 'Estilo personalizado no encontrado' },
        { status: 404 }
      )
    }

    // Update the custom style
    const { data: updatedStyle, error: updateError } = await supabase
      .from('user_custom_styles')
      .update({
        style_name,
        base_prompt,
        negative_prompt,
        preview_image_url,
        metadata,
        is_public,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating custom style:', updateError)
      return NextResponse.json(
        { error: 'Error al actualizar estilo personalizado' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      customStyle: updatedStyle,
      message: 'Estilo personalizado actualizado correctamente'
    })
  } catch (error) {
    console.error('Custom style update error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}