'use client'

import { useTokenBalance } from '@/hooks/useTokenBalance'
import { AlertCircle, Sparkles, Coins } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'

interface DashboardHeaderProps {
  className?: string
}

export function DashboardHeader({ className }: DashboardHeaderProps) {
  const { available, loading, isLow, hasTokens } = useTokenBalance()
  const previousAvailable = useRef(available)
  const tokenRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  // Check if we're in a project page
  const isInProject = pathname?.includes('/dashboard/projects/') && pathname.split('/').length > 3

  // Add pulse animation when tokens change
  useEffect(() => {
    if (previousAvailable.current !== available && !loading && tokenRef.current) {
      tokenRef.current.classList.add('animate-pulse')
      const timer = setTimeout(() => {
        tokenRef.current?.classList.remove('animate-pulse')
      }, 1000)
      previousAvailable.current = available
      return () => clearTimeout(timer)
    }
  }, [available, loading])

  return (
    <div className={cn("flex items-center justify-between", className)}>
      {/* Left side - Breadcrumb or title when in project */}
      <div className="flex items-center gap-2">
        {isInProject && (
          <div className="flex items-center gap-2 text-sm">
            <Link
              href="/dashboard/projects"
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              Proyectos
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-700 font-medium">Espacio de Trabajo</span>
          </div>
        )}
      </div>

      {/* Right side - Compact Token Display */}
      <Link
        href="/dashboard/tokens"
        className="group"
      >
        <div
          ref={tokenRef}
          className={cn(
            "flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all duration-200 cursor-pointer",
            !hasTokens && "bg-red-50 hover:bg-red-100",
            isLow && "bg-yellow-50 hover:bg-yellow-100",
            hasTokens && !isLow && "bg-primary/5 hover:bg-primary/10"
          )}
        >
          {/* Icon */}
          {!hasTokens ? (
            <AlertCircle className="h-3.5 w-3.5 text-red-500" />
          ) : isLow ? (
            <Coins className="h-3.5 w-3.5 text-yellow-600" />
          ) : (
            <Sparkles className="h-3.5 w-3.5 text-primary" />
          )}

          {/* Token count - more compact */}
          <span className={cn(
            "font-semibold text-xs",
            !hasTokens && "text-red-700",
            isLow && "text-yellow-700",
            hasTokens && !isLow && "text-primary"
          )}>
            {loading ? '...' : available}
          </span>

          {/* Minimal status indicator */}
          {!hasTokens && (
            <span className="text-[10px] text-red-600 font-medium">
              VACÍO
            </span>
          )}
          {isLow && hasTokens && (
            <span className="text-[10px] text-yellow-600 font-medium">
              BAJO
            </span>
          )}
        </div>
      </Link>
    </div>
  )
}