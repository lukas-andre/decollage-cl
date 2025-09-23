import { Suspense } from 'react'
import AuthConfirmClient from './auth-confirm-client'
import { Loader2 } from 'lucide-react'

export default function AuthConfirmPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-[#A3B1A1] mx-auto" />
            <p className="text-[#333333] font-lato">Verificando tu acceso...</p>
          </div>
        </div>
      }
    >
      <AuthConfirmClient />
    </Suspense>
  )
}