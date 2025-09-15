'use client'

import { useState, useEffect, useCallback } from 'react'

interface TokenBalance {
  available: number
  total_purchased: number
  total_used: number
  loading: boolean
  error: string | null
}

export function useTokenBalance() {
  const [balance, setBalance] = useState<TokenBalance>({
    available: 0,
    total_purchased: 0,
    total_used: 0,
    loading: true,
    error: null
  })

  const fetchBalance = useCallback(async () => {
    try {
      setBalance(prev => ({ ...prev, loading: true, error: null }))
      
      const response = await fetch('/api/tokens/balance')
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch token balance')
      }
      
      setBalance({
        available: data.tokens_available || 0,
        total_purchased: data.tokens_total_purchased || 0,
        total_used: data.tokens_total_used || 0,
        loading: false,
        error: null
      })
    } catch (error) {
      console.error('Error fetching token balance:', error)
      setBalance(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch balance'
      }))
    }
  }, [])

  const refreshBalance = useCallback(() => {
    fetchBalance()
  }, [fetchBalance])

  const deductTokens = useCallback((amount: number) => {
    setBalance(prev => ({
      ...prev,
      available: Math.max(0, prev.available - amount),
      total_used: prev.total_used + amount
    }))
  }, [])

  const addTokens = useCallback((amount: number) => {
    setBalance(prev => ({
      ...prev,
      available: prev.available + amount,
      total_purchased: prev.total_purchased + amount
    }))
  }, [])

  useEffect(() => {
    fetchBalance()
  }, [fetchBalance])

  return {
    ...balance,
    refresh: refreshBalance,
    deduct: deductTokens,
    add: addTokens,
    hasTokens: balance.available > 0,
    isLow: balance.available > 0 && balance.available < 5
  }
}