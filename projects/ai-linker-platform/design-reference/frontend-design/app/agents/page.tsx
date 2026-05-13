"use client"

import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import {
  Bot, Star, Monitor, Apple, Zap, Users, ArrowRight,
  Briefcase, MessageSquare, FileText, Search as SearchIcon,
  Code2, Headphones, ChevronRight
} from "lucide-react"

// ─── 데이터 ───────────────────────────────────────────────────────────────────

const agentGroups = [
  {
    group: "업무 자동화",
    desc: "반복 업무를 자동화해 시간을 아끼는 Agent 모음",
    icon: Briefcase,
    color: "text-brand-cyan",
    bg: "bg-brand-cyan-soft",
    agents: [
      {
        id: "hermes",
        name: "Hermes AI Agent",
        tagline: "이메일·일정·문서를 한 번에",
        desc: "반복 업무 자동화에 최적화된 범용 AI Agent. 이메일, 일정, 문서를 한 번에 관리하세요.",
        os: ["Windows", "iOS"],
        price: "₩29,000",
        version: "v2.4.1",
        rating: 4.8,
        reviews: 342,
        difficulty: "초보자",
        difficultyColor: "bg-green-100 text-green-700",
        badge: "베스트셀러",
        badgeColor: "bg-amber-100 text-amber-700",
        skillCount: 18,
        users: "2,400+",
        iconColor: "text-brand-cyan",
        iconBg: "from-brand-navy to-brand-violet/80",
      },
      {
        id: "doc-writer",
        name: "DocWriter Agent",
        tagline: "기획서·보고서·제안서 5분 완성",
        desc: "기획서·보고서·제안서를 순식간에 초안 작성. 어떤 문서도 5분 안에.",
        os: ["Windows", "iOS"],
        price: "₩22,000",
        version: "v2.2.0",
        rating: 4.7,
        reviews: 260,
        difficulty: "초보자",
        difficultyColor: "bg-green-100 text-green-700",
        badge: null,
        badgeColor: "",
        skillCount: 12,
        users: "1,800+",
        iconColor: "text-emerald-300",
        iconBg: "from-emerald-700 to-teal-600",
      },
    ],
  },
  {
    group: "메신저·커뮤니케이션",
    desc: "슬랙·카카오톡·메일을 연결해 소통을 자동화하는 Agent",
    icon: MessageSquare,
    color: "text-brand-violet",
    bg: "bg-purple-50",
    agents: [
      {
        id: "business-messenger",
        name: "Business Messenger Agent",
        tagline: "메시지 요약·자동 답변·일정 등록",
        desc: "슬랙·카카오톡과 연동되는 비서 Agent. 메시지 요약, 자동 답변, 일정 등록까지.",
        os: ["Windows", "iOS"],
        price: "₩19,000",
        version: "v3.1.0",
        rating: 4.9,
        reviews: 589,
        difficulty: "일반 사용자",
        difficultyColor: "bg-blue-100 text-blue-700",
        badge: "신규",
        badgeColor: "bg-green-100 text-green-700",
        skillCount: 21,
        users: "3,100+",
        iconColor: "text-purple-300",
        iconBg: "from-purple-700 to-brand-violet/80",
      },
    ],
  },
  {
    group: "리서치·정보 수집",
    desc: "웹 탐색·논문·뉴스를 자동으로 정리해 주는 Agent",
    icon: SearchIcon,
    color: "text-amber-500",
    bg: "bg-amber-50",
    agents: [
      {
        id: "research",
        name: "Research Agent",
        tagline: "웹 전체를 탐색해 요약·정리",
        desc: "웹 전체를 탐색해 요약·정리해주는 리서치 전문 Agent. 논문·뉴스·시장조사에 최적.",
        os: ["Windows", "iOS"],
        price: "₩24,000",
        version: "v2.0.5",
        rating: 4.6,
        reviews: 178,
        difficulty: "일반 사용자",
        difficultyColor: "bg-blue-100 text-blue-700",
        badge: null,
        badgeColor: "",
        skillCount: 15,
        users: "980+",
        iconColor: "text-amber-300",
        iconBg: "from-amber-600 to-orange-600",
      },
    ],
  },
  {
    group: "전문가용",
    desc: "개발자·CS 운영자를 위한 고급 기능 Agent",
    icon: Code2,
    color: "text-indigo-500",
    bg: "bg-indigo-50",
    agents: [
      {
        id: "openclaw",
        name: "OpenClaw Assistant",
        tagline: "코드 자동완성·리뷰·디버깅",
        desc: "코드 자동완성·리뷰·디버깅까지. 개발 생산성을 2배로 높이는 코딩 전문 Agent.",
        os: ["Windows"],
        price: "₩39,000",
        version: "v1.8.3",
        rating: 4.7,
        reviews: 215,
        difficulty: "파워유저",
        difficultyColor: "bg-purple-100 text-purple-700",
        badge: "인기",
        badgeColor: "bg-brand-cyan-soft text-brand-navy",
        skillCount: 24,
        users: "1,200+",
        iconColor: "text-indigo-300",
        iconBg: "from-indigo-700 to-violet-600",
      },
      {
        id: "customer-support",
        name: "CS Helper Agent",
        tagline: "24시간 고객 응대 자동화",
        desc: "24시간 자동 고객 응대 시스템 구축. CS 업무량을 70% 줄여드립니다.",
        os: ["Windows"],
        price: "₩34,000",
        version: "v1.5.2",
        rating: 4.5,
        reviews: 97,
        difficulty: "일반 사용자",
        difficultyColor: "bg-blue-100 text-blue-700",
        badge: null,
        badgeColor: "",
        skillCount: 19,
        users: "650+",
        iconColor: "text-pink-300",
        iconBg: "from-pink-700 to-rose-600",
      },
    ],
  },
]

