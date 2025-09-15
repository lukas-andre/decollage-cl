import { Metadata } from 'next'
import Link from 'next/link'
import { SignupForm } from '@/components/auth/signup-form'

export const metadata: Metadata = {
  title: 'Crear Cuenta | VirtualStaging',
  description: 'Crea tu cuenta gratuita en VirtualStaging',
}

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-cyan-50 px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">VirtualStaging</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Comienza tu prueba gratuita con 5 tokens
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-lg">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold">Crear Cuenta</h2>
            <p className="text-sm text-muted-foreground mt-2">
              Regístrate para comenzar a transformar espacios
            </p>
          </div>

          <SignupForm />

          <div className="mt-6 pt-6 border-t text-center text-sm">
            <span className="text-muted-foreground">¿Ya tienes cuenta? </span>
            <Link 
              href="/login"
              className="font-medium text-primary hover:underline"
            >
              Inicia sesión
            </Link>
          </div>

          <div className="mt-4 text-xs text-center text-muted-foreground">
            Al registrarte, aceptas nuestros{' '}
            <Link href="/terms" className="underline hover:text-primary">
              Términos de Servicio
            </Link>{' '}
            y{' '}
            <Link href="/privacy" className="underline hover:text-primary">
              Política de Privacidad
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}