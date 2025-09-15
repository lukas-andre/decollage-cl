'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { 
  LayoutDashboard, 
  Users, 
  DollarSign, 
  Image, 
  Settings,
  Edit,
  Trash,
  Plus,
  Check
} from 'lucide-react'

interface Style {
  id: string
  name: string
  code: string
  category: string | null
  description: string | null
  base_prompt: string
  ai_config: Record<string, unknown> | null
  token_cost: number | null
  example_image: string | null
  is_active: boolean | null
  sort_order: number | null
  created_at: string | null
  updated_at: string | null
}

export default function AdminStylesPage() {
  const [styles, setStyles] = useState<Style[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [selectedStyle, setSelectedStyle] = useState<Style | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    category: 'contemporary',
    description: '',
    base_prompt: '',
    token_cost: 10,
    is_active: true,
  })

  useEffect(() => {
    fetchStyles()
  }, [])

  const fetchStyles = async () => {
    try {
      const response = await fetch('/api/styles')
      if (response.ok) {
        const data = await response.json()
        setStyles(data.styles || [])
      }
    } catch (error) {
      console.error('Error fetching styles:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    try {
      const response = await fetch('/api/styles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        await fetchStyles()
        setShowCreateDialog(false)
        resetForm()
      }
    } catch (error) {
      console.error('Error creating style:', error)
    }
  }

  const handleUpdate = async () => {
    if (!selectedStyle) return

    try {
      const response = await fetch(`/api/styles/${selectedStyle.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        await fetchStyles()
        setShowEditDialog(false)
        setSelectedStyle(null)
        resetForm()
      }
    } catch (error) {
      console.error('Error updating style:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este estilo?')) return

    try {
      const response = await fetch(`/api/styles/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchStyles()
      }
    } catch (error) {
      console.error('Error deleting style:', error)
    }
  }

  const handleToggleActive = async (style: Style) => {
    try {
      const response = await fetch(`/api/styles/${style.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          is_active: !style.is_active,
        }),
      })

      if (response.ok) {
        await fetchStyles()
      }
    } catch (error) {
      console.error('Error toggling style status:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      category: 'contemporary',
      description: '',
      base_prompt: '',
      token_cost: 10,
      is_active: true,
    })
  }

  const openEditDialog = (style: Style) => {
    setSelectedStyle(style)
    setFormData({
      name: style.name,
      code: style.code,
      category: style.category || 'contemporary',
      description: style.description || '',
      base_prompt: style.base_prompt,
      token_cost: style.token_cost || 10,
      is_active: style.is_active ?? true,
    })
    setShowEditDialog(true)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-sm">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center border-b px-6">
            <Link href="/admin" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded bg-black" />
              <span className="text-lg font-semibold">Admin Panel</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            <Link href="/admin" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100">
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>
            <Link href="/admin/users" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100">
              <Users className="h-4 w-4" />
              Usuarios
            </Link>
            <Link href="/admin/transactions" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100">
              <DollarSign className="h-4 w-4" />
              Transacciones
            </Link>
            <Link href="/admin/styles" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium bg-gray-100 text-gray-900">
              <Image className="h-4 w-4" aria-label="Icono de estilos" />
              Estilos
            </Link>
            <Link href="/admin/settings" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100">
              <Settings className="h-4 w-4" />
              Configuración
            </Link>
          </nav>

          {/* User menu */}
          <div className="border-t p-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-gray-200" />
              <div className="flex-1">
                <p className="text-sm font-medium">Admin User</p>
                <p className="text-xs text-gray-500">admin@virtualstaging.cl</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="pl-64">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gestión de Estilos</h1>
              <p className="mt-1 text-sm text-gray-500">
                Administra los estilos disponibles para virtual staging
              </p>
            </div>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Estilo
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="mb-8 grid gap-6 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  Total Estilos
                </CardTitle>
                <Image className="h-4 w-4 text-gray-400" aria-label="Icono de imagen" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{styles.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  Estilos Activos
                </CardTitle>
                <Check className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {styles.filter(s => s.is_active).length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  Categorías
                </CardTitle>
                <LayoutDashboard className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {new Set(styles.map(s => s.category)).size}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  Token Promedio
                </CardTitle>
                <DollarSign className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {styles.length > 0 
                    ? Math.round(styles.reduce((acc, s) => acc + (s.token_cost || 0), 0) / styles.length)
                    : 0}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Styles Table */}
          <Card>
            <CardHeader>
              <CardTitle>Lista de Estilos</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Código</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Tokens</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Creado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center">
                        Cargando estilos...
                      </TableCell>
                    </TableRow>
                  ) : styles.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center">
                        No hay estilos disponibles
                      </TableCell>
                    </TableRow>
                  ) : (
                    styles.map((style) => (
                      <TableRow key={style.id}>
                        <TableCell className="font-medium">{style.name}</TableCell>
                        <TableCell>
                          <code className="rounded bg-gray-100 px-2 py-1 text-xs">
                            {style.code}
                          </code>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {style.category || 'Sin categoría'}
                          </Badge>
                        </TableCell>
                        <TableCell>{style.token_cost}</TableCell>
                        <TableCell>
                          <button
                            onClick={() => handleToggleActive(style)}
                            className="cursor-pointer"
                          >
                            <Badge variant={style.is_active ? 'default' : 'secondary'}>
                              {style.is_active ? 'Activo' : 'Inactivo'}
                            </Badge>
                          </button>
                        </TableCell>
                        <TableCell>
                          {style.created_at 
                            ? new Date(style.created_at).toLocaleDateString('es-CL')
                            : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditDialog(style)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(style.id)}
                            >
                              <Trash className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Estilo</DialogTitle>
            <DialogDescription>
              Añade un nuevo estilo para virtual staging
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="code">Código</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Categoría</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="contemporary">Contemporáneo</SelectItem>
                    <SelectItem value="traditional">Tradicional</SelectItem>
                    <SelectItem value="eclectic">Ecléctico</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="token_cost">Costo en Tokens</Label>
                <Input
                  id="token_cost"
                  type="number"
                  value={formData.token_cost}
                  onChange={(e) => setFormData({ ...formData, token_cost: parseInt(e.target.value) })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="description">Descripción</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="base_prompt">Prompt Base</Label>
              <textarea
                id="base_prompt"
                className="w-full rounded-md border p-2"
                rows={4}
                value={formData.base_prompt}
                onChange={(e) => setFormData({ ...formData, base_prompt: e.target.value })}
                placeholder="Ej: Modern minimalist interior design with clean lines..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreate}>
              Crear Estilo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Estilo</DialogTitle>
            <DialogDescription>
              Modifica los detalles del estilo seleccionado
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-name">Nombre</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-code">Código</Label>
                <Input
                  id="edit-code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-category">Categoría</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="contemporary">Contemporáneo</SelectItem>
                    <SelectItem value="traditional">Tradicional</SelectItem>
                    <SelectItem value="eclectic">Ecléctico</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-token_cost">Costo en Tokens</Label>
                <Input
                  id="edit-token_cost"
                  type="number"
                  value={formData.token_cost}
                  onChange={(e) => setFormData({ ...formData, token_cost: parseInt(e.target.value) })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-description">Descripción</Label>
              <Input
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-base_prompt">Prompt Base</Label>
              <textarea
                id="edit-base_prompt"
                className="w-full rounded-md border p-2"
                rows={4}
                value={formData.base_prompt}
                onChange={(e) => setFormData({ ...formData, base_prompt: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdate}>
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}