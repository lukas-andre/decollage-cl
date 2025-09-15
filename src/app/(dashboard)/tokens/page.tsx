import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LogoutButton } from '@/components/dashboard/logout-button'
import { CheckCircle, CreditCard, History } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Comprar Tokens | VirtualStaging',
  description: 'Compra tokens para generar más imágenes con VirtualStaging',
}

export default function TokensPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <header className="fixed top-0 w-full bg-white/80 backdrop-blur-xl z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="text-lg font-bold tracking-tight">
              VirtualStaging
            </Link>
            
            <div className="hidden md:flex items-center gap-8">
              <Link href="/" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                Inicio
              </Link>
              <Link href="/dashboard" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                Dashboard
              </Link>
              <Link href="/generate" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                Generar
              </Link>
              <Link href="/gallery" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                Galería
              </Link>
              <Link href="/tokens" className="text-sm font-medium text-gray-900">
                Tokens
              </Link>
            </div>
            
            <div className="flex items-center gap-4">
              <LogoutButton className="text-gray-600 hover:text-gray-900" />
            </div>
          </div>
        </div>
      </header>

      <main className="mt-16">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold tracking-tight mb-4">Comprar Tokens</h2>
              <p className="text-gray-600 text-lg">
                Cada token te permite generar una imagen con staging virtual
              </p>
            </div>

            {/* Current Balance */}
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-6 mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-blue-600 font-medium mb-1">Balance Actual</div>
                  <div className="text-3xl font-bold text-blue-900">250 tokens</div>
                  <div className="text-sm text-blue-600">Equivale a ~25 generaciones</div>
                </div>
                <div className="text-right">
                  <CreditCard className="h-12 w-12 text-blue-400 mb-2" />
                  <div className="text-sm text-blue-600">Última compra: Hace 3 días</div>
                </div>
              </div>
            </Card>

            {/* Pricing Plans */}
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <Card className="bg-white border border-gray-100 rounded-xl p-6 hover:shadow-lg transition-all">
                <CardHeader className="p-0 mb-6">
                  <CardTitle className="text-xl mb-2">Básico</CardTitle>
                  <div className="text-3xl font-bold mb-2">
                    <span className="text-lg text-gray-500">$</span>9.990
                  </div>
                  <div className="text-gray-500 text-sm">100 tokens</div>
                  <div className="text-xs text-gray-400">$99 por token</div>
                </CardHeader>
                
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-3 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    ~10 generaciones
                  </li>
                  <li className="flex items-center gap-3 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    Todos los estilos
                  </li>
                  <li className="flex items-center gap-3 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    Descarga en HD
                  </li>
                  <li className="flex items-center gap-3 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    Soporte por email
                  </li>
                </ul>
                
                <Button variant="outline" className="w-full border-gray-300">
                  Comprar
                </Button>
              </Card>
              
              <Card className="bg-white border-2 border-blue-500 rounded-xl p-6 relative hover:shadow-lg transition-all">
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white px-4 py-1 rounded-full text-xs font-semibold uppercase tracking-wide">
                  Más Popular
                </Badge>
                <CardHeader className="p-0 mb-6">
                  <CardTitle className="text-xl mb-2">Profesional</CardTitle>
                  <div className="text-3xl font-bold mb-2">
                    <span className="text-lg text-gray-500">$</span>39.990
                  </div>
                  <div className="text-gray-500 text-sm">500 tokens</div>
                  <div className="text-xs text-gray-400">$80 por token</div>
                </CardHeader>
                
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-3 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    ~50 generaciones
                  </li>
                  <li className="flex items-center gap-3 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    Todos los estilos
                  </li>
                  <li className="flex items-center gap-3 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    Descarga en HD
                  </li>
                  <li className="flex items-center gap-3 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    Procesamiento prioritario
                  </li>
                  <li className="flex items-center gap-3 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    Soporte prioritario
                  </li>
                </ul>
                
                <Button className="w-full bg-black text-white hover:bg-gray-800">
                  Comprar
                </Button>
              </Card>
              
              <Card className="bg-white border border-gray-100 rounded-xl p-6 hover:shadow-lg transition-all">
                <CardHeader className="p-0 mb-6">
                  <CardTitle className="text-xl mb-2">Empresa</CardTitle>
                  <div className="text-3xl font-bold mb-2">
                    <span className="text-lg text-gray-500">$</span>99.990
                  </div>
                  <div className="text-gray-500 text-sm">1500 tokens</div>
                  <div className="text-xs text-gray-400">$67 por token</div>
                </CardHeader>
                
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-3 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    ~150 generaciones
                  </li>
                  <li className="flex items-center gap-3 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    Todos los estilos
                  </li>
                  <li className="flex items-center gap-3 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    API Access
                  </li>
                  <li className="flex items-center gap-3 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    Multi-usuario
                  </li>
                  <li className="flex items-center gap-3 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    Soporte dedicado
                  </li>
                </ul>
                
                <Button variant="outline" className="w-full border-gray-300">
                  Contactar Ventas
                </Button>
              </Card>
            </div>

            {/* Payment Methods */}
            <Card className="bg-white border border-gray-100 rounded-xl p-6 mb-8">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Métodos de Pago
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg">
                  <div className="w-10 h-6 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-bold">
                    VISA
                  </div>
                  <span className="text-sm">Tarjetas de Crédito/Débito</span>
                </div>
                <div className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg">
                  <div className="w-10 h-6 bg-red-600 rounded flex items-center justify-center text-white text-xs font-bold">
                    MC
                  </div>
                  <span className="text-sm">MasterCard</span>
                </div>
                <div className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg">
                  <div className="w-10 h-6 bg-green-600 rounded flex items-center justify-center text-white text-xs font-bold">
                    WP
                  </div>
                  <span className="text-sm">WebPay Plus</span>
                </div>
                <div className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg">
                  <div className="w-10 h-6 bg-orange-500 rounded flex items-center justify-center text-white text-xs font-bold">
                    TB
                  </div>
                  <span className="text-sm">Transferencia Bancaria</span>
                </div>
              </div>
            </Card>

            {/* Transaction History */}
            <Card className="bg-white border border-gray-100 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <History className="h-5 w-5" />
                Historial de Compras
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                  <div>
                    <div className="font-medium text-sm">Paquete Profesional</div>
                    <div className="text-xs text-gray-500">15 Ago 2024 • #TRX-2024-156</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-sm">$39.990</div>
                    <div className="text-xs text-green-600">+500 tokens</div>
                  </div>
                  <Badge className="bg-green-100 text-green-800 text-xs">Completado</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                  <div>
                    <div className="font-medium text-sm">Paquete Básico</div>
                    <div className="text-xs text-gray-500">28 Jul 2024 • #TRX-2024-089</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-sm">$9.990</div>
                    <div className="text-xs text-green-600">+100 tokens</div>
                  </div>
                  <Badge className="bg-green-100 text-green-800 text-xs">Completado</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                  <div>
                    <div className="font-medium text-sm">Tokens de Bienvenida</div>
                    <div className="text-xs text-gray-500">10 Jul 2024 • Registro</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-sm">Gratis</div>
                    <div className="text-xs text-green-600">+10 tokens</div>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800 text-xs">Bono</Badge>
                </div>
              </div>
              
              <div className="mt-6 text-center">
                <Button variant="outline" className="border-gray-300">
                  Ver Historial Completo
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}