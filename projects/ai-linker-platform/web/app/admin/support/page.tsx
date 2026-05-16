import { MessageSquare, UserCircle } from 'lucide-react'
import { StatusBadge } from '@/components/admin/status-badge'
import { SupportReplyForm, SupportSearch, SupportStatusActions } from '@/components/admin/moderation-actions'
import { requireAdminPagePermission } from '@/lib/admin-auth'
import { formatDate } from '@/lib/admin-format'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

type SupportPageProps = {
  searchParams: Promise<{ q?: string; ticketId?: string; status?: string }>
}

const statusMap = {
  OPEN: { badge: 'pending' as const, label: '접수' },
  IN_PROGRESS: { badge: 'active' as const, label: '처리중' },
  WAITING_CUSTOMER: { badge: 'warning' as const, label: '고객 대기' },
  CLOSED: { badge: 'inactive' as const, label: '완료' },
}

const senderLabel = {
  USER: '고객',
  ADMIN: '관리자',
  SYSTEM: '시스템',
}

export default async function SupportPage({ searchParams }: SupportPageProps) {
  await requireAdminPagePermission('SUPPORT_MANAGE')

  const { q = '', ticketId = '', status = '' } = await searchParams
  const query = q.trim()

  const where = {
    ...(status ? { status: status as never } : {}),
    ...(query
      ? {
          OR: [
            { id: { contains: query } },
            { subject: { contains: query } },
            { category: { contains: query } },
            { user: { name: { contains: query } } },
            { user: { email: { contains: query } } },
          ],
        }
      : {}),
  }

  const [tickets, counts] = await Promise.all([
    prisma.supportTicket.findMany({
      where,
      take: 100,
      orderBy: { updatedAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
        assignedAdmin: { select: { name: true, email: true } },
        messages: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    }),
    prisma.supportTicket.groupBy({ by: ['status'], _count: true }),
  ])

  const selectedTicketId = ticketId || tickets[0]?.id
  const selectedTicket = selectedTicketId
    ? await prisma.supportTicket.findUnique({
        where: { id: selectedTicketId },
        include: {
          user: { select: { name: true, email: true } },
          assignedAdmin: { select: { name: true, email: true } },
          messages: { orderBy: { createdAt: 'asc' } },
        },
      })
    : null

  const countByStatus = Object.fromEntries(counts.map((item) => [item.status, item._count]))
  const ticketOptions = tickets.map((ticket) => ({ id: ticket.id, label: `${ticket.user.name} · ${ticket.subject}` }))

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-foreground">상담 / 채팅</h1>
          <p className="text-sm text-muted-foreground mt-0.5">실제 고객 상담 티켓 및 채팅 관리</p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-full font-medium">접수 {countByStatus.OPEN ?? 0}건</span>
          <span className="bg-violet-50 text-violet-700 border border-violet-200 px-2.5 py-1 rounded-full font-medium">처리중 {countByStatus.IN_PROGRESS ?? 0}건</span>
          <span className="bg-sky-50 text-sky-700 border border-sky-200 px-2.5 py-1 rounded-full font-medium">고객 대기 {countByStatus.WAITING_CUSTOMER ?? 0}건</span>
        </div>
      </div>

      <div className="flex gap-4 h-[calc(100vh-13rem)] min-h-[36rem]">
        <div className="w-80 shrink-0 bg-card rounded-lg border border-border flex flex-col overflow-hidden">
          <SupportSearch defaultValue={query} tickets={ticketOptions} />
          <div className="flex-1 overflow-y-auto">
            {tickets.map((ticket) => {
              const config = statusMap[ticket.status]
              return (
                <a
                  key={ticket.id}
                  href={`/admin/support?ticketId=${ticket.id}${query ? `&q=${encodeURIComponent(query)}` : ''}${status ? `&status=${status}` : ''}`}
                  className={`block text-left px-3 py-3 border-b border-border/50 hover:bg-muted/40 transition-colors ${selectedTicket?.id === ticket.id ? 'bg-primary/5 border-l-2 border-l-primary' : ''}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-foreground truncate">{ticket.user.name}</span>
                        <StatusBadge status={config.badge} customLabel={config.label} />
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate mt-1">{ticket.subject}</p>
                      <p className="text-[10px] text-muted-foreground truncate mt-1">최근: {ticket.messages[0]?.message ?? '메시지 없음'}</p>
                    </div>
                    <span className="text-[10px] text-muted-foreground shrink-0 mt-0.5">{formatDate(ticket.updatedAt)}</span>
                  </div>
                </a>
              )
            })}
            {tickets.length === 0 && <div className="px-4 py-10 text-center text-sm text-muted-foreground">조건에 맞는 상담 티켓이 없습니다.</div>}
          </div>
        </div>

        <div className="flex-1 bg-card rounded-lg border border-border flex flex-col overflow-hidden">
          {selectedTicket ? (
            <>
              <div className="flex items-start justify-between gap-3 px-4 py-3 border-b border-border">
                <div>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-semibold text-foreground">{selectedTicket.subject}</h3>
                    <StatusBadge status={statusMap[selectedTicket.status].badge} customLabel={statusMap[selectedTicket.status].label} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{selectedTicket.user.name} · {selectedTicket.user.email} · {selectedTicket.id.slice(0, 12)}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">담당자: {selectedTicket.assignedAdmin?.name ?? '미배정'} · 카테고리: {selectedTicket.category}</p>
                </div>
                <SupportStatusActions ticketId={selectedTicket.id} />
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {selectedTicket.messages.map((message) => (
                  <div key={message.id} className={`flex ${message.senderType === 'ADMIN' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] ${message.senderType === 'ADMIN' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                      <span className="text-[10px] text-muted-foreground px-1">{senderLabel[message.senderType]} · {formatDate(message.createdAt)}</span>
                      <div className={`rounded-lg px-3 py-2.5 text-xs leading-relaxed ${message.senderType === 'ADMIN' ? 'bg-primary text-primary-foreground rounded-br-sm' : 'bg-muted text-foreground rounded-bl-sm'}`}>
                        {message.message}
                      </div>
                    </div>
                  </div>
                ))}
                {selectedTicket.messages.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-muted-foreground text-sm gap-2">
                    <UserCircle className="w-8 h-8" />
                    아직 메시지가 없습니다.
                  </div>
                )}
              </div>

              <div className="p-3 border-t border-border">
                <SupportReplyForm ticketId={selectedTicket.id} disabled={selectedTicket.status === 'CLOSED'} />
              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-sm text-muted-foreground">상담 티켓을 선택하세요.</div>
          )}
        </div>
      </div>
    </div>
  )
}
