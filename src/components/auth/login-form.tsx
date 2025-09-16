'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Mail, Lock } from 'lucide-react'

export function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message)
        return
      }

      // Check if user has a profile
      const profileResponse = await fetch('/api/auth/profile')
      const profileData = await profileResponse.json()
      
      if (!profileData.exists) {
        // New user, create profile (default to B2C)
        await fetch('/api/auth/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userType: 'b2c' })
        })
      }
      
      router.refresh()
      // Redirect based on user type
      if (profileData.isB2B) {
        router.push('/dashboard')
      } else {
        router.push('/dashboard/projects')
      }
    } catch {
      setError('Ha ocurrido un error inesperado')
    } finally {
      setIsLoading(false)
    }
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

      <div className="space-y-2">
        <Label htmlFor="password" className="text-[#333333] font-lato font-medium">Contraseña</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A3B1A1]" />
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
            Iniciando sesión...
          </>
        ) : (
          'Iniciar Sesión'
        )}
      </Button>
    </form>
  )
}