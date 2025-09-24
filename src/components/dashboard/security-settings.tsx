'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import {
  Lock,
  Mail,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  Loader2
} from 'lucide-react'

interface SecuritySettingsProps {
  userEmail: string
}

export function SecuritySettings({ userEmail }: SecuritySettingsProps) {
  const [hasPassword, setHasPassword] = useState(false)
  const [authMethod, setAuthMethod] = useState<string>('magic_link')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    checkPasswordStatus()
  }, [])

  useEffect(() => {
    // Calculate password strength
    if (password.length === 0) {
      setPasswordStrength(0)
    } else if (password.length < 8) {
      setPasswordStrength(25)
    } else {
      let strength = 25
      // Length check
      if (password.length >= 8) strength += 25
      // Contains number
      if (/\d/.test(password)) strength += 25
      // Contains special character or uppercase
      if (/[A-Z]/.test(password) || /[!@#$%^&*]/.test(password)) strength += 25
      setPasswordStrength(strength)
    }
  }, [password])

  const checkPasswordStatus = async () => {
    try {
      const response = await fetch('/api/auth/set-password')
      if (response.ok) {
        const data = await response.json()
        setHasPassword(data.hasPassword)
        setAuthMethod(data.authMethod)
      }
    } catch (error) {
      console.error('Error checking password status:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const validatePassword = () => {
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres')
      return false
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!validatePassword()) {
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/auth/set-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, confirmPassword })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Error al establecer la contraseña')
      } else {
        setSuccess('¡Contraseña establecida exitosamente!')
        setHasPassword(true)
        setAuthMethod('password')
        setPassword('')
        setConfirmPassword('')
      }
    } catch (error) {
      console.error('Error setting password:', error)
      setError('Ocurrió un error inesperado')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getPasswordStrengthLabel = () => {
    if (passwordStrength === 0) return ''
    if (passwordStrength <= 25) return 'Muy débil'
    if (passwordStrength <= 50) return 'Débil'
    if (passwordStrength <= 75) return 'Buena'
    return 'Fuerte'
  }

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 25) return 'bg-red-500'
    if (passwordStrength <= 50) return 'bg-orange-500'
    if (passwordStrength <= 75) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex flex-col items-center justify-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-[#A3B1A1]" />
            <p className="text-[#333333]/70 font-lato">Cargando configuración de seguridad...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Current Auth Method Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-cormorant text-[#333333]">
            Método de Autenticación Actual
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-[#A3B1A1]" />
            <div>
              <p className="font-lato text-sm text-[#333333]/70">Correo electrónico</p>
              <p className="font-lato font-medium text-[#333333]">{userEmail}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {authMethod === 'magic_link' ? (
              <>
                <Sparkles className="h-5 w-5 text-[#C4886F]" />
                <div>
                  <p className="font-lato font-medium text-[#333333]">Magic Link</p>
                  <p className="font-lato text-sm text-[#333333]/70">
                    Inicias sesión con un enlace enviado a tu correo
                  </p>
                </div>
              </>
            ) : (
              <>
                <Lock className="h-5 w-5 text-[#A3B1A1]" />
                <div>
                  <p className="font-lato font-medium text-[#333333]">Contraseña</p>
                  <p className="font-lato text-sm text-[#333333]/70">
                    Inicias sesión con correo y contraseña
                  </p>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Set/Change Password Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-cormorant text-[#333333]">
            {hasPassword ? 'Cambiar Contraseña' : 'Establecer Contraseña'}
          </CardTitle>
          <CardDescription className="font-lato text-[#333333]/70">
            {hasPassword
              ? 'Actualiza tu contraseña actual'
              : 'Agrega una contraseña a tu cuenta para tener otra forma de iniciar sesión'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive" className="border-[#C4886F]/30 bg-[#C4886F]/10">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-[#C4886F] font-lato">{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="border-[#A3B1A1]/30 bg-[#A3B1A1]/10">
                <CheckCircle className="h-4 w-4 text-[#A3B1A1]" />
                <AlertDescription className="text-[#333333] font-lato">{success}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="password" className="text-[#333333] font-lato font-medium">
                {hasPassword ? 'Nueva Contraseña' : 'Contraseña'}
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  className="pr-10 border-[#A3B1A1]/20 focus:border-[#A3B1A1] focus:ring-[#A3B1A1]/20 rounded-none font-lato"
                  required
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#333333]/50 hover:text-[#333333]"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {password && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm font-lato">
                    <span className="text-[#333333]/70">Fortaleza de contraseña:</span>
                    <span className={`font-medium ${passwordStrength > 50 ? 'text-green-600' : 'text-orange-600'}`}>
                      {getPasswordStrengthLabel()}
                    </span>
                  </div>
                  <Progress value={passwordStrength} className="h-2">
                    <div
                      className={`h-full ${getPasswordStrengthColor()} transition-all duration-300`}
                      style={{ width: `${passwordStrength}%` }}
                    />
                  </Progress>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-[#333333] font-lato font-medium">
                Confirmar Contraseña
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repite la contraseña"
                  className="pr-10 border-[#A3B1A1]/20 focus:border-[#A3B1A1] focus:ring-[#A3B1A1]/20 rounded-none font-lato"
                  required
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#333333]/50 hover:text-[#333333]"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-[#A3B1A1] hover:bg-[#A3B1A1]/90 text-white font-lato rounded-none transition-all duration-300"
              disabled={isSubmitting || passwordStrength < 50}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {hasPassword ? 'Actualizando contraseña...' : 'Estableciendo contraseña...'}
                </>
              ) : (
                <>
                  <Lock className="mr-2 h-4 w-4" />
                  {hasPassword ? 'Actualizar Contraseña' : 'Establecer Contraseña'}
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Magic Link Option */}
      {hasPassword && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-cormorant text-[#333333]">
              Opciones de Magic Link
            </CardTitle>
            <CardDescription className="font-lato text-[#333333]/70">
              Magic Link te permite iniciar sesión sin contraseña
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className="border-[#A3B1A1]/30 bg-[#A3B1A1]/5">
              <Sparkles className="h-4 w-4 text-[#C4886F]" />
              <AlertDescription className="text-[#333333] font-lato">
                Magic Link siempre está disponible como opción alternativa de inicio de sesión,
                incluso si tienes una contraseña configurada.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  )
}