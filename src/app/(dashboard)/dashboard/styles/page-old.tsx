'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  Plus, 
  Palette, 
  Search, 
  Star, 
  Users, 
  Lock, 
  Globe, 
  Edit, 
  Trash2, 
  Copy,
  MoreVertical,
  Sparkles,
  TrendingUp,
  Eye,
  Download,
  Upload,
  Filter
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { createBrowserClient } from '@supabase/ssr'

interface CustomStyle {
  id: string
  name: string
  description: string | null
  prompt_template: string
  category: 'modern' | 'classic' | 'minimalist' | 'luxury' | 'rustic' | 'industrial' | 'custom'
  is_public: boolean
  usage_count: number
  created_at: string
  updated_at: string
  user_id: string
  examples?: string[]
}

const styleCategories = [
  { value: 'all', label: 'Todas las categorías' },
  { value: 'modern', label: 'Moderno' },
  { value: 'classic', label: 'Clásico' },
  { value: 'minimalist', label: 'Minimalista' },
  { value: 'luxury', label: 'Lujo' },
  { value: 'rustic', label: 'Rústico' },
  { value: 'industrial', label: 'Industrial' },
  { value: 'custom', label: 'Personalizado' }
]

export default function StylesPage() {
  const [myStyles, setMyStyles] = useState<CustomStyle[]>([])
  const [publicStyles, setPublicStyles] = useState<CustomStyle[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editingStyle, setEditingStyle] = useState<CustomStyle | null>(null)
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    prompt_template: '',
    category: 'custom' as CustomStyle['category'],
    is_public: false
  })

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    fetchStyles()
  }, [])

  const fetchStyles = async () => {
    try {
      setLoading(true)
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Fetch user's custom styles
      const { data: userStyles, error: userError } = await supabase
        .from('custom_styles')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (userError) throw userError
      setMyStyles(userStyles || [])

      // Fetch public styles from other users
      const { data: publicStylesData, error: publicError } = await supabase
        .from('custom_styles')
        .select('*')
        .eq('is_public', true)
        .neq('user_id', user.id)
        .order('usage_count', { ascending: false })
        .limit(20)

      if (publicError) throw publicError
      setPublicStyles(publicStylesData || [])

    } catch (error) {
      console.error('Error fetching styles:', error)
      toast.error('Error al cargar los estilos')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateStyle = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('custom_styles')
        .insert([{
          ...formData,
          user_id: user.id
        }])
        .select()
        .single()

      if (error) throw error

      setMyStyles([data, ...myStyles])
      setShowCreateDialog(false)
      resetForm()
      toast.success('Estilo creado exitosamente')

    } catch (error) {
      console.error('Error creating style:', error)
      toast.error('Error al crear el estilo')
    }
  }

  const handleUpdateStyle = async () => {
    if (!editingStyle) return

    try {
      const { data, error } = await supabase
        .from('custom_styles')
        .update(formData)
        .eq('id', editingStyle.id)
        .select()
        .single()

      if (error) throw error

      setMyStyles(myStyles.map(s => s.id === editingStyle.id ? data : s))
      setEditingStyle(null)
      resetForm()
      toast.success('Estilo actualizado exitosamente')

    } catch (error) {
      console.error('Error updating style:', error)
      toast.error('Error al actualizar el estilo')
    }
  }

  const handleDeleteStyle = async (styleId: string) => {
    try {
      const { error } = await supabase
        .from('custom_styles')
        .delete()
        .eq('id', styleId)

      if (error) throw error

      setMyStyles(myStyles.filter(s => s.id !== styleId))
      toast.success('Estilo eliminado exitosamente')

    } catch (error) {
      console.error('Error deleting style:', error)
      toast.error('Error al eliminar el estilo')
    }
  }

  const handleDuplicateStyle = async (style: CustomStyle) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('custom_styles')
        .insert([{
          name: `${style.name} (Copia)`,
          description: style.description,
          prompt_template: style.prompt_template,
          category: style.category,
          is_public: false,
          user_id: user.id
        }])
        .select()
        .single()

      if (error) throw error

      setMyStyles([data, ...myStyles])
      toast.success('Estilo duplicado exitosamente')

    } catch (error) {
      console.error('Error duplicating style:', error)
      toast.error('Error al duplicar el estilo')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      prompt_template: '',
      category: 'custom',
      is_public: false
    })
  }

  const filteredMyStyles = myStyles.filter(style => {
    const matchesSearch = style.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (style.description && style.description.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesCategory = categoryFilter === 'all' || style.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const filteredPublicStyles = publicStyles.filter(style => {
    const matchesSearch = style.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (style.description && style.description.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesCategory = categoryFilter === 'all' || style.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const promptTemplates = [
    {
      name: 'Moderno Minimalista',
      template: 'Una habitación moderna y minimalista con líneas limpias, paleta de colores neutros, muebles funcionales de diseño escandinavo, iluminación natural abundante, espacios abiertos y despejados'
    },
    {
      name: 'Lujo Contemporáneo',
      template: 'Un espacio lujoso y sofisticado con materiales premium como mármol y terciopelo, paleta de colores elegante con dorados y negros, muebles de diseñador, iluminación dramática con candelabros modernos'
    },
    {
      name: 'Industrial Urbano',
      template: 'Un espacio de estilo industrial con ladrillos expuestos, vigas de metal, muebles de madera recuperada y metal negro, iluminación Edison vintage, paleta de colores tierra y grises'
    },
    {
      name: 'Escandinavo Hygge',
      template: 'Un espacio acogedor estilo escandinavo con tonos blancos y maderas claras, textiles suaves y naturales, plantas verdes, iluminación cálida y difusa, muebles simples pero funcionales'
    },
    {
      name: 'Mediterráneo Costero',
      template: 'Un espacio mediterráneo con colores azules y blancos, texturas naturales como ratán y lino, detalles náuticos, abundante luz natural, plantas mediterráneas, muebles de madera blanqueada'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Estilos Personalizados</h1>
              <p className="text-sm text-gray-500 mt-1">
                Crea y gestiona tus propios estilos de diseño para staging virtual
              </p>
            </div>
            
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Crear Estilo
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Mis Estilos</p>
                  <p className="text-2xl font-bold">{myStyles.length}</p>
                </div>
                <Palette className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Estilos Públicos</p>
                  <p className="text-2xl font-bold">{myStyles.filter(s => s.is_public).length}</p>
                </div>
                <Globe className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total de Usos</p>
                  <p className="text-2xl font-bold">
                    {myStyles.reduce((acc, s) => acc + s.usage_count, 0)}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Más Popular</p>
                  <p className="text-sm font-semibold truncate">
                    {myStyles.length > 0 
                      ? myStyles.sort((a, b) => b.usage_count - a.usage_count)[0].name
                      : 'Sin estilos'}
                  </p>
                </div>
                <Star className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar estilos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[200px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {styleCategories.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tabs for My Styles and Marketplace */}
        <Tabs defaultValue="my-styles" className="space-y-4">
          <TabsList>
            <TabsTrigger value="my-styles">
              <Lock className="mr-2 h-4 w-4" />
              Mis Estilos
            </TabsTrigger>
            <TabsTrigger value="marketplace">
              <Users className="mr-2 h-4 w-4" />
              Marketplace
            </TabsTrigger>
            <TabsTrigger value="templates">
              <Sparkles className="mr-2 h-4 w-4" />
              Plantillas
            </TabsTrigger>
          </TabsList>

          {/* My Styles Tab */}
          <TabsContent value="my-styles">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="h-48 animate-pulse" />
                ))}
              </div>
            ) : filteredMyStyles.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Palette className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No tienes estilos aún</h3>
                  <p className="text-sm text-gray-500 text-center mb-4">
                    Crea tu primer estilo personalizado para comenzar
                  </p>
                  <Button onClick={() => setShowCreateDialog(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Crear Primer Estilo
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredMyStyles.map((style) => (
                  <Card key={style.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-base">{style.name}</CardTitle>
                          <CardDescription className="text-xs mt-1">
                            {style.description || 'Sin descripción'}
                          </CardDescription>
                        </div>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => {
                              setEditingStyle(style)
                              setFormData({
                                name: style.name,
                                description: style.description || '',
                                prompt_template: style.prompt_template,
                                category: style.category,
                                is_public: style.is_public
                              })
                            }}>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDuplicateStyle(style)}>
                              <Copy className="mr-2 h-4 w-4" />
                              Duplicar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDeleteStyle(style.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="text-xs text-gray-600 line-clamp-2">
                          {style.prompt_template}
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">
                              {styleCategories.find(c => c.value === style.category)?.label || 'Personalizado'}
                            </Badge>
                            {style.is_public && (
                              <Badge variant="outline" className="text-xs">
                                <Globe className="mr-1 h-3 w-3" />
                                Público
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Eye className="h-3 w-3" />
                            {style.usage_count} usos
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Marketplace Tab */}
          <TabsContent value="marketplace">
            {filteredPublicStyles.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No hay estilos públicos disponibles</h3>
                  <p className="text-sm text-gray-500">
                    Sé el primero en compartir tus estilos con la comunidad
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPublicStyles.map((style) => (
                  <Card key={style.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-base">{style.name}</CardTitle>
                      <CardDescription className="text-xs">
                        {style.description || 'Sin descripción'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="text-xs text-gray-600 line-clamp-2">
                          {style.prompt_template}
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary" className="text-xs">
                            {styleCategories.find(c => c.value === style.category)?.label || 'Personalizado'}
                          </Badge>
                          
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">
                              <Users className="inline h-3 w-3 mr-1" />
                              {style.usage_count} usos
                            </span>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleDuplicateStyle(style)}
                            >
                              <Copy className="h-3 w-3 mr-1" />
                              Usar
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {promptTemplates.map((template, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-base">{template.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-gray-600 mb-4">{template.template}</p>
                    <Button 
                      className="w-full" 
                      size="sm"
                      onClick={() => {
                        setFormData({
                          ...formData,
                          name: template.name,
                          prompt_template: template.template
                        })
                        setShowCreateDialog(true)
                      }}
                    >
                      <Plus className="mr-2 h-3 w-3" />
                      Usar Plantilla
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Create/Edit Style Dialog */}
      <Dialog open={showCreateDialog || !!editingStyle} onOpenChange={(open) => {
        if (!open) {
          setShowCreateDialog(false)
          setEditingStyle(null)
          resetForm()
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingStyle ? 'Editar Estilo' : 'Crear Nuevo Estilo'}
            </DialogTitle>
            <DialogDescription>
              Define los parámetros de tu estilo personalizado para staging virtual
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre del Estilo</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej: Moderno Minimalista"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción (Opcional)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe brevemente tu estilo..."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="prompt">Prompt del Estilo</Label>
              <Textarea
                id="prompt"
                value={formData.prompt_template}
                onChange={(e) => setFormData({ ...formData, prompt_template: e.target.value })}
                placeholder="Describe en detalle cómo debe verse el espacio con este estilo..."
                rows={4}
                className="font-mono text-sm"
              />
              <p className="text-xs text-gray-500">
                Tip: Sé específico con colores, materiales, iluminación y atmósfera deseada
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Categoría</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => setFormData({ ...formData, category: value as CustomStyle['category'] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {styleCategories.slice(1).map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="public">Visibilidad</Label>
                <div className="flex items-center space-x-2 pt-2">
                  <Switch
                    id="public"
                    checked={formData.is_public}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_public: checked })}
                  />
                  <Label htmlFor="public" className="text-sm font-normal">
                    {formData.is_public ? 'Público' : 'Privado'}
                  </Label>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowCreateDialog(false)
                setEditingStyle(null)
                resetForm()
              }}
            >
              Cancelar
            </Button>
            <Button onClick={editingStyle ? handleUpdateStyle : handleCreateStyle}>
              {editingStyle ? 'Guardar Cambios' : 'Crear Estilo'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}