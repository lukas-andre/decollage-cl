'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Check, Share2, MessageSquare, Image as ImageIcon, Users, ChevronRight, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Database } from '@/types/database.types'

type Generation = Database['public']['Tables']['staging_generations']['Row']
type Project = Database['public']['Tables']['staging_projects']['Row']

interface EnhancedShareDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  project: Project
  generations: Generation[]
  onShare: (selectedIds: string[], format: 'quick' | 'story') => void
}

export function EnhancedShareDialog({
  open,
  onOpenChange,
  project,
  generations,
  onShare
}: EnhancedShareDialogProps) {
  const [selectedGenerations, setSelectedGenerations] = useState<Set<string>>(new Set())
  const [shareFormat, setShareFormat] = useState<'quick' | 'story'>('quick')

  const toggleSelection = (id: string) => {
    const newSelection = new Set(selectedGenerations)
    if (newSelection.has(id)) {
      newSelection.delete(id)
    } else {
      newSelection.add(id)
    }
    setSelectedGenerations(newSelection)
  }

  const handleShare = () => {
    if (selectedGenerations.size === 0) return
    onShare(Array.from(selectedGenerations), shareFormat)
    onOpenChange(false)
  }

  const isQuickShareValid = selectedGenerations.size === 1
  const isStoryShareValid = selectedGenerations.size >= 1

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-3xl font-light text-[#333333]">
            Compartir tu transformación
          </DialogTitle>
          <DialogDescription className="text-base text-gray-600">
            Selecciona cómo quieres compartir tu proyecto {project.name}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={shareFormat} onValueChange={(value) => setShareFormat(value as 'quick' | 'story')} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="quick" className="data-[state=active]:bg-[#A3B1A1]/10">
              <MessageSquare className="w-4 h-4 mr-2" />
              Compartir Rápido
            </TabsTrigger>
            <TabsTrigger value="story" className="data-[state=active]:bg-[#C4886F]/10">
              <Sparkles className="w-4 h-4 mr-2" />
              Crear Historia
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto">
            <TabsContent value="quick" className="space-y-4">
              <Card className="p-4 bg-[#A3B1A1]/5 border-[#A3B1A1]/20">
                <div className="flex items-start space-x-3">
                  <MessageSquare className="w-5 h-5 text-[#A3B1A1] mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-medium text-[#333333]">Compartir Rápido</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Perfecto para WhatsApp e Instagram. Muestra el antes/después con un slider interactivo.
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary" className="text-xs">
                        1 diseño
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        Link directo
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        Optimizado móvil
                      </Badge>
                    </div>
                  </div>
                </div>
              </Card>

              <div className="space-y-2">
                <p className="text-sm font-medium text-[#333333]">Selecciona un diseño:</p>
                <div className="grid grid-cols-2 gap-3">
                  {generations.map((generation) => (
                    <button
                      key={generation.id}
                      onClick={() => {
                        setSelectedGenerations(new Set([generation.id]))
                      }}
                      className={cn(
                        "relative group overflow-hidden rounded-lg border-2 transition-all duration-300",
                        selectedGenerations.has(generation.id)
                          ? "border-[#A3B1A1] shadow-lg scale-[1.02]"
                          : "border-gray-200 hover:border-[#A3B1A1]/50"
                      )}
                    >
                      <div className="aspect-[4/3] relative bg-gray-100">
                        {generation.image_url && (
                          <img
                            src={generation.image_url}
                            alt="Diseño generado"
                            className="w-full h-full object-cover"
                          />
                        )}
                        {selectedGenerations.has(generation.id) && (
                          <div className="absolute inset-0 bg-[#A3B1A1]/20 flex items-center justify-center">
                            <div className="bg-white rounded-full p-2">
                              <Check className="w-5 h-5 text-[#A3B1A1]" />
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="p-2 bg-white">
                        <p className="text-xs text-gray-600 truncate">
                          {generation.style || 'Sin estilo'}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="story" className="space-y-4">
              <Card className="p-4 bg-[#C4886F]/5 border-[#C4886F]/20">
                <div className="flex items-start space-x-3">
                  <Sparkles className="w-5 h-5 text-[#C4886F] mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-medium text-[#333333]">Crear Historia</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Crea una página estilo revista con múltiples diseños, paletas de colores y tu perfil.
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary" className="text-xs">
                        Múltiples diseños
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        Página completa
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        SEO optimizado
                      </Badge>
                    </div>
                  </div>
                </div>
              </Card>

              <div className="space-y-2">
                <p className="text-sm font-medium text-[#333333]">
                  Selecciona los diseños para tu historia ({selectedGenerations.size} seleccionados):
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {generations.map((generation, index) => (
                    <button
                      key={generation.id}
                      onClick={() => toggleSelection(generation.id)}
                      className={cn(
                        "relative group overflow-hidden rounded-lg border-2 transition-all duration-300",
                        selectedGenerations.has(generation.id)
                          ? "border-[#C4886F] shadow-lg scale-[1.02]"
                          : "border-gray-200 hover:border-[#C4886F]/50"
                      )}
                    >
                      <div className="aspect-[4/3] relative bg-gray-100">
                        {generation.image_url && (
                          <img
                            src={generation.image_url}
                            alt="Diseño generado"
                            className="w-full h-full object-cover"
                          />
                        )}
                        {selectedGenerations.has(generation.id) && (
                          <div className="absolute inset-0 bg-[#C4886F]/20 flex items-center justify-center">
                            <div className="bg-white rounded-full p-2">
                              <Check className="w-5 h-5 text-[#C4886F]" />
                            </div>
                          </div>
                        )}
                        {selectedGenerations.has(generation.id) && (
                          <div className="absolute top-2 right-2 bg-white rounded-full px-2 py-1">
                            <span className="text-xs font-medium text-[#C4886F]">
                              {Array.from(selectedGenerations).indexOf(generation.id) + 1}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="p-2 bg-white">
                        <p className="text-xs text-gray-600 truncate">
                          {generation.style || 'Sin estilo'}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </TabsContent>
          </div>

          <div className="pt-4 border-t mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {shareFormat === 'quick' ? (
                <span>{isQuickShareValid ? '1 diseño seleccionado' : 'Selecciona 1 diseño'}</span>
              ) : (
                <span>{selectedGenerations.size} diseño{selectedGenerations.size !== 1 ? 's' : ''} seleccionado{selectedGenerations.size !== 1 ? 's' : ''}</span>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleShare}
                disabled={
                  (shareFormat === 'quick' && !isQuickShareValid) ||
                  (shareFormat === 'story' && !isStoryShareValid)
                }
                className={cn(
                  "min-w-[140px]",
                  shareFormat === 'quick'
                    ? "bg-[#A3B1A1] hover:bg-[#A3B1A1]/90"
                    : "bg-[#C4886F] hover:bg-[#C4886F]/90"
                )}
              >
                {shareFormat === 'quick' ? (
                  <>
                    <Share2 className="w-4 h-4 mr-2" />
                    Compartir Ahora
                  </>
                ) : (
                  <>
                    <ChevronRight className="w-4 h-4 mr-2" />
                    Continuar
                  </>
                )}
              </Button>
            </div>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}