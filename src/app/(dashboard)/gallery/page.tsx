'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  ImageIcon,
  Heart,
  Share2,
  Download,
  TrendingUp,
  Star,
  Search,
  Filter,
  Grid3x3,
  List,
  MapPin,
  User,
  Calendar,
  Eye,
  MessageCircle,
  Sparkles,
  ChevronRight,
  Bookmark,
  MoreVertical
} from 'lucide-react'

// Chilean-focused gallery data
const chileanGalleryItems = [
  {
    id: '1',
    title: 'Living Mediterráneo en Providencia',
    author: 'Sofía Mendoza',
    location: 'Providencia, Santiago',
    likes: 342,
    views: 1250,
    comments: 28,
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=800',
    tags: ['Mediterráneo Chileno', 'Luminoso', 'Urbano'],
    style: 'Mediterráneo Chileno',
    createdAt: 'Hace 3 días',
    isFeatured: true,
    saved: false
  },
  {
    id: '2',
    title: 'Dormitorio Boho Valparaíso',
    author: 'Camila Herrera',
    location: 'Cerro Alegre, Valparaíso',
    likes: 256,
    views: 890,
    comments: 15,
    image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=800',
    tags: ['Boho Valparaíso', 'Costero', 'Colorido'],
    style: 'Boho Valparaíso',
    createdAt: 'Hace 1 semana',
    isFeatured: false,
    saved: true
  },
  {
    id: '3',
    title: 'Cocina Moderna en Las Condes',
    author: 'Valentina Rojas',
    location: 'Las Condes, Santiago',
    likes: 189,
    views: 756,
    comments: 12,
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=800',
    tags: ['Moderno Santiago', 'Funcional', 'Elegante'],
    style: 'Moderno Santiago',
    createdAt: 'Hace 2 semanas',
    isFeatured: false,
    saved: false
  },
  {
    id: '4',
    title: 'Terraza Rústica Patagónica',
    author: 'Andrea Silva',
    location: 'Puerto Varas',
    likes: 428,
    views: 1580,
    comments: 34,
    image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?q=80&w=800',
    tags: ['Rústico Chilote', 'Madera', 'Acogedor'],
    style: 'Rústico Chilote',
    createdAt: 'Hace 4 días',
    isFeatured: true,
    saved: false
  },
  {
    id: '5',
    title: 'Estudio Creativo Bellavista',
    author: 'Luis Morales',
    location: 'Bellavista, Santiago',
    likes: 312,
    views: 1120,
    comments: 21,
    image: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?q=80&w=800',
    tags: ['Arte Barrio', 'Urbano', 'Creativo'],
    style: 'Arte Barrio',
    createdAt: 'Hace 5 días',
    isFeatured: false,
    saved: true
  },
  {
    id: '6',
    title: 'Comedor Colonial Moderno',
    author: 'María González',
    location: 'La Reina, Santiago',
    likes: 275,
    views: 920,
    comments: 18,
    image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=800',
    tags: ['Colonial Moderno', 'Elegante', 'Cálido'],
    style: 'Colonial Moderno',
    createdAt: 'Hace 1 semana',
    isFeatured: false,
    saved: false
  }
]

// Featured transformation data
const featuredTransformation = {
  id: 'featured',
  title: 'Casa Patrimonial en Barrio Yungay',
  description: 'Una renovación respetuosa que honra la arquitectura histórica de Santiago mientras integra elementos modernos con materiales locales',
  author: 'Isabella Fernández',
  location: 'Barrio Yungay, Santiago',
  image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=2000',
  beforeImage: 'https://images.unsplash.com/photo-1540932239986-30128078f3c5?q=80&w=2000',
  stats: {
    likes: 892,
    views: 3450,
    saves: 234,
    shares: 56
  }
}

