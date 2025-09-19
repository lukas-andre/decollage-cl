'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { DashboardSidebar } from '@/components/dashboard/sidebar'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'

interface DashboardLayoutClientProps {
  children: React.ReactNode
}

export function DashboardLayoutClient({ children }: DashboardLayoutClientProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const pathname = usePathname()

  // Check if we're in a project detail page
  const isInProject = pathname?.includes('/dashboard/projects/') && pathname.split('/').length > 4

  // Auto-collapse sidebar when entering a project
  useEffect(() => {
    if (isInProject) {
      setIsSidebarCollapsed(true)
    } else {
      setIsSidebarCollapsed(false)
    }
  }, [isInProject])

  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      <DashboardSidebar onCollapsedChange={setIsSidebarCollapsed} />

      {/* Main content area with responsive margins */}
      <main
        className={cn(
          "transition-all duration-700 ease-out",
          isSidebarCollapsed ? "lg:ml-20" : "lg:ml-80"
        )}
      >
        {/* Only show header when NOT in project detail pages */}
        {!isInProject && (
          <div className="sticky top-0 z-30 border-b border-[#A3B1A1]/10 bg-white/95 backdrop-blur-xl px-8 py-4">
            <DashboardHeader />
          </div>
        )}

        {/* Content area with optimized padding for projects */}
        <div className={cn(
          "min-h-screen transition-all duration-300",
          isInProject ? "p-0" : "p-8 lg:p-10"
        )}>
          {children}
        </div>
      </main>
    </div>
  )
}