import { useCallback, useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react'

import {
  DEFAULT_WIZARD_FORM_DATA,
  type WizardFormData as FormData
} from '@/components/projects/context-first-wizard.types'

export { DEFAULT_WIZARD_FORM_DATA }

const DEFAULT_STEP = 1

const createDefaultFormData = (): FormData => ({
  ...DEFAULT_WIZARD_FORM_DATA
})

const buildStorageKey = (projectId: string, baseImageId?: string) =>
  `wizard_state_${projectId}_${baseImageId ?? 'default'}`

interface StoredWizardState {
  step: number
  formData: FormData
  updatedAt: number
}

interface UseWizardStateOptions {
  projectId: string
  baseImageId?: string | null
}

export interface WizardStateApi {
  step: number
  formData: FormData
  setStep: Dispatch<SetStateAction<number>>
  setFormData: Dispatch<SetStateAction<FormData>>
  reset: () => void
}

export function useWizardState({ projectId, baseImageId }: UseWizardStateOptions): WizardStateApi {
  const [step, setStepState] = useState<number>(DEFAULT_STEP)
  const [formData, setFormDataState] = useState<FormData>(() => createDefaultFormData())
  const storageKeyRef = useRef<string>(buildStorageKey(projectId, baseImageId ?? undefined))
  const isHydratedRef = useRef(false)

  // Load stored state whenever the project or base image changes
  useEffect(() => {
    const storageKey = buildStorageKey(projectId, baseImageId ?? undefined)
    storageKeyRef.current = storageKey
    isHydratedRef.current = false

    if (typeof window === 'undefined') {
      setStepState(DEFAULT_STEP)
      setFormDataState(createDefaultFormData())
      return
    }

    try {
      const raw = window.localStorage.getItem(storageKey)
      if (raw) {
        const parsed = JSON.parse(raw) as StoredWizardState
        if (
          typeof parsed?.step === 'number' &&
          parsed.step >= 1 &&
          parsed.step <= 4 &&
          parsed.formData
        ) {
          setStepState(parsed.step)
          setFormDataState({ ...DEFAULT_WIZARD_FORM_DATA, ...parsed.formData })
          isHydratedRef.current = true
          return
        }
      }
    } catch (error) {
      console.warn('[useWizardState] Failed to read stored state', error)
    }

    setStepState(DEFAULT_STEP)
    setFormDataState(createDefaultFormData())
    isHydratedRef.current = true
  }, [projectId, baseImageId])

  const persistState = useCallback(
    (nextStep: number, nextFormData: FormData) => {
      if (typeof window === 'undefined') return
      if (!isHydratedRef.current) return

      try {
        const payload: StoredWizardState = {
          step: nextStep,
          formData: nextFormData,
          updatedAt: Date.now()
        }
        window.localStorage.setItem(storageKeyRef.current, JSON.stringify(payload))
      } catch (error) {
        console.warn('[useWizardState] Failed to persist state', error)
      }
    },
    []
  )

  const setStep = useCallback<Dispatch<SetStateAction<number>>>(
    (value) => {
      setStepState((prev) => {
        const resolved = typeof value === 'function' ? value(prev) : value
        const normalized = Math.min(4, Math.max(1, resolved))
        persistState(normalized, formData)
        return normalized
      })
    },
    [formData, persistState]
  )

  const setFormData = useCallback<Dispatch<SetStateAction<FormData>>>(
    (value) => {
      setFormDataState((prev) => {
        const resolved = typeof value === 'function' ? value(prev) : value
        const next = { ...DEFAULT_WIZARD_FORM_DATA, ...prev, ...resolved }
        persistState(step, next)
        return next
      })
    },
    [persistState, step]
  )

  useEffect(() => {
    persistState(step, formData)
  }, [step, formData, persistState])

  const reset = useCallback(() => {
    const nextFormData = createDefaultFormData()
    setStepState(DEFAULT_STEP)
    setFormDataState(nextFormData)
    isHydratedRef.current = true

    if (typeof window !== 'undefined') {
      try {
        window.localStorage.removeItem(storageKeyRef.current)
      } catch (error) {
        console.warn('[useWizardState] Failed to clear state', error)
      }
    }
  }, [])

  return {
    step,
    formData,
    setStep,
    setFormData,
    reset
  }
}
