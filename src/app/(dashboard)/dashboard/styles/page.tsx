'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Heart,
  Palette,
  Search,
  Star,
  Plus,
  Sparkles,
  Mountain,
  Waves,
  TreePine,
  Home,
  Grape,
  Sun,
  Snowflake,
  Calendar,
  ArrowRight,
  Eye
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ChileanStyle {
  id: string
  name: string
  description: string
  category: 'coastal' | 'andean' | 'desert' | 'patagonian' | 'urban' | 'seasonal'
  colors: string[]
  inspiration: string
  popularity: number
  preview?: string
}

const chileanStyles: ChileanStyle[] = [
  {
    id: '1',
    name: 'Mediterráneo Chileno',
    description: 'Inspirado en la costa de Viña del Mar con azules y blancos',
    category: 'coastal',
    colors: ['#4A90E2', '#FFFFFF', '#F5F5DC', '#87CEEB'],
    inspiration: 'Costa del Pacífico chileno',
    popularity: 95
  },
  {
    id: '2',
    name: 'Boho Valparaíso',
    description: 'Colores vibrantes y arte urbano de los cerros porteños',
    category: 'coastal',
    colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A'],
    inspiration: 'Cerros de Valparaíso',
    popularity: 88
  },
  {
    id: '3',
    name: 'Rústico del Sur',
    description: 'Maderas nobles y texturas de la Patagonia chilena',
    category: 'patagonian',
    colors: ['#8B4513', '#D2B48C', '#228B22', '#696969'],
    inspiration: 'Bosques patagónicos',
    popularity: 82
  },
  {
    id: '4',
    name: 'Minimalista Santiago',
    description: 'Elegancia urbana con toques de la cordillera',
    category: 'urban',
    colors: ['#F5F5F5', '#333333', '#A3B1A1', '#E8E8E8'],
    inspiration: 'Arquitectura capitalina',
    popularity: 91
  },
  {
    id: '5',
    name: 'Desierto Florido',
    description: 'Colores del fenómeno único del norte de Chile',
    category: 'desert',
    colors: ['#DDA0DD', '#FFB6C1', '#F0E68C', '#98FB98'],
    inspiration: 'Desierto de Atacama en flor',
    popularity: 76
  },
  {
    id: '6',
    name: 'Otoño Austral',
    description: 'Tonos cálidos del otoño en el sur de Chile',
    category: 'seasonal',
    colors: ['#D2691E', '#CD853F', '#B22222', '#DEB887'],
    inspiration: 'Otoño en la Región de los Lagos',
    popularity: 85
  }
]

const seasonalCollections = [
  {
    id: 'fiestas-patrias',
    name: 'Fiestas Patrias',
    description: 'Celebra septiembre con orgullo chileno',
    colors: ['#DC143C', '#FFFFFF', '#191970'],
    season: 'Septiembre',
    icon: <Star className="h-6 w-6" />
  },
  {
    id: 'verano-costero',
    name: 'Verano Costero',
    description: 'Frescura del litoral chileno',
    colors: ['#87CEEB', '#F0F8FF', '#20B2AA'],
    season: 'Diciembre - Marzo',
    icon: <Waves className="h-6 w-6" />
  },
  {
    id: 'invierno-acogedor',
    name: 'Invierno Acogedor',
    description: 'Calidez durante los fríos meses',
    colors: ['#8B4513', '#D2B48C', '#A0522D'],
    season: 'Junio - Agosto',
    icon: <Snowflake className="h-6 w-6" />
  }
]

const categoryIcons = {
  coastal: <Waves className="h-5 w-5" />,
  andean: <Mountain className="h-5 w-5" />,
  desert: <Sun className="h-5 w-5" />,
  patagonian: <TreePine className="h-5 w-5" />,
  urban: <Home className="h-5 w-5" />,
  seasonal: <Calendar className="h-5 w-5" />
}

const categoryNames = {
  coastal: 'Costero',
  andean: 'Andino',
  desert: 'Desértico',
  patagonian: 'Patagónico',
  urban: 'Urbano',
  seasonal: 'Estacional'
}

