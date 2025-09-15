'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus, Search, Upload, Link2, Eye, Edit, Trash, Package } from 'lucide-react'
import { createBrowserClient } from '@supabase/ssr'
import { toast } from 'sonner'

interface Product {
  id: string
  name: string
  category: string
  product_image_url: string
  sku?: string
  description?: string
  staging_count: number
  is_active: boolean
  created_at: string
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [businessId, setBusinessId] = useState<string | null>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      
      // Get user's business
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: businessMember } = await supabase
        .from('business_members')
        .select('business_id')
        .eq('user_id', user.id)
        .single()

      if (businessMember) {
        setBusinessId(businessMember.business_id)

        // Fetch products
        const { data: productsData } = await supabase
          .from('products')
          .select('*')
          .eq('business_id', businessMember.business_id)
          .order('created_at', { ascending: false })

        if (productsData) {
          setProducts(productsData)
        }
      }
    } catch (error) {
      console.error('Error fetching products:', error)
      toast.error('Error al cargar productos')
    } finally {
      setLoading(false)
    }
  }

  const handleAddProduct = async (formData: FormData) => {
    if (!businessId) return

    try {
      const file = formData.get('image') as File
      
      // Upload image to Cloudflare (simplified for now)
      const imageUrl = URL.createObjectURL(file) // In production, upload to Cloudflare

      const { data, error } = await supabase
        .from('products')
        .insert({
          business_id: businessId,
          name: formData.get('name') as string,
          category: formData.get('category') as string,
          sku: formData.get('sku') as string,
          description: formData.get('description') as string,
          product_image_url: imageUrl,
        })
        .select()
        .single()

      if (error) throw error

      toast.success('Producto agregado exitosamente')
      setShowAddDialog(false)
      fetchProducts()
    } catch (error) {
      console.error('Error adding product:', error)
      toast.error('Error al agregar producto')
    }
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.sku?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const categories = [
    { value: 'all', label: 'Todas las categorías' },
    { value: 'rug', label: 'Alfombras' },
    { value: 'wallpaper', label: 'Papel Tapiz' },
    { value: 'curtain', label: 'Cortinas' },
    { value: 'furniture', label: 'Muebles' },
    { value: 'decor', label: 'Decoración' },
    { value: 'lighting', label: 'Iluminación' },
    { value: 'other', label: 'Otros' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Productos</h1>
              <p className="text-sm text-gray-500 mt-1">
                Gestiona tu catálogo de productos para staging virtual
              </p>
            </div>
            
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar Producto
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                  <DialogTitle>Agregar Nuevo Producto</DialogTitle>
                  <DialogDescription>
                    Agrega un producto a tu catálogo para usar en staging virtual
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={(e) => {
                  e.preventDefault()
                  handleAddProduct(new FormData(e.currentTarget))
                }}>
                  <div className="grid gap-4 py-4">
                    <div>
                      <Label htmlFor="name">Nombre del Producto</Label>
                      <Input id="name" name="name" required />
                    </div>
                    <div>
                      <Label htmlFor="category">Categoría</Label>
                      <Select name="category" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona una categoría" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.slice(1).map(cat => (
                            <SelectItem key={cat.value} value={cat.value}>
                              {cat.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="sku">SKU (Opcional)</Label>
                      <Input id="sku" name="sku" />
                    </div>
                    <div>
                      <Label htmlFor="description">Descripción</Label>
                      <Input id="description" name="description" />
                    </div>
                    <div>
                      <Label htmlFor="image">Imagen del Producto</Label>
                      <Input id="image" name="image" type="file" accept="image/*" required />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit">Agregar Producto</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Filters */}
        <div className="bg-white rounded-lg p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                  placeholder="Buscar productos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <div className="aspect-square bg-gray-200 animate-pulse" />
                <CardContent className="p-4">
                  <div className="h-4 bg-gray-200 rounded animate-pulse mb-2" />
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Package className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-gray-600 font-medium mb-1">
              {searchQuery || selectedCategory !== 'all' 
                ? 'No se encontraron productos' 
                : 'No hay productos aún'}
            </p>
            <p className="text-sm text-gray-500 mb-4">
              {searchQuery || selectedCategory !== 'all'
                ? 'Intenta con otros filtros'
                : 'Comienza agregando tu primer producto al catálogo'}
            </p>
            {!searchQuery && selectedCategory === 'all' && (
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Agregar Producto
              </Button>
            )}
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
              <Card key={product.id} className="overflow-hidden group hover:shadow-lg transition-shadow">
                <div className="aspect-square bg-gray-100 relative">
                  {product.product_image_url ? (
                    <img 
                      src={product.product_image_url} 
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button size="sm" variant="secondary">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="secondary">
                      <Link2 className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="secondary">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                  {!product.is_active && (
                    <div className="absolute top-2 right-2">
                      <span className="px-2 py-1 bg-gray-900/80 text-white text-xs rounded">
                        Inactivo
                      </span>
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <h3 className="font-medium text-gray-900 truncate">{product.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {categories.find(c => c.value === product.category)?.label}
                  </p>
                  {product.sku && (
                    <p className="text-xs text-gray-400 mt-1">SKU: {product.sku}</p>
                  )}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t">
                    <span className="text-xs text-gray-500">
                      {product.staging_count} usos
                    </span>
                    <Button size="sm" variant="outline" className="h-7 text-xs">
                      Crear Enlace
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}