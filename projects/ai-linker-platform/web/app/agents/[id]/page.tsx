"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Bot, Star, Monitor, Apple, Download, Key, Zap, CheckCircle2,
  ChevronRight, MessageCircle, FileText, Globe,
  ArrowRight, Shield, Clock, BarChart3, Bell, Code2,
  Headphones, Filter, Plus, Info, Search, X, Check,
  Database, Mail, CalendarDays, SlidersHorizontal
} from "lucide-react"

// ─── 설치 단계 ────────────────────────────────────────────────────────────────

const steps = [
  { n: 1, title: "설치파일 다운로드", desc: "결제 전이라도 최신 설치파일을 먼저 받을 수 있습니다." },
  { n: 2, title: "설치프로그램 실행", desc: "설치 프로그램이 웹과 연결해 최신 버전과 구매/검증 URL을 확인합니다." },
  { n: 3, title: "LLM 연결 단계", desc: "실제 AI Linker LLM 서비스를 사용하려면 결제 또는 설치코드가 필요합니다." },
  { n: 4, title: "설치코드 발급", desc: "결제 완료 즉시 웹에서 설치코드를 확인하고 복사할 수 있습니다." },
  { n: 5, title: "토큰 연결", desc: "설치코드 활성화 후 토큰 잔액이 있으면 AI 기능을 즉시 사용할 수 있습니다." },
]

// ─── 기본 기능 ────────────────────────────────────────────────────────────────

const features = [
  "이메일 자동 분류 및 답변 초안 생성",
  "구글 캘린더·아웃룩 일정 자동 관리",
  "문서 요약 및 보고서 자동 작성",
  "슬랙·카카오톡 메시지 요약",
  "반복 업무 자동화 워크플로우",
  "GPT-4o / Claude 3.5 선택 가능",
]

// ─── Skill 데이터 ─────────────────────────────────────────────────────────────

const includedSkills = [
  {
    icon: MessageCircle, name: "기본 메신저 연결",
    desc: "슬랙, 카카오톡 등 기본 메신저 알림 연동",
    color: "text-brand-cyan", bg: "bg-brand-cyan-soft",
  },
  {
    icon: FileText, name: "문서 요약 엔진",
    desc: "PDF, 워드, 구글 Docs 자동 요약",
    color: "text-emerald-500", bg: "bg-emerald-50",
  },
  {
    icon: CalendarDays, name: "일정 자동 등록",
    desc: "이메일·대화에서 일정을 파싱해 캘린더에 자동 등록",
    color: "text-blue-500", bg: "bg-blue-50",
  },
]

const skillCategories = ["전체", "메신저", "문서", "검색", "분석", "개발", "고객지원", "데이터", "이메일"]

type Skill = {
  icon: React.ElementType
  name: string
  category: string
  desc: string
  price: string
  rating: number
  reviews: number
  color: string
  bg: string
  badge: string | null
  installed?: boolean
}

