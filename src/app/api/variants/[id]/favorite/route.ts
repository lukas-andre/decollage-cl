import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, options)
              })
            } catch (error) {
              console.error('Error setting cookies:', error)
            }
          },
        },
      }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get current favorite status
    const { data: currentVariant, error: fetchError } = await supabase
      .from('transformations')
      .select('is_favorite, user_id')
      .eq('id', id)
      .single()

    if (fetchError) {
      console.error('Error fetching variant:', fetchError)
      return NextResponse.json(
        { error: 'Variant not found' },
        { status: 404 }
      )
    }

    // Check ownership
    if (currentVariant.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Toggle favorite status
    const { data: updatedVariant, error: updateError } = await supabase
      .from('transformations')
      .update({ 
        is_favorite: !currentVariant.is_favorite
      })
      .eq('id', id)
      .select('is_favorite')
      .single()

    if (updateError) {
      console.error('Error updating favorite status:', updateError)
      return NextResponse.json(
        { error: 'Failed to update favorite status' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      is_favorite: updatedVariant.is_favorite
    })

  } catch (error) {
    console.error('Error in toggle favorite endpoint:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}