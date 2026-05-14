'use client'

import { useState } from 'react'
import { Gift, Minus, Plus, ShieldCheck } from 'lucide-react'
import { adjustCreditAction } from '@/lib/credit-actions'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'

type CreditTarget = {
  userId: string
  name: string
  email: string
  balanceUsd?: string | number | { toString(): string } | null
}

export function CreditAdjustmentButton({ customers, target }: { customers: CreditTarget[]; target?: CreditTarget }) {
  const [open, setOpen] = useState(false)
  const defaultUserId = target?.userId ?? customers[0]?.userId ?? ''

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {target ? (
          <button className="p-1.5 rounded transition-colors text-emerald-600 hover:bg-emerald-50" title="크레딧 지급/차감">
            <Plus className="w-3.5 h-3.5" />
          </button>
        ) : (
          <Button size="sm" className="gap-1.5"><Gift className="w-3.5 h-3.5" />크레딧 수동 지급</Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>크레딧 수동 지급/차감</DialogTitle>
          <DialogDescription>슈퍼관리자만 고객 지갑 잔액을 직접 조정할 수 있습니다.</DialogDescription>
        </DialogHeader>
        <form action={adjustCreditAction} className="space-y-4">
          <div>
            <label className="text-xs font-medium block mb-1.5">고객</label>
            <select name="userId" defaultValue={defaultUserId} className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm">
              {customers.map((customer) => (
                <option key={customer.userId} value={customer.userId}>{customer.name} · {customer.email}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium block mb-1.5">유형</label>
            <div className="grid grid-cols-2 gap-2">
              <label className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm cursor-pointer">
                <input type="radio" name="type" value="GRANT" defaultChecked />
                <Plus className="h-3.5 w-3.5 text-emerald-600" /> 지급
              </label>
              <label className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm cursor-pointer">
                <input type="radio" name="type" value="DEDUCT" />
                <Minus className="h-3.5 w-3.5 text-rose-600" /> 차감
              </label>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium block mb-1.5">금액(USD 크레딧)</label>
            <Input name="amountUsd" className="h-9 text-sm" placeholder="10" type="number" min="0.01" step="0.01" required />
          </div>
          <div>
            <label className="text-xs font-medium block mb-1.5">사유</label>
            <Input name="reason" className="h-9 text-sm" placeholder="초기 크레딧 지급 / CS 보상 / 오입금 정정" required />
          </div>
          <div className="rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground flex gap-2">
            <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            처리 결과는 CreditTransaction과 AuditLog에 함께 기록됩니다.
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>취소</Button>
            <Button type="submit">처리</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
