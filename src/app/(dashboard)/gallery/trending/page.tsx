'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { ArrowLeft, TrendingUp, Construction } from 'lucide-react'

export default function TrendingGalleryPage() {
  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      {/* Page Header */}
      <div className="bg-white border-b border-[#A3B1A1]/10 px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <Link href="/dashboard/gallery">
            <Button variant="ghost" className="mb-4 text-[#333333]/60 hover:text-[#333333] rounded-none">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Galería
            </Button>
          </Link>
          <div className="flex items-center gap-3 mb-3">
            <TrendingUp className="h-8 w-8 text-[#A3B1A1]" />
            <Badge className="bg-[#C4886F]/10 text-[#C4886F] border-[#C4886F]/20 font-lato">
              Demo - En Construcción
            </Badge>
          </div>
          <h1 className="text-4xl font-cormorant font-light text-[#333333] mb-2">
            Tendencias
          </h1>
          <p className="text-lg text-[#333333]/60 font-lato font-light">
            Las transformaciones más populares de la semana
          </p>
        </div>
      </div>

      {/* Coming Soon Content */}
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <Card className="border-[#A3B1A1]/10 p-16">
            <div className="text-center">
              <div className="w-20 h-20 bg-[#A3B1A1]/10 flex items-center justify-center mx-auto mb-6">
                <Construction className="h-10 w-10 text-[#A3B1A1]" />
              </div>
              <h2 className="text-2xl font-cormorant font-light text-[#333333] mb-4">
                Página en Construcción
              </h2>
              <p className="text-[#333333]/60 font-lato max-w-md mx-auto">
                Estamos trabajando en esta sección. Pronto podrás explorar las transformaciones más populares de nuestra comunidad.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}