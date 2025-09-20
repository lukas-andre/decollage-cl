'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import {
  User,
  Mail,
  Phone,
  Home,
  Sparkles,
  Save,
  Loader2,
  ArrowRight,
  Settings,
  Eye,
  EyeOff
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { useUserProfile } from '@/hooks/useUserProfile'

const homeTypes = [
  { value: 'apartment', label: 'Departamento' },
  { value: 'house', label: 'Casa' },
  { value: 'townhouse', label: 'Casa pareada' },
  { value: 'studio', label: 'Estudio' }
]

export default function ProfilePage() {
  const { profile, loading, updateProfile, getDisplayName } = useUserProfile()
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    phone: '',
    home_type: '',
    is_public: false
  })

  // Initialize form data when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        username: profile.username || '',
        phone: profile.phone || '',
        home_type: profile.home_type || '',
        is_public: profile.is_public || false
      })
    }
  }, [profile])

  const handleSave = async () => {
    setSaving(true)

    const result = await updateProfile({
      full_name: formData.full_name || undefined,
      username: formData.username || undefined,
      phone: formData.phone || undefined,
      home_type: formData.home_type || undefined,
      is_public: formData.is_public
    })

    if (result?.error) {
      toast.error('Error al guardar', {
        description: result.error
      })
    } else {
      toast.success('Perfil actualizado', {
        description: 'Tus cambios han sido guardados correctamente'
      })
    }

    setSaving(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-[#A3B1A1]" />
          <p className="text-sm text-[#333333]/60 font-lato">Cargando perfil...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-light text-[#333333] font-cormorant">
            Mi Perfil
          </h1>
          <p className="text-sm text-[#333333]/60 font-lato mt-1">
            Gestiona tu información personal y preferencias
          </p>
        </div>
        <div className="w-16 h-16 bg-gradient-to-br from-[#A3B1A1]/20 to-[#C4886F]/20 flex items-center justify-center shadow-lg">
          <User className="h-8 w-8 text-[#A3B1A1]" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Profile Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="border-b border-[#A3B1A1]/10">
              <CardTitle className="text-lg font-normal font-cormorant text-[#333333]">
                Información Personal
              </CardTitle>
              <CardDescription className="font-lato text-sm">
                Tu información básica de contacto
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Email (read-only) */}
              <div className="space-y-2">
                <Label className="text-sm font-lato text-[#333333]/70">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-[#333333]/40" />
                  <Input
                    value={profile?.email || ''}
                    disabled
                    className="pl-10 bg-[#F8F8F8] border-[#A3B1A1]/20 font-lato text-sm"
                  />
                </div>
                <p className="text-xs text-[#333333]/50 font-lato">
                  El email no se puede cambiar
                </p>
              </div>

              {/* Full Name */}
              <div className="space-y-2">
                <Label className="text-sm font-lato text-[#333333]/70">Nombre Completo</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-[#333333]/40" />
                  <Input
                    value={formData.full_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                    placeholder="Tu nombre completo"
                    className="pl-10 border-[#A3B1A1]/20 font-lato text-sm focus:border-[#A3B1A1]"
                  />
                </div>
              </div>

              {/* Username */}
              <div className="space-y-2">
                <Label className="text-sm font-lato text-[#333333]/70">Nombre de Usuario</Label>
                <Input
                  value={formData.username}
                  onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                  placeholder="@usuario"
                  className="border-[#A3B1A1]/20 font-lato text-sm focus:border-[#A3B1A1]"
                />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label className="text-sm font-lato text-[#333333]/70">Teléfono</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-[#333333]/40" />
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+56 9 1234 5678"
                    className="pl-10 border-[#A3B1A1]/20 font-lato text-sm focus:border-[#A3B1A1]"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preferences */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="border-b border-[#A3B1A1]/10">
              <CardTitle className="text-lg font-normal font-cormorant text-[#333333]">
                Preferencias
              </CardTitle>
              <CardDescription className="font-lato text-sm">
                Personaliza tu experiencia en Decollage
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Home Type */}
              <div className="space-y-2">
                <Label className="text-sm font-lato text-[#333333]/70">Tipo de Hogar</Label>
                <Select value={formData.home_type} onValueChange={(value) => setFormData(prev => ({ ...prev, home_type: value }))}>
                  <SelectTrigger className="border-[#A3B1A1]/20 font-lato text-sm focus:border-[#A3B1A1]">
                    <Home className="h-4 w-4 text-[#333333]/40 mr-2" />
                    <SelectValue placeholder="Selecciona tu tipo de hogar" />
                  </SelectTrigger>
                  <SelectContent>
                    {homeTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value} className="font-lato">
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Public Profile */}
              <div className="flex items-center justify-between p-4 border border-[#A3B1A1]/20 rounded-lg">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {formData.is_public ? (
                      <Eye className="h-4 w-4 text-[#A3B1A1]" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-[#333333]/40" />
                    )}
                    <Label className="text-sm font-lato text-[#333333]/70">
                      Perfil Público
                    </Label>
                  </div>
                  <p className="text-xs text-[#333333]/50 font-lato">
                    Permite que otros usuarios vean tus proyectos
                  </p>
                </div>
                <Switch
                  checked={formData.is_public}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_public: checked }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-[#A3B1A1] hover:bg-[#A3B1A1]/90 text-white font-lato transition-all duration-300"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Guardar Cambios
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Token Balance */}
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <div className="w-12 h-12 bg-[#A3B1A1]/10 flex items-center justify-center mx-auto">
                  <Sparkles className="h-6 w-6 text-[#A3B1A1]" />
                </div>
                <div>
                  <p className="text-xs font-lato text-[#333333]/50 uppercase tracking-wider">
                    Tokens Disponibles
                  </p>
                  <p className="text-2xl font-light text-[#333333] font-cormorant mt-1">
                    {profile?.tokens_available || 0}
                  </p>
                </div>
                <Link href="/dashboard/tokens">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-[#A3B1A1] text-[#A3B1A1] hover:bg-[#A3B1A1] hover:text-white font-lato transition-all duration-300"
                  >
                    Comprar Tokens
                    <ArrowRight className="ml-2 h-3 w-3" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Account Info */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="border-b border-[#A3B1A1]/10">
              <CardTitle className="text-sm font-lato text-[#333333]/70 uppercase tracking-wider">
                Cuenta
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-lato text-[#333333]/60">Usuario desde</span>
                <span className="text-sm font-lato text-[#333333]">
                  {profile?.created_at
                    ? new Date(profile.created_at).toLocaleDateString('es-CL', {
                        year: 'numeric',
                        month: 'long'
                      })
                    : 'N/A'
                  }
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-lato text-[#333333]/60">Plan</span>
                <Badge className="bg-[#F8F8F8] text-[#333333] border-0 text-xs font-lato">
                  Gratuito
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}