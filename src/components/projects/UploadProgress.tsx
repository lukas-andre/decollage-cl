'use client'

import { Progress } from '@/components/ui/progress'
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface UploadProgressProps {
  progress: number
  status: 'selecting' | 'validating' | 'compressing' | 'uploading' | 'processing' | 'complete' | 'error'
  error?: string
  className?: string
}

export function UploadProgress({ progress, status, error, className }: UploadProgressProps) {
  const getStatusMessage = () => {
    switch (status) {
      case 'selecting':
        return 'Seleccionando archivo...'
      case 'validating':
        return 'Validando imagen...'
      case 'compressing':
        return 'Optimizando imagen...'
      case 'uploading':
        return 'Subiendo imagen...'
      case 'processing':
        return 'Procesando...'
      case 'complete':
        return '¡Imagen subida exitosamente!'
      case 'error':
        return error || 'Error al subir imagen'
      default:
        return 'Preparando...'
    }
  }

  const getIcon = () => {
    switch (status) {
      case 'complete':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Loader2 className="h-4 w-4 animate-spin text-primary" />
    }
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center gap-2">
        {getIcon()}
        <span className={cn(
          "text-sm font-medium",
          status === 'complete' && "text-green-700",
          status === 'error' && "text-red-700"
        )}>
          {getStatusMessage()}
        </span>
      </div>
      
      {status !== 'complete' && status !== 'error' && (
        <Progress 
          value={progress} 
          className="h-2"
        />
      )}
      
      {status === 'error' && error && (
        <div className="text-xs text-red-600 bg-red-50 p-2 rounded border">
          {error}
        </div>
      )}
    </div>
  )
}