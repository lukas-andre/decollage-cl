'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import {
  Sparkles,
  ArrowLeft,
  ArrowRight,
  Home,
  Bed,
  ChefHat,
  Bath,
  Sofa,
  Trees,
  Baby,
  Palette,
  Ruler,
  Wand2,
  Loader2,
  Edit2,
  Zap,
  Expand,
  Check,
  Plus
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

interface FormData {
  roomTypeId: string
  roomCategory: string
  inspirationMode: 'style' | 'prompt'
  styleId: string
  customPrompt: string
  furnitureMode: string
  roomWidth: number
  roomHeight: number
  colorPaletteId: string
}

interface ContextFirstWizardProps {
  designData: {
    styles: Array<{
      id: string
      name: string
      code: string
      token_cost: number
      category?: string
      macrocategory?: string
    }>
    roomTypes: Array<{
      id: string
      name: string
      code: string
      category?: string
    }>
    colorPalettes: Array<{
      id: string
      name: string
      code: string
      hex_colors: string[]
    }>
  }
  selectedBaseImage?: any
  generating: boolean
  hasTokens: boolean
  tokenBalance: number
  onGenerate: (params: any) => void
  onNoTokens: () => void
  onGenerationComplete?: boolean
}

// Room type icons mapping
const getRoomIcon = (roomCode: string) => {
  const iconMap: Record<string, React.ReactNode> = {
    // Main categories
    dormitorio: <Bed className="h-5 w-5" />,
    dormitorio_principal: <Bed className="h-5 w-5" />,
    dormitorio_ninos: <Baby className="h-5 w-5" />,
    living: <Sofa className="h-5 w-5" />,
    cocina: <ChefHat className="h-5 w-5" />,
    bano: <Bath className="h-5 w-5" />,
    bano_visitas: <Bath className="h-5 w-5" />,
    comedor: <Home className="h-5 w-5" />,
    home_office: <Home className="h-5 w-5" />,
    pieza_bebe: <Baby className="h-5 w-5" />,
    pieza_nina: <Baby className="h-5 w-5" />,
    pieza_nino: <Baby className="h-5 w-5" />,
    jardin: <Trees className="h-5 w-5" />,
    terraza: <Trees className="h-5 w-5" />,
    quincho: <Trees className="h-5 w-5" />,
    logia: <Trees className="h-5 w-5" />,
    sala_estar: <Sofa className="h-5 w-5" />,
    sala_juegos: <Baby className="h-5 w-5" />,
    entrada: <Home className="h-5 w-5" />,
    bodega: <Home className="h-5 w-5" />,
    // Legacy codes
    bedroom: <Bed className="h-5 w-5" />,
    kitchen: <ChefHat className="h-5 w-5" />,
    bathroom: <Bath className="h-5 w-5" />,
    dining: <Home className="h-5 w-5" />,
    office: <Home className="h-5 w-5" />,
    kids: <Baby className="h-5 w-5" />,
    outdoor: <Trees className="h-5 w-5" />
  }
  return iconMap[roomCode] || <Home className="h-5 w-5" />
}

