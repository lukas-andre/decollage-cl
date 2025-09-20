'use client'

import { create } from 'zustand'

export type AuthAction =
  | 'like'
  | 'download'
  | 'save'
  | 'create-design'
  | 'view-gallery'
  | 'share'
  | 'comment'

export interface AuthModalData {
  returnUrl?: string
  shareToken?: string
  itemId?: string
  imageUrl?: string
  title?: string
  action?: AuthAction
  metadata?: Record<string, any>
}

interface AuthModalState {
  isOpen: boolean
  data: AuthModalData | null

  // Actions
  openModal: (data?: AuthModalData) => void
  closeModal: () => void
  setData: (data: AuthModalData) => void
}

export const useAuthModal = create<AuthModalState>((set) => ({
  isOpen: false,
  data: null,

  openModal: (data) => set({
    isOpen: true,
    data: data || {}
  }),

  closeModal: () => set({
    isOpen: false,
    data: null
  }),

  setData: (data) => set({ data }),
}))

// Helper function to trigger auth with context
export const triggerAuth = (action: AuthAction, data?: Partial<AuthModalData>) => {
  const { openModal } = useAuthModal.getState()

  // Store the current URL for return
  const returnUrl = window.location.href

  // Create contextual messaging based on action
  const actionData: AuthModalData = {
    returnUrl,
    action,
    ...data
  }

  // Store in sessionStorage for persistence across page reloads
  sessionStorage.setItem('pendingAuthAction', JSON.stringify(actionData))

  openModal(actionData)
}

// Helper function to get and clear pending auth action
export const getPendingAuthAction = (): AuthModalData | null => {
  if (typeof window === 'undefined') return null

  try {
    const stored = sessionStorage.getItem('pendingAuthAction')
    if (stored) {
      sessionStorage.removeItem('pendingAuthAction')
      return JSON.parse(stored)
    }
  } catch (error) {
    console.error('Error parsing pending auth action:', error)
  }

  return null
}

// Helper function to get action-specific messaging
export const getActionMessage = (action: AuthAction): {
  title: string
  description: string
  ctaText: string
} => {
  const messages = {
    like: {
      title: 'Guarda tus diseños favoritos',
      description: 'Crea tu cuenta para guardar este diseño y descubrir más inspiración personalizada',
      ctaText: 'Me gusta este diseño'
    },
    download: {
      title: 'Descarga en alta calidad',
      description: 'Accede a descargas HD y comienza a transformar tu espacio hoy mismo',
      ctaText: 'Descargar imagen'
    },
    save: {
      title: 'Crea tu colección personal',
      description: 'Guarda diseños en tu biblioteca personal y organiza tu inspiración',
      ctaText: 'Guardar en mi colección'
    },
    'create-design': {
      title: 'Transforma tu espacio',
      description: 'Únete a miles de chilenas creando diseños únicos para sus hogares',
      ctaText: 'Crear mi diseño'
    },
    'view-gallery': {
      title: 'Explora la galería completa',
      description: 'Descubre cientos de transformaciones reales de hogares chilenos',
      ctaText: 'Ver galería completa'
    },
    share: {
      title: 'Comparte este diseño',
      description: 'Inspira a tus amigas compartiendo este increíble diseño',
      ctaText: 'Compartir diseño'
    },
    comment: {
      title: 'Únete a la conversación',
      description: 'Comparte tu opinión y conecta con otras apasionadas del diseño',
      ctaText: 'Comentar'
    }
  }

  return messages[action] || messages['create-design']
}