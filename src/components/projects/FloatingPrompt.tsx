'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Sparkles,
  X,
  Minimize2,
  Maximize2,
  Send,
  Wand2,
  Zap,
  Info
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

interface FloatingPromptProps {
  onSubmit: (prompt: string) => void
  isGenerating?: boolean
  tokenBalance?: number
}

export function FloatingPrompt({ onSubmit, isGenerating, tokenBalance = 0 }: FloatingPromptProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [prompt, setPrompt] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (isOpen && !isMinimized && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [isOpen, isMinimized])

  const handleSubmit = () => {
    if (!prompt.trim() || isGenerating) return
    onSubmit(prompt.trim())
    setPrompt('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <>
      {/* Floating Button to Open */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className={cn(
              "fixed bottom-6 right-6 z-50",
              "w-14 h-14 rounded-full",
              "bg-gradient-to-br from-[#A3B1A1] to-[#C4886F]",
              "shadow-2xl hover:shadow-3xl",
              "flex items-center justify-center",
              "text-white hover:scale-110 transition-all duration-300",
              "border border-white/20"
            )}
          >
            <Wand2 className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Floating Prompt Interface */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              height: isMinimized ? 'auto' : 'auto'
            }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={cn(
              "fixed bottom-6 right-6 z-50",
              "w-[450px] max-w-[90vw]",
              "bg-white rounded-2xl shadow-2xl",
              "border border-gray-200/50",
              "overflow-hidden"
            )}
          >
            {/* Header */}
            <div className={cn(
              "px-4 py-3",
              "bg-gradient-to-r from-[#A3B1A1]/10 to-[#C4886F]/10",
              "border-b border-gray-100",
              "flex items-center justify-between"
            )}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#A3B1A1] to-[#C4886F] flex items-center justify-center">
                  <Wand2 className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">AI Diseñador</h3>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Zap className="w-3 h-3" />
                    <span>{tokenBalance} tokens</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="w-8 h-8"
                >
                  {isMinimized ?
                    <Maximize2 className="w-4 h-4" /> :
                    <Minimize2 className="w-4 h-4" />
                  }
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <AnimatePresence>
              {!isMinimized && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Quick Actions */}
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-gray-500">Sugerencias:</span>
                      {[
                        'Hazlo más moderno',
                        'Estilo minimalista',
                        'Colores cálidos',
                        'Más iluminado'
                      ].map((suggestion) => (
                        <button
                          key={suggestion}
                          onClick={() => setPrompt(suggestion)}
                          className={cn(
                            "px-2.5 py-1 rounded-lg text-xs",
                            "bg-gray-50 hover:bg-gray-100",
                            "text-gray-700 transition-colors",
                            "border border-gray-200"
                          )}
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Prompt Input */}
                  <div className="p-4">
                    <div className={cn(
                      "relative rounded-xl",
                      "border-2 transition-all duration-200",
                      isFocused
                        ? "border-[#A3B1A1] shadow-lg shadow-[#A3B1A1]/10"
                        : "border-gray-200"
                    )}>
                      <Textarea
                        ref={textareaRef}
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        onKeyDown={handleKeyDown}
                        placeholder="Describe cómo quieres transformar este espacio..."
                        className={cn(
                          "resize-none border-0 focus:ring-0",
                          "placeholder:text-gray-400",
                          "min-h-[100px] max-h-[200px]",
                          "text-sm"
                        )}
                        disabled={isGenerating}
                      />

                      {/* Character count */}
                      <div className="absolute bottom-2 left-3 text-xs text-gray-400">
                        {prompt.length}/500
                      </div>

                      {/* Submit button */}
                      <Button
                        onClick={handleSubmit}
                        disabled={!prompt.trim() || isGenerating || tokenBalance === 0}
                        size="sm"
                        className={cn(
                          "absolute bottom-2 right-2",
                          "bg-gradient-to-r from-[#A3B1A1] to-[#C4886F]",
                          "hover:from-[#A3B1A1]/90 hover:to-[#C4886F]/90",
                          "text-white shadow-lg",
                          "px-3 py-1.5"
                        )}
                      >
                        {isGenerating ? (
                          <>
                            <Sparkles className="w-3 h-3 mr-1.5 animate-spin" />
                            Generando...
                          </>
                        ) : (
                          <>
                            <Send className="w-3 h-3 mr-1.5" />
                            Generar
                          </>
                        )}
                      </Button>
                    </div>

                    {/* Help text */}
                    <div className="mt-3 flex items-start gap-2">
                      <Info className="w-3 h-3 text-gray-400 mt-0.5" />
                      <p className="text-xs text-gray-500">
                        Presiona <kbd className="px-1 py-0.5 rounded bg-gray-100 text-gray-700 font-mono text-[10px]">Ctrl</kbd> + <kbd className="px-1 py-0.5 rounded bg-gray-100 text-gray-700 font-mono text-[10px]">Enter</kbd> para enviar
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}