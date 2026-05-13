'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Users,
  Package,
  GitBranch,
  KeyRound,
  CreditCard,
  Coins,
  Server,
  Activity,
  Puzzle,
  MessageSquare,
  Globe,
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap,
} from 'lucide-react'
import { useState } from 'react'

const navItems = [
  { href: '/admin', label: '대시보드', icon: LayoutDashboard },
  { href: '/admin/customers', label: '고객관리', icon: Users },
  { href: '/admin/products', label: '상품관리', icon: Package },
  { href: '/admin/releases', label: '릴리즈관리', icon: GitBranch },
  { href: '/admin/licenses', label: '설치코드/라이선스', icon: KeyRound },
  { href: '/admin/payments', label: '결제관리', icon: CreditCard },
  { href: '/admin/tokens', label: '토큰/크레딧', icon: Coins },
  { href: '/admin/llm-pool', label: 'LLM 계정 Pool', icon: Server },
  { href: '/admin/monitoring', label: '사용량 모니터링', icon: Activity },
  { href: '/admin/skills', label: 'Skill/컴포넌트', icon: Puzzle },
  { href: '/admin/support', label: '상담/채팅', icon: MessageSquare },
  { href: '/admin/community', label: '커뮤니티 관리', icon: Globe },
  { href: '/admin/settings', label: '시스템 설정', icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        'flex flex-col h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 shrink-0',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Logo */}
      <div className={cn('flex items-center gap-2.5 px-4 h-14 border-b border-sidebar-border', collapsed && 'justify-center px-0')}>
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary shrink-0">
          <Zap className="w-4 h-4 text-primary-foreground" />
        </div>
        {!collapsed && (
          <div>
            <span className="text-sidebar-foreground font-bold text-sm leading-none">AI Linker</span>
            <span className="block text-[10px] text-sidebar-foreground/50 mt-0.5">관리자</span>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground border-l-2 border-primary'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground',
                collapsed && 'justify-center px-0'
              )}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="p-2 border-t border-sidebar-border">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            'flex items-center justify-center w-full h-8 rounded-md text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent/60 transition-colors',
          )}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  )
}
