'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Sparkles, Clock, Layers, Wand2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function TransformationsHistoryPage() {
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
                  Historial de Transformaciones
                </h1>
                <Badge className="bg-[#F8F8F8] text-[#333333]/50 border-0 text-[9px] px-2 py-0.5 font-lato uppercase">
                  Demo
                </Badge>
              </div>
              <p className={`text-sm text-[#333333]/60 mt-1 font-lato transition-all duration-500 delay-100 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}`}>
                Revisa todas las versiones y cambios de tus espacios
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Demo Content */}
      <Card className={`border-0 shadow-lg bg-white transition-all duration-500 delay-200 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
        <CardContent className="py-20 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-[#A3B1A1]/10 to-[#C4886F]/10 flex items-center justify-center mx-auto mb-6">
            <Sparkles className="h-10 w-10 text-[#A3B1A1]" />
          </div>

          <h3 className="text-xl font-light text-[#333333] mb-3 font-cormorant">
            Tu Historial de Magia
          </h3>

          <p className="text-sm text-[#333333]/60 mb-8 max-w-md mx-auto font-lato leading-relaxed">
            Aquí podrás ver todas las transformaciones que has creado, comparar versiones anteriores
            y recuperar ese diseño perfecto que creaste la semana pasada.
          </p>

          {/* Feature Preview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto mb-8">
            <div className="p-4 bg-[#F8F8F8]/50 rounded-lg">
              <Clock className="h-6 w-6 text-[#A3B1A1] mx-auto mb-2" />
              <h4 className="text-xs font-lato font-medium text-[#333333] mb-1">Línea de Tiempo</h4>
              <p className="text-[10px] text-[#333333]/50 font-lato">
                Navega por fecha y hora de creación
              </p>
            </div>

            <div className="p-4 bg-[#F8F8F8]/50 rounded-lg">
              <Layers className="h-6 w-6 text-[#C4886F] mx-auto mb-2" />
              <h4 className="text-xs font-lato font-medium text-[#333333] mb-1">Comparación Visual</h4>
              <p className="text-[10px] text-[#333333]/50 font-lato">
                Compara antes y después lado a lado
              </p>
            </div>

            <div className="p-4 bg-[#F8F8F8]/50 rounded-lg">
              <Wand2 className="h-6 w-6 text-[#A3B1A1] mx-auto mb-2" />
              <h4 className="text-xs font-lato font-medium text-[#333333] mb-1">Recuperación Mágica</h4>
              <p className="text-[10px] text-[#333333]/50 font-lato">
                Restaura cualquier versión anterior
              </p>
            </div>
          </div>

          <div className="inline-flex items-center gap-2">
            <Badge className="bg-[#A3B1A1]/10 text-[#A3B1A1] border-0 px-2 py-0.5 text-[10px] font-lato">
              Demo
            </Badge>
            <span className="text-xs text-[#333333]/50 font-lato">
              Funcionalidad en desarrollo
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Demo Timeline */}
      <div className={`mt-8 space-y-4 transition-all duration-500 delay-300 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
        <h3 className="text-sm font-lato text-[#333333]/60 uppercase tracking-wider mb-4">
          Ejemplo de Timeline
        </h3>

        {[
          { time: 'Hoy, 14:30', style: 'Mediterráneo Chileno', room: 'Living' },
          { time: 'Ayer, 10:15', style: 'Minimalista Escandinavo', room: 'Dormitorio' },
          { time: 'Hace 3 días', style: 'Boho Valparaíso', room: 'Terraza' },
        ].map((item, index) => (
          <Card key={index} className="border-0 shadow-md bg-white/50 opacity-50 cursor-not-allowed">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#A3B1A1]/10 to-[#C4886F]/10 rounded" />
                  <div>
                    <p className="text-sm font-cormorant text-[#333333]">{item.style}</p>
                    <p className="text-xs text-[#333333]/50 font-lato">{item.room} • {item.time}</p>
                  </div>
                </div>
                <Badge className="bg-[#F8F8F8] text-[#333333]/30 border-0 text-[9px] px-2 py-0.5">
                  Demo
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}