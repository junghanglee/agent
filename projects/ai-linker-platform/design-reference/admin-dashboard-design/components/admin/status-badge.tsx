import { cn } from '@/lib/utils'

type StatusType =
  | 'active'
  | 'inactive'
  | 'pending'
  | 'expired'
  | 'suspended'
  | 'paid'
  | 'refunded'
  | 'failed'
  | 'draft'
  | 'published'
  | 'latest'
  | 'normal'
  | 'warning'
  | 'critical'

const statusConfig: Record<StatusType, { label: string; className: string }> = {
  active: { label: '활성', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  inactive: { label: '비활성', className: 'bg-gray-50 text-gray-600 border-gray-200' },
  pending: { label: '대기중', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  expired: { label: '만료', className: 'bg-rose-50 text-rose-700 border-rose-200' },
  suspended: { label: '정지', className: 'bg-red-50 text-red-700 border-red-200' },
  paid: { label: '결제완료', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  refunded: { label: '환불', className: 'bg-orange-50 text-orange-700 border-orange-200' },
  failed: { label: '실패', className: 'bg-rose-50 text-rose-700 border-rose-200' },
  draft: { label: '비공개', className: 'bg-gray-50 text-gray-600 border-gray-200' },
  published: { label: '공개', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  latest: { label: '최신', className: 'bg-violet-50 text-violet-700 border-violet-200' },
  normal: { label: '정상', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  warning: { label: '경고', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  critical: { label: '위험', className: 'bg-rose-50 text-rose-700 border-rose-200' },
}

interface StatusBadgeProps {
  status: StatusType
  customLabel?: string
}

export function StatusBadge({ status, customLabel }: StatusBadgeProps) {
  const config = statusConfig[status]
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border',
        config.className
      )}
    >
      <span className="w-1 h-1 rounded-full bg-current mr-1.5 opacity-80" />
      {customLabel ?? config.label}
    </span>
  )
}
