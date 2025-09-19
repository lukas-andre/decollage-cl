'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import {
  Home,
  Baby,
  Trees,
  Sparkles,
  ChevronDown,
  Armchair,
  Palette,
  Ruler,
  AlertCircle,
  Loader2,
  Star,
  Bed,
  Sofa,
  Bath,
  Coffee,
  Briefcase,
  Sun,
  Mountain,
  Heart,
  Rocket,
  PaintBucket,
  Blocks,
  ShoppingBag,
  RefreshCw,
  Move,
  Plus,
} from 'lucide-react'

interface DesignData {
  styles: Array<{
    id: string
    name: string
    code: string
    macrocategory?: string | null
    description?: string
  }>
  roomTypes: Array<{
    id: string
    name: string
    code: string
    description?: string
  }>
  colorPalettes: Array<{
    id: string
    name: string
    code: string
    hex_colors: string[]
  }>
}

interface GenerationFormProps {
  designData: DesignData | null
  selectedBaseImage: any
  generating: boolean
  hasTokens: boolean
  tokenBalance: number
  onGenerate: (params: {
    style_id?: string
    room_type_id?: string
    color_scheme_id?: string
    furniture_mode: string
    custom_prompt?: string
    dimensions?: {
      width: number | null
      height: number | null
    }
  }) => void
  onNoTokens: () => void
}

// Room type icons mapping
const roomIcons: Record<string, React.ReactNode> = {
  'living': <Sofa className="h-5 w-5" />,
  'sala_estar': <Coffee className="h-5 w-5" />,
  'dormitorio': <Bed className="h-5 w-5" />,
  'comedor': <ShoppingBag className="h-5 w-5" />,
  'dormitorio_ninos': <Baby className="h-5 w-5" />,
  'cocina': <Coffee className="h-5 w-5" />,
  'dormitorio_principal': <Heart className="h-5 w-5" />,
  'bano': <Bath className="h-5 w-5" />,
  'terraza': <Sun className="h-5 w-5" />,
  'bano_visitas': <Bath className="h-5 w-5" />,
  'jardin': <Trees className="h-5 w-5" />,
  'home_office': <Briefcase className="h-5 w-5" />,
  'logia': <Mountain className="h-5 w-5" />,
  'entrada': <Home className="h-5 w-5" />,
  'quincho': <Mountain className="h-5 w-5" />,
  'bodega': <Mountain className="h-5 w-5" />,
  // Children's rooms
  'pieza_nino': <Rocket className="h-5 w-5" />,
  'pieza_nina': <Heart className="h-5 w-5" />,
  'pieza_bebe': <Baby className="h-5 w-5" />,
  'sala_juegos': <Blocks className="h-5 w-5" />,
}

// Style icons for macrocategories
const styleIcons: Record<string, React.ReactNode> = {
  'Modern': <Home className="h-4 w-4" />,
  'Classic': <Star className="h-4 w-4" />,
  'Regional': <Mountain className="h-4 w-4" />,
  'Luxury': <Sparkles className="h-4 w-4" />,
  'Nature': <Trees className="h-4 w-4" />,
  'Lifestyle': <Coffee className="h-4 w-4" />,
  'Infantil': <Baby className="h-4 w-4" />,
}

// Furniture mode configurations
const furnitureModes = [
  {
    id: 'keep_all',
    label: 'Conservar Todo',
    description: 'Mantén el mobiliario exacto',
    icon: <Armchair className="h-5 w-5" />,
    color: 'text-green-600',
  },
  {
    id: 'keep_reposition',
    label: 'Reorganizar',
    description: 'Mismo mobiliario, nueva disposición',
    icon: <Move className="h-5 w-5" />,
    color: 'text-blue-600',
  },
  {
    id: 'keep_add_more',
    label: 'Complementar',
    description: 'Conservar y añadir más',
    icon: <Plus className="h-5 w-5" />,
    color: 'text-purple-600',
  },
  {
    id: 'replace_all',
    label: 'Reemplazar',
    description: 'Transformación completa',
    icon: <RefreshCw className="h-5 w-5" />,
    color: 'text-orange-600',
  },
]

// Room size presets
const roomSizePresets = [
  { label: 'Pequeño', width: 3, height: 3, description: '~9m²' },
  { label: 'Mediano', width: 4, height: 4.5, description: '~18m²' },
  { label: 'Grande', width: 5, height: 6, description: '~30m²' },
  { label: 'Muy Grande', width: 7, height: 8, description: '~56m²' },
]

