'use client'

import { useState } from 'react'
import { StatusBadge } from '@/components/admin/status-badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Search, Copy, Ban, CheckCircle, Monitor, Apple } from 'lucide-react'

const installCodes = [
  { code: 'AIL-7829-KQPL-W3X1', customer: '김민준', product: 'AI Writer Pro', os: 'Windows', status: 'active' as const, activations: '1/3', issuedAt: '2025-01-10', expiryAt: '2026-01-10' },
  { code: 'AIL-6341-MBNX-A2Y8', customer: '이서연', product: 'Sales Copilot', os: 'macOS', status: 'active' as const, activations: '2/2', issuedAt: '2025-01-09', expiryAt: '2025-07-09' },
  { code: 'AIL-5512-QZRT-K9P0', customer: '박도현', product: 'Data Analyst', os: 'Windows', status: 'pending' as const, activations: '0/1', issuedAt: '2025-01-12', expiryAt: '2026-01-12' },
  { code: 'AIL-4203-WNVS-L5M2', customer: '최수아', product: 'AI Writer Pro', os: 'Windows', status: 'active' as const, activations: '3/3', issuedAt: '2024-12-01', expiryAt: '2025-12-01' },
  { code: 'AIL-3198-BKJX-D7C4', customer: '정예준', product: 'Code Helper', os: 'Windows', status: 'suspended' as const, activations: '1/2', issuedAt: '2024-11-20', expiryAt: '2025-11-20' },
  { code: 'AIL-2087-FVNR-E3H6', customer: '윤하늘', product: 'AI Writer Pro', os: 'Windows', status: 'expired' as const, activations: '1/1', issuedAt: '2024-01-05', expiryAt: '2025-01-05' },
]

const licenses = [
  { customer: '김민준', agent: 'AI Writer Pro', status: 'active' as const, devices: '1/3', startDate: '2025-01-10', endDate: '2026-01-10' },
  { customer: '이서연', agent: 'Sales Copilot', status: 'active' as const, devices: '2/2', startDate: '2025-01-09', endDate: '2025-07-09' },
  { customer: '최수아', agent: 'AI Writer Pro', status: 'active' as const, devices: '3/3', startDate: '2024-12-01', endDate: '2025-12-01' },
  { customer: '최수아', agent: 'Data Analyst', status: 'active' as const, devices: '1/2', startDate: '2024-12-01', endDate: '2025-12-01' },
  { customer: '정예준', agent: 'Code Helper', status: 'suspended' as const, devices: '1/2', startDate: '2024-11-20', endDate: '2025-11-20' },
  { customer: '강지호', agent: 'Sales Copilot', status: 'active' as const, devices: '2/3', startDate: '2024-11-28', endDate: '2025-11-28' },
]

