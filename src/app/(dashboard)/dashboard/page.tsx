'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useUserProfile } from '@/hooks/useUserProfile'
import {
  Heart,
  Camera,
  Sparkles,
  ImageIcon,
  ArrowRight,
  Sun,
  Palette,
  Home,
  FolderOpen,
  Calendar,
  Clock
} from 'lucide-react'
import { createBrowserClient } from '@supabase/ssr'

interface UserStats {
  tokensAvailable: number
  totalSpaces: number
  totalTransformations: number
  recentActivity: string
}

interface FeaturedTransformation {
  id: string
  spaceName: string
  styleName: string
  imageUrl: string
  createdAt: string
}

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false)
  const [stats, setStats] = useState<UserStats>({
    tokensAvailable: 0,
    totalSpaces: 0,
    totalTransformations: 0,
    recentActivity: 'Hace 2 días'
  })
  const [featuredTransformations, setFeaturedTransformations] = useState<FeaturedTransformation[]>([])
  const [loading, setLoading] = useState(true)
  const [currentSeason, setCurrentSeason] = useState('Otoño Austral')
  const { getFirstName } = useUserProfile()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    setMounted(true)
    fetchUserData()
    setCurrentSeasonData()
  }, [])

  const setCurrentSeasonData = () => {
    const month = new Date().getMonth()
    if (month >= 2 && month <= 4) setCurrentSeason('Otoño Austral')
    else if (month >= 5 && month <= 7) setCurrentSeason('Invierno Acogedor')
    else if (month === 8) setCurrentSeason('Fiestas Patrias')
    else if (month >= 9 && month <= 11) setCurrentSeason('Primavera Chilena')
    else setCurrentSeason('Verano Costero')
  }

  const fetchUserData = async () => {
    try {
      setLoading(true)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get user profile and token balance
      const { data: profile } = await supabase
        .from('profiles')
        .select('tokens_available')
        .eq('id', user.id)
        .single()

      // Get project count
      const { count: projectCount } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .neq('status', 'archived')

      // Get transformation count
      const { count: transformationCount } = await supabase
        .from('transformations')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'completed')

      setStats({
        tokensAvailable: profile?.tokens_available || 0,
        totalSpaces: projectCount || 0,
        totalTransformations: transformationCount || 0,
        recentActivity: transformationCount! > 0 ? 'Hace 1 día' : 'Sin actividad'
      })

      // Get recent transformations for dashboard display
      const { data: recentTransformations } = await supabase
        .from('staging_generations')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(6)

      const featured: FeaturedTransformation[] = (recentTransformations || []).map(t => ({
        id: t.id,
        spaceName: `Generación ${t.id.slice(0, 8)}`,
        styleName: 'Estilo AI',
        imageUrl: t.result_image_url || '',
        createdAt: t.created_at
      }))

      setFeaturedTransformations(featured)

    } catch (error) {
      console.error('Error fetching user data:', error)
    } finally {
      setLoading(false)
    }
  }

  const seasonalPalettes = {
    'Otoño Austral': {
      colors: ['#D2691E', '#CD853F', '#F4A460', '#DEB887'],
      description: 'Tonos cálidos inspirados en los otoños del sur de Chile'
    },
    'Invierno Acogedor': {
      colors: ['#708090', '#2F4F4F', '#696969', '#A0A0A0'],
      description: 'Colores que abrazan durante los fríos inviernos chilenos'
    },
    'Fiestas Patrias': {
      colors: ['#DC143C', '#FFFFFF', '#191970', '#B22222'],
      description: 'Celebra septiembre con los colores de nuestra bandera'
    },
    'Primavera Chilena': {
      colors: ['#98FB98', '#90EE90', '#32CD32', '#228B22'],
      description: 'Verdes frescos que florecen en primavera'
    },
    'Verano Costero': {
      colors: ['#87CEEB', '#4682B4', '#B0E0E6', '#F0F8FF'],
      description: 'Azules del océano Pacífico chileno'
    }
  }

  const currentPalette = seasonalPalettes[currentSeason as keyof typeof seasonalPalettes]

  return (
    <div className="min-h-screen">
      {/* Welcome Header - Refined */}
      <div className="mb-10">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 bg-gradient-to-br from-[#A3B1A1] to-[#C4886F] flex items-center justify-center shadow-lg transition-all duration-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
            <Sun className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className={`text-3xl font-light text-[#333333] font-cormorant mb-1 transition-all duration-500 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}`}>
              Buenos días, {getFirstName()}
            </h1>
            <p className={`text-sm text-[#333333]/60 font-lato font-light transition-all duration-500 delay-100 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}`}>
              Lista para transformar tu hogar con Decollage
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <Card className={`border-0 shadow-lg hover:shadow-xl transition-all duration-500 bg-white relative overflow-hidden group ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
          <div className="absolute inset-0 bg-gradient-to-br from-[#A3B1A1]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          <CardContent className="p-6 relative">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-[11px] font-lato text-[#333333]/50 uppercase tracking-wider">Tokens Disponibles</p>
                <p className="text-2xl font-light text-[#333333] font-cormorant">
                  {loading ? (
                    <span className="inline-block w-12 h-7 bg-[#F8F8F8] animate-pulse rounded" />
                  ) : (
                    stats.tokensAvailable
                  )}
                </p>
                <Link
                  href="/dashboard/tokens"
                  className="inline-flex items-center text-xs text-[#A3B1A1] hover:text-[#A3B1A1]/80 font-lato transition-colors duration-300 group/link"
                >
                  <span>Comprar más</span>
                  <ArrowRight className="ml-1 h-3 w-3 transition-transform duration-300 group-hover/link:translate-x-0.5" />
                </Link>
              </div>
              <div className="w-10 h-10 bg-[#A3B1A1]/10 flex items-center justify-center transition-transform duration-500 group-hover:scale-105">
                <Sparkles className="h-5 w-5 text-[#A3B1A1]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`border-0 shadow-lg hover:shadow-xl transition-all duration-500 delay-75 bg-white relative overflow-hidden group ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
          <div className="absolute inset-0 bg-gradient-to-br from-[#C4886F]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          <CardContent className="p-6 relative">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-[11px] font-lato text-[#333333]/50 uppercase tracking-wider">Mis Espacios</p>
                <p className="text-2xl font-light text-[#333333] font-cormorant">
                  {loading ? (
                    <span className="inline-block w-12 h-7 bg-[#F8F8F8] animate-pulse rounded" />
                  ) : (
                    stats.totalSpaces
                  )}
                </p>
                <Link
                  href="/dashboard/projects"
                  className="inline-flex items-center text-xs text-[#C4886F] hover:text-[#C4886F]/80 font-lato transition-colors duration-300 group/link"
                >
                  <span>Ver todos</span>
                  <ArrowRight className="ml-1 h-3 w-3 transition-transform duration-300 group-hover/link:translate-x-0.5" />
                </Link>
              </div>
              <div className="w-10 h-10 bg-[#C4886F]/10 flex items-center justify-center transition-transform duration-500 group-hover:scale-105">
                <Home className="h-5 w-5 text-[#C4886F]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`border-0 shadow-lg hover:shadow-xl transition-all duration-500 delay-150 bg-white relative overflow-hidden group ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
          <div className="absolute inset-0 bg-gradient-to-br from-[#A3B1A1]/5 via-transparent to-[#C4886F]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          <CardContent className="p-6 relative">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <p className="text-[11px] font-lato text-[#333333]/50 uppercase tracking-wider">Transformaciones</p>
                  <Badge className="bg-[#F8F8F8] text-[#333333]/50 border-0 text-[9px] px-1.5 py-0.5 font-lato uppercase">
                    Demo
                  </Badge>
                </div>
                <p className="text-2xl font-light text-[#333333] font-cormorant">
                  {loading ? (
                    <span className="inline-block w-12 h-7 bg-[#F8F8F8] animate-pulse rounded" />
                  ) : (
                    stats.totalTransformations
                  )}
                </p>
                <p className="text-xs text-[#333333]/40 font-lato">
                  Última: {stats.recentActivity}
                </p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-[#A3B1A1] to-[#C4886F] flex items-center justify-center transition-transform duration-500 group-hover:scale-105">
                <ImageIcon className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Seasonal Inspiration */}
      <Card className={`mb-10 border-0 shadow-lg overflow-hidden bg-white transition-all duration-500 delay-200 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
        <div className="bg-gradient-to-r from-[#A3B1A1]/5 via-white to-[#C4886F]/5 p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-[#A3B1A1]" />
                <Badge className="bg-[#A3B1A1]/10 text-[#A3B1A1] border-0 px-2 py-0.5 text-[10px] font-lato uppercase">
                  {currentSeason}
                </Badge>
                <Badge className="bg-[#F8F8F8] text-[#333333]/50 border-0 px-2 py-0.5 text-[9px] font-lato uppercase">
                  Próximamente
                </Badge>
              </div>
              <h2 className="text-xl font-light text-[#333333] font-cormorant">
                Inspiración de Temporada
              </h2>
              <p className="text-sm text-[#333333]/60 font-lato max-w-md">
                {currentPalette.description}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-[#A3B1A1] hover:bg-[#A3B1A1]/10 transition-colors duration-300"
              disabled
            >
              <Palette className="mr-2 h-3 w-3" />
              Explorar
            </Button>
          </div>

          <div className="flex gap-2 mt-4">
            {currentPalette.colors.map((color, index) => (
              <div
                key={index}
                className="group relative"
              >
                <div
                  className="w-10 h-10 shadow-md border border-white transition-all duration-300 hover:scale-105 cursor-pointer"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Recent Generations */}
      <Card className={`mb-10 border-0 shadow-lg overflow-hidden bg-white transition-all duration-500 delay-300 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
        <CardHeader className="border-b border-[#A3B1A1]/10 bg-gradient-to-r from-white via-[#A3B1A1]/2 to-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#A3B1A1] to-[#C4886F] flex items-center justify-center">
                <ImageIcon className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-light text-[#333333] font-cormorant">
                  Últimas Generaciones
                </CardTitle>
                <CardDescription className="font-lato text-sm">
                  Tus transformaciones más recientes
                </CardDescription>
              </div>
            </div>
            <Link href="/dashboard/projects/transformations">
              <Button
                variant="ghost"
                size="sm"
                className="text-[#A3B1A1] hover:bg-[#A3B1A1]/10 font-lato transition-colors duration-300"
              >
                Ver todas
                <ArrowRight className="ml-2 h-3 w-3" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {featuredTransformations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredTransformations.slice(0, 6).map((transformation) => (
                <div
                  key={transformation.id}
                  className="group relative aspect-[4/3] bg-[#F8F8F8] overflow-hidden cursor-pointer transition-all duration-500 hover:shadow-xl"
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <p className="font-cormorant text-sm">{transformation.spaceName}</p>
                    <p className="font-lato text-xs opacity-80">{transformation.styleName}</p>
                    <p className="font-lato text-xs opacity-60">
                      {new Date(transformation.createdAt).toLocaleDateString('es-CL')}
                    </p>
                  </div>
                  {transformation.imageUrl && (
                    <img
                      src={transformation.imageUrl}
                      alt={transformation.spaceName}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Badge className="bg-white/90 text-[#333333] border-0 text-xs font-lato">
                      Ver proyecto
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-[#A3B1A1]/10 flex items-center justify-center mx-auto mb-4">
                <ImageIcon className="h-8 w-8 text-[#A3B1A1]/40" />
              </div>
              <h3 className="text-lg font-light text-[#333333] font-cormorant mb-2">
                Aún no tienes transformaciones
              </h3>
              <p className="text-sm text-[#333333]/60 font-lato mb-6 max-w-md mx-auto">
                Crea tu primer proyecto y comienza a transformar tus espacios con IA
              </p>
              <Link href="/dashboard/projects">
                <Button className="bg-[#A3B1A1] hover:bg-[#A3B1A1]/90 text-white font-lato">
                  <FolderOpen className="mr-2 h-4 w-4" />
                  Crear Proyecto
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity or Getting Started */}
      {stats.totalTransformations === 0 ? (
        <Card className={`border-0 shadow-lg bg-white transition-all duration-500 delay-350 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-[#A3B1A1]/10 to-[#C4886F]/10 flex items-center justify-center mx-auto mb-6">
              <Sparkles className="h-8 w-8 text-[#A3B1A1]" />
            </div>

            <h3 className="text-2xl font-light text-[#333333] mb-3 font-cormorant">
              ¡Bienvenida a Decollage!
            </h3>

            <p className="text-sm text-[#333333]/60 mb-6 max-w-md mx-auto font-lato leading-relaxed">
              Comienza tu viaje de transformación creando tu primer espacio y explorando las posibilidades infinitas
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                className="bg-[#A3B1A1] hover:bg-[#A3B1A1]/90 text-white transition-colors duration-300"
                size="sm"
                asChild
              >
                <Link href="/dashboard/projects">
                  <FolderOpen className="mr-2 h-3 w-3" />
                  Crear Mi Primer Espacio
                </Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-[#C4886F]/30 text-[#C4886F] hover:bg-[#C4886F]/10 transition-colors duration-300"
                asChild
              >
                <Link href="/dashboard/gallery">
                  <ImageIcon className="mr-2 h-3 w-3" />
                  Ver Ejemplos
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className={`border-0 shadow-lg bg-white transition-all duration-500 delay-350 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-light text-[#333333] font-cormorant">
                  Tus Últimas Creaciones
                </CardTitle>
                <CardDescription className="font-lato text-sm text-[#333333]/60 mt-1">
                  Revisa y continúa trabajando en tus espacios
                </CardDescription>
              </div>
              <Badge className="bg-[#F8F8F8] text-[#333333]/50 border-0 px-2 py-0.5 text-[9px] font-lato uppercase">
                Próximamente
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-[#333333]/50">
              <Clock className="h-10 w-10 mx-auto mb-4 text-[#A3B1A1]/30" />
              <p className="font-lato text-sm">Cargando tus transformaciones recientes...</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}