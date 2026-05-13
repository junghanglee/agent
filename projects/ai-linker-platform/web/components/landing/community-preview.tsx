import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MessageCircle, HelpCircle, Wrench, Headphones, ArrowRight, Users } from "lucide-react"

const supports = [
  {
    icon: HelpCircle,
    title: "구매자 Q&A",
    desc: "Agent 구매 전 궁금한 점을 커뮤니티에서 빠르게 해결하세요.",
    count: "1,240개 답변",
    color: "text-blue-500",
    bg: "bg-blue-50",
  },
  {
    icon: Wrench,
    title: "설치 도움",
    desc: "설치 과정에서 막히는 부분을 단계별로 안내받으세요.",
    count: "98% 해결률",
    color: "text-emerald-500",
    bg: "bg-emerald-50",
  },
  {
    icon: MessageCircle,
    title: "튜닝 요청",
    desc: "내 Agent를 더 잘 쓰고 싶다면? 전문가에게 직접 요청하세요.",
    count: "평균 4시간 응답",
    color: "text-brand-violet",
    bg: "bg-purple-50",
  },
  {
    icon: Headphones,
    title: "운영자 채팅 지원",
    desc: "복잡한 문제는 운영자와 1:1 채팅으로 직접 해결하세요.",
    count: "24/7 운영",
    color: "text-brand-cyan",
    bg: "bg-brand-cyan-soft",
  },
]

export function CommunityPreview() {
  return (
    <section className="bg-muted/40 py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm font-medium text-muted-foreground">
            <Users className="h-3.5 w-3.5" />
            32,000+ 커뮤니티 멤버
          </div>
          <h2 className="text-balance text-3xl font-bold text-foreground md:text-4xl">
            커뮤니티 &amp; 지원
          </h2>
          <p className="mt-3 text-muted-foreground">
            혼자 고민하지 마세요. AI Linker 커뮤니티가 함께합니다.
          </p>
        </div>

        {/* Support cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {supports.map((s) => (
            <div key={s.title} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl ${s.bg}`}>
                <s.icon className={`h-5 w-5 ${s.color}`} />
              </div>
              <h3 className="font-semibold text-foreground">{s.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
              <span className="mt-3 inline-block rounded-full bg-muted px-3 py-0.5 text-xs font-medium text-foreground">
                {s.count}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link href="/community">
            <Button className="gap-2 bg-brand-navy text-white hover:bg-brand-navy/90">
              커뮤니티 참여하기
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
