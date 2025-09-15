import { Metadata } from 'next'
import Link from 'next/link'
import { LoginForm } from '@/components/auth/login-form'

export const metadata: Metadata = {
  title: 'Iniciar Sesión | VirtualStaging',
  description: 'Accede a tu cuenta de VirtualStaging',
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-cyan-50 px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">VirtualStaging</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Transforma espacios vacíos en ambientes atractivos
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-lg">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold">Iniciar Sesión</h2>
            <p className="text-sm text-muted-foreground mt-2">
              Ingresa tus credenciales para continuar
            </p>
          </div>

          <LoginForm />

          <div className="mt-6 text-center text-sm">
            <Link 
              href="/forgot-password"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          <div className="mt-6 pt-6 border-t text-center text-sm">
            <span className="text-muted-foreground">¿No tienes cuenta? </span>
            <Link 
              href="/signup"
              className="font-medium text-primary hover:underline"
            >
              Regístrate gratis
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}