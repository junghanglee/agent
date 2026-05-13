"use client"

import { useState } from "react"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import {
  Search,
  ChevronDown,
  ChevronRight,
  MessageCircle,
  BookOpen,
  Zap,
  Download,
  CreditCard,
  Puzzle,
  Bot,
  ShieldCheck,
  LifeBuoy,
  Clock,
  CheckCircle2,
  CircleDot,
  PenLine,
  Phone,
  Mail,
  ExternalLink,
  ChevronUp,
} from "lucide-react"

// ─── types ───────────────────────────────────────────────────────────────────
type TicketStatus = "처리중" | "답변 완료" | "검토중"

interface FaqItem {
  q: string
  a: string
}

interface FaqCategory {
  id: string
  label: string
  icon: React.ReactNode
  items: FaqItem[]
}

interface Ticket {
  id: string
  title: string
  status: TicketStatus
  date: string
  category: string
  preview: string
}

// ─── data ─────────────────────────────────────────────────────────────────────
const faqCategories: FaqCategory[] = [
  {
    id: "install",
    label: "설치 / 시작",
    icon: <Download className="h-4 w-4" />,
    items: [
      {
        q: "AI Agent 설치코드는 어디서 확인하나요?",
        a: "구매 완료 후 마이페이지 > 설치코드 탭에서 확인할 수 있습니다. 설치코드는 이메일로도 발송됩니다. 코드는 'HERM-XXXX-XXXX-XXXX' 형식이며, Agent 설치 시 입력창에 붙여넣기 하시면 됩니다.",
      },
      {
        q: "Windows / macOS / iOS 중 어떤 OS에서 사용할 수 있나요?",
        a: "Agent마다 지원 OS가 다릅니다. 마켓 상세 페이지의 'OS 선택' 탭에서 지원 여부를 미리 확인해 주세요. 일부 Agent는 세 OS 모두를 지원합니다.",
      },
      {
        q: "설치 중 오류가 발생했어요.",
        a: "1) 설치코드가 정확한지 다시 확인해 주세요. 2) 네트워크 연결 상태를 점검해 주세요. 3) 보안 프로그램(백신)이 설치를 차단하는 경우 허용 목록에 추가해 주세요. 해결되지 않으면 하단 '1:1 문의하기'로 로그 파일을 첨부해 문의해 주세요.",
      },
      {
        q: "설치 후 Agent가 실행되지 않아요.",
        a: "먼저 앱을 완전히 종료 후 재실행해 보세요. 그래도 안 된다면 '설정 > 시스템 정보'에서 버전을 확인하고 최신 버전으로 업데이트해 주세요. 최신 버전에서도 동일하면 1:1 문의를 이용해 주세요.",
      },
    ],
  },
  {
    id: "token",
    label: "토큰 / 결제",
    icon: <CreditCard className="h-4 w-4" />,
    items: [
      {
        q: "토큰이란 무엇인가요?",
        a: "토큰은 AI Agent가 LLM(대형 언어 모델)을 호출할 때 소비하는 단위입니다. 1토큰 ≈ 약 0.75 영어 단어에 해당하며, 요청과 응답의 총 길이로 계산됩니다. 충전한 토큰은 마이페이지 > 토큰 탭에서 잔액과 사용 내역을 확인할 수 있습니다.",
      },
      {
        q: "결제 수단은 어떻게 되나요?",
        a: "신용·체크카드(Visa, MasterCard, 국내 카드), 카카오페이, 네이버페이, 무통장입금(세금계산서 발행 가능)을 지원합니다. 기업 구매의 경우 별도 문의 주시면 계약서 처리가 가능합니다.",
      },
      {
        q: "환불 정책이 어떻게 되나요?",
        a: "미사용 토큰 크레딧은 구매일로부터 7일 이내 100% 환불됩니다. 이미 일부 사용한 경우 잔여 토큰 기준으로 환불됩니다. Agent 라이선스는 설치코드를 사용하지 않은 경우에 한해 환불 가능합니다. 자세한 내용은 환불 정책 페이지를 참조해 주세요.",
      },
      {
        q: "구독 플랜과 크레딧 방식의 차이가 무엇인가요?",
        a: "크레딧 방식은 원하는 만큼 충전하여 사용하는 선불 방식입니다. 구독 플랜은 매월 일정 토큰을 제공받으며, 크레딧 대비 최대 30% 저렴합니다. 사용량이 예측 가능하다면 구독이 유리하고, 비정기적으로 사용한다면 크레딧이 적합합니다.",
      },
    ],
  },
  {
    id: "skill",
    label: "Skill 마켓",
    icon: <Puzzle className="h-4 w-4" />,
    items: [
      {
        q: "Skill은 무엇인가요?",
        a: "Skill은 Agent의 기능을 확장하는 플러그인입니다. 예를 들어 '메신저 연결' Skill을 추가하면 Slack·카카오톡으로 Agent 답변을 받을 수 있습니다. Skill은 마이페이지 > Skill 탭에서 관리할 수 있습니다.",
      },
      {
        q: "Skill을 구매했는데 Agent에 적용이 안 돼요.",
        a: "Skill 적용은 자동으로 이루어지며 최대 5분이 소요됩니다. Agent를 재시작한 후 설정 > Skill 목록을 확인해 주세요. 여전히 보이지 않으면 마이페이지 > Skill 탭에서 '다시 동기화' 버튼을 눌러 주세요.",
      },
      {
        q: "Skill도 환불이 되나요?",
        a: "Skill은 설치(활성화)하기 전이라면 구매 7일 이내 환불이 가능합니다. 단, 이미 활성화된 Skill은 환불이 불가합니다.",
      },
    ],
  },
  {
    id: "account",
    label: "계정 / 보안",
    icon: <ShieldCheck className="h-4 w-4" />,
    items: [
      {
        q: "비밀번호를 잊어버렸어요.",
        a: "로그인 페이지에서 '비밀번호 찾기'를 클릭하면 가입한 이메일로 재설정 링크가 발송됩니다. 이메일이 수신되지 않으면 스팸함을 확인하거나 고객지원으로 문의해 주세요.",
      },
      {
        q: "회원 탈퇴 시 구매 내역은 어떻게 되나요?",
        a: "탈퇴 후 모든 계정 데이터와 구매 내역은 삭제되며 복구가 불가합니다. 잔여 토큰이 있는 경우 환불 신청 후 탈퇴를 권장합니다. 탈퇴는 마이페이지 > 설정에서 진행할 수 있습니다.",
      },
      {
        q: "하나의 계정으로 여러 기기에서 사용할 수 있나요?",
        a: "Agent 라이선스는 구매 시 선택한 OS 1대에 귀속됩니다. 기기를 변경할 경우 마이페이지에서 기기 이전 신청(월 1회 무료)을 이용해 주세요.",
      },
    ],
  },
]

