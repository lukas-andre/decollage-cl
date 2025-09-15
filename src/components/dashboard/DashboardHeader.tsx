'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useTokenBalance } from '@/hooks/useTokenBalance'
import { Coins, RefreshCw, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useEffect, useRef } from 'react'

interface DashboardHeaderProps {
  className?: string
}

export function DashboardHeader({ className }: DashboardHeaderProps) {
  const { available, loading, error, refresh, isLow, hasTokens } = useTokenBalance()
  const previousAvailable = useRef(available)
  const tokenRef = useRef<HTMLDivElement>(null)

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
    <div className={cn("flex items-center justify-end gap-3", className)}>
      {/* Token Balance Display */}
      <div 
        ref={tokenRef}
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-200",
          !hasTokens && "border-red-200 bg-red-50",
          isLow && "border-yellow-200 bg-yellow-50", 
          hasTokens && !isLow && "border-primary/20 bg-primary/5 hover:bg-primary/10"
        )}
      >
        <div className="flex items-center gap-1.5">
          {!hasTokens ? (
            <AlertCircle className="h-4 w-4 text-red-500" />
          ) : (
            <Coins className={cn(
              "h-4 w-4",
              isLow ? "text-yellow-600" : "text-primary"
            )} />
          )}
          
          <span className={cn(
            "font-semibold text-sm",
            !hasTokens && "text-red-700",
            isLow && "text-yellow-700",
            hasTokens && !isLow && "text-primary"
          )}>
            {loading ? '...' : available}
          </span>
          
          <span className={cn(
            "text-xs font-medium",
            !hasTokens && "text-red-600",
            isLow && "text-yellow-600", 
            hasTokens && !isLow && "text-primary/80"
          )}>
            tokens
          </span>
        </div>

        {/* Status Badge */}
        {!hasTokens && (
          <Badge variant="destructive" className="text-xs py-0.5 px-1.5">
            Sin tokens
          </Badge>
        )}
        {isLow && (
          <Badge variant="secondary" className="text-xs py-0.5 px-1.5 bg-yellow-100 text-yellow-700 border-yellow-200">
            Pocos tokens
          </Badge>
        )}
      </div>

      {/* Refresh Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={refresh}
        disabled={loading}
        className={cn(
          "h-8 w-8 p-0 transition-transform hover:scale-105",
          loading && "animate-spin"
        )}
        title="Actualizar balance"
      >
        <RefreshCw className="h-4 w-4" />
      </Button>

      {/* Error Display */}
      {error && (
        <div className="text-xs text-red-600 max-w-[200px] truncate" title={error}>
          Error al cargar tokens
        </div>
      )}
    </div>
  )
}