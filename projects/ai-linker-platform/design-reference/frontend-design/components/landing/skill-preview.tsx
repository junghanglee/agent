import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MessageSquare, FileSpreadsheet, Globe, BarChart3, ArrowRight, ShoppingCart } from "lucide-react"

const skills = [
  {
    icon: MessageSquare,
    name: "메신저 연결",
    desc: "슬랙, 카카오, 텔레그램 등 메신저 앱과 Agent를 직접 연동",
    price: "₩9,900",
    compat: ["Hermes AI", "Business Messenger"],
    color: "text-blue-500",
    bg: "bg-blue-50",
  },
  {
    icon: FileSpreadsheet,
    name: "문서 자동화",
    desc: "엑셀·구글시트·노션과 연동해 문서를 자동으로 작성·정리",
    price: "₩12,900",
    compat: ["Hermes AI", "Research Agent"],
    color: "text-emerald-500",
    bg: "bg-emerald-50",
  },
  {
    icon: Globe,
    name: "웹검색 강화",
    desc: "실시간 웹 검색으로 Agent의 최신 정보 접근성을 극대화",
    price: "₩7,900",
    compat: ["Research Agent", "OpenClaw"],
    color: "text-brand-cyan",
    bg: "bg-brand-cyan-soft",
  },
  {
    icon: BarChart3,
    name: "업무 리포트 생성",
    desc: "주간·월간 업무 현황을 자동으로 분석·리포트 형태로 생성",
    price: "₩14,900",
    compat: ["Hermes AI", "Business Messenger"],
    color: "text-brand-violet",
    bg: "bg-purple-50",
  },
]

export function SkillPreview() {
  return (
    <section className="bg-background py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        {/* Header */}
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-balance text-3xl font-bold text-foreground md:text-4xl">
              Skill 마켓
            </h2>
            <p className="mt-2 text-muted-foreground">
              필요한 기능만 골라 AI Agent를 내 입맛대로 업그레이드하세요.
            </p>
          </div>
          <Link href="/skills">
            <Button variant="outline" className="gap-2 border-brand-navy text-brand-navy hover:bg-brand-navy hover:text-white">
              전체 Skill 보기
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Skill cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {skills.map((skill) => (
            <div
              key={skill.name}
              className="group flex flex-col rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className={`mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl ${skill.bg}`}>
                <skill.icon className={`h-5 w-5 ${skill.color}`} />
              </div>
              <h3 className="font-semibold text-foreground">{skill.name}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground flex-1">{skill.desc}</p>

              {/* Compat badges */}
              <div className="my-3 flex flex-wrap gap-1">
                {skill.compat.map((c) => (
                  <span key={c} className="rounded-full border border-border bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                    {c}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between border-t border-border pt-3">
                <span className="font-bold text-foreground">{skill.price}</span>
                <Button size="sm" variant="outline" className="gap-1.5 text-xs border-brand-navy text-brand-navy hover:bg-brand-navy hover:text-white">
                  <ShoppingCart className="h-3 w-3" />
                  구매
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