const allPaidSkills: Skill[] = [
  {
    icon: Globe, name: "웹검색 강화", category: "검색",
    desc: "실시간 웹 검색으로 최신 정보 접근성을 극대화합니다.",
    price: "₩7,900", rating: 4.9, reviews: 312,
    color: "text-brand-cyan", bg: "bg-brand-cyan-soft", badge: "인기",
  },
  {
    icon: BarChart3, name: "업무 리포트 생성", category: "분석",
    desc: "주간·월간 업무 현황을 자동으로 분석해 리포트를 생성합니다.",
    price: "₩14,900", rating: 4.6, reviews: 145,
    color: "text-brand-violet", bg: "bg-purple-50", badge: null,
  },
  {
    icon: Bell, name: "스마트 알림", category: "메신저",
    desc: "중요 이벤트와 일정을 선택한 채널로 자동 발송합니다.",
    price: "₩6,900", rating: 4.5, reviews: 98,
    color: "text-amber-500", bg: "bg-amber-50", badge: "신규",
  },
  {
    icon: FileText, name: "고급 문서 자동화", category: "문서",
    desc: "엑셀·구글시트·노션과 연동해 문서를 자동 작성·정리합니다.",
    price: "₩12,900", rating: 4.7, reviews: 187,
    color: "text-emerald-500", bg: "bg-emerald-50", badge: null,
  },
  {
    icon: Code2, name: "코드 리뷰 엔진", category: "개발",
    desc: "커밋 단위로 코드를 자동 리뷰하고 개선안을 제안합니다.",
    price: "₩19,900", rating: 4.8, reviews: 76,
    color: "text-indigo-500", bg: "bg-indigo-50", badge: null,
  },
  {
    icon: Headphones, name: "CS 자동응답", category: "고객지원",
    desc: "고객 문의를 분류하고 FAQ 기반으로 자동 답변합니다.",
    price: "₩16,900", rating: 4.6, reviews: 112,
    color: "text-pink-500", bg: "bg-pink-50", badge: null,
  },
  {
    icon: Database, name: "DB 연동 조회", category: "데이터",
    desc: "MySQL·PostgreSQL에 자연어로 질의해 데이터를 조회합니다.",
    price: "₩22,900", rating: 4.7, reviews: 54,
    color: "text-teal-500", bg: "bg-teal-50", badge: null,
  },
  {
    icon: Mail, name: "이메일 자동 분류", category: "이메일",
    desc: "수신 이메일을 주제·중요도별로 자동 분류하고 레이블을 붙입니다.",
    price: "₩9,900", rating: 4.8, reviews: 203,
    color: "text-orange-500", bg: "bg-orange-50", badge: "인기",
  },
  {
    icon: MessageCircle, name: "팀즈 연동", category: "메신저",
    desc: "MS Teams 채널과 연결해 요약 알림·회의록 자동 생성.",
    price: "₩11,900", rating: 4.5, reviews: 88,
    color: "text-blue-600", bg: "bg-blue-50", badge: null,
  },
  {
    icon: BarChart3, name: "경쟁사 모니터링", category: "검색",
    desc: "지정한 키워드를 매일 검색해 변동 사항을 리포트로 발송합니다.",
    price: "₩17,900", rating: 4.4, reviews: 61,
    color: "text-rose-500", bg: "bg-rose-50", badge: null,
  },
]

// ─── 리뷰 ─────────────────────────────────────────────────────────────────────

const reviews = [
  { name: "김민준", rating: 5, date: "2025.04.12", text: "설치가 정말 쉬워요. 설치코드 받고 5분 만에 사용 시작했습니다. 업무 자동화가 확실히 되네요." },
  { name: "이수진", rating: 4, date: "2025.03.28", text: "토큰 소모가 생각보다 적고, 기능이 다양합니다. 비서처럼 쓰고 있어요." },
  { name: "박현우", rating: 5, date: "2025.03.15", text: "Skill 추가가 편하고 커뮤니티 지원도 빠릅니다. 강력 추천!" },
]

// ─── Skill 탭 컴포넌트 ────────────────────────────────────────────────────────

