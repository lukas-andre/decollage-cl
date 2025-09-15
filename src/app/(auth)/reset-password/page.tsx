import { ResetPasswordForm } from '@/components/auth/reset-password-form'

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Restablecer Contraseña</h1>
          <p className="mt-2 text-sm text-gray-600">
            Ingresa tu nueva contraseña para completar el restablecimiento.
          </p>
        </div>
        <ResetPasswordForm />
      </div>
    </div>
  )
}