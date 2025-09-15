import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle } from 'lucide-react'

export default function AuthCodeErrorPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8 px-4">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
          <h1 className="mt-4 text-2xl font-bold">Error de Autenticación</h1>
          <p className="mt-2 text-sm text-gray-600">
            Hubo un problema al procesar tu solicitud de autenticación.
          </p>
        </div>

        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            El enlace de autenticación no es válido o ha expirado.
            Por favor, intenta iniciar sesión nuevamente o solicita un nuevo enlace.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <Button asChild className="w-full">
            <Link href="/login">Volver al Inicio de Sesión</Link>
          </Button>
          
          <Button asChild variant="outline" className="w-full">
            <Link href="/forgot-password">¿Olvidaste tu contraseña?</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}