'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { createSupportTicketAction } from '@/lib/public-actions'
import {
  Search, ChevronDown, ChevronRight, MessageCircle, BookOpen, Zap, Download, CreditCard, Puzzle,
  Bot, ShieldCheck, LifeBuoy, Clock, CheckCircle2, CircleDot, PenLine, Phone, Mail, ExternalLink, ChevronUp,
} from 'lucide-react'

type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'WAITING_CUSTOMER' | 'CLOSED'
type ProductOption = { id: string; name: string }
type Ticket = {
  id: string
  subject: string
  status: TicketStatus
  createdAt: Date | string
  category: string
  messages: { message: string; createdAt: Date | string }[]
}

type SupportClientProps = {
  tickets: Ticket[]
  products: ProductOption[]
  initialSection?: string
}

interface FaqItem { q: string; a: string }
interface FaqCategory { id: string; label: string; icon: React.ReactNode; items: FaqItem[] }

const faqCategories: FaqCategory[] = [
  { id: 'install', label: '설치 / 시작', icon: <Download className="h-4 w-4" />, items: [
    { q: 'AI Agent 설치코드는 어디서 확인하나요?', a: '구매 완료 후 마이페이지 > 설치코드 탭에서 확인할 수 있습니다. 설치코드는 이메일로도 발송됩니다.' },
    { q: '설치 중 오류가 발생했어요.', a: '설치코드, 네트워크, 보안 프로그램 차단 여부를 확인해 주세요. 해결되지 않으면 1:1 문의로 로그를 남겨 주세요.' },
    { q: '설치 후 Agent가 실행되지 않아요.', a: '앱을 완전히 종료 후 재실행하고, 최신 버전 여부를 확인해 주세요.' },
  ] },
  { id: 'token', label: '토큰 / 결제', icon: <CreditCard className="h-4 w-4" />, items: [
    { q: '토큰이란 무엇인가요?', a: 'AI Agent가 LLM을 호출할 때 소비하는 단위입니다. 잔액과 사용 내역은 마이페이지에서 확인할 수 있습니다.' },
    { q: '환불 정책이 어떻게 되나요?', a: '미사용 토큰 크레딧은 구매일로부터 7일 이내 환불 기준으로 처리됩니다.' },
  ] },
  { id: 'skill', label: 'Skill 마켓', icon: <Puzzle className="h-4 w-4" />, items: [
    { q: 'Skill은 무엇인가요?', a: 'Agent 기능을 확장하는 플러그인입니다. 예: 메신저 연결, 문서 자동화, 웹검색 등.' },
  ] },
  { id: 'account', label: '계정 / 보안', icon: <ShieldCheck className="h-4 w-4" />, items: [
    { q: '하나의 계정으로 여러 기기에서 사용할 수 있나요?', a: '라이선스 정책에 따라 활성화 가능 기기 수가 다릅니다. 설치코드 상세에서 확인해 주세요.' },
  ] },
]

const statusConfig: Record<TicketStatus, { label: string; color: string; icon: React.ReactNode }> = {
  OPEN: { label: '접수', color: 'bg-blue-100 text-blue-700', icon: <Clock className="h-3 w-3" /> },
  IN_PROGRESS: { label: '처리중', color: 'bg-amber-100 text-amber-700', icon: <CircleDot className="h-3 w-3" /> },
  WAITING_CUSTOMER: { label: '고객 확인 필요', color: 'bg-violet-100 text-violet-700', icon: <MessageCircle className="h-3 w-3" /> },
  CLOSED: { label: '답변 완료', color: 'bg-green-100 text-green-700', icon: <CheckCircle2 className="h-3 w-3" /> },
}

function formatDate(value: Date | string) {
  return new Intl.DateTimeFormat('ko-KR', { dateStyle: 'medium' }).format(new Date(value))
}

function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(null)
  return (
    <div className="divide-y divide-border rounded-2xl border border-border bg-card overflow-hidden">
      {items.map((item, i) => (
        <div key={item.q}>
          <button onClick={() => setOpen(open === i ? null : i)} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-muted/50">
            <span className="font-medium text-foreground text-sm leading-relaxed">{item.q}</span>
            {open === i ? <ChevronUp className="h-4 w-4 shrink-0 text-brand-cyan" /> : <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />}
          </button>
          {open === i && <div className="border-t border-border bg-muted/30 px-5 py-4"><p className="text-sm leading-relaxed text-muted-foreground">{item.a}</p></div>}
        </div>
      ))}
    </div>
  )
}

