import { SetPasswordForm } from '@/components/auth/set-password-form'

export default function SetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Set Your Password</h1>
          <p className="mt-2 text-sm text-gray-600">
            Welcome! Please set your password to complete your account setup.
          </p>
        </div>
        <SetPasswordForm />
      </div>
    </div>
  )
}