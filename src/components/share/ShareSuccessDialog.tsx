'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Check, Copy, MessageSquare, Share2, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface ShareSuccessDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  shareUrl: string
  format: 'quick' | 'story'
}

export function ShareSuccessDialog({
  open,
  onOpenChange,
  shareUrl,
  format
}: ShareSuccessDialogProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      toast.success('Link copiado al portapapeles')
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error('Error al copiar el link')
    }
  }

  const handleWhatsAppShare = () => {
    const message = format === 'quick'
      ? `¡Mira cómo transformé mi espacio con Decollage! 🏠✨\n\n${shareUrl}`
      : `¡Creé una historia de diseño increíble en Decollage! 🎨✨\n\n${shareUrl}`
    
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }

  const handleViewShare = () => {
    window.open(shareUrl, '_blank')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-light text-[#333333]">
            ¡Listo para compartir! 🎉
          </DialogTitle>
          <DialogDescription className="text-base text-gray-600">
            Tu {format === 'quick' ? 'diseño' : 'historia'} está {format === 'quick' ? 'listo' : 'lista'} para compartir
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* URL Copy Section */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#333333]">
              Link para compartir:
            </label>
            <div className="flex gap-2">
              <Input
                value={shareUrl}
                readOnly
                className="flex-1 text-sm"
              />
              <Button
                onClick={handleCopy}
                variant="outline"
                size="icon"
                className={cn(
                  "transition-colors",
                  copied && "bg-green-50 border-green-300"
                )}
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3">
            <Card 
              className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={handleWhatsAppShare}
            >
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-green-600" />
                </div>
                <span className="text-sm font-medium text-[#333333]">WhatsApp</span>
              </div>
            </Card>

            <Card 
              className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={handleViewShare}
            >
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <ExternalLink className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-sm font-medium text-[#333333]">Ver página</span>
              </div>
            </Card>
          </div>

          {/* Tips Section */}
          <Card className={cn(
            "p-4 border-l-4",
            format === 'quick' ? "bg-[#A3B1A1]/5 border-[#A3B1A1]" : "bg-[#C4886F]/5 border-[#C4886F]"
          )}>
            <h4 className="text-sm font-medium text-[#333333] mb-2">
              {format === 'quick' ? '💡 Consejo rápido:' : '✨ Maximiza tu impacto:'}
            </h4>
            <p className="text-xs text-gray-600">
              {format === 'quick' 
                ? 'Comparte en grupos de WhatsApp de decoración o con amigas que estén renovando sus espacios.'
                : 'Agrega una descripción personal cuando compartas tu historia para conectar mejor con tu audiencia.'
              }
            </p>
          </Card>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cerrar
          </Button>
          <Button
            onClick={handleViewShare}
            className={cn(
              format === 'quick'
                ? "bg-[#A3B1A1] hover:bg-[#A3B1A1]/90"
                : "bg-[#C4886F] hover:bg-[#C4886F]/90"
            )}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Ver {format === 'quick' ? 'diseño' : 'historia'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}