import { StatusBadge } from '@/components/admin/status-badge'
import { ReleaseArchiveButton, ReleaseCreateButton, ReleaseDownloadButton, ReleaseEditButton, ReleasePublishToggleButton } from '@/components/admin/release-actions'
import { requireAdminPagePermission } from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'
import { formatBytes, formatDate, statusToBadge } from '@/lib/admin-format'
import { Star } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function ReleasesPage() {
  await requireAdminPagePermission('RELEASES_MANAGE')

  const [releases, products] = await Promise.all([
    prisma.agentRelease.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        agentProduct: { select: { id: true, name: true, slug: true } },
        installerFile: true,
      },
    }),
    prisma.agentProduct.findMany({
      where: { status: { not: 'ARCHIVED' } },
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
    }),
  ])

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">릴리즈관리</h1>
          <p className="text-sm text-muted-foreground mt-0.5">AI Agent 인스톨러 빌드 {releases.length}개 — 업로드/수정 가능</p>
        </div>
        <ReleaseCreateButton products={products} />
      </div>

      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Agent</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">OS</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">버전</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">파일명</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">크기</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">SHA256</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground">최신</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground">공개</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">업로드일</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground">액션</th>
              </tr>
            </thead>
            <tbody>
              {releases.map((release) => (
                <tr key={release.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3"><p className="font-medium">{release.agentProduct.name}</p><p className="font-mono text-muted-foreground mt-0.5">{release.agentProduct.slug}</p></td>
                  <td className="px-4 py-3"><span className="px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-700">{release.platform}</span></td>
                  <td className="px-4 py-3 font-mono font-semibold text-primary">v{release.version}</td>
                  <td className="px-4 py-3 font-mono text-muted-foreground max-w-[220px] truncate">{release.installerFile?.fileName ?? '파일 미연결'}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">{formatBytes(release.installerFile?.sizeBytes)}</td>
                  <td className="px-4 py-3 font-mono text-muted-foreground">{release.installerFile?.sha256.slice(0, 12) ?? '—'}</td>
                  <td className="px-4 py-3 text-center">{release.isLatest && <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-violet-50 text-violet-700 text-[11px] font-medium border border-violet-200"><Star className="w-2.5 h-2.5" />최신</span>}</td>
                  <td className="px-4 py-3 text-center"><StatusBadge status={statusToBadge(release.status)} /></td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(release.createdAt)}</td>
                  <td className="px-4 py-3"><div className="flex items-center justify-center gap-1"><ReleaseDownloadButton url={release.installerFile?.downloadUrl} /><ReleasePublishToggleButton id={release.id} status={release.status} /><ReleaseEditButton products={products} release={{ id: release.id, agentProductId: release.agentProductId, platform: release.platform, version: release.version, releaseNotes: release.releaseNotes, status: release.status, isLatest: release.isLatest, isRequired: release.isRequired, installerFile: release.installerFile ? { fileName: release.installerFile.fileName, storageKey: release.installerFile.storageKey, downloadUrl: release.installerFile.downloadUrl, sizeBytes: release.installerFile.sizeBytes, sha256: release.installerFile.sha256 } : null }} /><ReleaseArchiveButton id={release.id} /></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
