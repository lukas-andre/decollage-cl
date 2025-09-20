'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  Home,
  FolderOpen,
  Palette,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Leaf,
  User,
  LogOut,
  Settings,
  Share2
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { LogoutButton } from '@/components/dashboard/logout-button'

interface SidebarItem {
  title: string
  href: string
  icon: React.ReactNode
  badge?: string
  children?: Array<{
    title: string
    href: string
  }>
}

const sidebarItems: SidebarItem[] = [
  {
    title: 'Inicio',
    href: '/dashboard',
    icon: <Home className="h-4 w-4" />
  },
  {
    title: 'Mis Espacios',
    href: '/dashboard/projects',
    icon: <FolderOpen className="h-4 w-4" />,
    children: [
      { title: 'Gestión de espacios', href: '/dashboard/projects' },
      { title: 'Galería de imágenes', href: '/dashboard/projects/images' },
      { title: 'Historial', href: '/dashboard/projects/transformations' }
    ]
  },
  {
    title: 'Mis Compartidos',
    href: '/dashboard/shares',
    icon: <Share2 className="h-4 w-4" />,
    children: [
      { title: 'Gestionar enlaces', href: '/dashboard/shares' },
      { title: 'Analíticas', href: '/dashboard/shares/analytics' }
    ]
  },
  {
    title: 'Tokens',
    href: '/dashboard/tokens',
    icon: <Sparkles className="h-4 w-4" />,
    children: [
      { title: 'Mi balance', href: '/dashboard/tokens' },
      { title: 'Paquetes', href: '/dashboard/tokens/packages' },
      { title: 'Historial', href: '/dashboard/tokens/history' }
    ]
  }
]

interface DashboardSidebarProps {
  onCollapsedChange?: (collapsed: boolean) => void
}

