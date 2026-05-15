export function formatKrw(value: number | string | { toString(): string } | null | undefined) {
  const numberValue = Number(value ?? 0)
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
    maximumFractionDigits: 0,
  }).format(numberValue)
}

export function formatUsd(value: number | string | { toString(): string } | null | undefined) {
  const numberValue = Number(value ?? 0)
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(numberValue)
}

export function formatDate(date: Date | string | null | undefined) {
  if (!date) return '—'
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(date))
}

export function formatDateTime(date: Date | string | null | undefined) {
  if (!date) return '—'
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function formatBytes(value: bigint | number | null | undefined) {
  const bytes = Number(value ?? 0)
  if (bytes <= 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  return `${(bytes / 1024 ** index).toFixed(index === 0 ? 0 : 1)} ${units[index]}`
}

export function statusToBadge(status: string) {
  const normalized = status.toLowerCase()
  if (normalized === 'active') return 'active'
  if (normalized === 'paid') return 'paid'
  if (normalized === 'published') return 'published'
  if (normalized === 'draft') return 'draft'
  if (normalized === 'pending') return 'pending'
  if (normalized === 'refunded') return 'refunded'
  if (normalized === 'failed') return 'failed'
  if (normalized === 'expired') return 'expired'
  if (normalized === 'suspended') return 'suspended'
  if (normalized === 'warning') return 'warning'
  if (normalized === 'critical') return 'critical'
  if (normalized === 'disabled') return 'inactive'
  return 'normal'
}