// Categorize room types using macrocategory field
const categorizeRooms = (roomTypes: any[]) => {
  const categories = {
    interiores: roomTypes.filter(room => {
      // Use macrocategory if available, otherwise fallback to legacy logic
      if (room.macrocategory) {
        return room.macrocategory === 'interior'
      }
      // Legacy fallback
      const interiorCodes = [
        'dormitorio', 'dormitorio_principal', 'living', 'cocina', 'bano', 'bano_visitas',
        'comedor', 'home_office', 'entrada', 'sala_estar', 'bodega',
        'bedroom', 'kitchen', 'bathroom', 'dining', 'office'
      ]
      return interiorCodes.includes(room.code) ||
             (room.name.toLowerCase().includes('dormitorio') && !room.name.toLowerCase().includes('niñ') && !room.name.toLowerCase().includes('beb'))
    }),
    infantil: roomTypes.filter(room => {
      // Use macrocategory if available, otherwise fallback to legacy logic
      if (room.macrocategory) {
        return room.macrocategory === 'infantil'
      }
      // Legacy fallback
      const infantilCodes = [
        'dormitorio_ninos', 'pieza_bebe', 'pieza_nina', 'pieza_nino', 'sala_juegos',
        'kids'
      ]
      return infantilCodes.includes(room.code) ||
             room.name.toLowerCase().includes('infantil') ||
             room.name.toLowerCase().includes('niñ') ||
             room.name.toLowerCase().includes('bebé')
    }),
    exteriores: roomTypes.filter(room => {
      // Use macrocategory if available, otherwise fallback to legacy logic
      if (room.macrocategory) {
        return room.macrocategory === 'exterior'
      }
      // Legacy fallback
      const exteriorCodes = [
        'jardin', 'terraza', 'quincho', 'logia', 'fachada',
        'outdoor', 'garden', 'patio'
      ]
      return exteriorCodes.includes(room.code) ||
             room.name.toLowerCase().includes('jardín') ||
             room.name.toLowerCase().includes('terraza') ||
             room.name.toLowerCase().includes('balcón') ||
             room.name.toLowerCase().includes('fachada')
    })
  }
  return categories
}

// Categorize styles by macrocategory
const categorizeStyles = (styles: any[]) => {
  const categories: Record<string, any[]> = {}
  styles.forEach(style => {
    const category = style.macrocategory || 'Clásicos'
    if (!categories[category]) {
      categories[category] = []
    }
    categories[category].push(style)
  })
  return categories
}

// Smart filter styles based on room compatibility
const getCompatibleStyles = (selectedRoom: any, allStyles: any[]) => {
  if (!selectedRoom || !selectedRoom.compatible_style_macrocategories) {
    return allStyles // Return all if no compatibility info
  }

  const compatibleMacrocategories = selectedRoom.compatible_style_macrocategories
  return allStyles.filter(style => {
    if (!style.macrocategory) return true // Include legacy styles without macrocategory
    return compatibleMacrocategories.includes(style.macrocategory)
  })
}

// Get filtered and categorized styles for UI
const getFilteredStyleCategories = (selectedRoom: any, allStyles: any[]) => {
  const compatibleStyles = getCompatibleStyles(selectedRoom, allStyles)
  return categorizeStyles(compatibleStyles)
}

// Get recommended styles for a room type
const getRecommendedStyles = (roomCode: string, styles: any[]) => {
  const recommendations: Record<string, string[]> = {
    // Dormitorios
    dormitorio: ['Minimalista', 'Escandinavo', 'Moderno', 'Boho'],
    dormitorio_principal: ['Elegante', 'Minimalista', 'Mediterráneo', 'Moderno'],
    dormitorio_ninos: ['Infantil', 'Colorido', 'Lúdico', 'Nórdico'],
    pieza_bebe: ['Infantil', 'Suave', 'Nórdico', 'Minimalista'],
    pieza_nina: ['Romántico', 'Infantil', 'Boho', 'Colorido'],
    pieza_nino: ['Aventurero', 'Infantil', 'Industrial', 'Colorido'],
    // Living/Comedor
    living: ['Moderno', 'Minimalista', 'Industrial', 'Escandinavo'],
    comedor: ['Elegante', 'Moderno', 'Rústico', 'Industrial'],
    sala_estar: ['Acogedor', 'Boho', 'Escandinavo', 'Moderno'],
    // Cocina/Baño
    cocina: ['Moderno', 'Industrial', 'Rústico', 'Minimalista'],
    bano: ['Spa', 'Minimalista', 'Moderno', 'Elegante'],
    bano_visitas: ['Minimalista', 'Moderno', 'Elegante', 'Industrial'],
    // Trabajo
    home_office: ['Minimalista', 'Industrial', 'Moderno', 'Escandinavo'],
    // Exteriores
    jardin: ['Natural', 'Mediterráneo', 'Tropical', 'Zen'],
    terraza: ['Mediterráneo', 'Boho', 'Moderno', 'Tropical'],
    quincho: ['Rústico', 'Industrial', 'Chileno', 'Mediterráneo'],
    logia: ['Minimalista', 'Mediterráneo', 'Boho', 'Moderno'],
    // Otros
    entrada: ['Minimalista', 'Moderno', 'Elegante', 'Industrial'],
    bodega: ['Industrial', 'Organizado', 'Minimalista', 'Funcional'],
    sala_juegos: ['Colorido', 'Lúdico', 'Moderno', 'Creativo']
  }

  const recommendedNames = recommendations[roomCode] || ['Moderno', 'Minimalista', 'Elegante', 'Escandinavo']
  return styles.filter(style =>
    recommendedNames.some(name =>
      style.name.toLowerCase().includes(name.toLowerCase())
    )
  ).slice(0, 4)
}

