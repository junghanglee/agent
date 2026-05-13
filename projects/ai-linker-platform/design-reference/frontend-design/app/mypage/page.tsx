"use client"

import { useState } from "react"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import {
  Bot, Key, Download, Zap, Puzzle, HelpCircle, User,
  Monitor, Apple, TrendingUp, ArrowRight, BarChart3, RefreshCw, CheckCircle2
} from "lucide-react"

const myAgents = [
  {
    name: "Hermes AI Agent",
    os: "Windows",
    version: "v2.4.1",
    latestVersion: "v2.4.1",
    licenseStatus: "활성",
    installCode: "HERM-2025-XKDR-9F4T",
    expiry: "2026.05.13",
  },
  {
    name: "Research Agent",
    os: "iOS",
    version: "v2.0.3",
    latestVersion: "v2.0.5",
    licenseStatus: "활성",
    installCode: "RSRC-2024-PLMV-2G8Q",
    expiry: "2026.03.28",
  },
]

const tokenHistory = [
  { date: "2025.05.10", desc: "Hermes Agent 사용", amount: "-3,200", type: "use" },
  { date: "2025.05.08", desc: "Pro Credit 충전", amount: "+180,000", type: "charge" },
  { date: "2025.05.05", desc: "Research Agent 사용", amount: "-1,800", type: "use" },
  { date: "2025.04.30", desc: "Starter Credit 충전", amount: "+50,000", type: "charge" },
]

const purchasedSkills = [
  { name: "메신저 연결", compat: "Hermes AI", active: true },
  { name: "문서 자동화", compat: "Hermes AI", active: true },
  { name: "웹검색 강화", compat: "Research Agent", active: false },
]

const tickets = [
  { id: "#1024", title: "설치 오류 문의", status: "답변 완료", date: "2025.05.09" },
  { id: "#1018", title: "토큰 충전 오류", status: "처리중", date: "2025.05.02" },
]

const tabs = ["내 Agent", "설치코드", "토큰", "Skill", "지원"]

