'use client'

import { useState } from 'react'
import { StatusBadge } from '@/components/admin/status-badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Upload, Download, Globe, EyeOff, Star } from 'lucide-react'

const releases = [
  {
    id: 'REL-001',
    agent: 'AI Writer Pro',
    os: 'Windows',
    version: 'v2.4.1',
    filename: 'ai-writer-pro-win-v2.4.1.exe',
    fileSize: '128 MB',
    sha256: 'a3f8...d291',
    status: 'published' as const,
    isLatest: true,
    uploadedAt: '2025-01-10',
  },
  {
    id: 'REL-002',
    agent: 'AI Writer Pro',
    os: 'macOS',
    version: 'v2.4.1',
    filename: 'ai-writer-pro-mac-v2.4.1.dmg',
    fileSize: '145 MB',
    sha256: 'b7c2...e104',
    status: 'published' as const,
    isLatest: true,
    uploadedAt: '2025-01-10',
  },
  {
    id: 'REL-003',
    agent: 'Sales Copilot',
    os: 'Windows',
    version: 'v1.8.0',
    filename: 'sales-copilot-win-v1.8.0.exe',
    fileSize: '95 MB',
    sha256: 'c9d1...f023',
    status: 'published' as const,
    isLatest: true,
    uploadedAt: '2025-01-08',
  },
  {
    id: 'REL-004',
    agent: 'Data Analyst',
    os: 'Windows',
    version: 'v3.1.2',
    filename: 'data-analyst-win-v3.1.2.exe',
    fileSize: '210 MB',
    sha256: 'd4e5...a812',
    status: 'draft' as const,
    isLatest: false,
    uploadedAt: '2025-01-12',
  },
  {
    id: 'REL-005',
    agent: 'AI Writer Pro',
    os: 'Windows',
    version: 'v2.4.0',
    filename: 'ai-writer-pro-win-v2.4.0.exe',
    fileSize: '127 MB',
    sha256: 'e6f7...b943',
    status: 'published' as const,
    isLatest: false,
    uploadedAt: '2024-12-20',
  },
]

export default function ReleasesPage() {
  const [showUploadModal, setShowUploadModal] = useState(false)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">릴리즈관리</h1>
          <p className="text-sm text-muted-foreground mt-0.5">AI Agent 인스톨러 빌드 관리</p>
        </div>
        <Button size="sm" className="gap-1.5" onClick={() => setShowUploadModal(true)}>
          <Upload className="w-3.5 h-3.5" />
          릴리즈 업로드
        </Button>
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
                  <td className="px-4 py-3 font-medium">{release.agent}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${release.os === 'Windows' ? 'bg-blue-50 text-blue-700' : 'bg-gray-50 text-gray-700'}`}>
                      {release.os}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono font-semibold text-primary">{release.version}</td>
                  <td className="px-4 py-3 font-mono text-muted-foreground max-w-[180px] truncate">{release.filename}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">{release.fileSize}</td>
                  <td className="px-4 py-3 font-mono text-muted-foreground">{release.sha256}</td>
                  <td className="px-4 py-3 text-center">
                    {release.isLatest && <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-violet-50 text-violet-700 text-[11px] font-medium border border-violet-200"><Star className="w-2.5 h-2.5" />최신</span>}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <StatusBadge status={release.status} />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{release.uploadedAt}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <button className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground" title="다운로드 테스트">
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <button className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground" title={release.status === 'published' ? '비공개' : '공개'}>
                        {release.status === 'published' ? <EyeOff className="w-3.5 h-3.5" /> : <Globe className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showUploadModal && <UploadReleaseModal onClose={() => setShowUploadModal(false)} />}
    </div>
  )
}

function UploadReleaseModal({ onClose }: { onClose: () => void }) {
  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-card rounded-xl border border-border w-full max-w-md shadow-2xl">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="text-sm font-bold">릴리즈 업로드</h2>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-sm">✕</button>
          </div>

          <div className="p-5 space-y-4">
            <div>
              <label className="text-xs font-medium text-foreground block mb-1.5">Agent 선택</label>
              <select className="w-full h-8 bg-background border border-border rounded-md px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary">
                <option>AI Writer Pro</option>
                <option>Sales Copilot</option>
                <option>Data Analyst</option>
                <option>Code Helper</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-foreground block mb-1.5">플랫폼</label>
              <div className="flex gap-3">
                {['Windows', 'macOS'].map((os) => (
                  <label key={os} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="radio" name="platform" defaultChecked={os === 'Windows'} />
                    {os}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-foreground block mb-1.5">버전</label>
              <Input className="h-8 text-sm" placeholder="v2.5.0" />
            </div>

            <div>
              <label className="text-xs font-medium text-foreground block mb-1.5">릴리즈 노트</label>
              <textarea className="w-full h-16 bg-background border border-border rounded-md p-2.5 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary" placeholder="변경 사항을 입력하세요..." />
            </div>

            <div>
              <label className="text-xs font-medium text-foreground block mb-1.5">인스톨러 파일</label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
                <Upload className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">클릭하거나 파일을 드래그하세요</p>
                <p className="text-[11px] text-muted-foreground/70 mt-1">.exe, .dmg 파일 지원</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input type="checkbox" id="mark-latest" className="rounded" />
              <label htmlFor="mark-latest" className="text-sm">최신 버전으로 지정</label>
            </div>
          </div>

          <div className="flex justify-end gap-2 px-5 pb-5">
            <Button variant="outline" size="sm" onClick={onClose}>취소</Button>
            <Button size="sm" className="gap-1.5"><Upload className="w-3.5 h-3.5" />업로드</Button>
          </div>
        </div>
      </div>
    </>
  )
}