function NewTicketForm({ onClose, products }: { onClose: () => void; products: ProductOption[] }) {
  return (
    <form action={createSupportTicketAction} className="rounded-2xl border border-border bg-card p-6 space-y-4">
      <h3 className="font-bold text-foreground text-lg">1:1 문의하기</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-foreground">문의 유형</label>
          <select name="category" className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand-cyan/50">
            {faqCategories.map((cat) => <option key={cat.id} value={cat.id}>{cat.label}</option>)}
            <option value="etc">기타</option>
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-foreground">관련 Agent</label>
          <select name="agentProductId" className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand-cyan/50">
            <option value="none">해당 없음</option>
            {products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-foreground">제목</label>
        <input name="subject" required type="text" placeholder="문의 내용을 간략히 입력해 주세요" className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-cyan/50" />
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-foreground">상세 내용</label>
        <textarea name="message" required rows={5} placeholder="문제 상황, 오류 메시지, 사용 환경을 상세히 적어 주세요." className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-cyan/50 resize-none leading-relaxed" />
      </div>
      <div className="flex gap-3 pt-1">
        <Button type="button" variant="outline" className="flex-1" onClick={onClose}>취소</Button>
        <Button type="submit" className="flex-1 gap-2 bg-brand-navy text-white hover:bg-brand-navy/90 font-semibold"><PenLine className="h-4 w-4" />문의 접수</Button>
      </div>
    </form>
  )
}

export function SupportClient({ tickets, products, initialSection }: SupportClientProps) {
  const [activeCategory, setActiveCategory] = useState('install')
  const [searchQuery, setSearchQuery] = useState('')
  const [showTicketForm, setShowTicketForm] = useState(false)
  const [activeSection, setActiveSection] = useState<'faq' | 'tickets'>(initialSection === 'tickets' ? 'tickets' : 'faq')
  const activeFaq = faqCategories.find((c) => c.id === activeCategory) ?? faqCategories[0]
  const filteredItems = searchQuery.trim()
    ? faqCategories.flatMap((c) => c.items.map((item) => ({ ...item, category: c.label }))).filter((item) => item.q.includes(searchQuery) || item.a.includes(searchQuery))
    : null

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="relative overflow-hidden bg-brand-navy pt-28 pb-16">
        <div className="relative mx-auto max-w-4xl px-5 text-center md:px-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand-cyan/30 bg-brand-cyan/10 px-3.5 py-1.5 text-xs font-semibold text-brand-cyan"><LifeBuoy className="h-3.5 w-3.5" />고객지원 센터</div>
          <h1 className="text-balance text-3xl font-extrabold tracking-tight text-white md:text-4xl">무엇을 도와드릴까요?</h1>
          <p className="mt-3 text-base text-white/60">자주 묻는 질문에서 빠르게 답을 찾거나, 1:1 문의를 남겨 주세요.</p>
          <div className="relative mx-auto mt-7 max-w-xl">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
            <input type="text" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); if (e.target.value) setActiveSection('faq') }} placeholder="설치 오류, 토큰 충전, Skill 적용..." className="w-full rounded-2xl border border-white/20 bg-white/10 py-3.5 pl-11 pr-4 text-sm text-white placeholder:text-white/40 backdrop-blur focus:outline-none focus:ring-2 focus:ring-brand-cyan/60" />
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-card">
        <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-border md:grid-cols-4">
          {[{ icon: <BookOpen className="h-5 w-5 text-brand-cyan" />, label: '자주 묻는 질문', desc: 'FAQ 바로가기', onClick: () => { setActiveSection('faq'); setSearchQuery('') }, active: activeSection === 'faq' },
            { icon: <PenLine className="h-5 w-5 text-brand-violet" />, label: '1:1 문의', desc: '직접 문의하기', onClick: () => setShowTicketForm(true), active: false },
            { icon: <MessageCircle className="h-5 w-5 text-green-500" />, label: '내 문의 내역', desc: '진행 현황 확인', onClick: () => { setActiveSection('tickets'); setShowTicketForm(false) }, active: activeSection === 'tickets' }].map((item) => (
            <button key={item.label} onClick={item.onClick} className={`flex flex-col items-center gap-1.5 px-4 py-5 text-center transition-colors hover:bg-muted/50 ${item.active ? 'bg-brand-navy/5 border-b-2 border-brand-navy' : ''}`}>
              <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${item.active ? 'bg-brand-navy/10' : 'bg-muted'}`}>{item.icon}</div>
              <p className={`text-sm font-semibold ${item.active ? 'text-brand-navy' : 'text-foreground'}`}>{item.label}</p><p className="text-xs text-muted-foreground">{item.desc}</p>
            </button>
          ))}
          <Link href="/community" className="flex flex-col items-center gap-1.5 px-4 py-5 text-center transition-colors hover:bg-muted/50"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted"><Zap className="h-5 w-5 text-amber-500" /></div><p className="text-sm font-semibold text-foreground">커뮤니티</p><p className="text-xs text-muted-foreground">사용자 Q&A</p></Link>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-12 md:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {showTicketForm && <NewTicketForm onClose={() => setShowTicketForm(false)} products={products} />}
            {searchQuery.trim() && filteredItems && <div className="space-y-3"><p className="text-sm text-muted-foreground"><strong className="text-foreground">&apos;{searchQuery}&apos;</strong> 검색 결과 {filteredItems.length}건</p>{filteredItems.length === 0 ? <div className="rounded-2xl border border-border bg-card px-6 py-10 text-center"><Search className="mx-auto mb-3 h-8 w-8 text-muted-foreground/40" /><p className="font-medium text-foreground">검색 결과가 없습니다</p><Button onClick={() => setShowTicketForm(true)} className="mt-4 gap-2 bg-brand-navy text-white hover:bg-brand-navy/90" size="sm"><PenLine className="h-3.5 w-3.5" />1:1 문의하기</Button></div> : <FaqAccordion items={filteredItems.map(({ q, a }) => ({ q, a }))} />}</div>}
            {!searchQuery.trim() && activeSection === 'faq' && <div className="space-y-5"><h2 className="text-xl font-bold text-foreground">자주 묻는 질문</h2><div className="flex flex-wrap gap-2">{faqCategories.map((cat) => <button key={cat.id} onClick={() => setActiveCategory(cat.id)} className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${activeCategory === cat.id ? 'bg-brand-navy text-white' : 'border border-border bg-card text-muted-foreground hover:text-foreground'}`}>{cat.icon}{cat.label}</button>)}</div><FaqAccordion items={activeFaq.items} /></div>}
            {!searchQuery.trim() && activeSection === 'tickets' && <div className="space-y-4"><div className="flex items-center justify-between"><h2 className="text-xl font-bold text-foreground">내 문의 내역</h2><Button onClick={() => setShowTicketForm(true)} size="sm" className="gap-2 bg-brand-navy text-white hover:bg-brand-navy/90"><PenLine className="h-3.5 w-3.5" />새 문의</Button></div><div className="space-y-3">{tickets.map((ticket) => { const cfg = statusConfig[ticket.status]; return <div key={ticket.id} className="rounded-2xl border border-border bg-card p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><div className="flex items-center gap-2"><span className="text-xs text-muted-foreground">#{ticket.id.slice(-6)}</span><p className="font-semibold text-foreground">{ticket.subject}</p></div><p className="mt-1 text-xs text-muted-foreground">{ticket.category} · {formatDate(ticket.createdAt)}</p><p className="mt-2 text-sm text-muted-foreground">{ticket.messages[0]?.message ?? '메시지 없음'}</p></div><span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${cfg.color}`}>{cfg.icon}{cfg.label}</span></div></div> })}{tickets.length === 0 && <div className="rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">아직 등록된 문의가 없습니다.</div>}</div></div>}
          </div>
          <aside className="space-y-5"><div className="rounded-2xl border border-brand-cyan/30 bg-brand-cyan-soft p-5"><Bot className="mb-2 h-5 w-5 text-brand-navy" /><p className="font-bold text-brand-navy text-sm">Agent 공식 문서</p><p className="mt-2 text-xs text-brand-navy/70 leading-relaxed">설치 가이드와 API 문서는 다음 단계에서 문서 센터로 연결합니다.</p><Button size="sm" className="mt-3 w-full gap-2 bg-brand-navy text-white hover:bg-brand-navy/90 text-xs"><ExternalLink className="h-3.5 w-3.5" />문서 바로가기</Button></div><div className="rounded-2xl border border-border bg-card p-5"><h3 className="mb-4 font-bold text-foreground">지원 채널</h3><div className="space-y-3 text-sm text-muted-foreground"><p className="flex items-center gap-2"><Mail className="h-4 w-4 text-brand-cyan" />support@ai-linker.local</p><p className="flex items-center gap-2"><Phone className="h-4 w-4 text-brand-cyan" />평일 10:00~18:00</p></div></div></aside>
        </div>
      </div>
      <Footer />
    </div>
  )
}
