import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { SignupForm } from '@/components/auth/signup-form'
import { Button } from '@/components/ui/button'
import { Leaf, ArrowLeft, Sparkles, Home, Users } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Crear Cuenta | Decollage',
  description: 'Únete a la comunidad de chilenas y chilenos que transforman sus hogares con Decollage',
}

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-[#F8F8F8] flex">
      {/* Left Side - Signup Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-20 xl:px-24">
        <div className="w-full max-w-md mx-auto">
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
              Transforma tu hogar
            </h1>
            <p className="text-[#333333]/70 font-lato leading-relaxed">
              Únete a miles de chilenas y chilenos que ya descubrieron su estilo único con nuestra plataforma de diseño
            </p>
          </div>

          {/* Signup Form */}
          <div className="space-y-6">
            <SignupForm />

            {/* Terms */}
            <div className="text-xs text-center text-[#333333]/60 font-lato leading-relaxed">
              Al registrarte, aceptas nuestros{' '}
              <Link href="/terms" className="text-[#A3B1A1] hover:text-[#333333] transition-colors duration-300">
                Términos de Servicio
              </Link>{' '}
              y{' '}
              <Link href="/privacy" className="text-[#A3B1A1] hover:text-[#333333] transition-colors duration-300">
                Política de Privacidad
              </Link>
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#A3B1A1]/20" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-[#F8F8F8] text-[#333333]/60 font-lato">
                  ¿Ya tienes cuenta?
                </span>
              </div>
            </div>

            {/* Login Link */}
            <div className="text-center">
              <p className="text-sm text-[#333333]/70 font-lato mb-4">
                Accede a tu cuenta y continúa transformando tu espacio
              </p>
              <Link href="/login">
                <Button className="w-full bg-transparent border border-[#A3B1A1] text-[#A3B1A1] hover:bg-[#A3B1A1] hover:text-white font-lato rounded-none transition-all duration-500">
                  Iniciar sesión
                  <Sparkles className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Inspirational Content */}
      <div className="hidden lg:block lg:flex-1 relative overflow-hidden">
        {/* Background Image */}
        <Image
          src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=2000&auto=format&fit=crop"
          alt="Inspiración de diseño chileno"
          fill
          className="object-cover"
          priority
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-12">
          <div className="max-w-md">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Users className="h-5 w-5 text-white" />
              </div>
              <span className="text-white/90 font-lato text-sm tracking-wide">
                COMUNIDAD DECOLLAGE
              </span>
            </div>

            <h2 className="text-3xl font-cormorant font-light text-white mb-4 leading-tight">
              "Descubrí mi estilo único y ahora mi casa refleja quien realmente soy"
            </h2>

            <p className="text-white/80 font-lato leading-relaxed mb-6">
              Más de 10,000 chilenas y chilenos han transformado sus hogares con Decollage.
              Descubre tu estilo personal y únete a una comunidad que celebra la creatividad.
            </p>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <span className="text-white font-cormorant">C</span>
              </div>
              <div>
                <p className="text-white font-cormorant">Camila Torres</p>
                <p className="text-white/70 text-sm font-lato">Providencia, Santiago</p>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-8 right-8">
          <div className="w-24 h-px bg-white/30" />
          <div className="w-12 h-px bg-white/30 mt-2" />
        </div>

        {/* Floating Badge */}
        <div className="absolute top-12 left-12">
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2">
            <span className="text-white font-lato text-xs tracking-wide">
              ESTILO CHILENO
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}