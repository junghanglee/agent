import { cn } from '@/lib/utils'
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string
  change?: string
  changeType?: 'up' | 'down' | 'neutral'
  icon: LucideIcon
  iconColor?: string
  iconBg?: string
  description?: string
}

export function StatCard({
  title,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  iconColor = 'text-primary',
  iconBg = 'bg-primary/10',
  description,
}: StatCardProps) {
  return (
    <div className="bg-card rounded-lg border border-border p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center shrink-0', iconBg)}>
          <Icon className={cn('w-4.5 h-4.5', iconColor)} />
        </div>
        {change && (
          <div
            className={cn(
              'flex items-center gap-0.5 text-xs font-medium rounded-full px-1.5 py-0.5',
              changeType === 'up' && 'text-emerald-600 bg-emerald-50',
              changeType === 'down' && 'text-rose-600 bg-rose-50',
              changeType === 'neutral' && 'text-muted-foreground bg-muted'
            )}
          >
            {changeType === 'up' && <TrendingUp className="w-3 h-3" />}
            {changeType === 'down' && <TrendingDown className="w-3 h-3" />}
            {change}
          </div>
        )}
      </div>
      <div>
        <p className="text-2xl font-bold text-foreground leading-none">{value}</p>
        <p className="text-xs text-muted-foreground mt-1">{title}</p>
        {description && <p className="text-[11px] text-muted-foreground/70 mt-0.5">{description}</p>}
      </div>
    </div>
  )
}
