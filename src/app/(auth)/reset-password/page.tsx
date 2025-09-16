import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { ResetPasswordForm } from '@/components/auth/reset-password-form'
import { Leaf, ArrowLeft, Shield } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Restablecer Contraseña | Decollage',
  description: 'Establece tu nueva contraseña y continúa transformando tu hogar',
}

export default function ResetPasswordPage() {
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
              Nueva contraseña
            </h1>
            <p className="text-[#333333]/70 font-lato leading-relaxed">
              ¡Ya casi estás lista! Ingresa tu nueva contraseña para completar el restablecimiento y volver a tu cuenta.
            </p>
          </div>

          {/* Form */}
          <div className="space-y-6">
            <ResetPasswordForm />
          </div>
        </div>
      </div>

      {/* Right Side - Inspirational Content */}
      <div className="hidden lg:block lg:flex-1 relative overflow-hidden">
        {/* Background Image */}
        <Image
          src="https://images.unsplash.com/photo-1484101403633-562f891dc89a?q=80&w=2000&auto=format&fit=crop"
          alt="Nuevo comienzo"
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
                <Shield className="h-5 w-5 text-white" />
              </div>
              <span className="text-white/90 font-lato text-sm tracking-wide">
                CUENTA PROTEGIDA
              </span>
            </div>

            <h2 className="text-3xl font-cormorant font-light text-white mb-4 leading-tight">
              "Un nuevo comienzo para continuar creando el hogar de tus sueños"
            </h2>

            <p className="text-white/80 font-lato leading-relaxed mb-6">
              Tu cuenta está segura con nosotros. Continúa diseñando espacios que reflejen tu personalidad única y estilo chileno.
            </p>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <span className="text-white font-cormorant">✓</span>
              </div>
              <div>
                <p className="text-white font-cormorant">Cuenta restablecida</p>
                <p className="text-white/70 text-sm font-lato">Lista para nuevas transformaciones</p>
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