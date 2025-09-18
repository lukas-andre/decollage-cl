import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form'
import { Button } from '@/components/ui/button'
import { Leaf, ArrowLeft, Mail, Sparkles } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Recuperar Contraseña | Decollage',
  description: 'Recupera el acceso a tu cuenta de Decollage',
}

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-[#F8F8F8] flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-20 xl:px-24">
        <div className="w-full max-w-sm mx-auto">
          {/* Back to Login */}
          <div className="mb-8">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-sm text-[#333333]/70 hover:text-[#A3B1A1] transition-colors duration-300 font-lato"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver al inicio de sesión
            </Link>
          </div>

          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-[#A3B1A1]/10 flex items-center justify-center">
              <Leaf className="h-6 w-6 text-[#A3B1A1]" />
            </div>
            <span className="text-2xl font-cormorant font-light text-[#333333]">Decollage</span>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-cormorant font-light text-[#333333] mb-2">
              ¿Olvidaste tu contraseña?
            </h1>
            <p className="text-[#333333]/70 font-lato leading-relaxed">
              No te preocupes, te ayudamos a recuperar el acceso a tu cuenta. Ingresa tu correo y te enviaremos las instrucciones.
            </p>
          </div>

          {/* Form */}
          <div className="space-y-6">
            <ForgotPasswordForm />

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#A3B1A1]/20" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-[#F8F8F8] text-[#333333]/60 font-lato">
                  ¿Recordaste tu contraseña?
                </span>
              </div>
            </div>

            {/* Back to Login */}
            <div className="text-center">
              <p className="text-sm text-[#333333]/70 font-lato mb-4">
                Vuelve a intentar acceder a tu cuenta
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
          src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?q=80&w=2000&auto=format&fit=crop"
          alt="Espacio de serenidad"
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
                <Mail className="h-5 w-5 text-white" />
              </div>
              <span className="text-white/90 font-lato text-sm tracking-wide">
                RECUPERACIÓN SEGURA
              </span>
            </div>

            <h2 className="text-3xl font-cormorant font-light text-white mb-4 leading-tight">
              "Tu hogar te espera para continuar la transformación"
            </h2>

            <p className="text-white/80 font-lato leading-relaxed mb-6">
              Miles de chilenas y chilenos confían en Decollage para mantener sus sueños de diseño seguros.
              Tu cuenta y proyectos están protegidos.
            </p>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <span className="text-white font-cormorant">✓</span>
              </div>
              <div>
                <p className="text-white font-cormorant">Recuperación en 2 minutos</p>
                <p className="text-white/70 text-sm font-lato">Proceso seguro y verificado</p>
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