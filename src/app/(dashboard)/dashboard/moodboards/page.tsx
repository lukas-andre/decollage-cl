'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Camera,
  Plus,
  Search,
  MessageCircleHeart,
  Heart,
  Sparkles,
  Upload,
  Image as ImageIcon,
  Palette,
  Grid,
  Share2,
  Download,
  Clock,
  Filter,
  TrendingUp,
  ArrowRight
} from 'lucide-react'

// Mock data
const mockMoodboards = [
  {
    id: '1',
    title: 'Living Mediterráneo Chileno',
    description: 'Inspirado en las costas de Viña del Mar',
    images: 4,
    createdAt: 'Hace 2 días',
    thumbnail: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=600',
    likes: 24,
    isPublic: true,
    tags: ['Mediterráneo', 'Costero', 'Minimalista']
  },
  {
    id: '2',
    title: 'Dormitorio Otoño Santiago',
    description: 'Colores cálidos para el otoño chileno',
    images: 6,
    createdAt: 'Hace 1 semana',
    thumbnail: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=600',
    likes: 18,
    isPublic: false,
    tags: ['Otoñal', 'Cálido', 'Acogedor']
  },
  {
    id: '3',
    title: 'Cocina Moderna Las Condes',
    description: 'Elegancia urbana con toques naturales',
    images: 8,
    createdAt: 'Hace 2 semanas',
    thumbnail: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=600',
    likes: 42,
    isPublic: true,
    tags: ['Moderno', 'Urbano', 'Funcional']
  }
]

