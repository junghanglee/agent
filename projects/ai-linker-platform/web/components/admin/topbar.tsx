'use client'

import { Bell, Search, ChevronDown } from 'lucide-react'
import { adminLogoutAction } from '@/lib/admin-auth-actions'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function AdminTopbar({ admin }: { admin: { name: string; email: string; role: string } }) {
  const initials = admin.name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase() || 'AD'

  return (
    <header className="h-14 border-b border-border bg-card flex items-center justify-between px-6 shrink-0">
      {/* Search */}
      <div className="relative w-80">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="검색..."
          className="pl-9 h-8 text-sm bg-muted/50 border-border/60"
        />
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-3">
        {/* Environment Badge */}
        <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/30 text-xs font-medium px-2 py-0.5 rounded-full">
          Production
        </Badge>

        {/* Notifications */}
        <button className="relative p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-destructive rounded-full" />
        </button>

        {/* Admin profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 hover:bg-muted rounded-md px-2 py-1.5 transition-colors">
              <Avatar className="w-7 h-7">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">{initials}</AvatarFallback>
              </Avatar>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-medium leading-none">{admin.name}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{admin.email}</p>
              </div>
              <ChevronDown className="w-3 h-3 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel className="text-xs">내 계정</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-sm">프로필 설정</DropdownMenuItem>
            <DropdownMenuItem className="text-sm">보안</DropdownMenuItem>
            <DropdownMenuSeparator />
            <form action={adminLogoutAction}>
              <DropdownMenuItem className="text-sm text-destructive" asChild>
                <button type="submit" className="w-full">로그아웃</button>
              </DropdownMenuItem>
            </form>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
