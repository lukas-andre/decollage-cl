'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Mail } from 'lucide-react'

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
      })

      if (error) {
        setError(error.message)
        return
      }

      setSuccess(true)
    } catch {
      setError('Ha ocurrido un error inesperado')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <Alert className="border-[#A3B1A1]/30 bg-[#A3B1A1]/10">
        <AlertDescription className="text-[#A3B1A1] font-lato">
          ¡Perfecto! Te hemos enviado un correo con instrucciones para restablecer tu contraseña.
          Por favor, revisa tu bandeja de entrada.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive" className="border-[#C4886F]/30 bg-[#C4886F]/10">
          <AlertDescription className="text-[#C4886F] font-lato">{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="email" className="text-[#333333] font-lato font-medium">Correo Electrónico</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A3B1A1]" />
          <Input
            id="email"
            type="email"
            placeholder="maria@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10 border-[#A3B1A1]/20 focus:border-[#A3B1A1] focus:ring-[#A3B1A1]/20 rounded-none font-lato transition-all duration-300"
            required
            disabled={isLoading}
          />
        </div>
      </div>

      <Button 
        type="submit" 
        className="w-full bg-[#A3B1A1] hover:bg-[#A3B1A1]/90 text-white font-lato rounded-none transition-all duration-500 transform hover:scale-[1.02] py-3" 
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Enviando instrucciones...
          </>
        ) : (
          'Enviar Instrucciones'
        )}
      </Button>
    </form>
  )
}