const myTickets: Ticket[] = [
  {
    id: "#1024",
    title: "Hermes Agent 설치 후 실행 오류",
    status: "답변 완료",
    date: "2025.05.09",
    category: "설치 / 시작",
    preview: "안녕하세요. 설치 완료 후 실행 시 오류 코드 ERR_0x42가 발생합니다...",
  },
  {
    id: "#1018",
    title: "토큰 충전 후 잔액 미반영",
    status: "처리중",
    date: "2025.05.02",
    category: "토큰 / 결제",
    preview: "결제는 완료됐는데 마이페이지 토큰 잔액에 반영이 되지 않습니다...",
  },
  {
    id: "#1011",
    title: "메신저 연결 Skill 적용 문의",
    status: "답변 완료",
    date: "2025.04.22",
    category: "Skill 마켓",
    preview: "Skill 구매 후 재시작해도 목록에 나타나지 않습니다...",
  },
]

const statusConfig: Record<TicketStatus, { label: string; color: string; icon: React.ReactNode }> = {
  처리중: {
    label: "처리중",
    color: "bg-amber-100 text-amber-700",
    icon: <CircleDot className="h-3 w-3" />,
  },
  답변완료: {
    label: "답변 완료",
    color: "bg-green-100 text-green-700",
    icon: <CheckCircle2 className="h-3 w-3" />,
  },
  검토중: {
    label: "검토중",
    color: "bg-blue-100 text-blue-700",
    icon: <Clock className="h-3 w-3" />,
  },
}

