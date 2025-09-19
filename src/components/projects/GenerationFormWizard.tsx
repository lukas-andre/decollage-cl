'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
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
  Palette,
  Home,
  ArrowLeft,
  ArrowRight,
  Sofa,
  PaintBucket,
  Ruler,
  Wand2,
  Loader2,
  Zap
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

interface FormData {
  mode: 'prompt' | 'style'
  customPrompt: string
  styleId: string
  roomTypeId: string
  furnitureMode: string
  roomWidth: number
  roomHeight: number
  colorPaletteId: string
}

interface GenerationFormWizardProps {
  designData: {
    styles: Array<{ id: string; name: string; code: string; token_cost: number }>
    roomTypes: Array<{ id: string; name: string; code: string }>
    colorPalettes: Array<{ id: string; name: string; code: string; hex_colors: string[] }>
  }
  selectedBaseImage?: any
  generating: boolean
  hasTokens: boolean
  tokenBalance: number
  onGenerate: (params: any) => void
  onNoTokens: () => void
}

export function GenerationFormWizard({
  designData,
  selectedBaseImage,
  generating,
  hasTokens,
  tokenBalance,
  onGenerate,
  onNoTokens
}: GenerationFormWizardProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<FormData>({
    mode: 'style',
    customPrompt: '',
    styleId: '',
    roomTypeId: '',
    furnitureMode: 'replace_all',
    roomWidth: 4,
    roomHeight: 4,
    colorPaletteId: ''
  })

  const updateFormData = (updates: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

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

    if (formData.mode === 'prompt') {
      params.prompt = formData.customPrompt
    } else {
      params.style_id = formData.styleId
    }

    if (formData.colorPaletteId) {
      params.color_palette_id = formData.colorPaletteId
    }

    onGenerate(params)
  }

  const canProceedStep1 = formData.mode === 'prompt'
    ? formData.customPrompt.trim().length > 0
    : formData.styleId !== ''

  const canProceedStep2 = formData.roomTypeId !== ''

  return (
    <div className="space-y-6">
      {/* Progress Indicator */}
      <div className="flex items-center justify-between mb-6">
        {[1, 2, 3].map((step) => (
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
            {step < 3 && (
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
        {/* Step 1: Core Idea */}
        {currentStep === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div>
              <h3 className="text-sm font-semibold mb-1">Paso 1: Define tu Visión</h3>
              <p className="text-xs text-gray-500">¿Cómo quieres transformar este espacio?</p>
            </div>

            <Tabs value={formData.mode} onValueChange={(value) => updateFormData({ mode: value as 'prompt' | 'style' })}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="style">
                  <PaintBucket className="h-3.5 w-3.5 mr-1.5" />
                  Estilo Guiado
                </TabsTrigger>
                <TabsTrigger value="prompt">
                  <Wand2 className="h-3.5 w-3.5 mr-1.5" />
                  Personalizado
                </TabsTrigger>
              </TabsList>

              <TabsContent value="style" className="space-y-3 mt-4">
                <Label className="text-xs">Selecciona un estilo</Label>
                <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto">
                  {designData.styles.map((style) => (
                    <button
                      key={style.id}
                      onClick={() => updateFormData({ styleId: style.id })}
                      className={cn(
                        "p-3 rounded-lg border-2 text-left transition-all",
                        formData.styleId === style.id
                          ? "border-[#A3B1A1] bg-[#A3B1A1]/5"
                          : "border-gray-200 hover:border-gray-300"
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <span className="text-xs font-medium">{style.name}</span>
                        <Badge variant="outline" className="text-[10px] px-1 py-0">
                          {style.token_cost || 1} token
                        </Badge>
                      </div>
                    </button>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="prompt" className="space-y-3 mt-4">
                <Label className="text-xs">Describe tu visión</Label>
                <Textarea
                  value={formData.customPrompt}
                  onChange={(e) => updateFormData({ customPrompt: e.target.value })}
                  placeholder="Un dormitorio minimalista con colores neutros y mucha luz natural..."
                  className="min-h-[120px] text-sm"
                />
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'Moderno y minimalista',
                    'Acogedor y cálido',
                    'Elegante y sofisticado',
                    'Rústico chileno'
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

        {/* Step 2: Define Space */}
        {currentStep === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div>
              <h3 className="text-sm font-semibold mb-1">Paso 2: Define el Espacio</h3>
              <p className="text-xs text-gray-500">¿Qué tipo de habitación es?</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {designData.roomTypes.map((room) => (
                <button
                  key={room.id}
                  onClick={() => updateFormData({ roomTypeId: room.id })}
                  className={cn(
                    "p-3 rounded-lg border-2 text-left transition-all flex items-center gap-2",
                    formData.roomTypeId === room.id
                      ? "border-[#A3B1A1] bg-[#A3B1A1]/5"
                      : "border-gray-200 hover:border-gray-300"
                  )}
                >
                  <Home className="h-4 w-4 text-gray-500" />
                  <span className="text-xs font-medium">{room.name}</span>
                </button>
              ))}
            </div>

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

        {/* Step 3: Fine-tuning */}
        {currentStep === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div>
              <h3 className="text-sm font-semibold mb-1">Paso 3: Ajustes Finales</h3>
              <p className="text-xs text-gray-500">Personaliza los detalles (opcional)</p>
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
                          Reemplazar todo
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="keep_existing" id="keep_existing" />
                        <Label htmlFor="keep_existing" className="text-xs">
                          Mantener existente
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="mix" id="mix" />
                        <Label htmlFor="mix" className="text-xs">
                          Mezclar ambos
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
                      <Label className="text-xs">Alto: {formData.roomHeight}m</Label>
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
                      Automático
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
                onClick={() => setCurrentStep(2)}
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
                    Generar Diseño
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