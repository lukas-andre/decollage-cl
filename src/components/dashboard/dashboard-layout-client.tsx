'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { DashboardSidebar } from '@/components/dashboard/sidebar'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'

interface DashboardLayoutClientProps {
  children: React.ReactNode
}

export function DashboardLayoutClient({ children }: DashboardLayoutClientProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

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
        {/* Dashboard Header with elegant shadow */}
        <div className="sticky top-0 z-30 border-b border-[#A3B1A1]/10 bg-white/95 backdrop-blur-xl px-8 py-5 shadow-sm">
          <DashboardHeader />
        </div>

        {/* Content area with generous padding */}
        <div className="min-h-screen p-8 lg:p-10">
          {children}
        </div>
      </main>
    </div>
  )
}