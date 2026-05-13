import { Rocket, Key, Coins, Puzzle } from "lucide-react"

const values = [
  {
    icon: Rocket,
    title: "쉬운 설치",
    desc: "클릭 몇 번으로 AI Agent를 설치하세요. 개발 지식이 없어도 OK.",
    color: "text-brand-cyan",
    bg: "bg-brand-cyan-soft",
  },
  {
    icon: Key,
    title: "설치코드 제공",
    desc: "구매 즉시 라이선스 코드가 발급됩니다. 코드 하나로 간편하게 인증.",
    color: "text-brand-violet",
    bg: "bg-purple-50",
  },
  {
    icon: Coins,
    title: "저렴한 LLM 토큰",
    desc: "시장 대비 50% 이상 저렴한 토큰으로 더 오래, 더 많이 사용하세요.",
    color: "text-amber-500",
    bg: "bg-amber-50",
  },
  {
    icon: Puzzle,
    title: "Skill 업그레이드",
    desc: "필요한 기능만 골라 Agent를 확장하세요. 수십 가지 Skill로 최적화.",
    color: "text-emerald-500",
    bg: "bg-emerald-50",
  },
]

export function ValueCards() {
  return (
    <section className="bg-background py-16 pt-20 md:py-24 md:pt-24">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((v) => (
            <div
              key={v.title}
              className="group rounded-2xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl ${v.bg}`}>
                <v.icon className={`h-6 w-6 ${v.color}`} />
              </div>
              <h3 className="mb-1.5 text-base font-semibold text-foreground">{v.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{v.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
