"use client"

import { useState } from "react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Zap, TrendingDown, CheckCircle2, BarChart3, RefreshCw, ArrowRight } from "lucide-react"

const credits = [
  {
    name: "Starter Credit",
    price: "$10",
    krw: "₩13,900",
    tokens: "50,000",
    market: "$20",
    saving: "50%",
    desc: "가볍게 시작하는 입문 플랜",
    perToken: "$0.0002",
    highlight: false,
    uses: ["GPT-4o mini 약 500회", "Claude Haiku 약 800회"],
  },
  {
    name: "Pro Credit",
    price: "$30",
    krw: "₩41,700",
    tokens: "180,000",
    market: "$60",
    saving: "50%",
    desc: "가장 많이 선택하는 인기 플랜",
    perToken: "$0.000167",
    highlight: true,
    uses: ["GPT-4o 약 600회", "Claude Sonnet 약 450회"],
  },
  {
    name: "Business Credit",
    price: "$100",
    krw: "₩139,000",
    tokens: "700,000",
    market: "$200",
    saving: "50%",
    desc: "팀·비즈니스를 위한 대용량 플랜",
    perToken: "$0.000143",
    highlight: false,
    uses: ["GPT-4o 약 2,333회", "Claude Sonnet 약 1,750회"],
  },
]

const subscriptions = [
  {
    name: "Basic Monthly",
    price: "$15/월",
    tokens: "90,000/월",
    saving: "50%",
    desc: "개인 사용자용 월정액",
  },
  {
    name: "Pro Monthly",
    price: "$25/월",
    tokens: "200,000/월",
    saving: "50%",
    desc: "파워유저·소규모팀용 월정액",
    highlight: true,
  },
  {
    name: "Business Monthly",
    price: "$80/월",
    tokens: "800,000/월",
    saving: "55%",
    desc: "중대형 팀·기업용 월정액",
  },
]