export function DashboardSidebar({ onCollapsedChange }: DashboardSidebarProps = {}) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [expandedItems, setExpandedItems] = useState<string[]>([])

  // Check if we're in a project page
  const isInProject = pathname?.includes('/dashboard/projects/') && pathname.split('/').length > 3

  useEffect(() => {
    // Auto-collapse when entering a project
    if (isInProject && !isCollapsed) {
      setIsCollapsed(true)
    }
  }, [isInProject])

  useEffect(() => {
    onCollapsedChange?.(isCollapsed)
  }, [isCollapsed, onCollapsedChange])

  const toggleExpanded = (href: string) => {
    setExpandedItems(prev =>
      prev.includes(href)
        ? prev.filter(item => item !== href)
        : [...prev, href]
    )
  }

  return (
    <TooltipProvider>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden fixed top-6 left-4 z-50 bg-white/95 backdrop-blur-sm shadow-lg border border-[#A3B1A1]/20"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </Button>

      {/* Overlay for mobile */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed left-0 top-0 h-full bg-white border-r border-[#A3B1A1]/10 transition-all duration-700 ease-out z-40 shadow-xl",
        isCollapsed ? "w-20" : "w-80",
        isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="flex h-full flex-col">
          {/* Logo Section */}
          <div className="flex h-28 items-center justify-between px-6 border-b border-[#A3B1A1]/10 bg-gradient-to-b from-white to-[#F8F8F8]/30">
            {!isCollapsed ? (
              <Link
                href="/dashboard"
                className="flex items-center gap-4 transition-all duration-700"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-[#A3B1A1]/20 to-[#A3B1A1]/10 flex items-center justify-center shadow-sm">
                  <Leaf className="h-7 w-7 text-[#A3B1A1]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-cormorant font-light text-[#333333] leading-none tracking-tight">
                    Decollage
                  </span>
                  <span className="text-[11px] font-lato text-[#A3B1A1] tracking-[0.2em] uppercase mt-1">
                    Tu espacio soñado
                  </span>
                </div>
              </Link>
            ) : (
              <div className="w-full flex justify-center">
                <div className="w-12 h-12 bg-gradient-to-br from-[#A3B1A1]/20 to-[#A3B1A1]/10 flex items-center justify-center shadow-sm">
                  <Leaf className="h-7 w-7 text-[#A3B1A1]" />
                </div>
              </div>
            )}

            {!isCollapsed && (
              <Button
                variant="ghost"
                size="icon"
                className="hidden lg:flex text-[#333333]/40 hover:text-[#333333] hover:bg-[#A3B1A1]/10 transition-all duration-500"
                onClick={() => setIsCollapsed(!isCollapsed)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Collapse button for collapsed state */}
          {isCollapsed && (
            <div className="hidden lg:flex justify-center px-4 py-3 border-b border-[#A3B1A1]/5">
              <Button
                variant="ghost"
                size="icon"
                className="text-[#333333]/40 hover:text-[#333333] hover:bg-[#A3B1A1]/10 transition-all duration-500 w-full"
                onClick={() => setIsCollapsed(false)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-4 py-8 space-y-2">
            {sidebarItems.map((item) => {
              const isActive = pathname === item.href ||
                (item.children && item.children.some(child => pathname === child.href))
              const isExpanded = expandedItems.includes(item.href)

              return (
                <div key={item.href}>
                  <div
                    className={cn(
                      "group flex items-center gap-3 px-4 py-3.5 text-sm transition-all duration-500 cursor-pointer relative overflow-hidden",
                      isActive
                        ? "text-[#333333] font-medium bg-gradient-to-r from-[#A3B1A1]/10 to-transparent"
                        : "text-[#333333]/60 hover:text-[#333333] hover:bg-[#F8F8F8]/50 font-light",
                      isCollapsed && "justify-center px-3"
                    )}
                    onClick={() => {
                      if (item.children && !isCollapsed) {
                        toggleExpanded(item.href)
                      }
                    }}
                  >
                    {/* Active indicator */}
                    {isActive && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#A3B1A1] to-[#A3B1A1]/60 transition-all duration-500" />
                    )}

                    <Link href={item.href} className="flex items-center gap-3 flex-1">
                      {isCollapsed ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className={cn(
                              "transition-all duration-500 transform",
                              isActive ? "text-[#A3B1A1] scale-110" : "text-[#333333]/40 group-hover:scale-105"
                            )}>
                              {item.icon}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent side="right">
                            <span className="uppercase tracking-[0.15em] text-[10px]">{item.title}</span>
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        <span className={cn(
                          "transition-all duration-500 transform",
                          isActive ? "text-[#A3B1A1] scale-110" : "text-[#333333]/40 group-hover:scale-105"
                        )}>
                          {item.icon}
                        </span>
                      )}

                      {!isCollapsed && (
                        <div className="flex items-center justify-between flex-1">
                          <span className="font-lato tracking-wide transition-all duration-500">{item.title}</span>
                          {item.badge && (
                            <span className="ml-auto px-2.5 py-1 text-[10px] bg-gradient-to-r from-[#C4886F]/10 to-[#C4886F]/5 text-[#C4886F] border border-[#C4886F]/20 font-lato tracking-[0.15em] uppercase shadow-sm">
                              {item.badge}
                            </span>
                          )}
                        </div>
                      )}
                    </Link>

                    {/* Expand indicator for items with children */}
                    {item.children && !isCollapsed && (
                      <ChevronRight className={cn(
                        "h-3 w-3 text-[#333333]/30 transition-all duration-500",
                        isExpanded && "rotate-90 text-[#A3B1A1]"
                      )} />
                    )}
                  </div>

                  {/* Children items */}
                  {item.children && !isCollapsed && (
                    <div className={cn(
                      "overflow-hidden transition-all duration-500 ease-out",
                      isExpanded ? "max-h-48 opacity-100" : "max-h-0 opacity-0"
                    )}>
                      <div className="ml-12 mt-2 space-y-1 pb-2">
                        {item.children.map((child) => {
                          const isChildActive = pathname === child.href
                          return (
                            <Link
                              key={child.href}
                              href={child.href}
                              className={cn(
                                "block px-4 py-2.5 text-xs font-lato transition-all duration-300 relative",
                                isChildActive
                                  ? "text-[#A3B1A1] font-medium pl-6"
                                  : "text-[#333333]/50 hover:text-[#333333] hover:pl-5"
                              )}
                            >
                              {isChildActive && (
                                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-[#A3B1A1] rounded-full" />
                              )}
                              {child.title}
                            </Link>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </nav>

          {/* User Section */}
          <div className="border-t border-[#A3B1A1]/10 p-6 bg-gradient-to-t from-[#F8F8F8]/30 to-transparent">
            <div className={cn(
              "flex items-center gap-3",
              isCollapsed && "justify-center flex-col gap-3"
            )}>
              <div className="h-12 w-12 bg-gradient-to-br from-[#F8F8F8] to-white border border-[#A3B1A1]/20 flex items-center justify-center shadow-sm transition-transform duration-300 hover:scale-105">
                <User className="h-5 w-5 text-[#333333]/60" />
              </div>
              {!isCollapsed && (
                <div className="flex-1">
                  <p className="text-sm font-lato text-[#333333] font-medium">Sofía Mendoza</p>
                  <p className="text-xs font-lato text-[#333333]/50">Mi espacio creativo</p>
                </div>
              )}
              {!isCollapsed && (
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-[#333333]/40 hover:text-[#333333] hover:bg-[#A3B1A1]/10 transition-all duration-300"
                  >
                    <Settings className="h-3 w-3" />
                  </Button>
                  <LogoutButton
                    iconOnly
                    className="h-8 w-8 text-[#333333]/40 hover:text-[#C4886F] hover:bg-[#C4886F]/10 transition-all duration-300"
                  />
                </div>
              )}
              {isCollapsed && (
                <div className="flex flex-col gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-[#333333]/40 hover:text-[#333333] hover:bg-[#A3B1A1]/10 transition-all duration-300"
                      >
                        <Settings className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <span className="uppercase tracking-[0.15em] text-[10px]">Configuración</span>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <LogoutButton
                        iconOnly
                        className="h-8 w-8 text-[#333333]/40 hover:text-[#C4886F] hover:bg-[#C4886F]/10 transition-all duration-300"
                      />
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <span className="uppercase tracking-[0.15em] text-[10px]">Cerrar sesión</span>
                    </TooltipContent>
                  </Tooltip>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>
    </TooltipProvider>
  )
}