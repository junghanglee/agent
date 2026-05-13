import { StatusBadge } from '@/components/admin/status-badge'
import { Button } from '@/components/ui/button'
import { prisma } from '@/lib/prisma'
import { formatKrw, statusToBadge } from '@/lib/admin-format'
import { Plus, Edit2, Eye, Monitor, Apple, Smartphone, Globe } from 'lucide-react'

function parseJsonArray(value: string) {
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed.map(String) : []
  } catch {
    return []
  }
}

function PlatformIcon({ platform }: { platform: string }) {
  if (platform === 'WINDOWS') return <Monitor className="w-3.5 h-3.5 text-blue-500" title="Windows" />
  if (platform === 'MACOS') return <Apple className="w-3.5 h-3.5 text-gray-500" title="macOS" />
  if (platform === 'IOS' || platform === 'ANDROID') return <Smartphone className="w-3.5 h-3.5 text-violet-500" title={platform} />
  return <Globe className="w-3.5 h-3.5 text-cyan-500" title={platform} />
}

export default async function ProductsPage() {
  const products = await prisma.agentProduct.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { purchases: true, licenses: true, releases: true } },
    },
  })

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">상품관리</h1>
          <p className="text-sm text-muted-foreground mt-0.5">AI Agent 상품 {products.length}개 — DB 실데이터</p>
        </div>
        <Button size="sm" className="gap-1.5" disabled title="Gate 4에서 CRUD 연결">
          <Plus className="w-3.5 h-3.5" />
          상품 추가
        </Button>
      </div>

      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">상품</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">카테고리</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">태그</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">지원 OS</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">가격</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground">구매</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground">라이선스</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground">상태</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground">관리</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const tags = parseJsonArray(product.purposeTags)
                const platforms = parseJsonArray(product.supportedPlatforms)

                return (
                  <tr key={product.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">{product.name}</p>
                      <p className="text-muted-foreground font-mono mt-0.5">{product.slug}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-[11px] font-medium">{product.category}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {tags.map((tag) => <span key={tag} className="bg-muted text-muted-foreground px-1.5 py-0.5 rounded text-[10px]">{tag}</span>)}
                      </div>
                    </td>
                    <td className="px-4 py-3"><div className="flex gap-1">{platforms.map((platform) => <PlatformIcon key={platform} platform={platform} />)}</div></td>
                    <td className="px-4 py-3 text-right font-medium">{formatKrw(product.price)}</td>
                    <td className="px-4 py-3 text-center font-medium">{product._count.purchases.toLocaleString()}</td>
                    <td className="px-4 py-3 text-center font-medium">{product._count.licenses.toLocaleString()}</td>
                    <td className="px-4 py-3 text-center"><StatusBadge status={statusToBadge(product.status)} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground" title="Gate 4에서 수정 연결"><Edit2 className="w-3.5 h-3.5" /></button>
                        <button className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground" title="상세 보기"><Eye className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
