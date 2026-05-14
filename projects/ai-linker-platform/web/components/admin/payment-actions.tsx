'use client'

import { CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { approvePaymentAction } from '@/lib/payment-actions'

type PurchaseOption = {
  id: string
  label: string
  amount: string | number | { toString(): string }
  currency: string
  isTokenPurchase: boolean
}

export function ApprovePaymentButton({ purchases }: { purchases: PurchaseOption[] }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5"><CheckCircle2 className="h-3.5 w-3.5" />수동 승인</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>결제 수동 승인</DialogTitle>
          <DialogDescription>Provider 승인 API 연동 전/예외 상황에서만 사용하세요. 처리 결과는 결제, 구매, 라이선스 또는 지갑, AuditLog에 함께 반영됩니다.</DialogDescription>
        </DialogHeader>
        <form action={approvePaymentAction} className="space-y-4">
          <div>
            <label className="text-xs font-medium block mb-1.5">구매 내역</label>
            <select name="purchaseId" className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm" required>
              <option value="">구매 선택</option>
              {purchases.map((purchase) => <option key={purchase.id} value={purchase.id}>{purchase.label}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field name="provider" label="Provider" defaultValue="manual" required />
            <Field name="paymentKey" label="Payment Key" placeholder="manual-20260514-001" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field name="amount" label="결제금액" type="number" step="1" min="0" required />
            <Field name="currency" label="통화" defaultValue="KRW" required />
          </div>
          <Field name="tokenCreditUsd" label="토큰 충전 USD(토큰 구매일 때만)" type="number" step="0.01" min="0" placeholder="예: 50" />
          <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
            상품 구매는 설치코드와 라이선스가 자동 발급됩니다. 토큰 구매는 위 USD 입력값만큼 지갑에 충전됩니다.
          </div>
          <DialogFooter><Button type="submit">승인 처리</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function Field({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return <div><label className="text-xs font-medium block mb-1.5">{label}</label><Input className="h-9 text-sm" {...props} /></div>
}
