'use client'

import { useState } from 'react'
import { StatusBadge } from '@/components/admin/status-badge'
import { CustomerDrawer } from '@/components/admin/customer-drawer'
import { Search, Filter, UserPlus, ChevronDown } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const customers = [
  {
    id: 'USR-001',
    name: '김민준',
    email: 'minjun.kim@email.com',
    joinedAt: '2024-10-05',
    agents: 3,
    tokenBalance: '48,200',
    totalPaid: '₩357,000',
    licenseStatus: 'active' as const,
    lastSeen: '방금 전',
  },
  {
    id: 'USR-002',
    name: '이서연',
    email: 'seoyeon.lee@email.com',
    joinedAt: '2024-11-12',
    agents: 2,
    tokenBalance: '12,500',
    totalPaid: '₩228,000',
    licenseStatus: 'active' as const,
    lastSeen: '32분 전',
  },
  {
    id: 'USR-003',
    name: '박도현',
    email: 'dohyun.park@email.com',
    joinedAt: '2024-09-20',
    agents: 1,
    tokenBalance: '0',
    totalPaid: '₩99,000',
    licenseStatus: 'expired' as const,
    lastSeen: '3일 전',
  },
  {
    id: 'USR-004',
    name: '최수아',
    email: 'sua.choi@email.com',
    joinedAt: '2024-12-01',
    agents: 4,
    tokenBalance: '95,800',
    totalPaid: '₩516,000',
    licenseStatus: 'active' as const,
    lastSeen: '1시간 전',
  },
  {
    id: 'USR-005',
    name: '정예준',
    email: 'yejun.jung@email.com',
    joinedAt: '2024-08-15',
    agents: 2,
    tokenBalance: '3,100',
    totalPaid: '₩178,000',
    licenseStatus: 'suspended' as const,
    lastSeen: '7일 전',
  },
  {
    id: 'USR-006',
    name: '윤하늘',
    email: 'haneul.yoon@email.com',
    joinedAt: '2025-01-02',
    agents: 1,
    tokenBalance: '9,800',
    totalPaid: '₩89,000',
    licenseStatus: 'active' as const,
    lastSeen: '어제',
  },
  {
    id: 'USR-007',
    name: '강지호',
    email: 'jiho.kang@email.com',
    joinedAt: '2024-11-28',
    agents: 3,
    tokenBalance: '22,400',
    totalPaid: '₩267,000',
    licenseStatus: 'active' as const,
    lastSeen: '4시간 전',
  },
  {
    id: 'USR-008',
    name: '조민서',
    email: 'minseo.jo@email.com',
    joinedAt: '2024-07-10',
    agents: 5,
    tokenBalance: '134,000',
    totalPaid: '₩890,000',
    licenseStatus: 'active' as const,
    lastSeen: '2시간 전',
  },
]

export default function CustomersPage() {
  const [search, setSearch] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState<typeof customers[0] | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const filtered = customers.filter(
    (c) =>
      c.name.includes(search) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.id.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">고객관리</h1>
          <p className="text-sm text-muted-foreground mt-0.5">전체 고객 {customers.length}명</p>
        </div>
        <Button size="sm" className="gap-1.5">
          <UserPlus className="w-3.5 h-3.5" />
          고객 추가
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="이름, 이메일, ID 검색..."
            className="pl-9 h-8 text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="outline" size="sm" className="gap-1.5 h-8">
          <Filter className="w-3.5 h-3.5" />
          필터
          <ChevronDown className="w-3 h-3" />
        </Button>
      </div>

      {/* Table */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">고객ID / 이름</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">이메일</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">가입일</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground">보유 Agent</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">토큰 잔액</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">결제금액</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground">라이선스</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">최근 접속</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((customer) => (
                <tr
                  key={customer.id}
                  className="border-b border-border/50 hover:bg-muted/30 transition-colors cursor-pointer"
                  onClick={() => {
                    setSelectedCustomer(customer)
                    setDrawerOpen(true)
                  }}
                >
                  <td className="px-4 py-3">
                    <div className="font-medium text-foreground">{customer.name}</div>
                    <div className="text-muted-foreground font-mono mt-0.5">{customer.id}</div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{customer.email}</td>
                  <td className="px-4 py-3 text-muted-foreground">{customer.joinedAt}</td>
                  <td className="px-4 py-3 text-center font-medium">{customer.agents}</td>
                  <td className="px-4 py-3 text-right font-medium tabular-nums">{customer.tokenBalance}</td>
                  <td className="px-4 py-3 text-right font-medium">{customer.totalPaid}</td>
                  <td className="px-4 py-3 text-center">
                    <StatusBadge status={customer.licenseStatus} />
                  </td>
                  <td className="px-4 py-3 text-right text-muted-foreground">{customer.lastSeen}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Drawer */}
      {selectedCustomer && (
        <CustomerDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          customer={selectedCustomer}
        />
      )}
    </div>
  )
}
