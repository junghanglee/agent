import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Bot, Star, ArrowRight, Monitor, Apple, Download } from "lucide-react"

const agents = [
  {
    name: "Hermes AI Agent",
    category: "업무 자동화",
    difficulty: "초보자",
    difficultyColor: "bg-green-100 text-green-700",
    os: ["Windows", "iOS"],
    price: "₩29,000",
    version: "v2.4.1",
    rating: 4.8,
    reviews: 342,
    desc: "반복 업무 자동화에 최적화된 범용 AI Agent. 이메일, 일정, 문서를 한 번에 관리하세요.",
    badge: "베스트셀러",
    badgeColor: "bg-amber-100 text-amber-700",
  },
  {
    name: "OpenClaw Assistant",
    category: "코딩 보조",
    difficulty: "파워유저",
    difficultyColor: "bg-purple-100 text-purple-700",
    os: ["Windows"],
    price: "₩39,000",
    version: "v1.8.3",
    rating: 4.7,
    reviews: 215,
    desc: "코드 자동완성·리뷰·디버깅까지. 개발 생산성을 2배로 높이는 코딩 전문 Agent.",
    badge: "인기",
    badgeColor: "bg-brand-cyan-soft text-brand-navy",
  },
  {
    name: "Business Messenger Agent",
    category: "메신저 비서",
    difficulty: "일반 사용자",
    difficultyColor: "bg-blue-100 text-blue-700",
    os: ["Windows", "iOS"],
    price: "₩19,000",
    version: "v3.1.0",
    rating: 4.9,
    reviews: 589,
    desc: "슬랙·카카오톡과 연동되는 비서 Agent. 메시지 요약, 자동 답변, 일정 등록까지.",
    badge: "신규",
    badgeColor: "bg-green-100 text-green-700",
  },
  {
    name: "Research Agent",
    category: "리서치",
    difficulty: "일반 사용자",
    difficultyColor: "bg-blue-100 text-blue-700",
    os: ["Windows", "iOS"],
    price: "₩24,000",
    version: "v2.0.5",
    rating: 4.6,
    reviews: 178,
    desc: "웹 전체를 탐색해 요약·정리해주는 리서치 전문 Agent. 논문·뉴스·시장조사에 최적.",
    badge: null,
    badgeColor: "",
  },
]

export function FeaturedAgents() {
  return (
    <section className="bg-background py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        {/* Header */}
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-balance text-3xl font-bold text-foreground md:text-4xl">
              다운로드 가능한 AI Agent
            </h2>
            <p className="mt-2 text-muted-foreground">
              소개를 확인하고 필요한 설치파일을 바로 다운로드하세요.
            </p>
          </div>
          <Link href="/agents">
            <Button variant="outline" className="gap-2 border-brand-navy text-brand-navy hover:bg-brand-navy hover:text-white">
              전체 보기
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Agent cards */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {agents.map((agent) => (
            <div
              key={agent.name}
              className="group flex flex-col rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md"
            >
              {/* Thumbnail */}
              <div className="relative flex h-36 items-center justify-center rounded-t-2xl bg-gradient-to-br from-brand-navy to-brand-violet/80">
                <Bot className="h-14 w-14 text-brand-cyan/80" />
                {agent.badge && (
                  <span className={`absolute right-3 top-3 rounded-full px-2.5 py-0.5 text-xs font-semibold ${agent.badgeColor}`}>
                    {agent.badge}
                  </span>
                )}
              </div>

              {/* Body */}
              <div className="flex flex-1 flex-col gap-3 p-4">
                {/* OS badges */}
                <div className="flex items-center gap-1.5">
                  {agent.os.includes("Windows") && (
                    <span className="flex items-center gap-1 rounded border border-border bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                      <Monitor className="h-3 w-3" /> Windows
                    </span>
                  )}
                  {agent.os.includes("iOS") && (
                    <span className="flex items-center gap-1 rounded border border-border bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                      <Apple className="h-3 w-3" /> iOS
                    </span>
                  )}
                  <span className={`ml-auto rounded-full px-2 py-0.5 text-xs font-medium ${agent.difficultyColor}`}>
                    {agent.difficulty}
                  </span>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground">{agent.name}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground line-clamp-2">
                    {agent.desc}
                  </p>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  <span className="font-medium text-foreground">{agent.rating}</span>
                  <span>({agent.reviews})</span>
                  <span className="ml-auto text-muted-foreground/60">{agent.version}</span>
                </div>

                {/* Price + CTA */}
                <div className="mt-auto flex items-center justify-between border-t border-border pt-3">
                  <span className="text-base font-bold text-foreground">{agent.price}</span>
                  <Link href="/agents/hermes">
                    <Button size="sm" className="gap-1 bg-brand-navy text-white hover:bg-brand-navy/90 text-xs">
                      다운로드 <Download className="h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
