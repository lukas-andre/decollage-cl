import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { LoginForm } from '@/components/auth/login-form'
import { Button } from '@/components/ui/button'
import { Leaf, ArrowLeft, Heart, Home } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Iniciar Sesión | Decollage',
  description: 'Accede a tu cuenta de Decollage y continúa transformando tu hogar',
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#F8F8F8] flex">
      {/* Left Side - Login Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-20 xl:px-24">
        <div className="w-full max-w-sm mx-auto">
          {/* Back to Home */}
          <div className="mb-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-[#333333]/70 hover:text-[#A3B1A1] transition-colors duration-300 font-lato"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver al inicio
            </Link>
          </div>

          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-[#A3B1A1]/10 flex items-center justify-center">
              <Leaf className="h-6 w-6 text-[#A3B1A1]" />
            </div>
            <span className="text-2xl font-cormorant font-light text-[#333333]">Decollage</span>
          </div>

          {/* Welcome Message */}
          <div className="mb-8">
            <h1 className="text-3xl font-cormorant font-light text-[#333333] mb-2">
              Bienvenida de vuelta
            </h1>
            <p className="text-[#333333]/70 font-lato leading-relaxed">
              Continúa transformando tu hogar en el espacio que siempre soñaste
            </p>
          </div>

          {/* Login Form */}
          <div className="space-y-6">
            <LoginForm />

            {/* Forgot Password */}
            <div className="text-center">
              <Link
                href="/forgot-password"
                className="text-sm text-[#A3B1A1] hover:text-[#333333] transition-colors duration-300 font-lato"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#A3B1A1]/20" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-[#F8F8F8] text-[#333333]/60 font-lato">
                  ¿Primera vez aquí?
                </span>
              </div>
            </div>

            {/* Sign Up Link */}
            <div className="text-center">
              <p className="text-sm text-[#333333]/70 font-lato mb-4">
                Únete a miles de chilenas que ya transformaron sus hogares
              </p>
              <Link href="/signup">
                <Button className="w-full bg-[#333333] hover:bg-[#A3B1A1] text-white font-lato rounded-none transition-all duration-300">
                  Crear mi cuenta gratis
                  <Heart className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Inspirational Image & Quote */}
      <div className="hidden lg:block lg:flex-1 relative overflow-hidden">
        {/* Background Image */}
        <Image
          src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=2000&auto=format&fit=crop"
          alt="Hermoso interior chileno"
          fill
          className="object-cover"
          priority
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-12">
          <div className="max-w-md">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Home className="h-5 w-5 text-white" />
              </div>
              <span className="text-white/90 font-lato text-sm tracking-wide">
                INSPIRACIÓN REAL
              </span>
            </div>

            <h2 className="text-3xl font-cormorant font-light text-white mb-4 leading-tight">
              "Decollage me dio la confianza para crear el hogar que siempre quise"
            </h2>

            <p className="text-white/80 font-lato leading-relaxed mb-6">
              Más de 5,000 chilenas ya han transformado sus espacios con nuestra plataforma.
              Descubre estilos únicos que celebran nuestra cultura y paisajes.
            </p>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <span className="text-white font-cormorant">S</span>
              </div>
              <div>
                <p className="text-white font-cormorant">Sofía Mendoza</p>
                <p className="text-white/70 text-sm font-lato">Las Condes, Santiago</p>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-8 right-8">
          <div className="w-24 h-px bg-white/30" />
          <div className="w-12 h-px bg-white/30 mt-2" />
        </div>
      </div>
    </div>
  )
}