export default function GalleryPage() {
  const [mounted, setMounted] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [activeTab, setActiveTab] = useState('all')
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)
  const [savedItems, setSavedItems] = useState<Set<string>>(new Set(['2', '5']))

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSave = (itemId: string) => {
    setSavedItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(itemId)) {
        newSet.delete(itemId)
      } else {
        newSet.add(itemId)
      }
      return newSet
    })
  }

  const filteredItems = chileanGalleryItems.filter(item => {
    if (activeTab === 'featured' && !item.isFeatured) return false
    if (activeTab === 'saved' && !savedItems.has(item.id)) return false
    if (searchTerm && !item.title.toLowerCase().includes(searchTerm.toLowerCase())) return false
    return true
  })

  return (
    <div className="min-h-screen">
      {/* Page Header - Magazine Style */}
      <div className="mb-10">
        <div className={`flex items-center gap-4 mb-8 transition-all duration-500 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
          <div className="w-12 h-12 bg-gradient-to-br from-[#A3B1A1] to-[#C4886F] flex items-center justify-center shadow-lg">
            <ImageIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-light text-[#333333] font-cormorant">
              Galería de Inspiración
            </h1>
            <p className="text-sm text-[#333333]/60 font-lato font-light mt-1">
              Descubre transformaciones reales de hogares chilenos
            </p>
          </div>
        </div>

        {/* Stats Bar */}
        <div className={`grid grid-cols-4 gap-4 mb-8 transition-all duration-500 delay-100 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
          <div className="bg-white p-4 border-l-2 border-[#A3B1A1]">
            <p className="text-2xl font-light font-cormorant text-[#333333]">1,234</p>
            <p className="text-xs text-[#333333]/60 font-lato uppercase tracking-wider">Transformaciones</p>
          </div>
          <div className="bg-white p-4 border-l-2 border-[#C4886F]">
            <p className="text-2xl font-light font-cormorant text-[#333333]">456</p>
            <p className="text-xs text-[#333333]/60 font-lato uppercase tracking-wider">Creadoras Activas</p>
          </div>
          <div className="bg-white p-4 border-l-2 border-[#A3B1A1]">
            <p className="text-2xl font-light font-cormorant text-[#333333]">42</p>
            <p className="text-xs text-[#333333]/60 font-lato uppercase tracking-wider">Estilos Chilenos</p>
          </div>
          <div className="bg-white p-4 border-l-2 border-[#C4886F]">
            <p className="text-2xl font-light font-cormorant text-[#333333]">89%</p>
            <p className="text-xs text-[#333333]/60 font-lato uppercase tracking-wider">Satisfacción</p>
          </div>
        </div>

        {/* Tabs - Clean Design */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className={`flex items-center justify-between gap-4 transition-all duration-500 delay-150 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            <TabsList className="bg-transparent p-0 h-auto flex gap-1">
              <TabsTrigger
                value="all"
                className="data-[state=active]:bg-[#A3B1A1]/10 data-[state=active]:text-[#A3B1A1] px-6 py-2.5 font-lato text-sm transition-all duration-300"
              >
                Todas
              </TabsTrigger>
              <TabsTrigger
                value="trending"
                className="data-[state=active]:bg-[#A3B1A1]/10 data-[state=active]:text-[#A3B1A1] px-6 py-2.5 font-lato text-sm transition-all duration-300"
              >
                <TrendingUp className="h-3 w-3 mr-2" />
                Tendencias
              </TabsTrigger>
              <TabsTrigger
                value="featured"
                className="data-[state=active]:bg-[#A3B1A1]/10 data-[state=active]:text-[#A3B1A1] px-6 py-2.5 font-lato text-sm transition-all duration-300"
              >
                <Star className="h-3 w-3 mr-2" />
                Destacadas
              </TabsTrigger>
              <TabsTrigger
                value="saved"
                className="data-[state=active]:bg-[#A3B1A1]/10 data-[state=active]:text-[#A3B1A1] px-6 py-2.5 font-lato text-sm transition-all duration-300"
              >
                <Bookmark className="h-3 w-3 mr-2" />
                Guardadas
              </TabsTrigger>
            </TabsList>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="icon"
                onClick={() => setViewMode('grid')}
                className={`transition-all duration-300 ${
                  viewMode === 'grid'
                    ? 'bg-[#333333] hover:bg-[#333333]/90 text-white'
                    : 'text-[#333333]/40 hover:text-[#333333]'
                }`}
              >
                <Grid3x3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="icon"
                onClick={() => setViewMode('list')}
                className={`transition-all duration-300 ${
                  viewMode === 'list'
                    ? 'bg-[#333333] hover:bg-[#333333]/90 text-white'
                    : 'text-[#333333]/40 hover:text-[#333333]'
                }`}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Tabs>
      </div>

      {/* Search & Filter Bar */}
      <div className={`mb-8 transition-all duration-500 delay-200 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#333333]/40" />
            <Input
              placeholder="Buscar transformaciones..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 bg-white border-[#333333]/10 focus:border-[#A3B1A1] font-lato h-12 transition-colors duration-300"
            />
          </div>

          <Button
            variant="outline"
            className="border-[#333333]/10 text-[#333333]/60 hover:border-[#A3B1A1]/30 hover:text-[#A3B1A1] font-lato transition-all duration-300"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtros Avanzados
          </Button>

          <Button
            className="bg-[#A3B1A1] hover:bg-[#A3B1A1]/90 text-white font-lato transition-all duration-300"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Compartir Mi Trabajo
          </Button>
        </div>
      </div>

      {/* Featured Hero - Magazine Style */}
      {activeTab === 'all' && (
        <div className={`mb-12 transition-all duration-500 delay-250 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
          <Card className="group relative h-[500px] overflow-hidden border-0 shadow-2xl">
            <Image
              src={featuredTransformation.image}
              alt={featuredTransformation.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-1000"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

            {/* Content Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-12 text-white">
              <Badge className="mb-4 bg-[#C4886F] text-white border-0 text-[10px] px-3 py-1 font-lato uppercase tracking-wider">
                Transformación de la Semana
              </Badge>

              <h2 className="text-5xl font-light font-cormorant mb-4 leading-tight">
                {featuredTransformation.title}
              </h2>

              <p className="text-lg font-lato font-light mb-6 text-white/90 max-w-2xl">
                {featuredTransformation.description}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-white/70" />
                    <span className="text-sm font-lato text-white/90">{featuredTransformation.author}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-white/70" />
                    <span className="text-sm font-lato text-white/90">{featuredTransformation.location}</span>
                  </div>
                </div>

                <Link href="/dashboard/gallery/featured">
                  <Button className="bg-white hover:bg-white/90 text-[#333333] font-lato transition-all duration-300">
                    Ver Proyecto Completo
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>

              {/* Stats Bar */}
              <div className="absolute top-8 right-8 flex items-center gap-4 text-white/90">
                <span className="flex items-center gap-1 text-sm font-lato">
                  <Heart className="h-4 w-4" />
                  {featuredTransformation.stats.likes}
                </span>
                <span className="flex items-center gap-1 text-sm font-lato">
                  <Eye className="h-4 w-4" />
                  {featuredTransformation.stats.views}
                </span>
                <span className="flex items-center gap-1 text-sm font-lato">
                  <Bookmark className="h-4 w-4" />
                  {featuredTransformation.stats.saves}
                </span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Gallery Content */}
      <div className={viewMode === 'grid'
        ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'
        : 'space-y-6'
      }>
        {filteredItems.map((item, index) => (
          viewMode === 'grid' ? (
            // Grid View - Magazine Cards
            <Card
              key={item.id}
              className={`group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-700 bg-white cursor-pointer
                ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
              `}
              style={{ transitionDelay: `${300 + index * 50}ms` }}
              onMouseEnter={() => setHoveredCard(item.id)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              {/* Image Container */}
              <div className="relative h-72 overflow-hidden">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-1000"
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Top Actions */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                  {item.isFeatured && (
                    <Badge className="bg-[#C4886F] text-white border-0 text-[10px] px-2 py-0.5 font-lato uppercase">
                      <Star className="h-3 w-3 mr-1" />
                      Destacada
                    </Badge>
                  )}
                  {!item.isFeatured && (
                    <Badge className="bg-white/90 backdrop-blur-sm text-[#333333] border-0 text-[10px] px-2 py-0.5 font-lato">
                      {item.style}
                    </Badge>
                  )}

                  <Button
                    size="icon"
                    variant="ghost"
                    className={`w-8 h-8 bg-white/90 backdrop-blur-sm hover:bg-white transition-all duration-300 ${
                      savedItems.has(item.id) ? 'text-[#C4886F]' : 'text-[#333333]/60'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleSave(item.id)
                    }}
                  >
                    <Bookmark className={`h-4 w-4 ${savedItems.has(item.id) ? 'fill-current' : ''}`} />
                  </Button>
                </div>

                {/* Bottom Actions - Hover */}
                <div className={`absolute bottom-4 left-4 right-4 flex items-center justify-between transition-all duration-500 ${
                  hoveredCard === item.id ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                }`}>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      className="bg-white/90 backdrop-blur-sm hover:bg-white text-[#333333] h-8 px-3 font-lato text-xs"
                    >
                      <Heart className="h-3 w-3 mr-1" />
                      {item.likes}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="bg-white/90 backdrop-blur-sm hover:bg-white text-[#333333] h-8 w-8 p-0"
                    >
                      <Share2 className="h-3 w-3" />
                    </Button>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="bg-white/90 backdrop-blur-sm hover:bg-white text-[#333333] h-8 w-8 p-0"
                  >
                    <Download className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {/* Content */}
              <CardContent className="p-6">
                <h3 className="text-xl font-light font-cormorant text-[#333333] mb-2 line-clamp-1">
                  {item.title}
                </h3>

                <div className="flex items-center gap-4 text-sm text-[#333333]/60 font-lato mb-4">
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {item.author}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {item.location}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs text-[#333333]/50 font-lato">
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {item.views}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="h-3 w-3" />
                      {item.comments}
                    </span>
                  </div>
                  <span className="text-xs text-[#333333]/40 font-lato">
                    {item.createdAt}
                  </span>
                </div>
              </CardContent>
            </Card>
          ) : (
            // List View - Horizontal Cards
            <Card
              key={item.id}
              className={`overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-500 bg-white
                ${mounted ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'}
              `}
              style={{ transitionDelay: `${300 + index * 50}ms` }}
            >
              <div className="flex">
                <div className="relative w-80 h-48">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover"
                  />
                  {item.isFeatured && (
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-[#C4886F] text-white border-0 text-[10px] px-2 py-0.5 font-lato uppercase">
                        <Star className="h-3 w-3 mr-1" />
                        Destacada
                      </Badge>
                    </div>
                  )}
                </div>

                <div className="flex-1 p-8">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-2xl font-light font-cormorant text-[#333333] mb-2">
                        {item.title}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-[#333333]/60 font-lato">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {item.author}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {item.location}
                        </span>
                        <Badge className="bg-[#F8F8F8] text-[#333333]/60 border-0 px-2 py-0.5 text-xs font-lato">
                          {item.style}
                        </Badge>
                      </div>
                    </div>

                    <Button
                      size="icon"
                      variant="ghost"
                      className={`transition-colors duration-300 ${
                        savedItems.has(item.id) ? 'text-[#C4886F]' : 'text-[#333333]/40'
                      }`}
                      onClick={() => handleSave(item.id)}
                    >
                      <Bookmark className={`h-5 w-5 ${savedItems.has(item.id) ? 'fill-current' : ''}`} />
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6 text-sm text-[#333333]/60 font-lato">
                      <span className="flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        {item.likes} me gusta
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {item.views} vistas
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="h-3 w-3" />
                        {item.comments} comentarios
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" className="text-[#333333]/60 hover:text-[#A3B1A1] font-lato">
                        <Share2 className="h-3 w-3 mr-2" />
                        Compartir
                      </Button>
                      <Button variant="ghost" size="icon" className="text-[#333333]/40 hover:text-[#333333]">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )
        ))}
      </div>

      {/* Load More */}
      <div className={`mt-12 text-center transition-all duration-500 delay-500 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
        <Button
          variant="outline"
          size="lg"
          className="border-[#333333]/20 hover:border-[#A3B1A1] text-[#333333] hover:text-[#A3B1A1] font-lato transition-all duration-300"
        >
          <Sparkles className="h-4 w-4 mr-2" />
          Cargar Más Transformaciones
        </Button>
      </div>
    </div>
  )
}