function SkillStore() {
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("전체")
  const [showInstalled, setShowInstalled] = useState(false)
  const [installedSet, setInstalledSet] = useState<Set<string>>(new Set())

  const filtered = useMemo(() => {
    return allPaidSkills.filter((s) => {
      const matchSearch =
        search === "" ||
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.desc.includes(search) ||
        s.category.includes(search)
      const matchCategory = category === "전체" || s.category === category
      const matchInstalled = !showInstalled || installedSet.has(s.name)
      return matchSearch && matchCategory && matchInstalled
    })
  }, [search, category, showInstalled, installedSet])

  const toggleInstall = (name: string) => {
    setInstalledSet((prev) => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })
  }

  return (
    <div className="space-y-6">
      {/* Info banner */}
      <div className="flex items-start gap-3 rounded-xl border border-brand-cyan/30 bg-brand-cyan-soft p-4">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand-navy" />
        <p className="text-sm text-brand-navy/80">
          Skill을 추가 설치하면 이 Agent의 기능을 확장하거나 업무에 맞게 튜닝할 수 있습니다.
          구매 이후 언제든지 추가·제거할 수 있으며, 각 Skill은 독립적으로 동작합니다.
        </p>
      </div>

      {/* Included skills */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <p className="text-sm font-semibold text-foreground">기본 포함 Skill</p>
          <span className="ml-auto rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
            {includedSkills.length}개 포함
          </span>
        </div>
        <div className="grid gap-2 sm:grid-cols-3">
          {includedSkills.map((s) => (
            <div
              key={s.name}
              className="flex items-center gap-3 rounded-xl border border-green-100 bg-green-50/50 p-3"
            >
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${s.bg}`}>
                <s.icon className={`h-4 w-4 ${s.color}`} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-foreground leading-tight">{s.name}</p>
                <p className="text-xs text-muted-foreground leading-tight mt-0.5 line-clamp-1">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Skill 스토어 */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm font-semibold text-foreground">추가 Skill 스토어</p>
          </div>
          <span className="text-xs text-muted-foreground">
            {filtered.length} / {allPaidSkills.length}개
          </span>
        </div>

        {/* Search + filter bar */}
        <div className="space-y-3 mb-5">
          {/* Search input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Skill 이름, 기능, 카테고리로 검색..."
              className="pl-9 pr-9 bg-background text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Category chips + installed toggle */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <Filter className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            {skillCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-all ${
                  category === cat
                    ? "bg-brand-navy text-white"
                    : "border border-border bg-card text-muted-foreground hover:border-brand-navy/40 hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
            <div className="ml-auto shrink-0">
              <button
                onClick={() => setShowInstalled((v) => !v)}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium border transition-all ${
                  showInstalled
                    ? "bg-brand-cyan-soft border-brand-cyan text-brand-navy"
                    : "border-border bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                <Check className="h-3 w-3" />
                설치됨만
              </button>
            </div>
          </div>
        </div>

        {/* Skill cards grid */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border py-12 text-center">
            <Search className="h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">검색 결과가 없습니다.</p>
            <button
              onClick={() => { setSearch(""); setCategory("전체"); setShowInstalled(false) }}
              className="text-xs text-brand-navy underline underline-offset-2"
            >
              필터 초기화
            </button>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {filtered.map((s) => {
              const isInstalled = installedSet.has(s.name)
              return (
                <div
                  key={s.name}
                  className={`flex flex-col rounded-xl border bg-card p-4 transition-all hover:shadow-md ${
                    isInstalled ? "border-brand-cyan/40 ring-1 ring-brand-cyan/20" : "border-border"
                  }`}
                >
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${s.bg}`}>
                        <s.icon className={`h-5 w-5 ${s.color}`} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground leading-tight">{s.name}</p>
                        <span className="text-xs text-muted-foreground">{s.category}</span>
                      </div>
                    </div>
                    {s.badge && (
                      <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                        {s.badge}
                      </span>
                    )}
                  </div>

                  <p className="flex-1 text-xs leading-relaxed text-muted-foreground">{s.desc}</p>

                  <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    <span className="font-medium text-foreground">{s.rating}</span>
                    <span>({s.reviews})</span>
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                    <span className="font-bold text-foreground">{s.price}</span>
                    <Button
                      size="sm"
                      onClick={() => toggleInstall(s.name)}
                      className={`gap-1.5 text-xs transition-all ${
                        isInstalled
                          ? "bg-muted text-muted-foreground border border-border hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                          : "bg-brand-navy text-white hover:bg-brand-navy/90"
                      }`}
                      variant={isInstalled ? "outline" : "default"}
                    >
                      {isInstalled ? (
                        <><Check className="h-3 w-3" /> 설치됨</>
                      ) : (
                        <><Plus className="h-3 w-3" /> 추가 설치</>
                      )}
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Token CTA */}
      <div className="rounded-xl border border-brand-cyan/30 bg-brand-cyan-soft p-4">
        <div className="flex items-center gap-3">
          <Zap className="h-5 w-5 text-brand-navy" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-brand-navy">LLM 토큰이 필요합니다</p>
            <p className="text-xs text-brand-navy/70">AI Linker 토큰으로 시장가보다 50% 저렴하게 사용하세요.</p>
          </div>
          <Link href="/tokens">
            <Button size="sm" className="bg-brand-navy text-white text-xs gap-1">
              토큰 충전 <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

// ─── 메인 페이지 ──────────────────────────────────────────────────────────────

export default function AgentDetailPage() {
  const [selectedOS, setSelectedOS] = useState<"Windows" | "iOS">("Windows")
  const [activeTab, setActiveTab] = useState("기능")

  const tabs = ["기능", "설치 방법", "Skill", "리뷰/Q&A"]

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Breadcrumb */}
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-3 md:px-8">
          <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Link href="/" className="hover:text-foreground">홈</Link>
            <ChevronRight className="h-3 w-3" />
            <Link href="/agents" className="hover:text-foreground">Agent 마켓</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground">Hermes AI Agent</span>
          </nav>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 md:px-8">
        <div className="grid gap-10 lg:grid-cols-3">

          {/* ── 본문 ── */}
          <div className="lg:col-span-2 space-y-8">

            {/* Product hero */}
            <div className="flex items-start gap-5">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-navy to-brand-violet/80">
                <Bot className="h-10 w-10 text-brand-cyan" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                    베스트셀러
                  </span>
                  <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                    초보자
                  </span>
                </div>
                <h1 className="text-2xl font-bold text-foreground md:text-3xl">
                  Hermes AI Agent 설치 프로그램
                </h1>
                <div className="mt-1.5 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    <span className="font-semibold text-foreground">4.8</span>
                    <span>(342개 리뷰)</span>
                  </span>
                  <span>v2.4.1</span>
                  <span>업무 자동화</span>
                  <span className="flex items-center gap-1 text-brand-cyan font-medium">
                    <Zap className="h-3.5 w-3.5" />
                    Skill {allPaidSkills.length + includedSkills.length}개 호환
                  </span>
                </div>
              </div>
            </div>

            {/* OS selector */}
            <div>
              <p className="mb-2 text-sm font-semibold text-foreground">OS 버전 선택</p>
              <div className="flex gap-3">
                {(["Windows", "iOS"] as const).map((os) => (
                  <button
                    key={os}
                    onClick={() => setSelectedOS(os)}
                    className={`flex items-center gap-2 rounded-xl border-2 px-5 py-3 text-sm font-medium transition-all ${
                      selectedOS === os
                        ? "border-brand-navy bg-brand-navy/5 text-brand-navy"
                        : "border-border bg-card text-muted-foreground hover:border-brand-navy/40"
                    }`}
                  >
                    {os === "Windows" ? <Monitor className="h-4 w-4" /> : <Apple className="h-4 w-4" />}
                    {os}
                  </button>
                ))}
              </div>
            </div>

            {/* Latest release */}
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">최신 버전</p>
                  <p className="text-lg font-bold text-foreground">v2.4.1</p>
                  <p className="text-sm text-muted-foreground mt-0.5">2025년 4월 30일 릴리즈</p>
                </div>
                <span className="rounded-full bg-brand-cyan-soft px-3 py-1 text-xs font-semibold text-brand-navy">
                  최신
                </span>
              </div>
              <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-brand-cyan" />GPT-4o 지원 추가</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-brand-cyan" />일정 자동 등록 기능 강화</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-brand-cyan" />메신저 연결 안정성 개선</li>
              </ul>
              <Link href="/api/releases/latest?productSlug=hermes-agent&platform=WINDOWS">
                <Button size="sm" className="mt-4 gap-1.5 text-xs" variant="outline">
                  <Download className="h-3.5 w-3.5" />
                  최신 릴리즈 확인
                </Button>
              </Link>
            </div>

            {/* Tabs */}
            <div>
              <div className="flex border-b border-border overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`shrink-0 px-5 py-2.5 text-sm font-medium transition-colors ${
                      activeTab === tab
                        ? "border-b-2 border-brand-navy text-brand-navy"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {tab}
                    {tab === "Skill" && (
                      <span className="ml-1.5 rounded-full bg-brand-cyan-soft px-1.5 py-0.5 text-xs font-semibold text-brand-navy">
                        {allPaidSkills.length + includedSkills.length}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              <div className="mt-6">
                {activeTab === "기능" && (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {features.map((f) => (
                      <div key={f} className="flex items-start gap-2.5 rounded-lg bg-muted/60 p-3 text-sm">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-cyan" />
                        <span className="text-foreground">{f}</span>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === "설치 방법" && (
                  <div className="space-y-4">
                    {steps.map((step, i) => (
                      <div key={step.n} className="flex items-start gap-4">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-navy text-sm font-bold text-white">
                          {step.n}
                        </div>
                        <div className={`flex-1 ${i < steps.length - 1 ? "pb-5 border-l-2 border-dashed border-border ml-[-28px] pl-10" : ""}`}>
                          <p className="font-semibold text-foreground">{step.title}</p>
                          <p className="mt-0.5 text-sm text-muted-foreground">{step.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === "Skill" && <SkillStore />}

                {activeTab === "리뷰/Q&A" && (
                  <div className="space-y-4">
                    {reviews.map((r) => (
                      <div key={r.name} className="rounded-xl border border-border bg-card p-4">
                        <div className="mb-2 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-navy text-xs font-bold text-white">
                              {r.name[0]}
                            </div>
                            <span className="text-sm font-semibold text-foreground">{r.name}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: r.rating }).map((_, i) => (
                              <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                            ))}
                            <span className="ml-2 text-xs text-muted-foreground">{r.date}</span>
                          </div>
                        </div>
                        <p className="text-sm leading-relaxed text-muted-foreground">{r.text}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── 사이드바 ── */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
              <div>
                <p className="text-xs text-muted-foreground">선택된 버전</p>
                <div className="mt-1 flex items-center gap-2">
                  {selectedOS === "Windows"
                    ? <Monitor className="h-4 w-4 text-brand-navy" />
                    : <Apple className="h-4 w-4 text-brand-navy" />}
                  <span className="font-semibold text-foreground">{selectedOS}</span>
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <div className="flex items-end justify-between">
                  <span className="text-sm text-muted-foreground">가격</span>
                  <span className="text-2xl font-extrabold text-foreground">₩29,000</span>
                </div>
              </div>

              <div className="space-y-2 rounded-lg bg-muted/60 p-3 text-sm">
                {[
                  { icon: Download, label: "결제 전 다운로드 가능" },
                  { icon: Key, label: "LLM 연결 단계에서 코드 필요" },
                  { icon: Shield, label: "평생 라이선스 (1 디바이스)" },
                  { icon: Clock, label: "무료 업데이트 1년" },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-2 text-muted-foreground">
                    <Icon className="h-3.5 w-3.5 text-brand-cyan" />
                    {label}
                  </div>
                ))}
              </div>

              <Link href={`/checkout?product=hermes-agent&platform=${selectedOS === "iOS" ? "IOS" : "WINDOWS"}`} className="block">
                <Button className="w-full gap-2 bg-brand-navy text-white font-bold hover:bg-brand-navy/90">
                  <Key className="h-4 w-4" /> 서비스 활성화/코드 발급
                </Button>
              </Link>
              <Link href="/api/installer/bootstrap?productSlug=hermes-agent&platform=WINDOWS" className="block">
                <Button variant="outline" className="w-full text-sm border-brand-navy text-brand-navy">
                  설치 연동 정보 확인
                </Button>
              </Link>

              {/* Skill summary */}
              <div
                className="cursor-pointer rounded-lg border border-border p-3 text-xs text-muted-foreground hover:bg-muted/40 transition-colors"
                onClick={() => setActiveTab("Skill")}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-foreground text-sm">호환 Skill</span>
                  <span className="text-brand-cyan font-medium">{allPaidSkills.length + includedSkills.length}개</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {skillCategories.slice(1).map((cat) => (
                    <span key={cat} className="rounded-full bg-muted px-2 py-0.5">{cat}</span>
                  ))}
                </div>
                <p className="mt-2 text-brand-navy/80 font-medium flex items-center gap-1">
                  Skill 탭에서 자세히 보기 <ArrowRight className="h-3 w-3" />
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
