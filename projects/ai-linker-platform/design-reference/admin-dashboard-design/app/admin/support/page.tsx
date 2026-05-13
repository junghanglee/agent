'use client'

import { useState } from 'react'
import { StatusBadge } from '@/components/admin/status-badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, MessageSquare, Send } from 'lucide-react'

const tickets = [
  { id: 'TKT-581', customer: '정예준', email: 'yejun.jung@email.com', subject: '설치 오류 문의', priority: 'high', status: 'pending' as const, time: '23분 전', unread: 2 },
  { id: 'TKT-580', customer: '윤하늘', email: 'haneul.yoon@email.com', subject: '결제 취소 요청', priority: 'medium', status: 'pending' as const, time: '1시간 전', unread: 1 },
  { id: 'TKT-579', customer: '강지호', email: 'jiho.kang@email.com', subject: '토큰 잔액 오류', priority: 'high', status: 'pending' as const, time: '2시간 전', unread: 3 },
  { id: 'TKT-578', customer: '조민서', email: 'minseo.jo@email.com', subject: '라이선스 이전 요청', priority: 'low', status: 'pending' as const, time: '3시간 전', unread: 0 },
  { id: 'TKT-577', customer: '박도현', email: 'dohyun.park@email.com', subject: 'AI 응답 품질 문의', priority: 'medium', status: 'active' as const, time: '어제', unread: 0 },
  { id: 'TKT-576', customer: '이서연', email: 'seoyeon.lee@email.com', subject: '구독 업그레이드 문의', priority: 'low', status: 'inactive' as const, time: '2일 전', unread: 0 },
]

const messages = [
  { sender: 'customer', name: '정예준', text: '안녕하세요, AI Writer Pro 설치 중 오류가 발생합니다. 오류 코드: ERR_INSTALLER_FAILED', time: '10:23' },
  { sender: 'admin', name: '관리자', text: '안녕하세요! 불편을 드려서 죄송합니다. 오류 코드를 확인했습니다. 현재 Windows Defender가 설치 파일을 차단하고 있을 수 있습니다. 잠시 해제 후 재시도해 보시겠어요?', time: '10:31' },
  { sender: 'customer', name: '정예준', text: '해봤는데 동일한 오류가 발생합니다...', time: '10:45' },
]

const priorityLabel: Record<string, string> = { high: '높음', medium: '중간', low: '낮음' }
const priorityClass: Record<string, string> = {
  high: 'text-rose-600 bg-rose-50 border-rose-200',
  medium: 'text-amber-600 bg-amber-50 border-amber-200',
  low: 'text-sky-600 bg-sky-50 border-sky-200',
}

export default function SupportPage() {
  const [selectedTicket, setSelectedTicket] = useState(tickets[0])
  const [search, setSearch] = useState('')

  const filtered = tickets.filter(
    (t) => t.customer.includes(search) || t.subject.includes(search) || t.id.includes(search)
  )

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-foreground">상담 / 채팅</h1>
        <p className="text-sm text-muted-foreground mt-0.5">고객 상담 티켓 및 채팅 관리</p>
      </div>

      <div className="flex gap-4 h-[calc(100vh-13rem)]">
        {/* Ticket List */}
        <div className="w-72 shrink-0 bg-card rounded-lg border border-border flex flex-col overflow-hidden">
          <div className="p-3 border-b border-border">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input placeholder="검색..." className="pl-8 h-7 text-xs" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filtered.map((ticket) => (
              <button
                key={ticket.id}
                onClick={() => setSelectedTicket(ticket)}
                className={`w-full text-left px-3 py-3 border-b border-border/50 hover:bg-muted/40 transition-colors ${selectedTicket.id === ticket.id ? 'bg-primary/5 border-l-2 border-l-primary' : ''}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-foreground truncate">{ticket.customer}</span>
                      {ticket.unread > 0 && (
                        <span className="shrink-0 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                          {ticket.unread}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground truncate mt-0.5">{ticket.subject}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${priorityClass[ticket.priority]}`}>
                        {priorityLabel[ticket.priority]}
                      </span>
                      <StatusBadge status={ticket.status} />
                    </div>
                  </div>
                  <span className="text-[10px] text-muted-foreground shrink-0 mt-0.5">{ticket.time}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Panel */}
        <div className="flex-1 bg-card rounded-lg border border-border flex flex-col overflow-hidden">
          {/* Chat Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div>
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">{selectedTicket.subject}</h3>
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${priorityClass[selectedTicket.priority]}`}>
                  {priorityLabel[selectedTicket.priority]}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{selectedTicket.customer} · {selectedTicket.email} · {selectedTicket.id}</p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="text-xs h-7">완료처리</Button>
              <StatusBadge status={selectedTicket.status} />
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] ${msg.sender === 'admin' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                  <span className="text-[10px] text-muted-foreground px-1">{msg.name} · {msg.time}</span>
                  <div className={`rounded-lg px-3 py-2.5 text-xs leading-relaxed ${msg.sender === 'admin' ? 'bg-primary text-primary-foreground rounded-br-sm' : 'bg-muted text-foreground rounded-bl-sm'}`}>
                    {msg.text}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="p-3 border-t border-border">
            <div className="flex gap-2">
              <Input placeholder="메시지를 입력하세요..." className="h-9 text-sm flex-1" />
              <Button size="sm" className="h-9 px-3">
                <Send className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
