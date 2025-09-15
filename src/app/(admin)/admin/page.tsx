import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LogoutButton } from '@/components/dashboard/logout-button'

export const metadata: Metadata = {
  title: 'Panel de Administración | VirtualStaging',
  description: 'Panel de administración de VirtualStaging',
}

export default function AdminPage() {
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
              <Link href="/tokens" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                Tokens
              </Link>
              <Link href="/admin" className="text-sm font-medium text-gray-900">
                Admin
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
          <h2 className="text-4xl font-bold tracking-tight mb-8">Panel de Administración</h2>
          
          {/* Admin Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <Card className="bg-white border border-gray-100 rounded-xl p-5">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                Ingresos del Mes
              </div>
              <div className="text-4xl font-bold tracking-tight mb-1">$2.4M</div>
              <div className="text-xs font-medium text-green-600">+18% vs mes anterior</div>
            </Card>
            
            <Card className="bg-white border border-gray-100 rounded-xl p-5">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                Usuarios Activos
              </div>
              <div className="text-4xl font-bold tracking-tight mb-1">342</div>
              <div className="text-xs font-medium text-green-600">+28 esta semana</div>
            </Card>
            
            <Card className="bg-white border border-gray-100 rounded-xl p-5">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                Costo API
              </div>
              <div className="text-4xl font-bold tracking-tight mb-1">$580K</div>
              <div className="text-xs font-medium text-gray-500">Margen: 76%</div>
            </Card>
            
            <Card className="bg-white border border-gray-100 rounded-xl p-5">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                Generaciones
              </div>
              <div className="text-4xl font-bold tracking-tight mb-1">8,743</div>
              <div className="text-xs font-medium text-green-600">+12% este mes</div>
            </Card>
          </div>

          {/* User Management */}
          <h3 className="text-xl font-semibold mb-6">Gestión de Usuarios</h3>
          <Card className="bg-white border border-gray-100 rounded-xl overflow-hidden mb-12">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Usuario
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Email
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Tokens
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Generaciones
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Estado
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-4 font-medium text-sm">María González</td>
                    <td className="px-4 py-4 text-sm">maria@inmobiliaria.cl</td>
                    <td className="px-4 py-4 text-sm">450</td>
                    <td className="px-4 py-4 text-sm">23</td>
                    <td className="px-4 py-4">
                      <Badge className="bg-green-100 text-green-800 text-xs">Activo</Badge>
                    </td>
                    <td className="px-4 py-4">
                      <Button variant="ghost" size="sm" className="text-xs">
                        Ver detalles
                      </Button>
                    </td>
                  </tr>
                  <tr className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-4 font-medium text-sm">Juan Pérez</td>
                    <td className="px-4 py-4 text-sm">juan@corredores.cl</td>
                    <td className="px-4 py-4 text-sm">120</td>
                    <td className="px-4 py-4 text-sm">67</td>
                    <td className="px-4 py-4">
                      <Badge className="bg-green-100 text-green-800 text-xs">Activo</Badge>
                    </td>
                    <td className="px-4 py-4">
                      <Button variant="ghost" size="sm" className="text-xs">
                        Ver detalles
                      </Button>
                    </td>
                  </tr>
                  <tr className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-4 font-medium text-sm">Ana Silva</td>
                    <td className="px-4 py-4 text-sm">ana@propiedades.cl</td>
                    <td className="px-4 py-4 text-sm">0</td>
                    <td className="px-4 py-4 text-sm">100</td>
                    <td className="px-4 py-4">
                      <Badge className="bg-yellow-100 text-yellow-800 text-xs">Sin tokens</Badge>
                    </td>
                    <td className="px-4 py-4">
                      <Button variant="ghost" size="sm" className="text-xs">
                        Ver detalles
                      </Button>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-4 font-medium text-sm">Carlos López</td>
                    <td className="px-4 py-4 text-sm">carlos@broker.cl</td>
                    <td className="px-4 py-4 text-sm">890</td>
                    <td className="px-4 py-4 text-sm">12</td>
                    <td className="px-4 py-4">
                      <Badge className="bg-green-100 text-green-800 text-xs">Activo</Badge>
                    </td>
                    <td className="px-4 py-4">
                      <Button variant="ghost" size="sm" className="text-xs">
                        Ver detalles
                      </Button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>

          {/* Recent Transactions */}
          <h3 className="text-xl font-semibold mb-6">Transacciones Recientes</h3>
          <Card className="bg-white border border-gray-100 rounded-xl overflow-hidden mb-12">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                      ID
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Usuario
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Tipo
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Monto
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Tokens
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Fecha
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Estado
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-4 font-mono text-xs">#TRX-2024-001</td>
                    <td className="px-4 py-4 text-sm">María González</td>
                    <td className="px-4 py-4 text-sm">Compra</td>
                    <td className="px-4 py-4 text-sm font-semibold">$39.990</td>
                    <td className="px-4 py-4 text-sm">500</td>
                    <td className="px-4 py-4 text-sm">Hoy, 14:30</td>
                    <td className="px-4 py-4">
                      <Badge className="bg-green-100 text-green-800 text-xs">Completado</Badge>
                    </td>
                  </tr>
                  <tr className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-4 font-mono text-xs">#TRX-2024-002</td>
                    <td className="px-4 py-4 text-sm">Juan Pérez</td>
                    <td className="px-4 py-4 text-sm">Generación</td>
                    <td className="px-4 py-4 text-sm">-</td>
                    <td className="px-4 py-4 text-sm text-red-600">-10</td>
                    <td className="px-4 py-4 text-sm">Hoy, 13:45</td>
                    <td className="px-4 py-4">
                      <Badge className="bg-blue-100 text-blue-800 text-xs">Procesado</Badge>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-4 font-mono text-xs">#TRX-2024-003</td>
                    <td className="px-4 py-4 text-sm">Ana Silva</td>
                    <td className="px-4 py-4 text-sm">Compra</td>
                    <td className="px-4 py-4 text-sm font-semibold">$99.990</td>
                    <td className="px-4 py-4 text-sm">1500</td>
                    <td className="px-4 py-4 text-sm">Ayer, 18:20</td>
                    <td className="px-4 py-4">
                      <Badge className="bg-yellow-100 text-yellow-800 text-xs">Pendiente</Badge>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>

          {/* Admin Actions */}
          <div>
            <h3 className="text-xl font-semibold mb-6">Acciones Administrativas</h3>
            <div className="flex flex-wrap gap-4">
              <Button className="bg-black text-white hover:bg-gray-800">
                Exportar Reporte
              </Button>
              <Button variant="outline" className="border-gray-300">
                Gestionar Estilos
              </Button>
              <Button variant="outline" className="border-gray-300">
                Configurar Precios
              </Button>
              <Button variant="outline" className="border-gray-300">
                Ver Logs
              </Button>
              <Button variant="outline" className="border-gray-300">
                Configuración API
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}