function getStatusConfig(status: TicketStatus) {
  if (status === "답변 완료") return statusConfig["답변완료"]
  return statusConfig[status] ?? statusConfig["검토중"]
}

// ─── sub-components ───────────────────────────────────────────────────────────
function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(null)
  return (
    <div className="divide-y divide-border rounded-2xl border border-border bg-card overflow-hidden">
      {items.map((item, i) => (
        <div key={i}>
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-muted/50"
          >
            <span className="font-medium text-foreground text-sm leading-relaxed">{item.q}</span>
            {open === i ? (
              <ChevronUp className="h-4 w-4 shrink-0 text-brand-cyan" />
            ) : (
              <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
            )}
          </button>
          {open === i && (
            <div className="border-t border-border bg-muted/30 px-5 py-4">
              <p className="text-sm leading-relaxed text-muted-foreground">{item.a}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ─── new ticket form ──────────────────────────────────────────────────────────
function NewTicketForm({ onClose }: { onClose: () => void }) {
  const [submitted, setSubmitted] = useState(false)

  if (submitted) {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-8 text-center">
        <CheckCircle2 className="mx-auto mb-3 h-10 w-10 text-green-500" />
        <p className="font-bold text-foreground text-lg">문의가 접수되었습니다</p>
        <p className="mt-1 text-sm text-muted-foreground">
          영업일 기준 1~2일 내로 이메일과 마이페이지에 답변을 드립니다.
        </p>
        <Button onClick={onClose} className="mt-5 bg-brand-navy text-white hover:bg-brand-navy/90">
          확인
        </Button>
      </div>
    )
  }

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); setSubmitted(true) }}
      className="rounded-2xl border border-border bg-card p-6 space-y-4"
    >
      <h3 className="font-bold text-foreground text-lg">1:1 문의하기</h3>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-foreground">문의 유형</label>
          <select className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand-cyan/50">
            <option>설치 / 시작</option>
            <option>토큰 / 결제</option>
            <option>Skill 마켓</option>
            <option>계정 / 보안</option>
            <option>기타</option>
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-foreground">관련 Agent</label>
          <select className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand-cyan/50">
            <option>해당 없음</option>
            <option>Hermes AI Agent</option>
            <option>Research Agent</option>
            <option>기타</option>
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold text-foreground">제목</label>
        <input
          required
          type="text"
          placeholder="문의 내용을 간략히 입력해 주세요"
          className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-cyan/50"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold text-foreground">상세 내용</label>
        <textarea
          required
          rows={5}
          placeholder="문제 상황, 오류 메시지, 사용 환경(OS, 버전 등)을 상세히 적어 주시면 빠른 해결에 도움이 됩니다."
          className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-cyan/50 resize-none leading-relaxed"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold text-foreground">첨부 파일 (선택)</label>
        <div className="flex items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/30 px-4 py-5 text-center">
          <div>
            <p className="text-xs text-muted-foreground">
              스크린샷, 로그 파일 등을 첨부하면 더 빠른 답변이 가능합니다
            </p>
            <p className="mt-1 text-xs text-muted-foreground">PNG, JPG, PDF, TXT — 최대 10MB</p>
            <Button type="button" size="sm" variant="outline" className="mt-2 text-xs">
              파일 선택
            </Button>
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-1">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={onClose}
        >
          취소
        </Button>
        <Button
          type="submit"
          className="flex-1 gap-2 bg-brand-navy text-white hover:bg-brand-navy/90 font-semibold"
        >
          <PenLine className="h-4 w-4" />
          문의 접수
        </Button>
      </div>
    </form>
  )
}

// ─── main page ────────────────────────────────────────────────────────────────
export default function SupportPage() {
  const [activeCategory, setActiveCategory] = useState("install")
  const [searchQuery, setSearchQuery] = useState("")
  const [showTicketForm, setShowTicketForm] = useState(false)
  const [activeSection, setActiveSection] = useState<"faq" | "tickets">("faq")

  const activeFaq = faqCategories.find((c) => c.id === activeCategory)!

  const filteredItems = searchQuery.trim()
    ? faqCategories
        .flatMap((c) => c.items.map((item) => ({ ...item, category: c.label })))
        .filter(
          (item) =>
            item.q.includes(searchQuery) || item.a.includes(searchQuery)
        )
    : null

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-brand-navy pt-28 pb-16">
        {/* subtle grid overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(var(--brand-cyan) 1px, transparent 1px), linear-gradient(90deg, var(--brand-cyan) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div className="relative mx-auto max-w-4xl px-5 text-center md:px-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand-cyan/30 bg-brand-cyan/10 px-3.5 py-1.5 text-xs font-semibold text-brand-cyan">
            <LifeBuoy className="h-3.5 w-3.5" />
            고객지원 센터
          </div>
          <h1 className="text-balance text-3xl font-extrabold tracking-tight text-white md:text-4xl">
            무엇을 도와드릴까요?
          </h1>
          <p className="mt-3 text-base text-white/60">
            자주 묻는 질문에서 빠르게 답을 찾거나, 1:1 문의를 남겨 주세요.
          </p>

          {/* search */}
          <div className="relative mx-auto mt-7 max-w-xl">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                if (e.target.value) setActiveSection("faq")
              }}
              placeholder="설치 오류, 토큰 충전, Skill 적용..."
              className="w-full rounded-2xl border border-white/20 bg-white/10 py-3.5 pl-11 pr-4 text-sm text-white placeholder:text-white/40 backdrop-blur focus:outline-none focus:ring-2 focus:ring-brand-cyan/60"
            />
          </div>

          {/* stat chips */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-5">
            {[
              { icon: <Clock className="h-3.5 w-3.5" />, label: "평균 응답 시간", value: "4시간 이내" },
              { icon: <CheckCircle2 className="h-3.5 w-3.5" />, label: "해결률", value: "98.4%" },
              { icon: <MessageCircle className="h-3.5 w-3.5" />, label: "누적 해결 문의", value: "12,400+" },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-2 text-sm">
                <span className="text-brand-cyan">{s.icon}</span>
                <span className="text-white/50">{s.label}</span>
                <span className="font-bold text-white">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── quick action cards ── */}
      <section className="border-b border-border bg-card">
        <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-border md:grid-cols-4">
          {[
            {
              icon: <BookOpen className="h-5 w-5 text-brand-cyan" />,
              label: "자주 묻는 질문",
              desc: "FAQ 바로가기",
              onClick: () => { setActiveSection("faq"); setSearchQuery("") },
              active: activeSection === "faq",
            },
            {
              icon: <PenLine className="h-5 w-5 text-brand-violet" />,
              label: "1:1 문의",
              desc: "직접 문의하기",
              onClick: () => setShowTicketForm(true),
              active: false,
            },
            {
              icon: <MessageCircle className="h-5 w-5 text-green-500" />,
              label: "내 문의 내역",
              desc: "진행 현황 확인",
              onClick: () => { setActiveSection("tickets"); setShowTicketForm(false) },
              active: activeSection === "tickets",
            },
            {
              icon: <Zap className="h-5 w-5 text-amber-500" />,
              label: "커뮤니티",
              desc: "사용자 Q&A",
              href: "/community",
              active: false,
            },
          ].map((item) =>
            item.href ? (
              <Link
                key={item.label}
                href={item.href}
                className="flex flex-col items-center gap-1.5 px-4 py-5 text-center transition-colors hover:bg-muted/50"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted">
                  {item.icon}
                </div>
                <p className="text-sm font-semibold text-foreground">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </Link>
            ) : (
              <button
                key={item.label}
                onClick={item.onClick}
                className={`flex flex-col items-center gap-1.5 px-4 py-5 text-center transition-colors hover:bg-muted/50 ${
                  item.active ? "bg-brand-navy/5 border-b-2 border-brand-navy" : ""
                }`}
              >
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${item.active ? "bg-brand-navy/10" : "bg-muted"}`}>
                  {item.icon}
                </div>
                <p className={`text-sm font-semibold ${item.active ? "text-brand-navy" : "text-foreground"}`}>
                  {item.label}
                </p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </button>
            )
          )}
        </div>
      </section>

      {/* ── body ── */}
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* ── main column ── */}
          <div className="lg:col-span-2 space-y-6">

            {/* new ticket form */}
            {showTicketForm && (
              <NewTicketForm onClose={() => setShowTicketForm(false)} />
            )}

            {/* search results */}
            {searchQuery.trim() && filteredItems && (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">&apos;{searchQuery}&apos;</strong> 검색 결과{" "}
                  {filteredItems.length}건
                </p>
                {filteredItems.length === 0 ? (
                  <div className="rounded-2xl border border-border bg-card px-6 py-10 text-center">
                    <Search className="mx-auto mb-3 h-8 w-8 text-muted-foreground/40" />
                    <p className="font-medium text-foreground">검색 결과가 없습니다</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      다른 키워드로 검색하거나 1:1 문의를 이용해 주세요.
                    </p>
                    <Button
                      onClick={() => setShowTicketForm(true)}
                      className="mt-4 gap-2 bg-brand-navy text-white hover:bg-brand-navy/90"
                      size="sm"
                    >
                      <PenLine className="h-3.5 w-3.5" /> 1:1 문의하기
                    </Button>
                  </div>
                ) : (
                  <FaqAccordion
                    items={filteredItems.map(({ q, a }) => ({ q, a }))}
                  />
                )}
              </div>
            )}

            {/* FAQ section */}
            {!searchQuery.trim() && activeSection === "faq" && (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-foreground">자주 묻는 질문</h2>
                </div>

                {/* category tabs */}
                <div className="flex flex-wrap gap-2">
                  {faqCategories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={`flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-sm font-medium transition-colors ${
                        activeCategory === cat.id
                          ? "border-brand-navy bg-brand-navy text-white"
                          : "border-border bg-card text-muted-foreground hover:border-brand-navy/40 hover:text-foreground"
                      }`}
                    >
                      {cat.icon}
                      {cat.label}
                    </button>
                  ))}
                </div>

                <FaqAccordion items={activeFaq.items} />
              </div>
            )}

            {/* My tickets */}
            {!searchQuery.trim() && activeSection === "tickets" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-foreground">내 문의 내역</h2>
                  <Button
                    size="sm"
                    onClick={() => { setShowTicketForm(true); setActiveSection("faq") }}
                    className="gap-1.5 bg-brand-navy text-white hover:bg-brand-navy/90"
                  >
                    <PenLine className="h-3.5 w-3.5" />
                    새 문의
                  </Button>
                </div>

                <div className="space-y-3">
                  {myTickets.map((ticket) => {
                    const sc = getStatusConfig(ticket.status)
                    return (
                      <div
                        key={ticket.id}
                        className="group cursor-pointer rounded-2xl border border-border bg-card p-5 transition-shadow hover:shadow-md"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className="text-xs text-muted-foreground">{ticket.id}</span>
                              <span className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                                {ticket.category}
                              </span>
                            </div>
                            <p className="font-semibold text-foreground truncate">{ticket.title}</p>
                            <p className="mt-1 text-sm text-muted-foreground line-clamp-1">
                              {ticket.preview}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-2 shrink-0">
                            <span
                              className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${sc.color}`}
                            >
                              {sc.icon}
                              {sc.label}
                            </span>
                            <span className="text-xs text-muted-foreground">{ticket.date}</span>
                          </div>
                        </div>
                        <div className="mt-3 flex items-center gap-1 text-xs text-brand-navy font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                          상세 보기 <ChevronRight className="h-3 w-3" />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* ── sidebar ── */}
          <aside className="space-y-5">
            {/* contact channels */}
            <div className="rounded-2xl border border-border bg-card p-5">
              <h3 className="mb-4 font-bold text-foreground">다른 문의 채널</h3>
              <div className="space-y-3">
                <a
                  href="mailto:support@ailinker.io"
                  className="flex items-center gap-3 rounded-xl border border-border px-4 py-3 transition-colors hover:bg-muted/50"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-cyan-soft">
                    <Mail className="h-4 w-4 text-brand-navy" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">이메일 문의</p>
                    <p className="text-xs text-muted-foreground truncate">support@ailinker.io</p>
                  </div>
                  <ExternalLink className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                </a>

                <a
                  href="tel:02-0000-0000"
                  className="flex items-center gap-3 rounded-xl border border-border px-4 py-3 transition-colors hover:bg-muted/50"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-cyan-soft">
                    <Phone className="h-4 w-4 text-brand-navy" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">전화 문의</p>
                    <p className="text-xs text-muted-foreground">02-0000-0000 (평일 10–18시)</p>
                  </div>
                </a>

                <Link
                  href="/community"
                  className="flex items-center gap-3 rounded-xl border border-border px-4 py-3 transition-colors hover:bg-muted/50"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-cyan-soft">
                    <MessageCircle className="h-4 w-4 text-brand-navy" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">커뮤니티</p>
                    <p className="text-xs text-muted-foreground">사용자 간 Q&A</p>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                </Link>
              </div>
            </div>

            {/* response time guide */}
            <div className="rounded-2xl border border-border bg-card p-5">
              <h3 className="mb-4 font-bold text-foreground">답변 안내</h3>
              <div className="space-y-3">
                {[
                  { label: "1:1 문의", time: "영업일 1–2일", color: "bg-brand-cyan" },
                  { label: "이메일", time: "영업일 1–3일", color: "bg-brand-violet" },
                  { label: "전화", time: "즉시 (평일 10–18시)", color: "bg-green-500" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-foreground">
                      <span className={`h-2 w-2 rounded-full ${item.color}`} />
                      {item.label}
                    </div>
                    <span className="text-xs text-muted-foreground">{item.time}</span>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-xs text-muted-foreground leading-relaxed">
                주말 및 공휴일은 답변이 지연될 수 있습니다. 긴급한 문제는 전화 문의를 권장합니다.
              </p>
            </div>

            {/* popular faq links */}
            <div className="rounded-2xl border border-border bg-card p-5">
              <h3 className="mb-4 font-bold text-foreground">많이 찾는 질문</h3>
              <div className="space-y-1.5">
                {[
                  { q: "설치코드 확인 방법", cat: "install" },
                  { q: "환불 정책 안내", cat: "token" },
                  { q: "기기 변경(이전) 방법", cat: "account" },
                  { q: "Skill 적용 안 될 때", cat: "skill" },
                  { q: "비밀번호 초기화", cat: "account" },
                ].map((item) => (
                  <button
                    key={item.q}
                    onClick={() => {
                      setActiveCategory(item.cat)
                      setActiveSection("faq")
                      setSearchQuery("")
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    <ChevronRight className="h-3.5 w-3.5 shrink-0 text-brand-cyan" />
                    {item.q}
                  </button>
                ))}
              </div>
            </div>

            {/* agent docs */}
            <div className="rounded-2xl border border-brand-cyan/30 bg-brand-cyan-soft p-5">
              <div className="flex items-center gap-2 mb-2">
                <Bot className="h-5 w-5 text-brand-navy" />
                <p className="font-bold text-brand-navy text-sm">Agent 공식 문서</p>
              </div>
              <p className="text-xs text-brand-navy/70 leading-relaxed mb-3">
                설치 가이드, API 레퍼런스, Skill 개발 문서를 확인하세요.
              </p>
              <Button size="sm" className="w-full gap-2 bg-brand-navy text-white hover:bg-brand-navy/90 text-xs">
                <BookOpen className="h-3.5 w-3.5" />
                문서 바로가기
                <ExternalLink className="h-3 w-3" />
              </Button>
            </div>
          </aside>
        </div>
      </div>

      <Footer />
    </div>
  )
}