export default function TokensPage() {
  const [tab, setTab] = useState<"credit" | "subscription">("credit")

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Page header */}
      <div className="border-b border-border bg-brand-navy">
        <div className="mx-auto max-w-7xl px-4 py-12 md:px-8 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand-cyan/30 bg-brand-cyan/10 px-4 py-1.5 text-sm font-medium text-brand-cyan">
            <TrendingDown className="h-3.5 w-3.5" />
            시장가 대비 50% 이상 절약
          </div>
          <h1 className="text-3xl font-bold text-white md:text-4xl">
            LLM 토큰 충전
          </h1>
          <p className="mt-3 text-white/60 max-w-xl mx-auto">
            AI Linker의 토큰은 동일 품질 기준 시장 최저가를 보장합니다. 더 오래, 더 많이 AI를 사용하세요.
          </p>

          {/* Current balance */}
          <div className="mt-6 inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-6 py-3">
            <Zap className="h-5 w-5 text-brand-cyan" />
            <span className="text-white/70 text-sm">현재 잔액</span>
            <span className="text-xl font-bold text-white">128,400 토큰</span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12 md:px-8">
        {/* Tabs */}
        <div className="mb-8 flex justify-center gap-2">
          <button
            onClick={() => setTab("credit")}
            className={`rounded-full px-6 py-2.5 text-sm font-semibold transition-all ${
              tab === "credit"
                ? "bg-brand-navy text-white shadow-sm"
                : "border border-border bg-card text-muted-foreground hover:text-foreground"
            }`}
          >
            크레딧 충전
          </button>
          <button
            onClick={() => setTab("subscription")}
            className={`rounded-full px-6 py-2.5 text-sm font-semibold transition-all ${
              tab === "subscription"
                ? "bg-brand-navy text-white shadow-sm"
                : "border border-border bg-card text-muted-foreground hover:text-foreground"
            }`}
          >
            <RefreshCw className="inline h-3.5 w-3.5 mr-1.5" />
            구독 플랜
          </button>
        </div>

        {/* Credit plans */}
        {tab === "credit" && (
          <div className="grid gap-5 md:grid-cols-3">
            {credits.map((plan) => (
              <div
                key={plan.name}
                className={`relative flex flex-col rounded-2xl border p-6 transition-shadow ${
                  plan.highlight
                    ? "border-brand-navy bg-card shadow-lg shadow-brand-navy/10"
                    : "border-border bg-card shadow-sm hover:shadow-md"
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-navy px-3 py-0.5 text-xs font-bold text-white">
                    가장 인기
                  </div>
                )}

                <div className="mb-1 flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-cyan-soft">
                    <Zap className="h-4 w-4 text-brand-navy" />
                  </div>
                  <span className="font-bold text-foreground">{plan.name}</span>
                </div>

                <p className="mt-1 text-sm text-muted-foreground mb-4">{plan.desc}</p>

                <div className="mb-1">
                  <span className="text-3xl font-extrabold text-foreground">{plan.price}</span>
                  <span className="ml-1 text-sm text-muted-foreground">{plan.krw}</span>
                </div>

                <div className="mb-4 rounded-lg bg-muted/60 p-3 space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-foreground">{plan.tokens} 토큰</span>
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-bold text-green-700">
                      {plan.saving} 절약
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground line-through">시장가 {plan.market}</p>
                  <p className="text-xs text-muted-foreground">토큰당 {plan.perToken}</p>
                </div>

                <div className="mb-5 space-y-1">
                  {plan.uses.map((u) => (
                    <div key={u} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <CheckCircle2 className="h-3.5 w-3.5 text-brand-cyan shrink-0" />
                      {u}
                    </div>
                  ))}
                </div>

                <Button
                  className={`mt-auto w-full font-semibold ${
                    plan.highlight
                      ? "bg-brand-navy text-white hover:bg-brand-navy/90"
                      : "border border-brand-navy bg-transparent text-brand-navy hover:bg-brand-navy hover:text-white"
                  }`}
                >
                  충전하기
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Subscription plans */}
        {tab === "subscription" && (
          <div className="grid gap-5 md:grid-cols-3">
            {subscriptions.map((plan) => (
              <div
                key={plan.name}
                className={`relative flex flex-col rounded-2xl border p-6 ${
                  plan.highlight ? "border-brand-navy shadow-lg" : "border-border shadow-sm"
                } bg-card`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-navy px-3 py-0.5 text-xs font-bold text-white">
                    추천
                  </div>
                )}
                <div className="mb-1 flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 text-brand-cyan" />
                  <span className="font-bold text-foreground">{plan.name}</span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground mb-4">{plan.desc}</p>
                <div className="mb-4">
                  <span className="text-3xl font-extrabold text-foreground">{plan.price}</span>
                </div>
                <div className="mb-5 rounded-lg bg-muted/60 p-3">
                  <p className="text-sm font-semibold text-foreground">{plan.tokens}</p>
                  <span className="mt-1 inline-block rounded-full bg-green-100 px-2 py-0.5 text-xs font-bold text-green-700">
                    {plan.saving} 절약
                  </span>
                </div>
                <Button
                  className={`mt-auto w-full font-semibold ${
                    plan.highlight
                      ? "bg-brand-navy text-white hover:bg-brand-navy/90"
                      : "border border-brand-navy bg-transparent text-brand-navy hover:bg-brand-navy hover:text-white"
                  }`}
                >
                  구독 시작하기
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Savings comparison */}
        <div className="mt-12 rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center gap-2 mb-5">
            <BarChart3 className="h-5 w-5 text-brand-cyan" />
            <h2 className="font-bold text-foreground">타 서비스 가격 비교</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-2 text-left text-muted-foreground font-medium">서비스</th>
                  <th className="py-2 text-center text-muted-foreground font-medium">100만 토큰당</th>
                  <th className="py-2 text-center text-muted-foreground font-medium">절감율</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: "OpenAI 직접 구매", price: "$15.00", saving: "-", highlight: false },
                  { name: "Anthropic 직접 구매", price: "$12.00", saving: "-", highlight: false },
                  { name: "AI Linker (Pro Credit)", price: "$6.00", saving: "60% 절약", highlight: true },
                ].map((row) => (
                  <tr key={row.name} className={`border-b border-border ${row.highlight ? "bg-brand-cyan-soft" : ""}`}>
                    <td className={`py-3 font-medium ${row.highlight ? "text-brand-navy" : "text-foreground"}`}>
                      {row.name}
                      {row.highlight && <span className="ml-2 rounded-full bg-brand-navy px-2 py-0.5 text-xs text-white">AI Linker</span>}
                    </td>
                    <td className={`py-3 text-center ${row.highlight ? "font-bold text-brand-navy" : "text-foreground"}`}>
                      {row.price}
                    </td>
                    <td className="py-3 text-center">
                      {row.saving !== "-" ? (
                        <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-bold text-green-700">
                          {row.saving}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
