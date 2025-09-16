'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Camera,
  Plus,
  Upload,
  X,
  Save,
  ArrowLeft,
  MessageCircleHeart,
  ImageIcon,
  Sparkles,
  Grid3x3,
  Layout,
  Palette
} from 'lucide-react'

export default function CreateMoodboardPage() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [selectedImages, setSelectedImages] = useState<string[]>([])
  const [layout, setLayout] = useState<'grid' | 'collage' | 'mosaic'>('grid')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const mockSuggestions = [
    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=400',
    'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=400',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=400',
    'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?q=80&w=400',
    'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?q=80&w=400',
    'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=400'
  ]

  const addImage = (url: string) => {
    if (!selectedImages.includes(url)) {
      setSelectedImages([...selectedImages, url])
    }
  }

  const removeImage = (url: string) => {
    setSelectedImages(selectedImages.filter(img => img !== url))
  }

  return (
    <div className="min-h-screen">
      {/* Header - Refined */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/moodboards">
              <Button
                variant="ghost"
                size="sm"
                className="text-[#333333]/60 hover:text-[#333333] transition-colors duration-300"
              >
                <ArrowLeft className="h-3 w-3 mr-1" />
                Volver
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className={`text-2xl font-light text-[#333333] font-cormorant transition-all duration-500 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}`}>
                  Crear Moodboard
                </h1>
                <Badge className="bg-gradient-to-r from-[#A3B1A1]/10 to-[#C4886F]/10 text-[#333333]/60 border-0 text-[9px] px-2 py-0.5 font-lato uppercase">
                  Demo
                </Badge>
              </div>
              <p className={`text-sm text-[#333333]/60 mt-1 font-lato transition-all duration-500 delay-100 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}`}>
                Combina múltiples imágenes para tu visión
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              size="sm"
              className="border-[#A3B1A1]/20 text-[#333333]/60 hover:bg-[#A3B1A1]/10"
              disabled
            >
              Guardar borrador
            </Button>
            <Button
              className="bg-[#A3B1A1] hover:bg-[#A3B1A1]/90 text-white transition-all duration-300"
              size="sm"
              disabled
            >
              <Save className="h-3 w-3 mr-2" />
              Guardar
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Panel - Form & Upload */}
          <div className="lg:col-span-1 space-y-6">
            {/* Basic Info */}
            <Card className={`border-0 shadow-lg bg-white transition-all duration-500 delay-200 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
              <CardContent className="p-5">
                <h3 className="text-base font-cormorant font-normal text-[#333333] mb-3">
                  Información Básica
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-lato text-[#333333]/50 mb-1.5 block uppercase tracking-wider">
                      Título
                    </label>
                    <Input
                      placeholder="Ej: Living Mediterráneo"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="border-[#A3B1A1]/20 focus:border-[#A3B1A1]/40 bg-[#F8F8F8]/50 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-lato text-[#333333]/60 mb-2 block">
                      Descripción
                    </label>
                    <Textarea
                      placeholder="Describe tu visión..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="border-[#A3B1A1]/20 focus:border-[#A3B1A1] font-lato rounded-none resize-none"
                      rows={3}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Upload Options */}
            <Card className={`border-0 shadow-lg bg-white transition-all duration-500 delay-300 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
              <CardContent className="p-5">
                <h3 className="text-base font-cormorant font-normal text-[#333333] mb-3">
                  Agregar Imágenes
                </h3>
                <div className="space-y-3">
                  <Button variant="outline" size="sm" className="w-full justify-start border-[#A3B1A1]/20 text-[#333333]/60 hover:bg-[#A3B1A1]/10 text-xs" disabled>
                    <Upload className="h-3 w-3 mr-2" />
                    Subir desde dispositivo
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start border-[#A3B1A1]/20 text-[#333333]/60 hover:bg-[#A3B1A1]/10 text-xs" disabled>
                    <MessageCircleHeart className="h-3 w-3 mr-2" />
                    Importar de Pinterest
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start border-[#A3B1A1]/20 text-[#333333]/60 hover:bg-[#A3B1A1]/10 text-xs" disabled>
                    <ImageIcon className="h-3 w-3 mr-2" />
                    Galería de Decollage
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Layout Options */}
            <Card className={`border-0 shadow-lg bg-white transition-all duration-500 delay-400 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
              <CardContent className="p-5">
                <h3 className="text-base font-cormorant font-normal text-[#333333] mb-3">
                  Disposición
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant={layout === 'grid' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setLayout('grid')}
                    className={layout === 'grid' ? 'bg-[#A3B1A1] text-white' : 'border-[#A3B1A1]/20 text-[#333333]/60'}
                  >
                    <Grid3x3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={layout === 'collage' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setLayout('collage')}
                    className={layout === 'collage' ? 'bg-[#A3B1A1] text-white' : 'border-[#A3B1A1]/20 text-[#333333]/60'}
                  >
                    <Layout className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={layout === 'mosaic' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setLayout('mosaic')}
                    className={layout === 'mosaic' ? 'bg-[#A3B1A1] text-white' : 'border-[#A3B1A1]/20 text-[#333333]/60'}
                  >
                    <Palette className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Preview & Suggestions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Preview Area */}
            <Card className={`border-0 shadow-lg bg-white min-h-[400px] transition-all duration-500 delay-500 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-cormorant font-normal text-[#333333]">
                    Vista Previa
                  </h3>
                  {selectedImages.length > 0 && (
                    <Badge className="bg-[#A3B1A1]/10 text-[#A3B1A1] border-0 text-[10px] px-2 py-0.5 font-lato">
                      {selectedImages.length} imágenes
                    </Badge>
                  )}
                </div>

                {selectedImages.length > 0 ? (
                  <div className={`grid gap-2 ${
                    layout === 'grid' ? 'grid-cols-3' :
                    layout === 'collage' ? 'grid-cols-2' :
                    'grid-cols-4'
                  }`}>
                    {selectedImages.map((img, index) => (
                      <div key={index} className={`relative group ${
                        layout === 'collage' && index === 0 ? 'col-span-2 row-span-2' : ''
                      }`}>
                        <div className={`relative overflow-hidden ${
                          layout === 'collage' && index === 0 ? 'h-64' : 'h-32'
                        }`}>
                          <Image
                            src={img}
                            alt={`Moodboard image ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                          <Button
                            size="icon"
                            variant="destructive"
                            className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeImage(img)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-[320px] border border-dashed border-[#A3B1A1]/20 bg-[#F8F8F8]/30 flex flex-col items-center justify-center">
                    <div className="w-12 h-12 bg-[#A3B1A1]/10 flex items-center justify-center mb-3">
                      <ImageIcon className="h-6 w-6 text-[#A3B1A1]/50" />
                    </div>
                    <p className="text-sm text-[#333333]/50 font-lato">
                      Agrega imágenes para comenzar
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* AI Suggestions */}
            <Card className={`border-0 shadow-lg bg-white transition-all duration-500 delay-600 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="h-4 w-4 text-[#A3B1A1]" />
                  <h3 className="text-base font-cormorant font-normal text-[#333333]">
                    Sugerencias
                  </h3>
                  <Badge className="bg-[#F8F8F8] text-[#333333]/50 border-0 text-[9px] px-1.5 py-0.5 font-lato uppercase">
                    Demo
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {mockSuggestions.map((img, index) => (
                    <div
                      key={index}
                      className="relative group cursor-pointer"
                      onClick={() => addImage(img)}
                    >
                      <div className="relative h-24 overflow-hidden">
                        <Image
                          src={img}
                          alt={`Suggestion ${index + 1}`}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <Plus className="h-6 w-6 text-white" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
  )
}