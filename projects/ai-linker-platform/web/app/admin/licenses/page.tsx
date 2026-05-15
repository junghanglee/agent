import { StatusBadge } from '@/components/admin/status-badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CopyInstallCodeButton, IssueInstallCodeButton, LicenseActivateButton, LicenseSuspendButton, RevokeInstallCodeButton } from '@/components/admin/license-actions'
import { searchLicensesAction } from '@/lib/admin-actions'
import { requireAdminPagePermission } from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'
import { formatDate, statusToBadge } from '@/lib/admin-format'
import { Search, Monitor, Apple, Smartphone, Globe } from 'lucide-react'

export const dynamic = 'force-dynamic'

function PlatformIcon({ platform }: { platform?: string | null }) {
  if (platform === 'WINDOWS') return <Monitor className="w-3.5 h-3.5 text-blue-500 mx-auto" />
  if (platform === 'MACOS') return <Apple className="w-3.5 h-3.5 text-gray-500 mx-auto" />
  if (platform === 'IOS' || platform === 'ANDROID') return <Smartphone className="w-3.5 h-3.5 text-violet-500 mx-auto" />
  return <Globe className="w-3.5 h-3.5 text-cyan-500 mx-auto" />
}

export default async function LicensesPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  await requireAdminPagePermission('LICENSES_MANAGE')

  const { q = '' } = await searchParams
  const query = q.trim()

  const [installCodes, licenses, paidPurchases] = await Promise.all([
    prisma.installCode.findMany({
      where: query ? { OR: [{ code: { contains: query } }, { user: { name: { contains: query } } }, { user: { email: { contains: query } } }, { purchase: { agentProduct: { name: { contains: query } } } }] } : undefined,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, email: true } }, purchase: { include: { agentProduct: { select: { name: true } } } }, license: { include: { deviceActivations: true } } },
    }),
    prisma.license.findMany({
      where: query ? { OR: [{ user: { name: { contains: query } } }, { user: { email: { contains: query } } }, { agentProduct: { name: { contains: query } } }, { installCode: { code: { contains: query } } }] } : undefined,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, email: true } }, agentProduct: { select: { name: true } }, installCode: { include: { purchase: true } }, deviceActivations: true },
    }),
    prisma.purchase.findMany({ where: { status: 'PAID', agentProductId: { not: null }, installCodes: { none: {} } }, orderBy: { createdAt: 'desc' }, take: 20, include: { user: true, agentProduct: true } }),
  ])

  const purchaseOptions = paidPurchases.map((purchase) => ({ id: purchase.id, label: `${purchase.user.name} · ${purchase.agentProduct?.name ?? '상품 없음'} · ${formatDate(purchase.createdAt)}` }))

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">설치코드 / 라이선스</h1>
          <p className="text-sm text-muted-foreground mt-0.5">설치 코드 {installCodes.length}개 · 라이선스 {licenses.length}개 · 미발급 구매 {paidPurchases.length}개 — 발급/상태 변경 가능</p>
        </div>
        <IssueInstallCodeButton purchases={purchaseOptions} />
      </div>

      <form action={searchLicensesAction} className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        <Input name="q" defaultValue={query} placeholder="고객, 코드, 상품 검색..." className="pl-9 h-8 text-sm" />
      </form>

      <Tabs defaultValue="codes">
        <TabsList><TabsTrigger value="codes" className="text-xs">설치코드</TabsTrigger><TabsTrigger value="licenses" className="text-xs">라이선스</TabsTrigger><TabsTrigger value="issuable" className="text-xs">미발급 구매</TabsTrigger></TabsList>

        <TabsContent value="codes" className="mt-4">
          <div className="bg-card rounded-lg border border-border overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-xs"><thead><tr className="border-b border-border bg-muted/40"><th className="text-left px-4 py-3 font-medium text-muted-foreground">코드</th><th className="text-left px-4 py-3 font-medium text-muted-foreground">고객</th><th className="text-left px-4 py-3 font-medium text-muted-foreground">상품</th><th className="text-center px-4 py-3 font-medium text-muted-foreground">OS</th><th className="text-center px-4 py-3 font-medium text-muted-foreground">상태</th><th className="text-center px-4 py-3 font-medium text-muted-foreground">활성화</th><th className="text-left px-4 py-3 font-medium text-muted-foreground">발급일</th><th className="text-left px-4 py-3 font-medium text-muted-foreground">만료일</th><th className="text-center px-4 py-3 font-medium text-muted-foreground">액션</th></tr></thead><tbody>{installCodes.map((item) => (<tr key={item.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors"><td className="px-4 py-3 font-mono text-muted-foreground">{item.code}</td><td className="px-4 py-3"><p className="font-medium">{item.user.name}</p><p className="text-muted-foreground mt-0.5">{item.user.email}</p></td><td className="px-4 py-3 text-muted-foreground">{item.purchase.agentProduct?.name ?? '—'}</td><td className="px-4 py-3 text-center"><PlatformIcon platform={item.purchase.platform} /></td><td className="px-4 py-3 text-center"><StatusBadge status={statusToBadge(item.status)} /></td><td className="px-4 py-3 text-center font-medium tabular-nums">{item.usedActivations}/{item.maxActivations}</td><td className="px-4 py-3 text-muted-foreground">{formatDate(item.createdAt)}</td><td className="px-4 py-3 text-muted-foreground">{formatDate(item.expiresAt)}</td><td className="px-4 py-3"><div className="flex items-center justify-center gap-1"><CopyInstallCodeButton code={item.code} /><RevokeInstallCodeButton id={item.id} /></div></td></tr>))}</tbody></table></div></div>
        </TabsContent>

        <TabsContent value="licenses" className="mt-4">
          <div className="bg-card rounded-lg border border-border overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-xs"><thead><tr className="border-b border-border bg-muted/40"><th className="text-left px-4 py-3 font-medium text-muted-foreground">고객</th><th className="text-left px-4 py-3 font-medium text-muted-foreground">Agent</th><th className="text-center px-4 py-3 font-medium text-muted-foreground">상태</th><th className="text-center px-4 py-3 font-medium text-muted-foreground">디바이스</th><th className="text-left px-4 py-3 font-medium text-muted-foreground">시작일</th><th className="text-left px-4 py-3 font-medium text-muted-foreground">종료일</th><th className="text-center px-4 py-3 font-medium text-muted-foreground">액션</th></tr></thead><tbody>{licenses.map((license) => (<tr key={license.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors"><td className="px-4 py-3"><p className="font-medium">{license.user.name}</p><p className="text-muted-foreground mt-0.5">{license.user.email}</p></td><td className="px-4 py-3 text-muted-foreground">{license.agentProduct.name}</td><td className="px-4 py-3 text-center"><StatusBadge status={statusToBadge(license.status)} /></td><td className="px-4 py-3 text-center font-medium tabular-nums">{license.deviceActivations.length}/{license.installCode.maxActivations}</td><td className="px-4 py-3 text-muted-foreground">{formatDate(license.startsAt)}</td><td className="px-4 py-3 text-muted-foreground">{formatDate(license.endsAt)}</td><td className="px-4 py-3"><div className="flex items-center justify-center gap-1"><LicenseActivateButton id={license.id} /><LicenseSuspendButton id={license.id} /></div></td></tr>))}</tbody></table></div></div>
        </TabsContent>

        <TabsContent value="issuable" className="mt-4">
          <div className="bg-card rounded-lg border border-border overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-xs"><thead><tr className="border-b border-border bg-muted/40"><th className="text-left px-4 py-3 font-medium text-muted-foreground">구매ID</th><th className="text-left px-4 py-3 font-medium text-muted-foreground">고객</th><th className="text-left px-4 py-3 font-medium text-muted-foreground">상품</th><th className="text-center px-4 py-3 font-medium text-muted-foreground">OS</th><th className="text-left px-4 py-3 font-medium text-muted-foreground">구매일</th></tr></thead><tbody>{paidPurchases.map((purchase) => (<tr key={purchase.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors"><td className="px-4 py-3 font-mono text-muted-foreground">{purchase.id}</td><td className="px-4 py-3 font-medium">{purchase.user.name}</td><td className="px-4 py-3 text-muted-foreground">{purchase.agentProduct?.name ?? '—'}</td><td className="px-4 py-3"><PlatformIcon platform={purchase.platform} /></td><td className="px-4 py-3 text-muted-foreground">{formatDate(purchase.createdAt)}</td></tr>))}</tbody></table></div></div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
