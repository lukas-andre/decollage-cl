'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { 
  ArrowUpRight, 
  CreditCard, 
  FolderOpen, 
  Image as ImageIcon, 
  TrendingUp,
  Sparkles,
  Clock,
  Download,
  ChevronRight,
  Rocket,
  AlertCircle,
  Package,
  Link2
} from 'lucide-react'
import { createBrowserClient } from '@supabase/ssr'
import { toast } from 'sonner'

interface Stats {
  // B2C Stats
  tokensAvailable?: number
  tokensUsed?: number
  totalProjects?: number
  totalTransformations?: number
  
  // B2B Stats
  stagingLimit?: number
  stagingUsed?: number
  totalProducts?: number
  totalSessions?: number
  
  // Common Stats
  averageTime: number
  successRate: number
  userType: 'b2c' | 'b2b'
}

interface RecentGeneration {
  id: string
  projectName?: string // B2C
  productName?: string // B2B
  category?: string
  styleName?: string
  resultImageUrl: string
  createdAt: string
  spaceType?: 'interior' | 'exterior' | 'commercial'
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    averageTime: 0,
    successRate: 95,
    userType: 'b2c'
  })
  const [recentGenerations, setRecentGenerations] = useState<RecentGeneration[]>([])
  const [loading, setLoading] = useState(true)
  const [showWizard, setShowWizard] = useState(false)
  const [businessName, setBusinessName] = useState('')
  const [userType, setUserType] = useState<'b2c' | 'b2b'>('b2c')

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch user data
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get user profile (all users have profiles now)
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (!profile) {
        console.error('No profile found for user:', user.id)
        return
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
            monthly_staging_limit,
            monthly_staging_used,
            subscription_plan
          )
        `)
        .eq('user_id', user.id)
        .single()

      let statsData: Partial<Stats> = { averageTime: 0, successRate: 97 }
      let recentData: RecentGeneration[] = []
      
      // Determine user type based on profile and business membership
      const isB2B = businessMember?.businesses && profile?.user_type === 'b2b'
      
      // Redirect B2C users to projects page (their main screen)
      if (!isB2B) {
        window.location.href = '/dashboard/projects'
        return
      }
      
      if (isB2B) {
        // B2B User
        const business = businessMember.businesses as any
        setBusinessName(business.name)
        setUserType('b2b')
        
        // Fetch B2B specific data
        const { count: productCount } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('business_id', business.id)
          .eq('is_active', true)

        const { data: sessions, count: sessionCount } = await supabase
          .from('staging_sessions')
          .select('processing_time_ms', { count: 'exact' })
          .eq('business_id', business.id)
          .eq('status', 'completed')
          
        statsData = {
          ...statsData,
          stagingLimit: business.monthly_staging_limit || 100,
          stagingUsed: business.monthly_staging_used || 0,
          totalProducts: productCount || 0,
          totalSessions: sessionCount || 0,
          userType: 'b2b'
        }
        
        // Calculate average time for B2B
        if (sessions?.length) {
          statsData.averageTime = Math.round(sessions.reduce((acc, s) => acc + (s.processing_time_ms || 0), 0) / sessions.length / 1000)
        }
      } else {
        // B2C User - Use actual data from database
        setUserType('b2c')
        
        // Fetch B2C specific data
        const { count: projectCount } = await supabase
          .from('projects')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .neq('status', 'archived')

        const { data: transformations, count: transformationCount } = await supabase
          .from('transformations')
          .select('processing_time_ms', { count: 'exact' })
          .eq('user_id', user.id)
          .eq('status', 'completed')
          
        statsData = {
          ...statsData,
          tokensAvailable: profile.tokens_available || 0,
          tokensUsed: profile.tokens_total_used || 0,
          totalProjects: projectCount || 0,
          totalTransformations: transformationCount || 0,
          userType: 'b2c'
        }
        
        // Calculate average time for B2C
        if (transformations?.length) {
          statsData.averageTime = Math.round(transformations.reduce((acc, t) => acc + (t.processing_time_ms || 0), 0) / transformations.length / 1000)
        }
      }

      // Fetch recent generations based on user type
      if (isB2B && businessMember?.businesses) {
        const business = businessMember.businesses as any
        
        const { data: recent } = await supabase
          .from('staging_sessions')
          .select(`
            id,
            created_at,
            product_id,
            staging_results (
              result_image_url,
              thumbnail_url
            )
          `)
          .eq('business_id', business.id)
          .eq('status', 'completed')
          .order('created_at', { ascending: false })
          .limit(6)
          
        if (recent && recent.length > 0) {
          const productIds = [...new Set(recent.map(r => r.product_id).filter(Boolean))]
          const { data: products } = await supabase
            .from('products')
            .select('id, name, category')
            .in('id', productIds)
            
          const productMap = new Map(products?.map(p => [p.id, { name: p.name, category: p.category }]) || [])
          
          recentData = recent
            .filter(s => s.staging_results && s.staging_results.length > 0)
            .map(s => {
              const product = productMap.get(s.product_id)
              const result = Array.isArray(s.staging_results) ? s.staging_results[0] : s.staging_results
              return {
                id: s.id,
                productName: product?.name || 'Producto',
                category: product?.category || 'general',
                resultImageUrl: result?.thumbnail_url || result?.result_image_url || '',
                createdAt: s.created_at
              }
            })
        }
      } else {
        // B2C - Fetch actual data from transformations
        const { data: recent } = await supabase
          .from('transformations')
          .select(`
            id,
            result_image_url,
            created_at,
            tokens_consumed,
            project_id,
            style_id,
            projects (id, name),
            design_styles (id, name)
          `)
          .eq('user_id', user.id)
          .eq('status', 'completed')
          .order('created_at', { ascending: false })
          .limit(6)
          
        if (recent && recent.length > 0) {
          recentData = recent.map(t => ({
            id: t.id,
            projectName: (t.projects as any)?.name || 'Sin proyecto',
            styleName: (t.design_styles as any)?.name || 'Personalizado',
            resultImageUrl: t.result_image_url || '',
            createdAt: t.created_at
          }))
        }
      }

      // Set the stats and recent generations
      setStats(statsData as Stats)
      setRecentGenerations(recentData)
      
      // Show wizard for new users
      if (statsData.userType === 'b2c' && statsData.totalProjects === 0) {
        setShowWizard(true)
      } else if (statsData.userType === 'b2b' && statsData.totalProducts === 0) {
        setShowWizard(true)
      }

      // Removed - already handled above

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      toast.error('Error al cargar los datos del panel')
    } finally {
      setLoading(false)
    }
  }

  const formatTimeAgo = (date: string) => {
    const now = new Date()
    const past = new Date(date)
    const diff = Math.floor((now.getTime() - past.getTime()) / 1000)
    
    if (diff < 60) return 'Hace unos segundos'
    if (diff < 3600) return `Hace ${Math.floor(diff / 60)} minutos`
    if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} horas`
    return `Hace ${Math.floor(diff / 86400)} días`
  }

  const quickStartSteps = userType === 'b2c' ? [
    { title: 'Crea un proyecto', description: 'Organiza por propiedad', href: '/dashboard/projects' },
    { title: 'Sube fotos', description: 'Espacios vacíos', href: '/dashboard/projects' },
    { title: 'Elige estilo', description: 'Moderno, escandinavo...', href: '/dashboard/styles' },
    { title: 'Genera staging', description: 'Transforma en segundos', href: '/dashboard/projects' }
  ] : [
    { title: 'Agrega productos', description: 'Catálogo B2B', href: '/dashboard/products' },
    { title: 'Crea enlaces', description: 'Para clientes', href: '/dashboard/quick-links' },
    { title: 'Personaliza', description: 'Tu marca', href: '/dashboard/branding' },
    { title: 'Comparte', description: 'Con clientes', href: '/dashboard/showcases' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Panel Principal</h1>
              <p className="text-sm text-gray-500 mt-1">
                {businessName ? `Panel de ${businessName}` : 'Bienvenido a tu espacio de trabajo B2B'}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/products">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Productos
                </Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/dashboard/quick-links">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Crear Enlace
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Quick Start Wizard for new users */}
        {showWizard && (
          <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Rocket className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-lg">Inicio Rápido</CardTitle>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowWizard(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </Button>
              </div>
              <CardDescription>
                Completa estos pasos para comenzar con tu primer staging virtual
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {quickStartSteps.map((step, index) => (
                  <Link key={index} href={step.href}>
                    <div className="group cursor-pointer">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-semibold">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm text-gray-900 group-hover:text-blue-600 transition-colors">
                            {step.title}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">{step.description}</p>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-blue-100">
                <Button size="sm" className="w-full" asChild>
                  <Link href="/dashboard/products">
                    Agregar mi primer producto
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Tokens Disponibles
                </CardTitle>
                <CreditCard className="h-4 w-4 text-gray-400" />
              </div>
            </CardHeader>
            <CardContent>
              {stats.userType === 'b2c' ? (
                <>
                  <div className="text-2xl font-bold text-gray-900">{stats.tokensAvailable || 0}</div>
                  <div className="flex items-center gap-2 mt-2">
                    <Progress value={(stats.tokensAvailable || 0) / ((stats.tokensAvailable || 0) + (stats.tokensUsed || 0)) * 100} className="h-2" />
                    <span className="text-xs text-gray-500">{stats.tokensUsed || 0} usados</span>
                  </div>
                  <Link href="/dashboard/pricing" className="text-xs text-blue-600 hover:text-blue-700 mt-2 inline-block">
                    Comprar tokens →
                  </Link>
                </>
              ) : (
                <>
                  <div className="text-2xl font-bold text-gray-900">{(stats.stagingLimit || 0) - (stats.stagingUsed || 0)}</div>
                  <div className="flex items-center gap-2 mt-2">
                    <Progress value={((stats.stagingUsed || 0) / (stats.stagingLimit || 1)) * 100} className="h-2" />
                    <span className="text-xs text-gray-500">{stats.stagingUsed || 0} / {stats.stagingLimit || 0}</span>
                  </div>
                  <Link href="/dashboard/subscription" className="text-xs text-blue-600 hover:text-blue-700 mt-2 inline-block">
                    Mejorar plan →
                  </Link>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Proyectos Activos
                </CardTitle>
                <FolderOpen className="h-4 w-4 text-gray-400" />
              </div>
            </CardHeader>
            <CardContent>
              {stats.userType === 'b2c' ? (
                <>
                  <div className="text-2xl font-bold text-gray-900">{stats.totalProjects || 0}</div>
                  <p className="text-xs text-gray-500 mt-1">
                    {(stats.totalProjects || 0) === 0 ? 'Sin proyectos aún' : `${stats.totalTransformations || 0} transformaciones totales`}
                  </p>
                  <Link href="/dashboard/projects" className="text-xs text-blue-600 hover:text-blue-700 mt-2 inline-block">
                    Ver proyectos →
                  </Link>
                </>
              ) : (
                <>
                  <div className="text-2xl font-bold text-gray-900">{stats.totalProducts || 0}</div>
                  <p className="text-xs text-gray-500 mt-1">
                    {(stats.totalProducts || 0) === 0 ? 'Sin productos aún' : `${stats.totalSessions || 0} sesiones totales`}
                  </p>
                  <Link href="/dashboard/products" className="text-xs text-blue-600 hover:text-blue-700 mt-2 inline-block">
                    Ver productos →
                  </Link>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Tiempo Promedio
                </CardTitle>
                <Clock className="h-4 w-4 text-gray-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.averageTime}s</div>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3 text-green-500" />
                <span className="text-xs text-green-600">15% más rápido</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">Por generación</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Tasa de Éxito
                </CardTitle>
                <ImageIcon className="h-4 w-4 text-gray-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.successRate}%</div>
              <Progress value={stats.successRate} className="h-2 mt-2" />
              <p className="text-xs text-gray-500 mt-2">Generaciones exitosas</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="group hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer border-gray-200">
            <Link href="/dashboard/projects">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FolderOpen className="h-5 w-5 text-blue-600" />
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                </div>
              </CardHeader>
              <CardContent>
                <CardTitle className="text-base mb-1">Gestionar Proyectos</CardTitle>
                <CardDescription className="text-xs">
                  Organiza tus generaciones por propiedad o cliente
                </CardDescription>
              </CardContent>
            </Link>
          </Card>

          <Card className="group hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer border-gray-200">
            <Link href="/dashboard/styles">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Sparkles className="h-5 w-5 text-purple-600" />
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-gray-400 group-hover:text-purple-600 transition-colors" />
                </div>
              </CardHeader>
              <CardContent>
                <CardTitle className="text-base mb-1">Estilos Personalizados</CardTitle>
                <CardDescription className="text-xs">
                  Crea y guarda tus propios estilos de diseño
                </CardDescription>
              </CardContent>
            </Link>
          </Card>

          <Card className="group hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer border-gray-200">
            <Link href="/dashboard/analytics">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-gray-400 group-hover:text-green-600 transition-colors" />
                </div>
              </CardHeader>
              <CardContent>
                <CardTitle className="text-base mb-1">Analíticas</CardTitle>
                <CardDescription className="text-xs">
                  Estadísticas y métricas de uso
                </CardDescription>
              </CardContent>
            </Link>
          </Card>
        </div>

        {/* Recent Generations */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Generaciones Recientes</CardTitle>
                <CardDescription>
                  Tus últimas transformaciones de staging virtual
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/gallery">
                  Ver todas
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="aspect-video bg-gray-100 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : recentGenerations.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <ImageIcon className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-600 font-medium mb-1">No hay generaciones aún</p>
                <p className="text-sm text-gray-500 mb-4">
                  Comienza creando tu primer proyecto de staging virtual
                </p>
                <Button size="sm" asChild>
                  <Link href="/dashboard/projects">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Crear Proyecto
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recentGenerations.map((generation) => (
                  <div key={generation.id} className="group relative">
                    <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                      <img 
                        src={generation.resultImageUrl} 
                        alt={generation.projectName || generation.productName || 'Staging'}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="absolute bottom-0 left-0 right-0 p-3">
                          <Button size="sm" variant="secondary" className="w-full">
                            <Download className="mr-2 h-3 w-3" />
                            Descargar
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {generation.projectName || generation.productName || 'Staging'}
                      </p>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-gray-500">
                          {generation.styleName || generation.category || 'General'} • {formatTimeAgo(generation.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tips Section */}
        <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
          <CardHeader className="pb-3">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div className="flex-1">
                <CardTitle className="text-base text-amber-900">Consejo del día</CardTitle>
                <CardDescription className="text-sm text-amber-700 mt-1">
                  Para mejores resultados, asegúrate de que tus fotos tengan buena iluminación natural 
                  y estén tomadas desde ángulos que muestren claramente el espacio completo.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>
    </div>
  )
}