'use client'

import { Ban, CheckCircle2 } from 'lucide-react'
import { updateWalletStatusAction } from '@/lib/credit-actions'

export function WalletStatusButton({ userId, status }: { userId: string; status: 'ACTIVE' | 'SUSPENDED' }) {
  const isSuspend = status === 'SUSPENDED'
  return (
    <form action={updateWalletStatusAction}>
      <input type="hidden" name="userId" value={userId} />
      <input type="hidden" name="status" value={status} />
      <input type="hidden" name="reason" value={isSuspend ? '관리자 수동 지갑 정지' : '관리자 수동 지갑 활성화'} />
      <button
        className={`p-1.5 rounded transition-colors ${isSuspend ? 'text-rose-600 hover:bg-rose-50' : 'text-emerald-600 hover:bg-emerald-50'}`}
        title={isSuspend ? '지갑 정지' : '지갑 활성화'}
      >
        {isSuspend ? <Ban className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
      </button>
    </form>
  )
}