// ─── 컴포넌트 ─────────────────────────────────────────────────────────────────

function AgentCard({ agent }: { agent: (typeof agentGroups)[0]["agents"][0] }) {
  return (
    <div className="group flex flex-col rounded-2xl border border-border bg-card shadow-sm transition-all hover:shadow-lg hover:-translate-y-0.5">
      {/* Top band */}
      <div className={`relative flex h-36 items-center justify-center rounded-t-2xl bg-gradient-to-br ${agent.iconBg}`}>
        <Bot className={`h-14 w-14 ${agent.iconColor} opacity-90`} />
        {agent.badge && (
          <span className={`absolute right-3 top-3 rounded-full px-2.5 py-0.5 text-xs font-semibold ${agent.badgeColor}`}>
            {agent.badge}
          </span>
        )}
        {/* OS badges */}
        <div className="absolute bottom-3 left-3 flex gap-1.5">
          {agent.os.includes("Windows") && (
            <span className="flex items-center gap-1 rounded-md bg-white/20 px-2 py-0.5 text-xs text-white backdrop-blur-sm">
              <Monitor className="h-3 w-3" /> Win
            </span>
          )}
          {agent.os.includes("iOS") && (
            <span className="flex items-center gap-1 rounded-md bg-white/20 px-2 py-0.5 text-xs text-white backdrop-blur-sm">
              <Apple className="h-3 w-3" /> iOS
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        {/* Name & tagline */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${agent.difficultyColor}`}>
              {agent.difficulty}
            </span>
          </div>
          <h3 className="font-bold text-foreground leading-tight">{agent.name}</h3>
          <p className="mt-0.5 text-xs font-medium text-brand-cyan">{agent.tagline}</p>
        </div>

        <p className="text-sm leading-relaxed text-muted-foreground line-clamp-2">{agent.desc}</p>

        {/* Stats row */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            <span className="font-semibold text-foreground">{agent.rating}</span>
            <span>({agent.reviews})</span>
          </span>
          <span className="flex items-center gap-1">
            <Zap className="h-3 w-3 text-brand-cyan" />
            Skill {agent.skillCount}개
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {agent.users}
          </span>
        </div>

        {/* Price + CTA */}
        <div className="mt-auto flex items-center justify-between border-t border-border pt-4">
          <div>
            <p className="text-xs text-muted-foreground">{agent.version}</p>
            <p className="text-lg font-extrabold text-foreground">{agent.price}</p>
          </div>
          <div className="flex gap-2">
            <Link href={`/agents/${agent.id}`}>
              <Button size="sm" variant="outline" className="text-xs">
                상세보기
              </Button>
            </Link>
            <Link href={`/agents/${agent.id}`}>
              <Button size="sm" className="gap-1 bg-brand-navy text-white text-xs hover:bg-brand-navy/90">
                구매 <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── 페이지 ───────────────────────────────────────────────────────────────────

export default function AgentsPage() {
  const totalAgents = agentGroups.reduce((sum, g) => sum + g.agents.length, 0)

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <div className="border-b border-border bg-brand-navy">
        <div className="mx-auto max-w-7xl px-4 py-14 md:px-8">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-brand-cyan">
            AI Agent 마켓
          </p>
          <h1 className="text-3xl font-extrabold text-white md:text-4xl">
            목적에 맞는 Agent를 고르세요
          </h1>
          <p className="mt-3 max-w-xl text-base text-white/70">
            설치코드 하나로 바로 시작하고, 필요한 Skill을 추가해 나만의 AI Agent로 튜닝하세요.
          </p>
          {/* Summary chips */}
          <div className="mt-6 flex flex-wrap gap-3">
            <span className="flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-sm text-white/80">
              <Bot className="h-3.5 w-3.5 text-brand-cyan" />
              총 {totalAgents}개 Agent
            </span>
            <span className="flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-sm text-white/80">
              <Zap className="h-3.5 w-3.5 text-brand-cyan" />
              총 100+ Skill
            </span>
            <span className="flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-sm text-white/80">
              <Users className="h-3.5 w-3.5 text-brand-cyan" />
              누적 사용자 10,000+
            </span>
          </div>
        </div>
      </div>

      {/* Group sections */}
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-8 space-y-14">
        {agentGroups.map((group) => {
          const GroupIcon = group.icon
          return (
            <section key={group.group}>
              {/* Group header */}
              <div className="mb-6 flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${group.bg}`}>
                  <GroupIcon className={`h-5 w-5 ${group.color}`} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">{group.group}</h2>
                  <p className="text-sm text-muted-foreground">{group.desc}</p>
                </div>
                <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground" />
              </div>

              {/* Agent cards */}
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {group.agents.map((agent) => (
                  <AgentCard key={agent.id} agent={agent} />
                ))}
              </div>
            </section>
          )
        })}
      </div>

      {/* CTA banner */}
      <div className="bg-brand-navy/5 border-y border-border">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 flex flex-col items-center gap-4 text-center">
          <Zap className="h-8 w-8 text-brand-cyan" />
          <h3 className="text-xl font-bold text-foreground">구매 후 토큰만 충전하면 바로 시작</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            설치코드를 받아 설치하고, AI Linker 토큰을 연결하면 즉시 사용할 수 있습니다. 토큰은 시장가보다 50% 저렴합니다.
          </p>
          <div className="flex gap-3">
            <Link href="/tokens">
              <Button variant="outline" className="gap-2 border-brand-navy text-brand-navy">
                토큰 요금 보기
              </Button>
            </Link>
            <Link href="/community">
              <Button className="gap-2 bg-brand-navy text-white hover:bg-brand-navy/90">
                커뮤니티 후기 보기
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
