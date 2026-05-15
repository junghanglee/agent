'use client'

import { useState } from 'react'
import { Archive, Download, Edit2, EyeOff, Globe, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { archiveReleaseAction, createReleaseAction, publishReleaseAction, unpublishReleaseAction, updateReleaseAction } from '@/lib/admin-actions'

type ProductOption = { id: string; name: string }
type ReleaseValue = {
  id?: string
  agentProductId?: string
  platform?: string
  version?: string
  releaseNotes?: string
  status?: string
  isLatest?: boolean
  isRequired?: boolean
  installerFile?: {
    fileName?: string | null
    storageKey?: string | null
    downloadUrl?: string | null
    sizeBytes?: string | number | bigint | null
    sha256?: string | null
  } | null
}

const platforms = ['WINDOWS', 'MACOS', 'IOS', 'ANDROID', 'WEB']
const statuses = ['DRAFT', 'PUBLISHED', 'ROLLED_BACK', 'ARCHIVED']

export function ReleaseCreateButton({ products }: { products: ProductOption[] }) {
  return <ReleaseDialog mode="create" products={products} />
}

export function ReleaseEditButton({ release, products }: { release: ReleaseValue; products: ProductOption[] }) {
  return <ReleaseDialog mode="edit" release={release} products={products} />
}

export function ReleaseArchiveButton({ id }: { id: string }) {
  return <form action={archiveReleaseAction}><input type="hidden" name="id" value={id} /><button className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-rose-600" title="릴리즈 보관"><Archive className="w-3.5 h-3.5" /></button></form>
}

export function ReleaseDownloadButton({ url }: { url?: string | null }) {
  if (!url) return <button type="button" disabled className="p-1.5 rounded text-muted-foreground/40 cursor-not-allowed" title="다운로드 URL 없음"><Download className="w-3.5 h-3.5" /></button>

  return <a href={url} target="_blank" rel="noreferrer" className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground" title="다운로드 테스트"><Download className="w-3.5 h-3.5" /></a>
}

export function ReleasePublishToggleButton({ id, status }: { id: string; status: string }) {
  const isPublished = status === 'PUBLISHED'
  const action = isPublished ? unpublishReleaseAction : publishReleaseAction

  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <button className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground" title={isPublished ? '비공개 전환' : '공개 전환'}>
        {isPublished ? <EyeOff className="w-3.5 h-3.5" /> : <Globe className="w-3.5 h-3.5" />}
      </button>
    </form>
  )
}

function ReleaseDialog({ mode, release, products }: { mode: 'create' | 'edit'; release?: ReleaseValue; products: ProductOption[] }) {
  const [open, setOpen] = useState(false)
  const action = mode === 'create' ? createReleaseAction : updateReleaseAction

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {mode === 'create' ? <Button size="sm" className="gap-1.5"><Upload className="w-3.5 h-3.5" />릴리즈 업로드</Button> : <button className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground" title="릴리즈 수정"><Edit2 className="w-3.5 h-3.5" /></button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader><DialogTitle>{mode === 'create' ? '릴리즈 업로드' : '릴리즈 수정'}</DialogTitle><DialogDescription>인스톨러 파일은 현재 메타데이터 URL 방식으로 등록합니다.</DialogDescription></DialogHeader>
        <form action={action} className="space-y-4">
          {release?.id && <input type="hidden" name="id" value={release.id} />}
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs font-medium block mb-1.5">상품</label><select name="agentProductId" defaultValue={release?.agentProductId ?? products[0]?.id} className="w-full h-9 bg-background border border-border rounded-md px-3 text-sm">{products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}</select></div>
            <div><label className="text-xs font-medium block mb-1.5">플랫폼</label><select name="platform" defaultValue={release?.platform ?? 'WINDOWS'} className="w-full h-9 bg-background border border-border rounded-md px-3 text-sm">{platforms.map((platform) => <option key={platform} value={platform}>{platform}</option>)}</select></div>
            <Field name="version" label="버전" defaultValue={release?.version} required />
            <div><label className="text-xs font-medium block mb-1.5">상태</label><select name="status" defaultValue={release?.status ?? 'DRAFT'} className="w-full h-9 bg-background border border-border rounded-md px-3 text-sm">{statuses.map((status) => <option key={status} value={status}>{status}</option>)}</select></div>
          </div>
          <div><label className="text-xs font-medium block mb-1.5">릴리즈 노트</label><Textarea name="releaseNotes" defaultValue={release?.releaseNotes ?? ''} /></div>
          <div className="grid grid-cols-2 gap-3"><Field name="fileName" label="파일명" defaultValue={release?.installerFile?.fileName ?? ''} required={mode === 'create'} /><Field name="storageKey" label="스토리지 키" defaultValue={release?.installerFile?.storageKey ?? ''} required={mode === 'create'} /><Field name="downloadUrl" label="다운로드 URL" defaultValue={release?.installerFile?.downloadUrl ?? ''} required={mode === 'create'} /><Field name="sizeBytes" label="파일 크기(bytes)" type="number" defaultValue={release?.installerFile?.sizeBytes?.toString() ?? 0} required={mode === 'create'} /><Field name="sha256" label="SHA256" defaultValue={release?.installerFile?.sha256 ?? ''} required={mode === 'create'} /></div>
          <div className="flex gap-4"><label className="flex items-center gap-2 text-sm"><input type="checkbox" name="isLatest" defaultChecked={release?.isLatest} />최신 릴리즈</label><label className="flex items-center gap-2 text-sm"><input type="checkbox" name="isRequired" defaultChecked={release?.isRequired} />필수 업데이트</label></div>
          <DialogFooter><Button type="button" variant="outline" onClick={() => setOpen(false)}>취소</Button><Button type="submit">저장</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function Field({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return <div><label className="text-xs font-medium block mb-1.5">{label}</label><Input className="h-9 text-sm" {...props} /></div>
}