export function ContextFirstWizard({
  designData,
  selectedBaseImage,
  generating,
  hasTokens,
  tokenBalance,
  onGenerate,
  onNoTokens,
  onGenerationComplete = false
}: ContextFirstWizardProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<FormData>({
    roomTypeId: '',
    roomCategory: 'interiores',
    inspirationMode: 'style',
    styleId: '',
    customPrompt: '',
    furnitureMode: 'replace_all',
    roomWidth: 4,
    roomHeight: 4,
    colorPaletteId: ''
  })
  const [openAccordions, setOpenAccordions] = useState(['furniture']) // Furniture accordion open by default

  const updateFormData = (updates: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  const categorizedRooms = categorizeRooms(designData.roomTypes)
  const selectedRoom = designData.roomTypes.find(r => r.id === formData.roomTypeId)
  const selectedStyle = designData.styles.find(s => s.id === formData.styleId)
  const selectedPalette = designData.colorPalettes.find(p => p.id === formData.colorPaletteId)

  // Smart style filtering based on room compatibility
  const compatibleStyles = selectedRoom ? getCompatibleStyles(selectedRoom, designData.styles) : designData.styles
  const categorizedStyles = categorizeStyles(compatibleStyles)
  const recommendedStyles = selectedRoom ? getRecommendedStyles(selectedRoom.code, compatibleStyles) : []

  const handleGenerate = () => {
    if (!hasTokens) {
      onNoTokens()
      return
    }

    const params: any = {
      room_type_id: formData.roomTypeId,
      furniture_mode: formData.furnitureMode,
      room_width: formData.roomWidth,
      room_height: formData.roomHeight
    }

    // Support three modes: style-only, prompt-only, or style+prompt combination
    if (formData.customPrompt && formData.customPrompt.trim().length > 0) {
      params.prompt = formData.customPrompt.trim()
    }

    if (formData.styleId) {
      params.style_id = formData.styleId
    }

    if (formData.colorPaletteId) {
      params.color_palette_id = formData.colorPaletteId
    }

    onGenerate(params)
  }

  const canProceedStep1 = formData.roomTypeId !== ''
  // Si hay prompt, el estilo es opcional. Si no hay prompt, el estilo es obligatorio
  const canProceedStep2 = formData.inspirationMode === 'prompt'
    ? formData.customPrompt.trim().length > 0  // En modo prompt, solo necesita prompt
    : formData.styleId !== '' || formData.customPrompt.trim().length > 0  // En modo estilo, necesita estilo O prompt

  // Support keyboard navigation
  const handleKeyNavigation = (e: KeyboardEvent) => {
    if (e.key === 'Tab' && !e.shiftKey && currentStep < 4 && canProceedToNext()) {
      e.preventDefault()
      setCurrentStep(prev => prev + 1)
    } else if (e.key === 'Tab' && e.shiftKey && currentStep > 1) {
      e.preventDefault()
      setCurrentStep(prev => prev - 1)
    }
  }

  const canProceedToNext = () => {
    switch (currentStep) {
      case 1: return canProceedStep1
      case 2: return canProceedStep2
      case 3: return true
      default: return false
    }
  }

  const jumpToStep = (step: number) => {
    setCurrentStep(step)
  }

  const handleQuickNewGeneration = () => {
    // Reset form data to initial state
    setFormData({
      roomTypeId: '',
      roomCategory: 'interiores',
      inspirationMode: 'style',
      styleId: '',
      customPrompt: '',
      furnitureMode: 'replace_all',
      roomWidth: 4,
      roomHeight: 4,
      colorPaletteId: ''
    })
    // Reset to first step
    setCurrentStep(1)
    // Reset open accordions
    setOpenAccordions(['furniture'])
  }

  return (
    <div className="space-y-6">
      {/* Progress Indicator */}
      <div className="flex items-center justify-between mb-6">
        {[1, 2, 3, 4].map((step) => (
          <div key={step} className="flex items-center flex-1">
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all",
                currentStep >= step
                  ? "bg-[#A3B1A1] text-white"
                  : "bg-gray-200 text-gray-500"
              )}
            >
              {step}
            </div>
            {step < 4 && (
              <div
                className={cn(
                  "flex-1 h-0.5 mx-2 transition-all",
                  currentStep > step ? "bg-[#A3B1A1]" : "bg-gray-200"
                )}
              />
            )}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1: Define el Espacio */}
        {currentStep === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div>
              <h3 className="text-sm font-semibold mb-1">Paso 1 de 4: Define el Espacio</h3>
              <p className="text-xs text-gray-500">¿Qué tipo de espacio vamos a transformar?</p>
            </div>

            <Tabs value={formData.roomCategory} onValueChange={(value) => updateFormData({ roomCategory: value, roomTypeId: '' })}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="interiores" className="text-xs">Interiores</TabsTrigger>
                <TabsTrigger value="infantil" className="text-xs">Infantil</TabsTrigger>
                <TabsTrigger value="exteriores" className="text-xs">Exteriores</TabsTrigger>
              </TabsList>

              <TabsContent value="interiores" className="mt-4">
                <div className="grid grid-cols-2 gap-2">
                  {categorizedRooms.interiores.map((room) => (
                    <Card
                      key={room.id}
                      className={cn(
                        "cursor-pointer transition-all hover:shadow-md",
                        formData.roomTypeId === room.id
                          ? "border-[#A3B1A1] bg-[#A3B1A1]/5"
                          : "border-gray-200 hover:border-gray-300"
                      )}
                      onClick={() => {
                        updateFormData({ roomTypeId: room.id })
                        // Auto-avanzar al siguiente paso
                        setTimeout(() => setCurrentStep(2), 300)
                      }}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center gap-2">
                          {getRoomIcon(room.code)}
                          <span className="text-xs font-medium">{room.name}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="infantil" className="mt-4">
                <div className="grid grid-cols-2 gap-2">
                  {categorizedRooms.infantil.map((room) => (
                    <Card
                      key={room.id}
                      className={cn(
                        "cursor-pointer transition-all hover:shadow-md",
                        formData.roomTypeId === room.id
                          ? "border-[#A3B1A1] bg-[#A3B1A1]/5"
                          : "border-gray-200 hover:border-gray-300"
                      )}
                      onClick={() => {
                        updateFormData({ roomTypeId: room.id })
                        // Auto-avanzar al siguiente paso
                        setTimeout(() => setCurrentStep(2), 300)
                      }}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center gap-2">
                          {getRoomIcon(room.code)}
                          <span className="text-xs font-medium">{room.name}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="exteriores" className="mt-4">
                <div className="grid grid-cols-2 gap-2">
                  {categorizedRooms.exteriores.map((room) => (
                    <Card
                      key={room.id}
                      className={cn(
                        "cursor-pointer transition-all hover:shadow-md",
                        formData.roomTypeId === room.id
                          ? "border-[#A3B1A1] bg-[#A3B1A1]/5"
                          : "border-gray-200 hover:border-gray-300"
                      )}
                      onClick={() => {
                        updateFormData({ roomTypeId: room.id })
                        // Auto-avanzar al siguiente paso
                        setTimeout(() => setCurrentStep(2), 300)
                      }}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center gap-2">
                          {getRoomIcon(room.code)}
                          <span className="text-xs font-medium">{room.name}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>

            {/* Botón Siguiente oculto ya que auto-avanza al seleccionar */}
            {formData.roomTypeId && (
              <Button
                onClick={() => setCurrentStep(2)}
                disabled={!canProceedStep1}
                className="w-full"
              >
                Siguiente
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </motion.div>
        )}

        {/* Step 2: Elige la Inspiración */}
        {currentStep === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div>
              <h3 className="text-sm font-semibold mb-1">Paso 2 de 4: Elige la Inspiración</h3>
              <p className="text-xs text-gray-500">¿Cómo quieres que se vea tu {selectedRoom?.name.toLowerCase()}?</p>
            </div>

            <Tabs value={formData.inspirationMode} onValueChange={(value) => updateFormData({ inspirationMode: value as 'style' | 'prompt' })}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="style" className="text-xs">
                  <Palette className="h-3.5 w-3.5 mr-1.5" />
                  Estilo Guiado
                </TabsTrigger>
                <TabsTrigger value="prompt" className="text-xs">
                  <Wand2 className="h-3.5 w-3.5 mr-1.5" />
                  Tu Propia Visión
                </TabsTrigger>
              </TabsList>

              <TabsContent value="style" className="mt-4 space-y-3">
                {/* Style Selection Tabs */}
                <Tabs defaultValue="recomendados" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="recomendados" className="text-xs">
                      Recomendados
                    </TabsTrigger>
                    <TabsTrigger value="mis-estilos" className="text-xs">
                      Mis Estilos
                    </TabsTrigger>
                    <TabsTrigger value="todos" className="text-xs">
                      Todos
                    </TabsTrigger>
                  </TabsList>

                  {/* Recommended Styles Tab */}
                  <TabsContent value="recomendados" className="mt-4 space-y-3">
                    {selectedRoom && recommendedStyles.length > 0 ? (
                      <div>
                        <Label className="text-xs font-medium text-[#A3B1A1]">✨ Perfectos para {selectedRoom.name}</Label>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          {recommendedStyles.map((style) => (
                            <button
                              key={style.id}
                              onClick={() => updateFormData({ styleId: style.id })}
                              className={cn(
                                "p-2 rounded-lg border text-left transition-all text-xs",
                                formData.styleId === style.id
                                  ? "border-[#A3B1A1] bg-[#A3B1A1]/5"
                                  : "border-gray-200 hover:border-gray-300"
                              )}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-medium">{style.name}</span>
                                <Badge variant="outline" className="text-[10px] px-1">
                                  {style.token_cost || 1}
                                </Badge>
                              </div>
                            </button>
                          ))}
                          {/* Personalizado button that switches to prompt tab */}
                          <button
                            onClick={() => updateFormData({ inspirationMode: 'prompt' })}
                            className="p-2 rounded-lg border text-left transition-all text-xs border-dashed border-gray-300 hover:border-[#C4886F] hover:bg-[#C4886F]/5"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium flex items-center gap-1">
                                <Wand2 className="h-3 w-3" />
                                Personalizado
                              </span>
                            </div>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <p className="text-xs">Selecciona un espacio para ver estilos recomendados</p>
                      </div>
                    )}
                  </TabsContent>

                  {/* Custom Styles Tab */}
                  <TabsContent value="mis-estilos" className="mt-4 space-y-3">
                    <div className="text-center py-8 text-gray-500">
                      <Wand2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-xs mb-2">Aún no tienes estilos guardados</p>
                      <p className="text-[10px] text-gray-400">Genera diseños y guarda tus favoritos para usarlos después</p>
                    </div>
                  </TabsContent>

                  {/* All Styles Tab */}
                  <TabsContent value="todos" className="mt-4 space-y-3">
                    <Label className="text-xs">Explorar todos los estilos</Label>
                    <Accordion type="single" collapsible className="w-full" defaultValue="Modern">
                      {Object.entries(categorizedStyles).map(([category, styles]) => (
                        <AccordionItem key={category} value={category}>
                          <AccordionTrigger className="text-xs">
                            {category} ({styles.length})
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="grid grid-cols-2 gap-2">
                              {styles.map((style) => (
                                <button
                                  key={style.id}
                                  onClick={() => updateFormData({ styleId: style.id })}
                                  className={cn(
                                    "p-2 rounded-lg border text-left transition-all text-xs",
                                    formData.styleId === style.id
                                      ? "border-[#A3B1A1] bg-[#A3B1A1]/5"
                                      : "border-gray-200 hover:border-gray-300"
                                  )}
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="font-medium">{style.name}</span>
                                    <Badge variant="outline" className="text-[10px] px-1">
                                      {style.token_cost || 1}
                                    </Badge>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </TabsContent>
                </Tabs>
              </TabsContent>

              <TabsContent value="prompt" className="mt-4 space-y-3">
                <Label className="text-xs">Describe tu visión perfecta {formData.styleId ? '(opcional)' : ''}</Label>
                <Textarea
                  value={formData.customPrompt}
                  onChange={(e) => updateFormData({ customPrompt: e.target.value })}
                  placeholder={`Un ${selectedRoom?.name.toLowerCase() || 'espacio'} con estilo...`}
                  className="min-h-[100px] text-sm"
                  autoFocus
                />
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'Moderno y minimalista con toques cálidos',
                    'Acogedor estilo mediterráneo chileno',
                    'Elegante con detalles en madera nativa',
                    'Rústico inspirado en el sur de Chile',
                    'Boho con colores de Valparaíso'
                  ].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => updateFormData({ customPrompt: suggestion })}
                      className="px-2 py-1 rounded-md text-xs bg-gray-100 hover:bg-gray-200 transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
                {/* Style selector inside prompt tab */}
                <div className="space-y-2">
                  <Label className="text-xs">Combinar con estilo (opcional)</Label>
                  <select
                    value={formData.styleId}
                    onChange={(e) => updateFormData({ styleId: e.target.value })}
                    className="w-full px-3 py-2 text-xs border rounded-md"
                  >
                    <option value="">Sin estilo específico</option>
                    {designData.styles.map((style) => (
                      <option key={style.id} value={style.id}>
                        {style.name} ({style.token_cost || 1} token)
                      </option>
                    ))}
                  </select>
                  {formData.styleId && (
                    <div className="p-2 rounded-lg bg-[#A3B1A1]/5 border border-[#A3B1A1]/20">
                      <p className="text-xs text-gray-600">✨ Se combinará con estilo: <strong>{selectedStyle?.name}</strong></p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(1)}
                className="flex-1"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Anterior
              </Button>
              <Button
                onClick={() => setCurrentStep(3)}
                disabled={!canProceedStep2}
                className="flex-1"
              >
                Siguiente
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Ajusta los Detalles */}
        {currentStep === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div>
              <h3 className="text-sm font-semibold mb-1">Paso 3 de 4: Ajusta los Detalles</h3>
              <p className="text-xs text-gray-500">Personaliza aspectos específicos (opcional)</p>
            </div>

            <Accordion type="multiple" className="w-full" value={openAccordions} onValueChange={setOpenAccordions}>
              {/* Furniture Mode */}
              <AccordionItem value="furniture">
                <AccordionTrigger className="text-xs">
                  <div className="flex items-center gap-2">
                    <Sofa className="h-3.5 w-3.5" />
                    Manejo del Mobiliario
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <RadioGroup
                    value={formData.furnitureMode}
                    onValueChange={(value) => updateFormData({ furnitureMode: value })}
                  >
                    <div className="space-y-2">
                      <div className="flex items-start space-x-2">
                        <RadioGroupItem value="replace_all" id="replace_all" className="mt-1" />
                        <div className="flex-1">
                          <Label htmlFor="replace_all" className="text-xs font-medium">Renovación completa</Label>
                          <p className="text-[10px] text-gray-500 mt-0.5">Reemplaza todo el mobiliario con opciones nuevas que coincidan con el estilo</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-2">
                        <RadioGroupItem value="keep_existing" id="keep_existing" className="mt-1" />
                        <div className="flex-1">
                          <Label htmlFor="keep_existing" className="text-xs font-medium">Conservar lo actual</Label>
                          <p className="text-[10px] text-gray-500 mt-0.5">Mantiene tus muebles y solo mejora decoración, colores y ambiente</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-2">
                        <RadioGroupItem value="mix" id="mix" className="mt-1" />
                        <div className="flex-1">
                          <Label htmlFor="mix" className="text-xs font-medium">Mezcla inteligente</Label>
                          <p className="text-[10px] text-gray-500 mt-0.5">Combina muebles existentes con nuevas piezas clave</p>
                        </div>
                      </div>
                    </div>
                  </RadioGroup>
                </AccordionContent>
              </AccordionItem>

              {/* Room Dimensions */}
              <AccordionItem value="dimensions">
                <AccordionTrigger className="text-xs">
                  <div className="flex items-center gap-2">
                    <Ruler className="h-3.5 w-3.5" />
                    Dimensiones del Espacio
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3">
                    <div className="p-2 rounded-md bg-[#A3B1A1]/10 border border-[#A3B1A1]/30">
                      <p className="text-[10px] text-[#A3B1A1] font-medium">✨ Decollage detecta automáticamente las proporciones de tu espacio</p>
                    </div>
                    <div>
                      <Label className="text-xs">Ancho: {formData.roomWidth}m</Label>
                      <Slider
                        value={[formData.roomWidth]}
                        onValueChange={([value]) => updateFormData({ roomWidth: value })}
                        max={10}
                        min={2}
                        step={0.5}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Largo: {formData.roomHeight}m</Label>
                      <Slider
                        value={[formData.roomHeight]}
                        onValueChange={([value]) => updateFormData({ roomHeight: value })}
                        max={10}
                        min={2}
                        step={0.5}
                        className="mt-2"
                      />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Color Palette - Coming Soon */}
              <AccordionItem value="colors" disabled>
                <AccordionTrigger className="text-xs opacity-50 cursor-not-allowed">
                  <div className="flex items-center gap-2">
                    <Palette className="h-3.5 w-3.5" />
                    Paleta de Colores <Badge variant="outline" className="ml-2 text-[8px] px-1">Próximamente</Badge>
                  </div>
                </AccordionTrigger>
              </AccordionItem>
            </Accordion>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(2)}
                className="flex-1"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Anterior
              </Button>
              <Button
                onClick={() => setCurrentStep(4)}
                className="flex-1"
              >
                Siguiente
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 4: Resumen y Generar */}
        {currentStep === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div>
              <h3 className="text-sm font-semibold mb-1">Paso 4 de 4: Resumen y Generar</h3>
              <p className="text-xs text-gray-500">Revisa tu configuración antes de generar</p>
            </div>

            <div className="space-y-3 p-4 rounded-lg bg-gray-50 border">
              {/* Space */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium">Espacio:</p>
                  <p className="text-xs text-gray-600">{selectedRoom?.name}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => jumpToStep(1)}
                  className="h-6 px-2 text-xs"
                >
                  <Edit2 className="h-3 w-3 mr-1" />
                  Editar
                </Button>
              </div>

              {/* Inspiration */}
              <div className="flex items-center justify-between">
                <div className="flex-1 mr-2">
                  <p className="text-xs font-medium">Inspiración:</p>
                  {formData.styleId && formData.customPrompt ? (
                    // Both style and custom prompt
                    <div className="space-y-1">
                      <p className="text-xs text-gray-600">
                        Estilo: <span className="font-medium">{selectedStyle?.name}</span>
                      </p>
                      <p className="text-xs text-gray-600">
                        Personalización: <span className="italic">"{formData.customPrompt}"</span>
                      </p>
                    </div>
                  ) : formData.styleId ? (
                    // Style only
                    <p className="text-xs text-gray-600">
                      {selectedStyle?.name}
                    </p>
                  ) : formData.customPrompt ? (
                    // Custom prompt only
                    <p className="text-xs text-gray-600">
                      <span className="italic">"{formData.customPrompt}"</span>
                    </p>
                  ) : (
                    // Nothing selected (shouldn't happen if validation works)
                    <p className="text-xs text-gray-500">Sin inspiración seleccionada</p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => jumpToStep(2)}
                  className="h-6 px-2 text-xs shrink-0"
                >
                  <Edit2 className="h-3 w-3 mr-1" />
                  Editar
                </Button>
              </div>

              {/* Furniture */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium">Mobiliario:</p>
                  <p className="text-xs text-gray-600">
                    {formData.furnitureMode === 'replace_all' ? 'Reemplazar todo' :
                     formData.furnitureMode === 'keep_existing' ? 'Mantener existente' : 'Mezclar ambos'}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => jumpToStep(3)}
                  className="h-6 px-2 text-xs"
                >
                  <Edit2 className="h-3 w-3 mr-1" />
                  Editar
                </Button>
              </div>

              {/* Dimensions */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium">Dimensiones:</p>
                  <p className="text-xs text-gray-600">Inferidas por Decollage ✨</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => jumpToStep(3)}
                  className="h-6 px-2 text-xs"
                >
                  <Edit2 className="h-3 w-3 mr-1" />
                  Editar
                </Button>
              </div>

              {/* Color Palette */}
              {formData.colorPaletteId && (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium">Paleta:</p>
                    <p className="text-xs text-gray-600">{selectedPalette?.name}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => jumpToStep(3)}
                    className="h-6 px-2 text-xs"
                  >
                    <Edit2 className="h-3 w-3 mr-1" />
                    Editar
                  </Button>
                </div>
              )}
            </div>

            {/* Token Warning */}
            {tokenBalance <= 2 && (
              <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                <div className="flex items-center gap-2 text-xs text-yellow-800">
                  <Zap className="h-3.5 w-3.5" />
                  <span>Te quedan {tokenBalance} tokens</span>
                </div>
              </div>
            )}

            {/* Generation Completion & Quick New Generation */}
            {onGenerationComplete && !generating && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-lg bg-gradient-to-r from-[#A3B1A1]/10 to-[#C4886F]/10 border border-[#A3B1A1]/20"
              >
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Check className="h-5 w-5 text-[#A3B1A1]" />
                  <span className="text-sm font-medium text-[#A3B1A1]">¡Diseño generado exitosamente!</span>
                </div>
                <Button
                  onClick={handleQuickNewGeneration}
                  className="w-full bg-gradient-to-r from-[#A3B1A1] to-[#C4886F] hover:from-[#A3B1A1]/90 hover:to-[#C4886F]/90"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Crear Nuevo Diseño
                </Button>
                <p className="text-xs text-center text-gray-500 mt-2">
                  Inicia rápidamente una nueva generación con la misma imagen
                </p>
              </motion.div>
            )}

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(3)}
                disabled={generating}
                className="flex-1"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Anterior
              </Button>
              <Button
                onClick={handleGenerate}
                disabled={generating || !hasTokens || onGenerationComplete}
                className="flex-1 bg-gradient-to-r from-[#A3B1A1] to-[#C4886F] hover:from-[#A3B1A1]/90 hover:to-[#C4886F]/90"
              >
                {generating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generando...
                  </>
                ) : onGenerationComplete ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Diseño Completado
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generar Diseño (1 Token)
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}