'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Check, Sparkles, Zap, Crown, Building2, Users, Rocket } from 'lucide-react'
import { toast } from 'sonner'

// Based on BUSINESS_PLAN.md pricing
const b2cPackages = [
  {
    id: 'starter',
    name: 'Starter Pack',
    tokens: 10,
    price: 9990,
    priceUSD: 10,
    popular: false,
    icon: <Sparkles className="h-5 w-5" />,
    features: [
      '10 generaciones de staging',
      'Estilos predefinidos',
      'Descarga en alta resolución',
      'Soporte por email'
    ]
  },
  {
    id: 'home-seller',
    name: 'Home Seller Pack',
    tokens: 30,
    price: 24990,
    priceUSD: 25,
    popular: true,
    icon: <Zap className="h-5 w-5" />,
    features: [
      '30 generaciones de staging',
      'Todos los estilos disponibles',
      'Múltiples variaciones',
      'Procesamiento prioritario',
      'Soporte por chat'
    ]
  },
  {
    id: 'professional',
    name: 'Professional Pack',
    tokens: 100,
    price: 69990,
    priceUSD: 70,
    popular: false,
    icon: <Crown className="h-5 w-5" />,
    features: [
      '100 generaciones de staging',
      'Estilos personalizados',
      'Batch processing',
      'API access básico',
      'Soporte prioritario 24/7'
    ]
  }
]

const b2bPackages = [
  {
    id: 'agency-starter',
    name: 'Agency Starter',
    generations: 250,
    price: 149990,
    priceUSD: 150,
    period: 'mes',
    popular: false,
    icon: <Building2 className="h-5 w-5" />,
    features: [
      '250 generaciones/mes',
      'Multi-usuario (3 seats)',
      'Workspace colaborativo',
      'Marca personalizada',
      'Analytics básico',
      'Soporte empresarial'
    ]
  },
  {
    id: 'agency-pro',
    name: 'Agency Pro',
    generations: 1000,
    price: 499990,
    priceUSD: 500,
    period: 'mes',
    popular: true,
    icon: <Users className="h-5 w-5" />,
    features: [
      '1000 generaciones/mes',
      'Usuarios ilimitados',
      'API completo',
      'White-label disponible',
      'Analytics avanzado',
      'Integraciones CRM',
      'Soporte dedicado'
    ]
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    generations: -1, // Unlimited
    price: 0, // Custom
    priceUSD: 0,
    period: 'mes',
    popular: false,
    icon: <Rocket className="h-5 w-5" />,
    features: [
      'Generaciones ilimitadas',
      'Infraestructura dedicada',
      'SLA garantizado 99.9%',
      'Desarrollo personalizado',
      'Onboarding incluido',
      'Account manager dedicado',
      'Facturación personalizada'
    ]
  }
]