export default function EstilosChilenosPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [activeTab, setActiveTab] = useState('chilean')

  const categories = ['all', ...Object.keys(categoryNames)] as const

  const filteredStyles = chileanStyles.filter(style => {
    const matchesSearch = style.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         style.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || style.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-light text-[#333333] font-[family-name:var(--font-cormorant)]">
              Estilos Chilenos
            </h1>
            <p className="text-[#333333]/70 mt-2 font-[family-name:var(--font-lato)]">
              Descubre la belleza de Chile en cada rincón de tu hogar
            </p>
          </div>

          <Button
            variant="outline"
            className="border-[#A3B1A1] text-[#A3B1A1] hover:bg-[#A3B1A1] hover:text-white"
          >
            <Plus className="mr-2 h-4 w-4" />
            Crear Estilo Personalizado
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-8">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar estilos chilenos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 border-gray-200/50 focus:border-[#A3B1A1] focus:ring-[#A3B1A1] bg-white/80"
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-white/80 backdrop-blur-sm">
          <TabsTrigger value="chilean" className="data-[state=active]:bg-[#A3B1A1] data-[state=active]:text-white">
            <Heart className="mr-2 h-4 w-4" />
            Estilos Chilenos
          </TabsTrigger>
          <TabsTrigger value="seasonal" className="data-[state=active]:bg-[#C4886F] data-[state=active]:text-white">
            <Calendar className="mr-2 h-4 w-4" />
            Temporadas
          </TabsTrigger>
          <TabsTrigger value="personal" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#A3B1A1] data-[state=active]:to-[#C4886F] data-[state=active]:text-white">
            <Sparkles className="mr-2 h-4 w-4" />
            Mis Estilos
          </TabsTrigger>
        </TabsList>

        {/* Chilean Styles Tab */}
        <TabsContent value="chilean" className="space-y-6">
          {/* Category Filter */}
          <div className="flex gap-2 flex-wrap">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className={cn(
                  "transition-all duration-300",
                  selectedCategory === category
                    ? "bg-[#A3B1A1] hover:bg-[#A3B1A1]/90 text-white"
                    : "border-gray-200 text-[#333333] hover:border-[#A3B1A1] hover:text-[#A3B1A1]"
                )}
              >
                {category !== 'all' && categoryIcons[category as keyof typeof categoryIcons]}
                <span className="ml-1">
                  {category === 'all' ? 'Todos' : categoryNames[category as keyof typeof categoryNames]}
                </span>
              </Button>
            ))}
          </div>

          {/* Styles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStyles.map((style) => (
              <Card
                key={style.id}
                className="group bg-white/80 backdrop-blur-sm border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-1 overflow-hidden cursor-pointer"
              >
                <div className="relative h-32 bg-gradient-to-br from-gray-100 to-gray-200">
                  <div className="absolute inset-0 flex">
                    {style.colors.map((color, index) => (
                      <div
                        key={index}
                        className="flex-1 transition-all duration-300 group-hover:scale-105"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>

                  <div className="absolute top-3 right-3">
                    <Badge
                      variant="secondary"
                      className="bg-white/90 backdrop-blur-sm text-[#333333] border-white/50"
                    >
                      {categoryIcons[style.category]}
                      <span className="ml-1">{categoryNames[style.category]}</span>
                    </Badge>
                  </div>

                  <div className="absolute bottom-3 left-3">
                    <div className="flex items-center gap-1 text-white text-xs bg-black/30 backdrop-blur-sm rounded-full px-2 py-1">
                      <Heart className="h-3 w-3" />
                      <span>{style.popularity}%</span>
                    </div>
                  </div>
                </div>

                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div>
                      <h3 className="text-lg font-normal text-[#333333] font-[family-name:var(--font-cormorant)] mb-1">
                        {style.name}
                      </h3>
                      <p className="text-sm text-[#333333]/70 font-[family-name:var(--font-lato)]">
                        {style.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="text-xs text-[#333333]/60 font-[family-name:var(--font-lato)]">
                        Inspirado en: {style.inspiration}
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-[#C4886F] hover:text-[#C4886F]/80 p-0 h-auto"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-[#A3B1A1] hover:text-[#A3B1A1]/80 p-0 h-auto"
                        >
                          Usar
                          <ArrowRight className="ml-1 h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Seasonal Collections Tab */}
        <TabsContent value="seasonal" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {seasonalCollections.map((collection) => (
              <Card
                key={collection.id}
                className="group bg-white/80 backdrop-blur-sm border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-1 overflow-hidden cursor-pointer"
              >
                <div className="relative h-40 bg-gradient-to-br from-gray-100 to-gray-200">
                  <div className="absolute inset-0 flex">
                    {collection.colors.map((color, index) => (
                      <div
                        key={index}
                        className="flex-1"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>

                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <div className="text-white text-center">
                      {collection.icon}
                      <div className="text-xs mt-2 font-[family-name:var(--font-lato)]">
                        {collection.season}
                      </div>
                    </div>
                  </div>
                </div>

                <CardContent className="p-6">
                  <h3 className="text-lg font-normal text-[#333333] font-[family-name:var(--font-cormorant)] mb-2">
                    {collection.name}
                  </h3>
                  <p className="text-sm text-[#333333]/70 font-[family-name:var(--font-lato)] mb-4">
                    {collection.description}
                  </p>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-[#C4886F] text-[#C4886F] hover:bg-[#C4886F] hover:text-white"
                  >
                    Explorar Colección
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Current Season Highlight */}
          <Card className="bg-gradient-to-r from-[#A3B1A1]/10 to-[#C4886F]/10 border-gray-200/50 shadow-lg">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-[#A3B1A1] to-[#C4886F] rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-white" />
              </div>

              <h3 className="text-2xl font-light text-[#333333] mb-3 font-[family-name:var(--font-cormorant)]">
                Estamos en Otoño Austral
              </h3>

              <p className="text-[#333333]/70 mb-6 font-[family-name:var(--font-lato)]">
                Descubre los colores cálidos que abrazan durante esta temporada del año
              </p>

              <Button className="bg-[#A3B1A1] hover:bg-[#A3B1A1]/90 text-white">
                <Palette className="mr-2 h-4 w-4" />
                Ver Paleta de Otoño
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Personal Styles Tab */}
        <TabsContent value="personal" className="space-y-6">
          <Card className="bg-white/80 backdrop-blur-sm border-gray-200/50 shadow-lg">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-[#A3B1A1]/20 to-[#C4886F]/20 rounded-full flex items-center justify-center mb-6">
                <Sparkles className="h-10 w-10 text-[#A3B1A1]" />
              </div>

              <h3 className="text-2xl font-light text-[#333333] mb-3 font-[family-name:var(--font-cormorant)]">
                Crea tu estilo único
              </h3>

              <p className="text-[#333333]/70 mb-6 max-w-md font-[family-name:var(--font-lato)]">
                Combina la inspiración chilena con tu toque personal para crear estilos únicos que reflejen tu personalidad
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button className="bg-[#A3B1A1] hover:bg-[#A3B1A1]/90 text-white">
                  <Plus className="mr-2 h-4 w-4" />
                  Crear Mi Primer Estilo
                </Button>
                <Button
                  variant="outline"
                  className="border-[#C4886F] text-[#C4886F] hover:bg-[#C4886F] hover:text-white"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Ver Tutoriales
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Featured Chilean Inspiration */}
      <div className="mt-12">
        <h2 className="text-2xl font-light text-[#333333] mb-6 font-[family-name:var(--font-cormorant)]">
          Inspiración desde Chile
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="group bg-white/80 backdrop-blur-sm border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-500 overflow-hidden cursor-pointer">
            <div className="h-48 bg-gradient-to-br from-blue-400 to-blue-600 relative">
              <div className="absolute inset-0 bg-black/20" />
              <div className="absolute bottom-4 left-4 text-white">
                <h3 className="text-lg font-normal font-[family-name:var(--font-cormorant)]">Rapa Nui Mystique</h3>
                <p className="text-sm opacity-90 font-[family-name:var(--font-lato)]">Colores del atardecer en Isla de Pascua</p>
              </div>
            </div>
          </Card>

          <Card className="group bg-white/80 backdrop-blur-sm border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-500 overflow-hidden cursor-pointer">
            <div className="h-48 bg-gradient-to-br from-green-500 to-green-700 relative">
              <div className="absolute inset-0 bg-black/20" />
              <div className="absolute bottom-4 left-4 text-white">
                <h3 className="text-lg font-normal font-[family-name:var(--font-cormorant)]">Valle Central</h3>
                <p className="text-sm opacity-90 font-[family-name:var(--font-lato)]">Inspirado en los viñedos chilenos</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}