'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ImageIcon, Upload, Grid3x3, Download, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function ProjectImagesPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/projects">
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
                  Galería de Imágenes
                </h1>
                <Badge className="bg-[#F8F8F8] text-[#333333]/50 border-0 text-[9px] px-2 py-0.5 font-lato uppercase">
                  Próximamente
                </Badge>
              </div>
              <p className={`text-sm text-[#333333]/60 mt-1 font-lato transition-all duration-500 delay-100 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}`}>
                Gestiona todas las imágenes de tus espacios
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Coming Soon Content */}
      <Card className={`border-0 shadow-lg bg-white transition-all duration-500 delay-200 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
        <CardContent className="py-20 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-[#A3B1A1]/10 to-[#C4886F]/10 flex items-center justify-center mx-auto mb-6">
            <ImageIcon className="h-10 w-10 text-[#A3B1A1]" />
          </div>

          <h3 className="text-xl font-light text-[#333333] mb-3 font-cormorant">
            Galería de Imágenes en Desarrollo
          </h3>

          <p className="text-sm text-[#333333]/60 mb-8 max-w-md mx-auto font-lato leading-relaxed">
            Pronto podrás subir, organizar y gestionar todas las fotos de tus espacios en un solo lugar.
            Crea colecciones, etiqueta habitaciones y accede rápidamente a tus imágenes.
          </p>

          {/* Feature Preview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto mb-8">
            <div className="p-4 bg-[#F8F8F8]/50 rounded-lg">
              <Upload className="h-6 w-6 text-[#A3B1A1] mx-auto mb-2" />
              <h4 className="text-xs font-lato font-medium text-[#333333] mb-1">Carga Múltiple</h4>
              <p className="text-[10px] text-[#333333]/50 font-lato">
                Arrastra y suelta varias imágenes a la vez
              </p>
            </div>

            <div className="p-4 bg-[#F8F8F8]/50 rounded-lg">
              <Grid3x3 className="h-6 w-6 text-[#C4886F] mx-auto mb-2" />
              <h4 className="text-xs font-lato font-medium text-[#333333] mb-1">Organización Smart</h4>
              <p className="text-[10px] text-[#333333]/50 font-lato">
                Categorización automática por habitación
              </p>
            </div>

            <div className="p-4 bg-[#F8F8F8]/50 rounded-lg">
              <Download className="h-6 w-6 text-[#A3B1A1] mx-auto mb-2" />
              <h4 className="text-xs font-lato font-medium text-[#333333] mb-1">Exportación Fácil</h4>
              <p className="text-[10px] text-[#333333]/50 font-lato">
                Descarga tus colecciones en alta resolución
              </p>
            </div>
          </div>

          <Badge className="bg-gradient-to-r from-[#A3B1A1]/10 to-[#C4886F]/10 text-[#333333]/60 border-0 px-3 py-1 text-xs font-lato">
            Disponible en Febrero 2025
          </Badge>
        </CardContent>
      </Card>
    </div>
  )
}