export default function PricingPage() {
  const [billingType, setBillingType] = useState<'b2c' | 'b2b'>('b2c')
  const [loading, setLoading] = useState(false)

  const handlePurchase = async (packageId: string, type: 'b2c' | 'b2b') => {
    setLoading(true)
    try {
      // Here would go the Flow Chile payment integration
      toast.success('Redirigiendo a Flow Chile para el pago...')
      
      // Simulate redirect
      setTimeout(() => {
        window.location.href = '#' // In production: Flow Chile payment URL
      }, 2000)
    } catch (error) {
      toast.error('Error al procesar el pago')
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(price)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Planes y Precios
            </h1>
            <p className="text-lg text-gray-600">
              Transforma espacios vacíos en propiedades listas para el mercado en segundos
            </p>
            <div className="mt-4 flex items-center justify-center gap-4">
              <Badge variant="secondary" className="text-sm">
                95% más económico que staging tradicional
              </Badge>
              <Badge variant="secondary" className="text-sm">
                Resultados en menos de 30 segundos
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 max-w-7xl mx-auto">
        {/* Billing Toggle */}
        <div className="flex justify-center mb-8">
          <Tabs value={billingType} onValueChange={(v) => setBillingType(v as 'b2c' | 'b2b')}>
            <TabsList className="grid w-[400px] grid-cols-2">
              <TabsTrigger value="b2c">
                <Sparkles className="mr-2 h-4 w-4" />
                Personal / Individual
              </TabsTrigger>
              <TabsTrigger value="b2b">
                <Building2 className="mr-2 h-4 w-4" />
                Empresas / Agencias
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* B2C Packages */}
        {billingType === 'b2c' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {b2cPackages.map((pkg) => (
              <Card 
                key={pkg.id} 
                className={`relative ${pkg.popular ? 'ring-2 ring-blue-600 shadow-lg' : ''}`}
              >
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-blue-600 text-white">Más Popular</Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto w-12 h-12 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-lg flex items-center justify-center text-blue-600 mb-4">
                    {pkg.icon}
                  </div>
                  <CardTitle className="text-xl">{pkg.name}</CardTitle>
                  <CardDescription>
                    {pkg.tokens} generaciones incluidas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-6">
                    <div className="text-3xl font-bold text-gray-900">
                      {formatPrice(pkg.price)}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      ~${pkg.priceUSD} USD
                    </p>
                  </div>
                  <ul className="space-y-3">
                    {pkg.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full" 
                    variant={pkg.popular ? 'default' : 'outline'}
                    onClick={() => handlePurchase(pkg.id, 'b2c')}
                    disabled={loading}
                  >
                    Comprar Ahora
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {/* B2B Packages */}
        {billingType === 'b2b' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {b2bPackages.map((pkg) => (
              <Card 
                key={pkg.id} 
                className={`relative ${pkg.popular ? 'ring-2 ring-purple-600 shadow-lg' : ''}`}
              >
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-purple-600 text-white">Recomendado</Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center text-purple-600 mb-4">
                    {pkg.icon}
                  </div>
                  <CardTitle className="text-xl">{pkg.name}</CardTitle>
                  <CardDescription>
                    {pkg.generations === -1 
                      ? 'Generaciones ilimitadas' 
                      : `${pkg.generations} generaciones/${pkg.period}`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-6">
                    {pkg.price === 0 ? (
                      <div className="text-2xl font-bold text-gray-900">
                        Precio Personalizado
                      </div>
                    ) : (
                      <>
                        <div className="text-3xl font-bold text-gray-900">
                          {formatPrice(pkg.price)}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          por {pkg.period} (~${pkg.priceUSD} USD)
                        </p>
                      </>
                    )}
                  </div>
                  <ul className="space-y-3">
                    {pkg.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full" 
                    variant={pkg.popular ? 'default' : 'outline'}
                    onClick={() => pkg.id === 'enterprise' 
                      ? window.location.href = 'mailto:ventas@virtualstaging.cl'
                      : handlePurchase(pkg.id, 'b2b')
                    }
                    disabled={loading}
                  >
                    {pkg.id === 'enterprise' ? 'Contactar Ventas' : 'Comenzar Ahora'}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {/* Additional Info */}
        <div className="mt-12 text-center">
          <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                ¿No estás seguro qué plan elegir?
              </h3>
              <p className="text-gray-600 mb-4">
                Comienza con nuestro plan gratuito de prueba: 5 generaciones gratis para nuevos usuarios
              </p>
              <Button variant="outline">
                Probar Gratis
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
            Preguntas Frecuentes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">¿Cómo funcionan los tokens?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Cada generación de staging consume 1 token. Los tokens no expiran y puedes usarlos cuando quieras.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">¿Puedo cambiar de plan?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Sí, puedes cambiar o cancelar tu plan en cualquier momento desde tu panel de control.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">¿Qué métodos de pago aceptan?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Aceptamos todas las tarjetas de crédito/débito chilenas a través de Flow Chile, además de transferencias bancarias para planes empresariales.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">¿Ofrecen descuentos por volumen?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Sí, para compras superiores a 500 tokens o planes enterprise, contáctanos para precios especiales.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}