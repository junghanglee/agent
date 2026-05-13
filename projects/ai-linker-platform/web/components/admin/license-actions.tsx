'use client'

import { useState } from 'react'
import { Ban, CheckCircle, Copy, Plus, PauseCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { issueInstallCodeAction, revokeInstallCodeAction, updateLicenseStatusAction } from '@/lib/admin-actions'

type PurchaseOption = {
  id: string
  label: string
}

export function IssueInstallCodeButton({ purchases }: { purchases: PurchaseOption[] }) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button size="sm" className="gap-1.5"><Plus className="w-3.5 h-3.5" />코드 발급</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>설치코드 발급</DialogTitle><DialogDescription>결제 완료 구매 내역을 선택하면 설치코드와 라이선스가 함께 생성됩니다.</DialogDescription></DialogHeader>
        <form action={issueInstallCodeAction} className="space-y-4">
          <div><label className="text-xs font-medium block mb-1.5">구매 내역</label><select name="purchaseId" className="w-full h-9 bg-background border border-border rounded-md px-3 text-sm" required>{purchases.map((purchase) => <option key={purchase.id} value={purchase.id}>{purchase.label}</option>)}</select></div>
          <div className="grid grid-cols-2 gap-3"><div><label className="text-xs font-medium block mb-1.5">최대 활성화 수</label><Input name="maxActivations" type="number" min={1} max={20} defaultValue={1} className="h-9 text-sm" /></div><div><label className="text-xs font-medium block mb-1.5">만료일</label><Input name="expiresAt" type="date" className="h-9 text-sm" /></div></div>
          <DialogFooter><Button type="button" variant="outline" onClick={() => setOpen(false)}>취소</Button><Button type="submit" disabled={purchases.length === 0}>발급</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function CopyInstallCodeButton({ code }: { code: string }) {
  return <button type="button" onClick={() => navigator.clipboard?.writeText(code)} className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground" title="코드 복사"><Copy className="w-3.5 h-3.5" /></button>
}

export function RevokeInstallCodeButton({ id }: { id: string }) {
  return <form action={revokeInstallCodeAction}><input type="hidden" name="id" value={id} /><button className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-rose-600" title="설치코드 폐기"><Ban className="w-3.5 h-3.5" /></button></form>
}

export function LicenseActivateButton({ id }: { id: string }) {
  return <form action={updateLicenseStatusAction}><input type="hidden" name="id" value={id} /><input type="hidden" name="status" value="ACTIVE" /><button className="p-1.5 rounded hover:bg-muted transition-colors text-emerald-600 hover:bg-emerald-50" title="라이선스 활성화"><CheckCircle className="w-3.5 h-3.5" /></button></form>
}

export function LicenseSuspendButton({ id }: { id: string }) {
  return <form action={updateLicenseStatusAction}><input type="hidden" name="id" value={id} /><input type="hidden" name="status" value="SUSPENDED" /><button className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-rose-600" title="라이선스 정지"><PauseCircle className="w-3.5 h-3.5" /></button></form>
}