export default function GenerationForm({
  designData,
  selectedBaseImage,
  generating,
  hasTokens,
  tokenBalance,
  onGenerate,
  onNoTokens,
}: GenerationFormProps) {
  // Form state
  const [selectedRoomType, setSelectedRoomType] = useState('')
  const [selectedStyle, setSelectedStyle] = useState('')
  const [customPrompt, setCustomPrompt] = useState('')
  const [furnitureMode, setFurnitureMode] = useState('replace_all')
  const [roomWidth, setRoomWidth] = useState(4)
  const [roomHeight, setRoomHeight] = useState(4)
  const [selectedColorPalette, setSelectedColorPalette] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [roomCategory, setRoomCategory] = useState<'interior' | 'children' | 'exterior'>('interior')

  // Categorize room types
  const roomTypesByCategory = {
    interior: designData?.roomTypes?.filter(room =>
      !['pieza_nino', 'pieza_nina', 'pieza_bebe', 'sala_juegos', 'jardin', 'terraza', 'quincho'].includes(room.code)
    ) || [],
    children: designData?.roomTypes?.filter(room =>
      ['pieza_nino', 'pieza_nina', 'pieza_bebe', 'sala_juegos', 'dormitorio_ninos'].includes(room.code)
    ) || [],
    exterior: designData?.roomTypes?.filter(room =>
      ['jardin', 'terraza', 'quincho'].includes(room.code)
    ) || [],
  }

  // Filter styles by macrocategory
  const stylesByMacro = designData?.styles
    ?.filter(s => s.code !== 'personalizado')
    ?.reduce((acc, style) => {
      const macro = style.macrocategory || 'Otros'
      if (!acc[macro]) acc[macro] = []
      acc[macro].push(style)
      return acc
    }, {} as Record<string, typeof designData.styles>) || {}

  // Smart style suggestions based on room type
  const suggestedStyles = () => {
    if (!selectedRoomType || !designData) return []
    const room = designData.roomTypes.find(r => r.id === selectedRoomType)
    if (!room) return []

    // Suggest relevant styles based on room type
    if (['pieza_nino', 'pieza_nina', 'pieza_bebe', 'sala_juegos'].includes(room.code)) {
      return designData.styles.filter(s => s.macrocategory === 'Infantil')
    }
    if (['jardin', 'terraza'].includes(room.code)) {
      return designData.styles.filter(s => s.macrocategory === 'Nature')
    }
    if (['dormitorio_principal', 'dormitorio'].includes(room.code)) {
      return designData.styles.filter(s =>
        ['Modern', 'Classic', 'Luxury'].includes(s.macrocategory || '')
      )
    }

    return []
  }

  const handleGenerate = () => {
    if (!hasTokens) {
      onNoTokens()
      return
    }

    // Use custom prompt or require a style
    if (!customPrompt.trim() && !selectedStyle) {
      return
    }

    onGenerate({
      style_id: selectedStyle || undefined,
      room_type_id: selectedRoomType || undefined,
      color_scheme_id: selectedColorPalette || undefined,
      furniture_mode: furnitureMode,
      custom_prompt: customPrompt.trim() || undefined,
      dimensions: {
        width: roomWidth,
        height: roomHeight,
      },
    })
  }

  const canGenerate = hasTokens && selectedBaseImage && (customPrompt.trim() || selectedStyle)

  return (
    <div className="space-y-6">
      {/* Step 1: Room Type Selection */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#A3B1A1]/10 flex items-center justify-center">
            <span className="text-sm font-semibold text-[#A3B1A1]">1</span>
          </div>
          <h3 className="font-semibold text-sm">¿Qué espacio quieres transformar?</h3>
        </div>

        <Tabs value={roomCategory} onValueChange={(v) => setRoomCategory(v as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="interior" className="flex items-center gap-1">
              <Home className="h-3 w-3" />
              Interiores
            </TabsTrigger>
            <TabsTrigger value="children" className="flex items-center gap-1">
              <Baby className="h-3 w-3" />
              Infantil
            </TabsTrigger>
            <TabsTrigger value="exterior" className="flex items-center gap-1">
              <Trees className="h-3 w-3" />
              Exteriores
            </TabsTrigger>
          </TabsList>

          <TabsContent value="interior" className="mt-3">
            <div className="grid grid-cols-2 gap-2">
              {roomTypesByCategory.interior.map((room) => (
                <Card
                  key={room.id}
                  className={cn(
                    "cursor-pointer transition-all duration-200 hover:shadow-md",
                    selectedRoomType === room.id
                      ? "border-[#A3B1A1] bg-[#A3B1A1]/5 shadow-sm"
                      : "hover:border-gray-300"
                  )}
                  onClick={() => setSelectedRoomType(room.id)}
                >
                  <CardContent className="p-3 flex items-center gap-2">
                    <div className={cn(
                      "flex-shrink-0",
                      selectedRoomType === room.id ? "text-[#A3B1A1]" : "text-gray-500"
                    )}>
                      {roomIcons[room.code] || <Home className="h-5 w-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{room.name}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="children" className="mt-3">
            <div className="grid grid-cols-2 gap-2">
              {roomTypesByCategory.children.map((room) => (
                <Card
                  key={room.id}
                  className={cn(
                    "cursor-pointer transition-all duration-200 hover:shadow-md",
                    selectedRoomType === room.id
                      ? "border-[#C4886F] bg-[#C4886F]/5 shadow-sm"
                      : "hover:border-gray-300"
                  )}
                  onClick={() => setSelectedRoomType(room.id)}
                >
                  <CardContent className="p-3 flex items-center gap-2">
                    <div className={cn(
                      "flex-shrink-0",
                      selectedRoomType === room.id ? "text-[#C4886F]" : "text-gray-500"
                    )}>
                      {roomIcons[room.code] || <Baby className="h-5 w-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{room.name}</p>
                      {room.description && (
                        <p className="text-[10px] text-muted-foreground truncate">{room.description}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="exterior" className="mt-3">
            <div className="grid grid-cols-2 gap-2">
              {roomTypesByCategory.exterior.map((room) => (
                <Card
                  key={room.id}
                  className={cn(
                    "cursor-pointer transition-all duration-200 hover:shadow-md",
                    selectedRoomType === room.id
                      ? "border-[#A3B1A1] bg-[#A3B1A1]/5 shadow-sm"
                      : "hover:border-gray-300"
                  )}
                  onClick={() => setSelectedRoomType(room.id)}
                >
                  <CardContent className="p-3 flex items-center gap-2">
                    <div className={cn(
                      "flex-shrink-0",
                      selectedRoomType === room.id ? "text-[#A3B1A1]" : "text-gray-500"
                    )}>
                      {roomIcons[room.code] || <Trees className="h-5 w-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{room.name}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Step 2: Style/Inspiration */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#A3B1A1]/10 flex items-center justify-center">
            <span className="text-sm font-semibold text-[#A3B1A1]">2</span>
          </div>
          <h3 className="font-semibold text-sm">¿Cómo lo quieres transformar?</h3>
        </div>

        {/* Custom Prompt - Always visible as primary option */}
        <Card className="border-2 border-[#A3B1A1]/20 bg-gradient-to-br from-[#A3B1A1]/5 to-transparent">
          <CardContent className="p-4">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-[#A3B1A1]/10 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-[#A3B1A1]" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-sm mb-1">Personalizado</h4>
                <p className="text-xs text-muted-foreground">
                  Describe libremente tu visión. Mientras más detalles, mejor resultado.
                </p>
              </div>
            </div>
            <Textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Ej: Quiero un dormitorio acogedor con tonos tierra, plantas naturales y una zona de lectura junto a la ventana..."
              className="min-h-[80px] resize-none text-sm"
            />
          </CardContent>
        </Card>

        {/* Optional Style Selection */}
        <Collapsible>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full justify-between">
              <span className="text-xs">O elige un estilo predefinido</span>
              <ChevronDown className="h-3 w-3" />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3 mt-3">
            {/* Suggested styles if room is selected */}
            {suggestedStyles().length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Estilos recomendados</p>
                <div className="grid grid-cols-2 gap-2">
                  {suggestedStyles().slice(0, 4).map((style) => (
                    <Button
                      key={style.id}
                      variant={selectedStyle === style.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedStyle(style.id)}
                      className="justify-start text-xs h-auto py-2"
                    >
                      <PaintBucket className="h-3 w-3 mr-1" />
                      {style.name}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* All styles by macrocategory */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Todos los estilos</p>
              {Object.entries(stylesByMacro).map(([macro, styles]) => (
                <div key={macro} className="space-y-1">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    {styleIcons[macro]}
                    <span>{macro}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1 ml-5">
                    {styles.map((style) => (
                      <Button
                        key={style.id}
                        variant={selectedStyle === style.id ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setSelectedStyle(style.id)}
                        className="justify-start text-[11px] h-7 px-2"
                      >
                        {style.name}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* Step 3: Details */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#A3B1A1]/10 flex items-center justify-center">
            <span className="text-sm font-semibold text-[#A3B1A1]">3</span>
          </div>
          <h3 className="font-semibold text-sm">Detalles (opcional)</h3>
        </div>

        {/* Furniture Mode */}
        <div className="space-y-2">
          <label className="text-xs font-medium flex items-center gap-1">
            <Armchair className="h-3 w-3" />
            Manejo del Mobiliario
          </label>
          <div className="grid grid-cols-2 gap-2">
            {furnitureModes.map((mode) => (
              <Card
                key={mode.id}
                className={cn(
                  "cursor-pointer transition-all duration-200",
                  furnitureMode === mode.id
                    ? "border-[#A3B1A1] bg-[#A3B1A1]/5"
                    : "hover:border-gray-300"
                )}
                onClick={() => setFurnitureMode(mode.id)}
              >
                <CardContent className="p-2">
                  <div className="flex items-center gap-2">
                    <div className={mode.color}>{mode.icon}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-medium">{mode.label}</p>
                      <p className="text-[9px] text-muted-foreground truncate">{mode.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Room Dimensions */}
        <div className="space-y-2">
          <label className="text-xs font-medium flex items-center gap-1">
            <Ruler className="h-3 w-3" />
            Tamaño del Espacio
          </label>

          {/* Quick presets */}
          <div className="flex gap-1">
            {roomSizePresets.map((preset) => (
              <Button
                key={preset.label}
                variant="ghost"
                size="sm"
                onClick={() => {
                  setRoomWidth(preset.width)
                  setRoomHeight(preset.height)
                }}
                className="text-[10px] h-7 px-2"
              >
                {preset.label}
                <span className="ml-1 text-muted-foreground">{preset.description}</span>
              </Button>
            ))}
          </div>

          {/* Sliders */}
          <div className="space-y-3 px-1">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground">Ancho</span>
                <span className="text-[11px] font-medium">{roomWidth}m</span>
              </div>
              <Slider
                value={[roomWidth]}
                onValueChange={([v]) => setRoomWidth(v)}
                min={2}
                max={10}
                step={0.5}
                className="h-1"
              />
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground">Largo</span>
                <span className="text-[11px] font-medium">{roomHeight}m</span>
              </div>
              <Slider
                value={[roomHeight]}
                onValueChange={([v]) => setRoomHeight(v)}
                min={2}
                max={10}
                step={0.5}
                className="h-1"
              />
            </div>
            <p className="text-[10px] text-center text-muted-foreground">
              Área aproximada: {(roomWidth * roomHeight).toFixed(1)}m²
            </p>
          </div>
        </div>

        {/* Advanced Options */}
        <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full justify-start text-xs p-0 h-auto hover:bg-transparent">
              <ChevronDown className={cn(
                "h-3 w-3 mr-1 transition-transform",
                showAdvanced && "rotate-180"
              )} />
              Opciones Avanzadas
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3 mt-3">
            {/* Color Palette Selection */}
            <div className="space-y-2">
              <label className="text-xs font-medium flex items-center gap-1">
                <Palette className="h-3 w-3" />
                Paleta de Colores
              </label>
              <div className="grid grid-cols-2 gap-2">
                {designData?.colorPalettes?.slice(0, 6).map((palette) => (
                  <Button
                    key={palette.id}
                    variant={selectedColorPalette === palette.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedColorPalette(
                      selectedColorPalette === palette.id ? '' : palette.id
                    )}
                    className="justify-start text-[11px] h-8"
                  >
                    <div className="flex gap-1 mr-2">
                      {palette.hex_colors?.slice(0, 3).map((color, i) => (
                        <div
                          key={i}
                          className="w-3 h-3 rounded-full border border-gray-200"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <span className="truncate">{palette.name}</span>
                  </Button>
                ))}
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* Generate Button */}
      <Button
        className="w-full"
        onClick={handleGenerate}
        disabled={!canGenerate || generating}
        variant={!hasTokens ? "destructive" : "default"}
      >
        {generating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generando...
          </>
        ) : !hasTokens ? (
          <>
            <AlertCircle className="mr-2 h-4 w-4" />
            Sin tokens
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-4 w-4" />
            Generar Diseño
            {selectedStyle && designData?.styles?.find(s => s.id === selectedStyle) && (
              <span className="ml-1 text-xs opacity-80">
                (1 token)
              </span>
            )}
          </>
        )}
      </Button>

      {/* Token Info */}
      {hasTokens && tokenBalance > 0 && tokenBalance <= 5 && (
        <div className="text-xs text-center text-yellow-600">
          ⚠️ Te quedan {tokenBalance} tokens
        </div>
      )}

      {/* Helper Text */}
      {!customPrompt && !selectedStyle && (
        <p className="text-xs text-center text-muted-foreground">
          Describe tu visión o selecciona un estilo para continuar
        </p>
      )}
    </div>
  )
}