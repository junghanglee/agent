'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ADMIN_ROLE_PERMISSIONS, type AdminRole, type AdminPermission } from '@/lib/admin-permissions'
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
  ClipboardList,
  Puzzle,
  MessageSquare,
  Globe,
  Settings,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { AILinkerLogo } from '@/components/brand/ai-linker-logo'
import { useState } from 'react'

const navItems: Array<{ href: string; label: string; icon: React.ElementType; permission: AdminPermission }> = [
  { href: '/admin', label: '대시보드', icon: LayoutDashboard, permission: 'DASHBOARD_READ' },
  { href: '/admin/customers', label: '고객관리', icon: Users, permission: 'CUSTOMERS_READ' },
  { href: '/admin/products', label: '상품관리', icon: Package, permission: 'PRODUCTS_MANAGE' },
  { href: '/admin/releases', label: '릴리즈관리', icon: GitBranch, permission: 'RELEASES_MANAGE' },
  { href: '/admin/licenses', label: '설치코드/라이선스', icon: KeyRound, permission: 'LICENSES_MANAGE' },
  { href: '/admin/payments', label: '결제관리', icon: CreditCard, permission: 'PAYMENTS_READ' },
  { href: '/admin/tokens', label: '토큰/크레딧', icon: Coins, permission: 'TOKENS_READ' },
  { href: '/admin/llm-pool', label: 'LLM 계정 Pool', icon: Server, permission: 'LLM_POOL_READ' },
  { href: '/admin/monitoring', label: '사용량 모니터링', icon: Activity, permission: 'MONITORING_READ' },
  { href: '/admin/audit', label: '감사로그', icon: ClipboardList, permission: 'AUDIT_READ' },
  { href: '/admin/skills', label: 'Skill/컴포넌트', icon: Puzzle, permission: 'SKILLS_MANAGE' },
  { href: '/admin/support', label: '상담/채팅', icon: MessageSquare, permission: 'SUPPORT_MANAGE' },
  { href: '/admin/community', label: '커뮤니티 관리', icon: Globe, permission: 'COMMUNITY_MANAGE' },
  { href: '/admin/admin-users', label: '관리자 계정', icon: ShieldCheck, permission: 'ADMIN_USERS_MANAGE' },
  { href: '/admin/settings', label: '시스템 설정', icon: Settings, permission: 'SETTINGS_MANAGE' },
]

export function AdminSidebar({ role }: { role: AdminRole }) {
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
        {collapsed ? (
          <AILinkerLogo href="/admin" variant="mark" size="sm" className="h-8 w-8" />
        ) : (
          <div>
            <AILinkerLogo href="/admin" variant="light" size="sm" />
            <span className="block text-[10px] text-sidebar-foreground/50 mt-0.5">관리자</span>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {navItems.filter((item) => ADMIN_ROLE_PERMISSIONS[role].includes(item.permission)).map((item) => {
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
