"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Briefcase,
  MessageCircle,
  FileText,
  Headphones,
  Search,
  Code2,
  ArrowRight,
} from "lucide-react"

const purposes = [
  { icon: Briefcase, label: "업무 자동화", desc: "반복 업무를 자동화해 생산성을 높이세요" },
  { icon: MessageCircle, label: "메신저 비서", desc: "카카오톡·슬랙에서 AI 비서를 활용하세요" },
  { icon: FileText, label: "문서 작성", desc: "보고서, 기획서를 빠르게 초안 작성" },
  { icon: Headphones, label: "고객상담", desc: "24시간 자동 응대로 CS 업무 절감" },
  { icon: Search, label: "리서치", desc: "웹 전체를 탐색하는 AI 리서치 어시스턴트" },
  { icon: Code2, label: "코딩 보조", desc: "코드 자동완성·리뷰·디버깅까지" },
]

const levels = ["완전 초보자", "일반 사용자", "파워유저", "개발자"]

export function PurposeSection() {
  const [activeLevel, setActiveLevel] = useState("일반 사용자")

  return (
    <section className="bg-muted/40 py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        {/* Header */}
        <div className="mb-10 text-center">
          <h2 className="text-balance text-3xl font-bold text-foreground md:text-4xl">
            내 목적에 맞는 Agent 찾기
          </h2>
          <p className="mt-3 text-base text-muted-foreground">
            어떤 일을 하고 싶으신가요? 원하는 목적을 선택해보세요.
          </p>
        </div>

        {/* Purpose cards */}
        <div className="mb-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {purposes.map((p) => (
            <Link href="/agents" key={p.label}>
              <div className="group flex items-start gap-4 rounded-xl border border-border bg-card p-5 transition-all hover:border-brand-cyan/50 hover:shadow-md cursor-pointer">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-cyan-soft">
                  <p.icon className="h-5 w-5 text-brand-navy" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground group-hover:text-brand-navy">
                    {p.label}
                  </h3>
                  <p className="mt-0.5 text-sm text-muted-foreground">{p.desc}</p>
                </div>
                <ArrowRight className="ml-auto h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
            </Link>
          ))}
        </div>

        {/* Skill level selector */}
        <div className="flex flex-col items-center gap-4">
          <p className="text-sm font-medium text-muted-foreground">내 숙련도를 선택하세요</p>
          <div className="flex flex-wrap justify-center gap-2">
            {levels.map((level) => (
              <button
                key={level}
                onClick={() => setActiveLevel(level)}
                className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${
                  activeLevel === level
                    ? "bg-brand-navy text-white shadow-sm"
                    : "border border-border bg-card text-muted-foreground hover:border-brand-navy/40 hover:text-foreground"
                }`}
              >
                {level}
              </button>
            ))}
          </div>
          <Link href="/agents">
            <Button className="mt-2 gap-2 bg-brand-navy text-white hover:bg-brand-navy/90">
              {activeLevel}에게 맞는 Agent 보기
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