export default function MoodboardsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="min-h-screen">
      {/* Page Header - Refined */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h1 className={`text-2xl font-light text-[#333333] font-cormorant transition-all duration-500 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}`}>
                Moodboards
              </h1>
              <Badge className="bg-gradient-to-r from-[#A3B1A1]/10 to-[#C4886F]/10 text-[#333333]/60 border-0 text-[9px] px-2 py-0.5 font-lato uppercase">
                Demo
              </Badge>
            </div>
            <p className={`text-sm text-[#333333]/60 font-lato transition-all duration-500 delay-100 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}`}>
              Crea tableros de inspiración con múltiples imágenes
            </p>
          </div>

          <Link href="/dashboard/moodboards/create">
            <Button
              className="bg-[#A3B1A1] hover:bg-[#A3B1A1]/90 text-white transition-all duration-300"
              size="sm"
            >
              <Plus className="h-3 w-3 mr-2" />
              Crear Moodboard
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters Bar - Elegant */}
      <div className={`bg-white border-0 shadow-lg p-5 mb-8 transition-all duration-500 delay-200 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar moodboards..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 border-[#A3B1A1]/20 focus:border-[#A3B1A1]/40 bg-[#F8F8F8]/50 text-sm"
            />
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              size="sm"
              className="border-[#A3B1A1]/20 text-[#333333]/60 hover:bg-[#A3B1A1]/10 transition-colors duration-300"
              disabled
            >
              <Filter className="h-3 w-3 mr-2" />
              Filtros
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className={`transition-colors duration-300 ${viewMode === 'grid' ? 'bg-[#A3B1A1]/10 text-[#A3B1A1]' : 'text-[#333333]/40'}`}
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Banner - Refined */}
      <div className={`bg-white border-0 shadow-lg p-5 mb-8 transition-all duration-500 delay-300 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div>
              <p className="text-[11px] font-lato text-[#333333]/50 uppercase tracking-wider mb-1">Total Moodboards</p>
              <p className="text-xl font-cormorant text-[#333333]">3</p>
            </div>
            <div>
              <p className="text-[11px] font-lato text-[#333333]/50 uppercase tracking-wider mb-1">Imágenes</p>
              <p className="text-xl font-cormorant text-[#333333]">18</p>
            </div>
            <div>
              <p className="text-[11px] font-lato text-[#333333]/50 uppercase tracking-wider mb-1">Compartidos</p>
              <p className="text-xl font-cormorant text-[#333333]">2</p>
            </div>
          </div>

          <Badge className="bg-[#A3B1A1]/10 text-[#A3B1A1] border-0 text-[10px] px-2 py-0.5 font-lato uppercase">
            <TrendingUp className="h-3 w-3 mr-1" />
            Demo Data
          </Badge>
        </div>
      </div>

      {/* Moodboards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockMoodboards.map((moodboard) => (
          <Card
            key={moodboard.id}
            className={`group overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-0.5 bg-white ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
            style={{ transitionDelay: `${400 + parseInt(moodboard.id) * 100}ms` }}
          >
            <div className="relative h-48 overflow-hidden bg-gradient-to-br from-[#A3B1A1]/5 to-[#C4886F]/5">
                  <Image
                    src={moodboard.thumbnail}
                    alt={moodboard.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                  />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              {/* Overlay Actions - Simplified */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-1 group-hover:translate-y-0">
                <div className="flex items-center gap-2">
                  <span className="bg-white/90 px-2 py-1 text-xs flex items-center gap-1">
                    <Heart className="h-3 w-3" />
                    {moodboard.likes}
                  </span>
                </div>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" className="h-6 w-6 bg-white/90 hover:bg-white">
                    <Share2 className="h-3 w-3" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-6 w-6 bg-white/90 hover:bg-white">
                    <Download className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {/* Tags */}
              <div className="absolute top-3 left-3 flex gap-2">
                {moodboard.isPublic && (
                  <Badge className="bg-white/90 text-[#333333]/60 border-0 text-[9px] px-1.5 py-0.5">
                    Público
                  </Badge>
                )}
              </div>
            </div>

            <CardHeader className="p-5 pb-3">
              <CardTitle className="text-base font-cormorant font-normal text-[#333333] mb-1">
                {moodboard.title}
              </CardTitle>
              <CardDescription className="text-xs font-lato text-[#333333]/60">
                {moodboard.description}
              </CardDescription>
            </CardHeader>

            <CardContent className="px-5 pb-5">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-[10px] text-[#333333]/50 font-lato">
                  <span className="flex items-center gap-1">
                    <Camera className="h-2.5 w-2.5" />
                    {moodboard.images} imágenes
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-2.5 w-2.5" />
                    {moodboard.createdAt}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1">
                  {moodboard.tags.slice(0, 2).map((tag) => (
                    <Badge key={tag} className="bg-[#F8F8F8] text-[#333333]/50 border-0 text-[9px] px-1.5 py-0.5 font-lato">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <Link href={`/dashboard/moodboards/${moodboard.id}`}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-[#A3B1A1] hover:bg-[#A3B1A1]/10 transition-colors duration-300 text-xs h-8"
                  >
                    Ver Moodboard
                    <ArrowRight className="h-2.5 w-2.5 ml-1 group-hover:translate-x-0.5 transition-transform" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
            ))}

        {/* Create New Card */}
        <Link href="/dashboard/moodboards/create">
          <Card className={`group h-full min-h-[350px] border border-dashed border-[#A3B1A1]/20 hover:border-[#A3B1A1]/40 transition-all duration-500 cursor-pointer bg-white/50 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
            style={{ transitionDelay: '700ms' }}
          >
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <div className="w-12 h-12 bg-[#A3B1A1]/10 group-hover:bg-[#A3B1A1]/20 flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-105">
                <Plus className="h-6 w-6 text-[#A3B1A1]" />
              </div>
              <h3 className="text-lg font-cormorant font-light text-[#333333] mb-2">
                Crear Nuevo Moodboard
              </h3>
              <p className="text-xs font-lato text-[#333333]/60 max-w-xs">
                Combina múltiples imágenes para crear tu visión perfecta
              </p>
            </div>
          </Card>
        </Link>
      </div>
    </div>
  )
}