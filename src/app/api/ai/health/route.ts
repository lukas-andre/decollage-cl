import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { virtualStagingService } from '@/lib/ai/virtual-staging'
import { costTracker } from '@/lib/ai/cost-tracking'

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

    // Check if user is authenticated and is admin
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

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Acceso denegado - Solo administradores' },
        { status: 403 }
      )
    }

    // Get service health
    const serviceHealth = {
      status: 'operational',
      providers: ['runware', 'gemini'],
      styles: virtualStagingService.getAvailableStyles().length,
      roomTypes: virtualStagingService.getAvailableRoomTypes().length
    }
    
    // Get cost configuration
    const costConfig = costTracker.getCostConfig()
    
    // Get platform cost summary for the last 24 hours
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const costSummary = costTracker.getPlatformCostSummary({
      from: yesterday,
      to: new Date()
    })

    // Check environment variables
    const environmentCheck = {
      geminiApiKey: !!process.env.GEMINI_API_KEY,
      cloudflareAccountId: !!process.env.CLOUDFLARE_ACCOUNT_ID,
      cloudflareImagesToken: !!process.env.CLOUDFLARE_IMAGES_API_TOKEN,
    }

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      status: 'healthy',
      ai: {
        serviceHealth,
        providers: serviceHealth.providers,
      },
      costs: {
        config: costConfig,
        summary: costSummary,
      },
      environment: environmentCheck,
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
      }
    })
  } catch (error) {
    console.error('Error in GET /api/ai/health:', error)
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}