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
  Zap
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
}

// Room type icons mapping
const getRoomIcon = (roomCode: string) => {
  const iconMap: Record<string, React.ReactNode> = {
    bedroom: <Bed className="h-5 w-5" />,
    living: <Sofa className="h-5 w-5" />,
    kitchen: <ChefHat className="h-5 w-5" />,
    bathroom: <Bath className="h-5 w-5" />,
    dining: <Home className="h-5 w-5" />,
    office: <Home className="h-5 w-5" />,
    kids: <Baby className="h-5 w-5" />,
    outdoor: <Trees className="h-5 w-5" />
  }
  return iconMap[roomCode] || <Home className="h-5 w-5" />
}

// Categorize room types
const categorizeRooms = (roomTypes: any[]) => {
  const categories = {
    interiores: roomTypes.filter(room =>
      ['bedroom', 'living', 'kitchen', 'bathroom', 'dining', 'office'].includes(room.code)
    ),
    infantil: roomTypes.filter(room =>
      room.code === 'kids' || room.name.toLowerCase().includes('infantil')
    ),
    exteriores: roomTypes.filter(room =>
      ['outdoor', 'garden', 'patio'].includes(room.code)
    )
  }
  return categories
}

// Categorize styles by macrocategory
const categorizeStyles = (styles: any[]) => {
  const categories: Record<string, any[]> = {}
  styles.forEach(style => {
    const category = style.macrocategory || 'Otros'
    if (!categories[category]) {
      categories[category] = []
    }
    categories[category].push(style)
  })
  return categories
}

export function ContextFirstWizard({
  designData,
  selectedBaseImage,
  generating,
  hasTokens,
  tokenBalance,
  onGenerate,
  onNoTokens
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

  const updateFormData = (updates: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  const categorizedRooms = categorizeRooms(designData.roomTypes)
  const categorizedStyles = categorizeStyles(designData.styles)
  const selectedRoom = designData.roomTypes.find(r => r.id === formData.roomTypeId)
  const selectedStyle = designData.styles.find(s => s.id === formData.styleId)
  const selectedPalette = designData.colorPalettes.find(p => p.id === formData.colorPaletteId)

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

    if (formData.inspirationMode === 'prompt') {
      params.prompt = formData.customPrompt
    } else {
      params.style_id = formData.styleId
    }

    if (formData.colorPaletteId) {
      params.color_palette_id = formData.colorPaletteId
    }

    onGenerate(params)
  }

  const canProceedStep1 = formData.roomTypeId !== ''
  const canProceedStep2 = formData.inspirationMode === 'prompt'
    ? formData.customPrompt.trim().length > 0
    : formData.styleId !== ''

  const jumpToStep = (step: number) => {
    setCurrentStep(step)
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
                      onClick={() => updateFormData({ roomTypeId: room.id })}
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
                      onClick={() => updateFormData({ roomTypeId: room.id })}
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
                      onClick={() => updateFormData({ roomTypeId: room.id })}
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

            <Button
              onClick={() => setCurrentStep(2)}
              disabled={!canProceedStep1}
              className="w-full"
            >
              Siguiente
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
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
                {/* Recommended Styles First */}
                {selectedRoom && (
                  <div className="mb-4">
                    <Label className="text-xs font-medium text-[#A3B1A1]">✨ Estilos Recomendados para {selectedRoom.name}</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {designData.styles.slice(0, 4).map((style) => (
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
                  </div>
                )}

                {/* Categorized Styles */}
                <Label className="text-xs">Explorar por Categoría</Label>
                <Accordion type="single" collapsible className="w-full">
                  {Object.entries(categorizedStyles).map(([category, styles]) => (
                    <AccordionItem key={category} value={category}>
                      <AccordionTrigger className="text-xs">{category}</AccordionTrigger>
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

              <TabsContent value="prompt" className="mt-4 space-y-3">
                <Label className="text-xs">Describe tu visión perfecta</Label>
                <Textarea
                  value={formData.customPrompt}
                  onChange={(e) => updateFormData({ customPrompt: e.target.value })}
                  placeholder={`Un ${selectedRoom?.name.toLowerCase() || 'espacio'} con estilo...`}
                  className="min-h-[100px] text-sm"
                />
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'Moderno y minimalista',
                    'Acogedor y cálido',
                    'Elegante y sofisticado',
                    'Rústico chileno',
                    'Boho mediterráneo'
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

            <Accordion type="multiple" className="w-full">
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
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="replace_all" id="replace_all" />
                        <Label htmlFor="replace_all" className="text-xs">
                          Reemplazar todo el mobiliario
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="keep_existing" id="keep_existing" />
                        <Label htmlFor="keep_existing" className="text-xs">
                          Mantener mobiliario existente
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="mix" id="mix" />
                        <Label htmlFor="mix" className="text-xs">
                          Mezclar ambos enfoques
                        </Label>
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

              {/* Color Palette */}
              <AccordionItem value="colors">
                <AccordionTrigger className="text-xs">
                  <div className="flex items-center gap-2">
                    <Palette className="h-3.5 w-3.5" />
                    Paleta de Colores
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    <button
                      onClick={() => updateFormData({ colorPaletteId: '' })}
                      className={cn(
                        "w-full p-2 rounded-lg border text-xs text-left",
                        !formData.colorPaletteId
                          ? "border-[#A3B1A1] bg-[#A3B1A1]/5"
                          : "border-gray-200"
                      )}
                    >
                      Automático (recomendado)
                    </button>
                    {designData.colorPalettes.map((palette) => (
                      <button
                        key={palette.id}
                        onClick={() => updateFormData({ colorPaletteId: palette.id })}
                        className={cn(
                          "w-full p-2 rounded-lg border flex items-center justify-between",
                          formData.colorPaletteId === palette.id
                            ? "border-[#A3B1A1] bg-[#A3B1A1]/5"
                            : "border-gray-200"
                        )}
                      >
                        <span className="text-xs">{palette.name}</span>
                        <div className="flex gap-1">
                          {palette.hex_colors.slice(0, 4).map((color, idx) => (
                            <div
                              key={idx}
                              className="w-4 h-4 rounded-full border border-gray-300"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </button>
                    ))}
                  </div>
                </AccordionContent>
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
                <div>
                  <p className="text-xs font-medium">Inspiración:</p>
                  <p className="text-xs text-gray-600">
                    {formData.inspirationMode === 'style'
                      ? selectedStyle?.name
                      : 'Visión personalizada'}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => jumpToStep(2)}
                  className="h-6 px-2 text-xs"
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
                  <p className="text-xs text-gray-600">{formData.roomWidth}m × {formData.roomHeight}m</p>
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
                disabled={generating || !hasTokens}
                className="flex-1 bg-gradient-to-r from-[#A3B1A1] to-[#C4886F] hover:from-[#A3B1A1]/90 hover:to-[#C4886F]/90"
              >
                {generating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generando...
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