import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { virtualStagingService } from '@/lib/ai/virtual-staging'

export async function GET() {
  try {
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

    // Check if user is authenticated
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

    // Get AI-defined room types
    const roomTypesObject = virtualStagingService.getAvailableRoomTypes()
    const roomTypes = Object.values(roomTypesObject).map(room => ({
      id: room.id,
      name: room.name,
      furniture: room.furniture,
      atmosphere: room.atmosphere,
      category: 'residential',
      is_active: true,
      sort_order: 1,
      created_at: new Date().toISOString(),
    }))

    return NextResponse.json({ roomTypes })
  } catch (error) {
    console.error('Error in GET /api/room-types:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// GET detailed information about a specific room type
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const body = await request.json()
    const { roomTypeId } = body

    if (!roomTypeId) {
      return NextResponse.json(
        { error: 'roomTypeId is required' },
        { status: 400 }
      )
    }

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

    // Check if user is authenticated
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

    // Get detailed room type information
    const roomTypesObject = virtualStagingService.getAvailableRoomTypes()
    const roomTypes = Object.values(roomTypesObject)
    const roomType = roomTypes.find(room => room.id === roomTypeId)

    if (!roomType) {
      return NextResponse.json(
        { error: 'Room type not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ 
      roomType: {
        id: roomType.id,
        name: roomType.name,
        furniture: roomType.furniture,
        atmosphere: roomType.atmosphere,
        optional_furniture: [],
        lighting_requirements: [],
      }
    })
  } catch (error) {
    console.error('Error in POST /api/room-types:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}