export default function MyPage() {
  const [activeTab, setActiveTab] = useState("내 Agent")

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="mx-auto max-w-7xl px-4 py-10 md:px-8">
        <div className="grid gap-8 lg:grid-cols-4">
          {/* Left sidebar */}
          <aside className="lg:col-span-1">
            {/* Profile card */}
            <div className="mb-4 rounded-2xl border border-border bg-card p-5 text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-brand-navy">
                <User className="h-7 w-7 text-brand-cyan" />
              </div>
              <p className="font-semibold text-foreground">김민준</p>
              <p className="text-xs text-muted-foreground">minj@example.com</p>
              <div className="mt-3 flex items-center justify-center gap-1.5 rounded-full bg-brand-cyan-soft px-3 py-1 text-xs font-medium text-brand-navy">
                <Zap className="h-3 w-3" />
                128,400 토큰
              </div>
            </div>

            {/* Navigation */}
            <div className="rounded-2xl border border-border bg-card p-2">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`w-full rounded-xl px-4 py-2.5 text-left text-sm font-medium transition-colors ${
                    activeTab === tab
                      ? "bg-brand-navy text-white"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </aside>

          {/* Main content */}
          <div className="lg:col-span-3 space-y-5">
            {/* My Agent tab */}
            {activeTab === "내 Agent" && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-foreground">내 Agent</h2>
                {myAgents.map((agent) => (
                  <div key={agent.name} className="rounded-2xl border border-border bg-card p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand-navy to-brand-violet/80">
                          <Bot className="h-5 w-5 text-brand-cyan" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{agent.name}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            {agent.os === "Windows" ? <Monitor className="h-3 w-3" /> : <Apple className="h-3 w-3" />}
                            {agent.os} · 현재 {agent.version}
                            {agent.version !== agent.latestVersion && (
                              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-amber-700 font-medium">
                                업데이트 가능 ({agent.latestVersion})
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700">
                        {agent.licenseStatus}
                      </span>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-3 text-sm">
                      <div className="rounded-lg bg-muted/60 p-2.5">
                        <p className="text-xs text-muted-foreground mb-0.5">설치코드</p>
                        <p className="font-mono font-bold text-foreground text-xs">{agent.installCode}</p>
                      </div>
                      <div className="rounded-lg bg-muted/60 p-2.5">
                        <p className="text-xs text-muted-foreground mb-0.5">라이선스 만료</p>
                        <p className="font-semibold text-foreground">{agent.expiry}</p>
                      </div>
                      <div className="rounded-lg bg-muted/60 p-2.5 flex items-center justify-center">
                        <Button size="sm" className="gap-1.5 text-xs bg-brand-navy text-white hover:bg-brand-navy/90">
                          <Download className="h-3 w-3" />
                          최신버전 다운
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Install codes tab */}
            {activeTab === "설치코드" && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-foreground">설치코드 관리</h2>
                {myAgents.map((agent) => (
                  <div key={agent.name} className="rounded-2xl border border-border bg-card p-5">
                    <div className="flex items-center justify-between mb-3">
                      <p className="font-semibold text-foreground">{agent.name}</p>
                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">활성</span>
                    </div>
                    <div className="flex items-center gap-2 rounded-xl border border-brand-cyan/30 bg-brand-cyan-soft px-4 py-3">
                      <Key className="h-4 w-4 text-brand-navy shrink-0" />
                      <code className="flex-1 font-mono font-bold tracking-widest text-brand-navy">
                        {agent.installCode}
                      </code>
                      <Button size="sm" className="text-xs bg-brand-navy text-white">복사</Button>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">만료일: {agent.expiry}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Token tab */}
            {activeTab === "토큰" && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-foreground">토큰 관리</h2>

                {/* Balance + usage */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-border bg-card p-5">
                    <p className="text-sm text-muted-foreground mb-1">현재 잔액</p>
                    <p className="text-3xl font-extrabold text-foreground">128,400</p>
                    <p className="text-sm text-muted-foreground">토큰</p>
                    <div className="mt-3 h-2 rounded-full bg-muted">
                      <div className="h-2 w-3/5 rounded-full bg-brand-cyan" />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">이번 달 225,600 사용</p>
                    <Link href="/tokens">
                      <Button size="sm" className="mt-3 gap-1.5 bg-brand-navy text-white text-xs hover:bg-brand-navy/90">
                        <Zap className="h-3 w-3" /> 충전하기
                      </Button>
                    </Link>
                  </div>
                  <div className="rounded-2xl border border-border bg-card p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <BarChart3 className="h-4 w-4 text-brand-cyan" />
                      <p className="text-sm font-semibold text-foreground">이번 달 사용량</p>
                    </div>
                    <div className="space-y-2">
                      {[
                        { label: "Hermes Agent", pct: 65, val: "146,640" },
                        { label: "Research Agent", pct: 35, val: "78,960" },
                      ].map((item) => (
                        <div key={item.label}>
                          <div className="flex justify-between text-xs text-muted-foreground mb-1">
                            <span>{item.label}</span>
                            <span>{item.val}</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-muted">
                            <div className="h-1.5 rounded-full bg-brand-violet" style={{ width: `${item.pct}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Usage history */}
                <div className="rounded-2xl border border-border bg-card p-5">
                  <h3 className="mb-4 font-semibold text-foreground">사용 내역</h3>
                  <div className="space-y-3">
                    {tokenHistory.map((h, i) => (
                      <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                        <div>
                          <p className="text-sm font-medium text-foreground">{h.desc}</p>
                          <p className="text-xs text-muted-foreground">{h.date}</p>
                        </div>
                        <span className={`font-bold ${h.type === "charge" ? "text-green-600" : "text-muted-foreground"}`}>
                          {h.amount}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Skills tab */}
            {activeTab === "Skill" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-foreground">구매한 Skill</h2>
                  <Link href="/agents">
                    <Button size="sm" variant="outline" className="gap-1.5 text-xs border-brand-navy text-brand-navy">
                      <Puzzle className="h-3 w-3" /> Skill 추가
                    </Button>
                  </Link>
                </div>
                <div className="space-y-3">
                  {purchasedSkills.map((s) => (
                    <div key={s.name} className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-cyan-soft">
                        <Puzzle className="h-5 w-5 text-brand-navy" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-foreground">{s.name}</p>
                        <p className="text-xs text-muted-foreground">{s.compat} 호환</p>
                      </div>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${s.active ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"}`}>
                        {s.active ? "활성" : "비활성"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Support tab */}
            {activeTab === "지원" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-foreground">지원 티켓</h2>
                  <Button size="sm" className="gap-1.5 bg-brand-navy text-white text-xs hover:bg-brand-navy/90">
                    <HelpCircle className="h-3.5 w-3.5" /> 새 문의
                  </Button>
                </div>
                <div className="space-y-3">
                  {tickets.map((t) => (
                    <div key={t.id} className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">{t.id}</span>
                          <p className="font-semibold text-foreground">{t.title}</p>
                        </div>
                        <p className="text-xs text-muted-foreground">{t.date}</p>
                      </div>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        t.status === "답변 완료" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                      }`}>
                        {t.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
