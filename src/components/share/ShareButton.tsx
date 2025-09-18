'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Share2, Loader2 } from 'lucide-react'
import { EnhancedShareDialog } from './EnhancedShareDialog'
import { ShareSuccessDialog } from './ShareSuccessDialog'
import { createClient } from '@/lib/supabase/client'
import { shareService } from '@/lib/services/share.service'
import { toast } from 'sonner'
import type { Database } from '@/types/database.types'

type Generation = Database['public']['Tables']['transformations']['Row']
type Project = Database['public']['Tables']['projects']['Row']

interface ShareButtonProps {
  project: Project
  generations: Generation[]
  className?: string
}

export function ShareButton({ project, generations, className }: ShareButtonProps) {
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false)
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false)
  const [shareUrl, setShareUrl] = useState('')
  const [shareFormat, setShareFormat] = useState<'quick' | 'story'>('quick')
  const [isSharing, setIsSharing] = useState(false)
  const supabase = createClient()

  const handleShare = async (selectedIds: string[], format: 'quick' | 'story') => {
    try {
      setIsSharing(true)
      setShareFormat(format)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Debes iniciar sesión para compartir')
        return
      }

      // Create share using the existing service
      const shareResponse = await shareService.createShare(project.id, {
        type: 'project',
        customTitle: project.name,
        customDescription: project.description || undefined,
        featured: selectedIds,
        visibility: 'public'
      }, supabase)

      // Update the share with our new format-specific data
      const whatsappMessage = format === 'quick'
        ? `¡Mira cómo transformé mi espacio con Decollage! 🏠✨\n\nProyecto: ${project.name}\n\nDescubre más transformaciones en decollage.cl`
        : null

      await supabase
        .from('project_shares')
        .update({
          share_format: format,
          whatsapp_message: whatsappMessage
        })
        .eq('share_token', shareResponse.shareToken)

      setShareUrl(shareResponse.shareUrl)
      setIsShareDialogOpen(false)
      setIsSuccessDialogOpen(true)

      // Track share event (simplified)
      await fetch('/api/share/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shareToken: shareResponse.shareToken,
          eventType: 'created',
          eventData: {
            format,
            generation_count: selectedIds.length
          }
        })
      })

    } catch (error) {
      console.error('Error sharing project:', error)
      toast.error('Error al compartir el proyecto')
    } finally {
      setIsSharing(false)
    }
  }

  const validGenerations = generations.filter(g => g.result_image_url)

  if (validGenerations.length === 0) {
    return null
  }

  return (
    <>
      <Button
        onClick={() => setIsShareDialogOpen(true)}
        variant="outline"
        size="sm"
        className={className}
        disabled={isSharing}
      >
        {isSharing ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Compartiendo...
          </>
        ) : (
          <>
            <Share2 className="w-4 h-4 mr-2" />
            Compartir
          </>
        )}
      </Button>

      <EnhancedShareDialog
        open={isShareDialogOpen}
        onOpenChange={setIsShareDialogOpen}
        project={project}
        generations={validGenerations}
        onShare={handleShare}
      />

      <ShareSuccessDialog
        open={isSuccessDialogOpen}
        onOpenChange={setIsSuccessDialogOpen}
        shareUrl={shareUrl}
        format={shareFormat}
      />
    </>
  )
}