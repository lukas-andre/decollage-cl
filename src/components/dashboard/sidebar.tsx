'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  Home, 
  FolderOpen, 
  Palette, 
  Layers, 
  Settings, 
  CreditCard,
  BarChart3,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Package,
  ImageIcon
} from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { LogoutButton } from '@/components/dashboard/logout-button'

interface SidebarItem {
  title: string
  href: string
  icon: React.ReactNode
  badge?: string
  subItems?: { title: string; href: string }[]
}

const sidebarItems: SidebarItem[] = [
  {
    title: 'Panel Principal',
    href: '/dashboard',
    icon: <Home className="h-5 w-5" />
  },
  {
    title: 'Proyectos',
    href: '/dashboard/projects',
    icon: <FolderOpen className="h-5 w-5" />,
    subItems: [
      { title: 'Todos los Proyectos', href: '/dashboard/projects' },
      { title: 'Plantillas', href: '/dashboard/projects/templates' }
    ]
  },
  {
    title: 'Estilos',
    href: '/dashboard/styles',
    icon: <Palette className="h-5 w-5" />,
    badge: 'Nuevo'
  },
  {
    title: 'Galería',
    href: '/dashboard/gallery',
    icon: <ImageIcon className="h-5 w-5" />
  },
  {
    title: 'Tokens',
    href: '/dashboard/tokens',
    icon: <CreditCard className="h-5 w-5" />
  },
  {
    title: 'Análisis',
    href: '/dashboard/analytics',
    icon: <BarChart3 className="h-5 w-5" />
  },
  {
    title: 'Configuración',
    href: '/dashboard/settings',
    icon: <Settings className="h-5 w-5" />
  }
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [expandedItems, setExpandedItems] = useState<string[]>([])

  const toggleExpanded = (href: string) => {
    setExpandedItems(prev => 
      prev.includes(href) 
        ? prev.filter(h => h !== href)
        : [...prev, href]
    )
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden fixed top-4 left-4 z-50 bg-white shadow-md"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Overlay for mobile */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed left-0 top-0 h-full bg-gradient-to-b from-slate-900 to-slate-950 text-white transition-all duration-300 z-40",
        isCollapsed ? "w-16" : "w-64",
        isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="flex h-full flex-col">
          {/* Logo Section */}
          <div className="flex h-16 items-center justify-between px-4 border-b border-slate-800">
            <Link 
              href="/dashboard" 
              className={cn(
                "flex items-center gap-2 font-bold text-lg transition-opacity",
                isCollapsed && "opacity-0"
              )}
            >
              <Sparkles className="h-6 w-6 text-blue-400" />
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                VirtualStaging
              </span>
            </Link>
            
            <Button
              variant="ghost"
              size="icon"
              className="hidden lg:flex text-slate-400 hover:text-white hover:bg-slate-800"
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-1">
              {sidebarItems.map((item) => {
                const isActive = pathname === item.href || 
                                (item.subItems && item.subItems.some(sub => pathname === sub.href))
                const isExpanded = expandedItems.includes(item.href)

                return (
                  <li key={item.href}>
                    <div className="relative">
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                          isActive 
                            ? "bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-white border-l-4 border-blue-400" 
                            : "text-slate-300 hover:text-white hover:bg-slate-800/50",
                          isCollapsed && "justify-center"
                        )}
                        onClick={(e) => {
                          if (item.subItems && !isCollapsed) {
                            e.preventDefault()
                            toggleExpanded(item.href)
                          }
                        }}
                      >
                        <span className={cn(
                          "flex items-center justify-center",
                          isActive && "text-blue-400"
                        )}>
                          {item.icon}
                        </span>
                        {!isCollapsed && (
                          <>
                            <span className="flex-1">{item.title}</span>
                            {item.badge && (
                              <span className={cn(
                                "px-2 py-0.5 text-xs rounded-full font-semibold",
                                item.badge === 'Nuevo' 
                                  ? "bg-green-500/20 text-green-400 border border-green-500/30"
                                  : "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                              )}>
                                {item.badge}
                              </span>
                            )}
                            {item.subItems && (
                              <ChevronRight className={cn(
                                "h-4 w-4 transition-transform",
                                isExpanded && "rotate-90"
                              )} />
                            )}
                          </>
                        )}
                      </Link>

                      {/* Subitems */}
                      {!isCollapsed && item.subItems && isExpanded && (
                        <ul className="mt-1 ml-8 space-y-1">
                          {item.subItems.map((subItem) => (
                            <li key={subItem.href}>
                              <Link
                                href={subItem.href}
                                className={cn(
                                  "block rounded-lg px-3 py-2 text-sm transition-all duration-200",
                                  pathname === subItem.href
                                    ? "text-blue-400 bg-slate-800/50"
                                    : "text-slate-400 hover:text-white hover:bg-slate-800/30"
                                )}
                              >
                                {subItem.title}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* User Section */}
          <div className="border-t border-slate-800 p-4">
            <div className={cn(
              "flex items-center gap-3",
              isCollapsed && "justify-center"
            )}>
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-semibold">
                U
              </div>
              {!isCollapsed && (
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">Usuario</p>
                  <p className="text-xs text-slate-400">Plan Pro</p>
                </div>
              )}
              {!isCollapsed && (
                <LogoutButton className="text-slate-400 hover:text-white" />
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}