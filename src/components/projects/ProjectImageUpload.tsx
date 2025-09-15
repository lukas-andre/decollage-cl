'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Upload, 
  X, 
  Plus,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'

interface UploadedFile extends File {
  id: string
  preview: string
}

interface UploadResult {
  fileName: string
  success: boolean
  error?: string
  projectImage?: unknown
}

interface ProjectImageUploadProps {
  projectId: string
  onUploadComplete?: () => void
}

export function ProjectImageUpload({ 
  projectId, 
  onUploadComplete 
}: ProjectImageUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [imageName, setImageName] = useState('')
  const [notes, setNotes] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadResults, setUploadResults] = useState<UploadResult[]>([])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => Object.assign(file, {
      id: Math.random().toString(36).substring(7),
      preview: URL.createObjectURL(file)
    }))
    
    setFiles(prev => [...prev, ...newFiles])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: true
  })

  const removeFile = (fileId: string) => {
    setFiles(prev => {
      const fileToRemove = prev.find(f => f.id === fileId)
      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.preview)
      }
      return prev.filter(f => f.id !== fileId)
    })
  }

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags(prev => [...prev, tagInput.trim()])
      setTagInput('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    }
  }

  const uploadImages = async () => {
    if (files.length === 0) {
      toast.error('Selecciona al menos una imagen')
      return
    }

    try {
      setUploading(true)
      setUploadProgress(0)
      setUploadResults([])

      const formData = new FormData()
      
      files.forEach(file => {
        formData.append('images', file)
      })
      
      if (imageName.trim()) {
        formData.append('imageName', imageName.trim())
      }
      
      formData.append('tags', JSON.stringify(tags))
      
      if (notes.trim()) {
        formData.append('notes', notes.trim())
      }

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90))
      }, 200)

      const response = await fetch(`/api/projects/${projectId}/images`, {
        method: 'POST',
        body: formData,
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Error al subir imágenes')
      }

      setUploadResults(result.results || [])
      
      const successful = result.results?.filter((r: UploadResult) => r.success).length || 0
      const failed = result.results?.filter((r: UploadResult) => !r.success).length || 0

      if (successful > 0) {
        toast.success(result.message || `${successful} imagen(es) subida(s) exitosamente`)
        
        // Clear form
        setFiles([])
        setImageName('')
        setNotes('')
        setTags([])
        setUploadProgress(0)
        
        // Notify parent
        onUploadComplete?.()
      }

      if (failed > 0) {
        toast.error(`${failed} imagen(es) fallaron al subir`)
      }

    } catch (error) {
      console.error('Upload error:', error)
      toast.error(error instanceof Error ? error.message : 'Error al subir imágenes')
    } finally {
      setUploading(false)
      setTimeout(() => {
        setUploadProgress(0)
        setUploadResults([])
      }, 3000)
    }
  }

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle>Subir nuevas imágenes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Dropzone */}
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer
              ${isDragActive 
                ? 'border-primary bg-primary/5' 
                : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50'
              }
            `}
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            {isDragActive ? (
              <p className="text-lg">Suelta las imágenes aquí...</p>
            ) : (
              <div>
                <p className="text-lg mb-2">
                  Arrastra imágenes aquí o <span className="text-primary">haz clic para seleccionar</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  Soporta JPG, PNG, WebP hasta 10MB por imagen
                </p>
              </div>
            )}
          </div>

          {/* File Preview */}
          {files.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {files.map((file) => (
                <div key={file.id} className="relative group">
                  <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                    <Image
                      src={file.preview}
                      alt={file.name}
                      width={200}
                      height={200}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    onClick={() => removeFile(file.id)}
                    className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <p className="text-xs text-center mt-1 truncate" title={file.name}>
                    {file.name}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Metadata Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Nombre personalizado (opcional)
              </label>
              <Input
                placeholder="Ej: Sala principal, Dormitorio master..."
                value={imageName}
                onChange={(e) => setImageName(e.target.value)}
                disabled={uploading}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Etiquetas
              </label>
              <div className="flex gap-2">
                <Input
                  placeholder="Agregar etiqueta..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={uploading}
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={addTag}
                  disabled={!tagInput.trim() || uploading}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        disabled={uploading}
                        className="hover:bg-destructive/20 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Notas (opcional)
            </label>
            <Textarea
              placeholder="Información adicional sobre estas imágenes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={uploading}
              rows={3}
            />
          </div>

          {/* Upload Button */}
          <div className="flex justify-end">
            <Button
              onClick={uploadImages}
              disabled={files.length === 0 || uploading}
              size="lg"
            >
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Subiendo...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Subir {files.length} imagen{files.length !== 1 ? 'es' : ''}
                </>
              )}
            </Button>
          </div>

          {/* Upload Progress */}
          {uploading && uploadProgress > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subiendo imágenes...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} />
            </div>
          )}

          {/* Upload Results */}
          {uploadResults.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">Resultados de la subida:</h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {uploadResults.map((result, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    {result.success ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span className="flex-1">{result.fileName}</span>
                    {result.error && (
                      <span className="text-red-500 text-xs">{result.error}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}