export default function LicensesPage() {
  const [search, setSearch] = useState('')
  const [showIssueModal, setShowIssueModal] = useState(false)

  const filteredCodes = installCodes.filter(
    (c) => c.customer.includes(search) || c.code.toLowerCase().includes(search.toLowerCase()) || c.product.includes(search)
  )

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">설치코드 / 라이선스</h1>
          <p className="text-sm text-muted-foreground mt-0.5">설치 코드 {installCodes.length}개 · 라이선스 {licenses.length}개</p>
        </div>
        <Button size="sm" className="gap-1.5" onClick={() => setShowIssueModal(true)}>
          <Plus className="w-3.5 h-3.5" />
          코드 발급
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        <Input placeholder="고객, 코드, 상품 검색..." className="pl-9 h-8 text-sm" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <Tabs defaultValue="codes">
        <TabsList>
          <TabsTrigger value="codes" className="text-xs">설치코드</TabsTrigger>
          <TabsTrigger value="licenses" className="text-xs">라이선스</TabsTrigger>
        </TabsList>

        <TabsContent value="codes" className="mt-4">
          <div className="bg-card rounded-lg border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">코드</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">고객</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">상품</th>
                    <th className="text-center px-4 py-3 font-medium text-muted-foreground">OS</th>
                    <th className="text-center px-4 py-3 font-medium text-muted-foreground">상태</th>
                    <th className="text-center px-4 py-3 font-medium text-muted-foreground">활성화</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">발급일</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">만료일</th>
                    <th className="text-center px-4 py-3 font-medium text-muted-foreground">액션</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCodes.map((item) => (
                    <tr key={item.code} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-mono text-muted-foreground">{item.code}</td>
                      <td className="px-4 py-3 font-medium">{item.customer}</td>
                      <td className="px-4 py-3 text-muted-foreground">{item.product}</td>
                      <td className="px-4 py-3 text-center">
                        {item.os === 'Windows' ? <Monitor className="w-3.5 h-3.5 text-blue-500 mx-auto" /> : <Apple className="w-3.5 h-3.5 text-gray-500 mx-auto" />}
                      </td>
                      <td className="px-4 py-3 text-center"><StatusBadge status={item.status} /></td>
                      <td className="px-4 py-3 text-center font-medium tabular-nums">{item.activations}</td>
                      <td className="px-4 py-3 text-muted-foreground">{item.issuedAt}</td>
                      <td className="px-4 py-3 text-muted-foreground">{item.expiryAt}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <button className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground" title="코드 복사">
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-rose-600" title="코드 정지">
                            <Ban className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="licenses" className="mt-4">
          <div className="bg-card rounded-lg border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">고객</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Agent</th>
                    <th className="text-center px-4 py-3 font-medium text-muted-foreground">상태</th>
                    <th className="text-center px-4 py-3 font-medium text-muted-foreground">디바이스</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">시작일</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">종료일</th>
                    <th className="text-center px-4 py-3 font-medium text-muted-foreground">액션</th>
                  </tr>
                </thead>
                <tbody>
                  {licenses.map((lic, i) => (
                    <tr key={i} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-medium">{lic.customer}</td>
                      <td className="px-4 py-3 text-muted-foreground">{lic.agent}</td>
                      <td className="px-4 py-3 text-center"><StatusBadge status={lic.status} /></td>
                      <td className="px-4 py-3 text-center font-medium tabular-nums">{lic.devices}</td>
                      <td className="px-4 py-3 text-muted-foreground">{lic.startDate}</td>
                      <td className="px-4 py-3 text-muted-foreground">{lic.endDate}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <button className="p-1.5 rounded hover:bg-muted transition-colors text-emerald-600 hover:bg-emerald-50" title="라이선스 활성화">
                            <CheckCircle className="w-3.5 h-3.5" />
                          </button>
                          <button className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-rose-600" title="라이선스 정지">
                            <Ban className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {showIssueModal && <IssueCodeModal onClose={() => setShowIssueModal(false)} />}
    </div>
  )
}

function IssueCodeModal({ onClose }: { onClose: () => void }) {
  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-card rounded-xl border border-border w-full max-w-sm shadow-2xl">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="text-sm font-bold">설치코드 발급</h2>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-sm">✕</button>
          </div>
          <div className="p-5 space-y-4">
            {[
              { label: '고객', type: 'select', options: ['김민준', '이서연', '박도현', '최수아'] },
              { label: '상품', type: 'select', options: ['AI Writer Pro', 'Sales Copilot', 'Data Analyst'] },
            ].map(({ label, options }) => (
              <div key={label}>
                <label className="text-xs font-medium text-foreground block mb-1.5">{label}</label>
                <select className="w-full h-8 bg-background border border-border rounded-md px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary">
                  {options.map((o) => <option key={o}>{o}</option>)}
                </select>
              </div>
            ))}
            <div>
              <label className="text-xs font-medium text-foreground block mb-1.5">OS</label>
              <div className="flex gap-4">
                {['Windows', 'macOS'].map((os) => (
                  <label key={os} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="radio" name="os" defaultChecked={os === 'Windows'} />
                    {os}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-foreground block mb-1.5">최대 활성화 수</label>
              <Input className="h-8 text-sm" placeholder="1" type="number" />
            </div>
          </div>
          <div className="flex justify-end gap-2 px-5 pb-5">
            <Button variant="outline" size="sm" onClick={onClose}>취소</Button>
            <Button size="sm">발급</Button>
          </div>
        </div>
      </div>
    </>
  )
}
