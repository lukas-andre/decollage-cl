import { Metadata } from 'next'
import Link from 'next/link'
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form'

export const metadata: Metadata = {
  title: 'Recuperar Contraseña | VirtualStaging',
  description: 'Recupera el acceso a tu cuenta de VirtualStaging',
}

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-cyan-50 px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">VirtualStaging</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Recupera el acceso a tu cuenta
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-lg">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold">¿Olvidaste tu contraseña?</h2>
            <p className="text-sm text-muted-foreground mt-2">
              Ingresa tu correo electrónico y te enviaremos instrucciones para restablecer tu contraseña
            </p>
          </div>

          <ForgotPasswordForm />

          <div className="mt-6 pt-6 border-t text-center text-sm">
            <Link 
              href="/login"
              className="font-medium text-primary hover:underline"
            >
              Volver al inicio de sesión
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}