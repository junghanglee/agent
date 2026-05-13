import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Zap, TrendingDown, ArrowRight } from "lucide-react"

const plans = [
  {
    name: "Starter Credit",
    price: "$10",
    tokens: "50,000",
    market: "$20",
    saving: "50%",
    desc: "가볍게 시작하기 좋은 입문 플랜",
    highlight: false,
  },
  {
    name: "Pro Credit",
    price: "$30",
    tokens: "180,000",
    market: "$60",
    saving: "50%",
    desc: "일반 사용자에게 가장 인기 있는 플랜",
    highlight: true,
  },
  {
    name: "Business Credit",
    price: "$100",
    tokens: "700,000",
    market: "$200",
    saving: "50%",
    desc: "팀·비즈니스를 위한 대용량 플랜",
    highlight: false,
  },
  {
    name: "Monthly Plan",
    price: "$25",
    tokens: "150,000/월",
    market: "$50",
    saving: "50%",
    desc: "매달 자동 충전되는 구독 플랜",
    highlight: false,
    badge: "구독",
  },
]

export function TokenSection() {
  return (
    <section className="bg-brand-navy py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand-cyan/30 bg-brand-cyan/10 px-4 py-1.5 text-sm font-medium text-brand-cyan">
            <TrendingDown className="h-3.5 w-3.5" />
            시장가 대비 50% 이상 절약
          </div>
          <h2 className="text-balance text-3xl font-bold text-white md:text-4xl">
            시장가격보다 50% 이상 저렴한{" "}
            <span className="text-brand-cyan">LLM 토큰 충전</span>
          </h2>
          <p className="mt-3 text-white/60">
            더 많이, 더 오래 AI를 사용하세요. AI Linker의 토큰은 가장 저렴합니다.
          </p>
        </div>

        {/* Pricing cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-2xl p-5 transition-shadow ${
                plan.highlight
                  ? "border-2 border-brand-cyan bg-brand-cyan/5 shadow-lg shadow-brand-cyan/10"
                  : "border border-white/10 bg-white/5"
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-cyan px-3 py-0.5 text-xs font-bold text-brand-navy">
                  가장 인기
                </div>
              )}
              {plan.badge && (
                <div className="absolute right-4 top-4 rounded-full bg-brand-violet/30 px-2.5 py-0.5 text-xs font-medium text-white/80">
                  {plan.badge}
                </div>
              )}

              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-cyan/20">
                  <Zap className="h-4 w-4 text-brand-cyan" />
                </div>
                <span className="text-sm font-semibold text-white">{plan.name}</span>
              </div>

              <div className="mb-1">
                <span className="text-3xl font-extrabold text-white">{plan.price}</span>
              </div>
              <p className="mb-3 text-xs text-white/50">{plan.desc}</p>

              <div className="mb-4 rounded-lg bg-white/5 p-3">
                <p className="text-sm text-brand-cyan font-semibold">{plan.tokens} 토큰</p>
                <p className="text-xs text-white/40 line-through">시장가 {plan.market}</p>
                <span className="mt-1 inline-block rounded-full bg-green-500/20 px-2 py-0.5 text-xs font-bold text-green-400">
                  {plan.saving} 절약
                </span>
              </div>

              <Link href="/tokens" className="mt-auto">
                <Button
                  size="sm"
                  className={`w-full font-semibold ${
                    plan.highlight
                      ? "bg-brand-cyan text-brand-navy hover:bg-brand-cyan/90"
                      : "border border-white/20 bg-white/10 text-white hover:bg-white/20"
                  }`}
                >
                  충전하기
                </Button>
              </Link>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link href="/tokens">
            <Button variant="link" className="gap-1 text-brand-cyan hover:text-brand-cyan/80">
              모든 토큰 플랜 비교하기
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
