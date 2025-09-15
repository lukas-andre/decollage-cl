'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { AlertCircle, Coins, Sparkles } from 'lucide-react'

interface NoTokensDialogProps {
  isOpen: boolean
  onClose: () => void
}

export function NoTokensDialog({ isOpen, onClose }: NoTokensDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-full bg-red-100">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <AlertDialogTitle className="text-lg font-semibold">
              No hay tokens disponibles
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-base leading-relaxed">
            Necesitas tokens para generar diseños de staging virtual. 
            <br /><br />
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">
                  ¿Qué son los tokens?
                </span>
              </div>
              <p className="text-sm text-blue-700">
                Los tokens son créditos que se consumen cada vez que generas un diseño. 
                Cada estilo tiene un costo diferente en tokens.
              </p>
            </div>
            <br />
            <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
              <div className="flex items-center gap-2 mb-2">
                <Coins className="h-4 w-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800">
                  ¡Próximamente!
                </span>
              </div>
              <p className="text-sm text-yellow-700">
                La compra de tokens estará disponible muy pronto. 
                Mantente atento para seguir creando diseños increíbles.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={onClose} className="w-full">
            Entendido
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}