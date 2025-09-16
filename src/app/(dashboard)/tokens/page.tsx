'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Sparkles,
  CreditCard,
  History,
  CheckCircle,
  ArrowRight,
  ShoppingBag,
  Leaf,
  Heart,
  Star,
  Clock,
  Gift,
  Zap,
  Trophy,
  TrendingUp
} from 'lucide-react'

export default function TokensPage() {
  const [mounted, setMounted] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<string | null>('profesional')
  const [hoveredPlan, setHoveredPlan] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  const tokenPlans = [
    {
      id: 'prueba',
      name: 'Pack Prueba',
      subtitle: 'Perfecta para comenzar',
      price: '2.990',
      tokens: 5,
      perToken: '598',
      badge: null,
      color: 'from-[#A3B1A1]/5',
      features: [
        '~5 transformaciones',
        'Todos los estilos chilenos',
        'Descarga en alta calidad',
        'Soporte por email'
      ]
    },
    {
      id: 'creativa',
      name: 'Pack Creativa',
      subtitle: 'Para explorar sin límites',
      price: '9.990',
      tokens: 20,
      perToken: '499',
      badge: 'Más Popular',
      color: 'from-[#C4886F]/5',
      features: [
        '~20 transformaciones',
        'Estilos exclusivos premium',
        'Procesamiento prioritario',
        'Historial de 30 días',
        'Soporte prioritario'
      ]
    },
    {
      id: 'profesional',
      name: 'Pack Profesional',
      subtitle: 'La elección de las expertas',
      price: '19.990',
      tokens: 50,
      perToken: '399',
      badge: 'Mejor Valor',
      color: 'from-[#A3B1A1]/10 to-[#C4886F]/5',
      features: [
        '~50 transformaciones',
        'Historial permanente',
      ]
    }
  ]

  const transactionHistory = [
    {
      id: 1,
      package: 'Pack Creativa',
      date: '15 Ene 2025',
      ref: '#DEC-2025-156',
      amount: '9.990',
      tokens: 20,
      status: 'completed'
    },
    {
      id: 2,
      package: 'Pack Prueba',
      date: '28 Dic 2024',
      ref: '#DEC-2024-089',
      amount: '2.990',
      tokens: 5,
      status: 'completed'
    },
    {
      id: 3,
      package: 'Tokens de Bienvenida',
      date: '10 Dic 2024',
      ref: 'Registro',
      amount: 'Gratis',
      tokens: 3,
      status: 'bonus'
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Header Section - Magazine Style */}
      <div className="mb-12">
        <div className={`flex items-center gap-4 mb-8 transition-all duration-500 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
          <div className="w-12 h-12 bg-gradient-to-br from-[#A3B1A1] to-[#C4886F] flex items-center justify-center shadow-lg">
            <ShoppingBag className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-light text-[#333333] font-cormorant">
              Compra Tokens
            </h1>
            <p className="text-sm text-[#333333]/60 font-lato font-light mt-1">
              Cada token es una nueva posibilidad para tu hogar
            </p>
          </div>
        </div>

        {/* Current Balance - Elegant Card */}
        <Card className={`border-0 shadow-lg bg-gradient-to-r from-[#A3B1A1]/5 via-white to-[#C4886F]/5 overflow-hidden transition-all duration-500 delay-100 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <p className="text-[11px] font-lato text-[#333333]/50 uppercase tracking-wider">
                    Balance Actual
                  </p>
                  <Badge className="bg-[#A3B1A1]/10 text-[#A3B1A1] border-0 text-[9px] px-1.5 py-0.5 font-lato uppercase">
                    Demo
                  </Badge>
                </div>
                <div className="flex items-baseline gap-3">
                  <span className="text-5xl font-light text-[#333333] font-cormorant">250</span>
                  <span className="text-xl text-[#333333]/60 font-lato">tokens</span>
                </div>
                <p className="text-sm text-[#333333]/60 font-lato">
                  Suficientes para ~25 transformaciones mágicas
                </p>
                <div className="flex items-center gap-1 text-[#A3B1A1]">
                  <Clock className="h-3 w-3" />
                  <span className="text-xs font-lato">Última compra: Hace 3 días</span>
                </div>
              </div>

              <div className="text-right space-y-3">
                <div className="w-20 h-20 bg-white/50 backdrop-blur-sm flex items-center justify-center mx-auto">
                  <Sparkles className="h-10 w-10 text-[#A3B1A1]/70" />
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-[#C4886F] hover:text-[#C4886F]/80 font-lato text-xs"
                >
                  <History className="mr-1 h-3 w-3" />
                  Ver historial completo
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pricing Plans - Editorial Layout */}
      <div className="mb-16">
        <div className="text-center mb-10">
          <Badge className={`mb-4 bg-[#C4886F]/10 text-[#C4886F] border-0 px-3 py-1 text-[10px] font-lato uppercase tracking-wider transition-all duration-500 delay-150 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            Planes Diseñados Para Ti
          </Badge>
          <h2 className={`text-3xl font-light text-[#333333] font-cormorant transition-all duration-500 delay-200 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            Elige tu paquete de transformación
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {tokenPlans.map((plan, index) => (
            <Card
              key={plan.id}
              className={`relative border-0 shadow-lg hover:shadow-2xl transition-all duration-700 cursor-pointer overflow-hidden bg-white
                ${selectedPlan === plan.id ? 'ring-2 ring-[#A3B1A1] scale-105' : ''}
                ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
              `}
              style={{ transitionDelay: `${250 + index * 50}ms` }}
              onMouseEnter={() => setHoveredPlan(plan.id)}
              onMouseLeave={() => setHoveredPlan(null)}
              onClick={() => setSelectedPlan(plan.id)}
            >
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${plan.color} to-transparent opacity-50`} />

              {/* Popular Badge */}
              {plan.badge && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#C4886F] text-white border-0 px-4 py-1 text-[10px] font-lato uppercase tracking-wider shadow-lg z-10">
                  {plan.badge}
                </Badge>
              )}

              <CardHeader className="relative pb-6 pt-8">
                <CardTitle className="text-2xl font-light text-[#333333] font-cormorant mb-1">
                  {plan.name}
                </CardTitle>
                <CardDescription className="text-sm text-[#333333]/60 font-lato">
                  {plan.subtitle}
                </CardDescription>
              </CardHeader>

              <CardContent className="relative space-y-6">
                {/* Pricing */}
                <div className="space-y-2">
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg text-[#333333]/60 font-lato">$</span>
                    <span className="text-4xl font-light text-[#333333] font-cormorant">
                      {plan.price}
                    </span>
                    <span className="text-sm text-[#333333]/60 font-lato">CLP</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-[#333333]/60 font-lato">
                    <span>{plan.tokens} tokens</span>
                    <span>•</span>
                    <span>${plan.perToken} por token</span>
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <CheckCircle className={`h-4 w-4 flex-shrink-0 mt-0.5 transition-colors duration-300 ${
                        hoveredPlan === plan.id ? 'text-[#A3B1A1]' : 'text-[#A3B1A1]/60'
                      }`} />
                      <span className="text-sm text-[#333333]/80 font-lato leading-relaxed">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <Button
                  className={`w-full font-lato transition-all duration-500 ${
                    selectedPlan === plan.id
                      ? 'bg-[#333333] hover:bg-[#333333]/90 text-white'
                      : 'bg-white hover:bg-[#F8F8F8] text-[#333333] border border-[#333333]/20'
                  }`}
                  size="lg"
                >
                  {selectedPlan === plan.id ? 'Seleccionado' : 'Seleccionar Plan'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Payment Methods - Minimalist */}
      <Card className={`mb-12 border-0 shadow-lg bg-white overflow-hidden transition-all duration-500 delay-400 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <CreditCard className="h-5 w-5 text-[#A3B1A1]" />
            <CardTitle className="text-xl font-light text-[#333333] font-cormorant">
              Métodos de Pago Seguros
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'Visa/Mastercard', icon: 'VISA', bg: 'bg-gradient-to-r from-blue-600 to-blue-500' },
              { name: 'WebPay Plus', icon: 'WP+', bg: 'bg-gradient-to-r from-green-600 to-green-500' },
              { name: 'MercadoPago', icon: 'MP', bg: 'bg-gradient-to-r from-sky-500 to-blue-500' },
              { name: 'Transferencia', icon: 'TB', bg: 'bg-gradient-to-r from-orange-500 to-orange-400' }
            ].map((method, idx) => (
              <div
                key={idx}
                className="group relative p-4 border border-[#333333]/10 hover:border-[#A3B1A1]/30 transition-all duration-300 cursor-pointer hover:shadow-md"
              >
                <div className="flex flex-col items-center gap-3">
                  <div className={`w-12 h-8 ${method.bg} flex items-center justify-center text-white text-xs font-bold shadow-sm`}>
                    {method.icon}
                  </div>
                  <span className="text-xs text-[#333333]/60 font-lato text-center">
                    {method.name}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-[#F8F8F8] flex items-start gap-3">
            <Gift className="h-4 w-4 text-[#C4886F] mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-[#333333]/80 font-lato">
                <span className="font-medium text-[#C4886F]">Descuento especial:</span> Obtén 10% off en tu primera compra con el código
                <Badge className="ml-2 bg-[#C4886F]/10 text-[#C4886F] border-[#C4886F]/20 px-2 py-0.5 text-xs font-mono">
                  BIENVENIDA2025
                </Badge>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transaction History - Clean Design */}
      <Card className={`border-0 shadow-lg bg-white overflow-hidden transition-all duration-500 delay-450 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <History className="h-5 w-5 text-[#A3B1A1]" />
              <CardTitle className="text-xl font-light text-[#333333] font-cormorant">
                Historial de Compras
              </CardTitle>
            </div>
            <Badge className="bg-[#F8F8F8] text-[#333333]/50 border-0 px-2 py-0.5 text-[9px] font-lato uppercase">
              Últimos 30 días
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {transactionHistory.map((transaction, idx) => (
              <div
                key={transaction.id}
                className={`group relative p-4 bg-[#F8F8F8]/50 hover:bg-[#F8F8F8] transition-all duration-300 cursor-pointer
                  ${mounted ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'}
                `}
                style={{ transitionDelay: `${500 + idx * 50}ms` }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white flex items-center justify-center">
                      {transaction.status === 'bonus' ? (
                        <Gift className="h-5 w-5 text-[#C4886F]" />
                      ) : (
                        <Sparkles className="h-5 w-5 text-[#A3B1A1]" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#333333] font-lato">
                        {transaction.package}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-[#333333]/60 font-lato">
                        <span>{transaction.date}</span>
                        <span>•</span>
                        <span>{transaction.ref}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-medium text-[#333333] font-lato">
                        {transaction.amount}
                      </p>
                      <p className="text-xs text-[#A3B1A1] font-lato">
                        +{transaction.tokens} tokens
                      </p>
                    </div>
                    <Badge className={`text-[10px] px-2 py-0.5 font-lato uppercase ${
                      transaction.status === 'bonus'
                        ? 'bg-[#C4886F]/10 text-[#C4886F] border-0'
                        : 'bg-[#A3B1A1]/10 text-[#A3B1A1] border-0'
                    }`}>
                      {transaction.status === 'bonus' ? 'Bono' : 'Completado'}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-[#333333]/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-[#A3B1A1]" />
                <p className="text-sm text-[#333333]/60 font-lato">
                  Has ahorrado <span className="font-medium text-[#A3B1A1]">$3,500 CLP</span> comprando paquetes
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-[#A3B1A1] hover:text-[#A3B1A1]/80 font-lato"
              >
                Ver todo el historial
                <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bottom CTA */}
      <div className={`mt-12 text-center transition-all duration-500 delay-500 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
        <div className="inline-flex items-center gap-2 text-sm text-[#333333]/60 font-lato">
          <Trophy className="h-4 w-4 text-[#C4886F]" />
          <span>Únete a más de <span className="font-medium text-[#333333]">1,000 chilenas</span> transformando sus hogares</span>
        </div>
      </div>
    </div>
  )
}