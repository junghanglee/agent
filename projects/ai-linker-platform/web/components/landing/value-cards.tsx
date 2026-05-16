import { Rocket, Download, Coins, MessageSquare } from "lucide-react"

const values = [
  {
    icon: Rocket,
    title: "쉬운 설치",
    desc: "클릭 몇 번으로 AI Agent를 설치하세요. 개발 지식이 없어도 OK.",
    color: "text-brand-cyan",
    bg: "bg-brand-cyan-soft",
  },
  {
    icon: Download,
    title: "다운로드 중심",
    desc: "회원가입 없이 소개를 보고 설치파일을 바로 받을 수 있습니다.",
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
    icon: MessageSquare,
    title: "요청 기반 처리",
    desc: "충전과 문의는 간단한 요청서로 남기고 관리자가 확인해 처리합니다.",
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
