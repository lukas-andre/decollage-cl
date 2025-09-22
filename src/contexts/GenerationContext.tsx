'use client'

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'

interface GenerationContextType {
  // Generation state
  generating: boolean
  generationComplete: boolean
  lastGeneratedVariant: any | null

  // Actions
  setGenerating: (generating: boolean) => void
  setGenerationComplete: (complete: boolean) => void
  setLastGeneratedVariant: (variant: any | null) => void
  resetGenerationState: () => void
}

const GenerationContext = createContext<GenerationContextType | undefined>(undefined)

export function GenerationProvider({ children }: { children: ReactNode }) {
  const [generating, setGenerating] = useState(false)
  const [generationComplete, setGenerationComplete] = useState(false)
  const [lastGeneratedVariant, setLastGeneratedVariant] = useState<any | null>(null)

  const resetGenerationState = useCallback(() => {
    setGenerating(false)
    setGenerationComplete(false)
    setLastGeneratedVariant(null)
  }, [])

  const value: GenerationContextType = {
    generating,
    generationComplete,
    lastGeneratedVariant,
    setGenerating,
    setGenerationComplete,
    setLastGeneratedVariant,
    resetGenerationState
  }

  return (
    <GenerationContext.Provider value={value}>
      {children}
    </GenerationContext.Provider>
  )
}

export function useGeneration() {
  const context = useContext(GenerationContext)
  if (context === undefined) {
    throw new Error('useGeneration must be used within a GenerationProvider')
  }
  return context
}