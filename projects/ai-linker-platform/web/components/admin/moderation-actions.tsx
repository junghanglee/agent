'use client'

import { CheckCircle, EyeOff, MessageSquare, Send, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { updateCommunityCommentStatusAction, updateCommunityPostStatusAction } from '@/lib/community-actions'
import { replySupportTicketAction, updateSupportTicketStatusAction } from '@/lib/support-actions'

type TicketOption = {
  id: string
  label: string
}

type StatusOption = {
  value: 'OPEN' | 'IN_PROGRESS' | 'WAITING_CUSTOMER' | 'CLOSED'
  label: string
}

const statusOptions: StatusOption[] = [
  { value: 'OPEN', label: '접수' },
  { value: 'IN_PROGRESS', label: '처리중' },
  { value: 'WAITING_CUSTOMER', label: '고객 대기' },
  { value: 'CLOSED', label: '완료' },
]

export function SupportSearch({ defaultValue, tickets }: { defaultValue: string; tickets: TicketOption[] }) {
  return (
    <form className="p-3 border-b border-border space-y-2">
      <div className="relative">
        <Input name="q" placeholder="검색..." className="h-7 text-xs" defaultValue={defaultValue} />
      </div>
      <select name="ticketId" className="h-7 w-full rounded-md border border-border bg-background px-2 text-xs" defaultValue="">
        <option value="">최근 티켓 자동 선택</option>
        {tickets.map((ticket) => <option key={ticket.id} value={ticket.id}>{ticket.label}</option>)}
      </select>
      <Button type="submit" size="sm" variant="outline" className="h-7 w-full text-xs">검색/열기</Button>
    </form>
  )
}

export function SupportReplyForm({ ticketId, disabled }: { ticketId: string; disabled?: boolean }) {
  return (
    <form action={replySupportTicketAction} className="flex gap-2">
      <input type="hidden" name="ticketId" value={ticketId} />
      <Input name="message" placeholder="메시지를 입력하세요..." className="h-9 text-sm flex-1" disabled={disabled} required />
      <Button size="sm" className="h-9 px-3" disabled={disabled}>
        <Send className="w-3.5 h-3.5" />
      </Button>
    </form>
  )
}

export function SupportStatusActions({ ticketId }: { ticketId: string }) {
  return (
    <div className="flex flex-wrap gap-1.5 justify-end">
      {statusOptions.map((option) => (
        <form key={option.value} action={updateSupportTicketStatusAction}>
          <input type="hidden" name="ticketId" value={ticketId} />
          <input type="hidden" name="status" value={option.value} />
          <Button size="sm" variant="outline" className="h-7 text-xs" type="submit">
            {option.value === 'CLOSED' ? <CheckCircle className="w-3 h-3 mr-1" /> : null}
            {option.label}
          </Button>
        </form>
      ))}
    </div>
  )
}

export function CommunityPostStatusButton({ postId, status, label }: { postId: string; status: 'PUBLISHED' | 'HIDDEN' | 'DELETED'; label: string }) {
  const Icon = status === 'PUBLISHED' ? CheckCircle : status === 'HIDDEN' ? EyeOff : XCircle
  return (
    <form action={updateCommunityPostStatusAction}>
      <input type="hidden" name="postId" value={postId} />
      <input type="hidden" name="status" value={status} />
      <button className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground" title={label}>
        <Icon className="w-3.5 h-3.5" />
      </button>
    </form>
  )
}

export function CommunityCommentStatusButton({ commentId, status, label }: { commentId: string; status: 'PUBLISHED' | 'HIDDEN' | 'DELETED'; label: string }) {
  const Icon = status === 'PUBLISHED' ? CheckCircle : status === 'HIDDEN' ? EyeOff : XCircle
  return (
    <form action={updateCommunityCommentStatusAction}>
      <input type="hidden" name="commentId" value={commentId} />
      <input type="hidden" name="status" value={status} />
      <button className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground" title={label}>
        <Icon className="w-3.5 h-3.5" />
      </button>
    </form>
  )
}
