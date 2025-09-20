'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'

interface LogoutButtonProps {
  variant?: 'ghost' | 'outline' | 'default'
  size?: 'sm' | 'default' | 'lg'
  className?: string
  iconOnly?: boolean
}

export function LogoutButton({
  variant = 'ghost',
  size = 'sm',
  className,
  iconOnly = false
}: LogoutButtonProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleLogout = async () => {
    setIsLoading(true)
    
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('Error logging out:', error)
        return
      }

      router.push('/login')
      router.refresh()
    } catch (error) {
      console.error('Error logging out:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant={variant}
      size={iconOnly ? 'icon' : size}
      className={className}
      onClick={handleLogout}
      disabled={isLoading}
    >
      {iconOnly ? (
        <LogOut className="h-3 w-3" />
      ) : (
        isLoading ? 'Cerrando...' : 'Cerrar Sesión'
      )}
    </Button>
  )
}