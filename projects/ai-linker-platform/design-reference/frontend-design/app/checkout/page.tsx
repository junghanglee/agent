"use client"

import { useState } from "react"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import {
  Bot, Monitor, Apple, Key, Download, BookOpen, Copy, CheckCircle2,
  ChevronRight, Zap, ArrowRight
} from "lucide-react"

export default function CheckoutPage() {
  const [copied, setCopied] = useState(false)
  const installCode = "HERM-2025-XKDR-9F4T"

  const handleCopy = () => {
    navigator.clipboard.writeText(installCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Breadcrumb */}
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-3 md:px-8">
          <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Link href="/" className="hover:text-foreground">홈</Link>
            <ChevronRight className="h-3 w-3" />
            <Link href="/agents/hermes" className="hover:text-foreground">Hermes AI Agent</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground">구매 완료</span>
          </nav>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-12 md:px-8">
        {/* Success banner */}
        <div className="mb-8 rounded-2xl bg-brand-navy p-6 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-brand-cyan/20">
            <CheckCircle2 className="h-7 w-7 text-brand-cyan" />
          </div>
          <h1 className="text-xl font-bold text-white">구매가 완료되었습니다!</h1>
          <p className="mt-1 text-sm text-white/60">아래 설치코드와 파일로 지금 바로 시작하세요.</p>
        </div>

        {/* Product summary */}
        <div className="mb-5 rounded-2xl border border-border bg-card p-5">
          <h2 className="mb-4 text-sm font-semibold text-muted-foreground uppercase tracking-wide">주문 요약</h2>
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-brand-navy to-brand-violet/80">
              <Bot className="h-7 w-7 text-brand-cyan" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-foreground">Hermes AI Agent 설치 프로그램</p>
              <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                <Monitor className="h-3.5 w-3.5" />
                <span>Windows v2.4.1</span>
                <span>·</span>
                <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">초보자</span>
              </div>
            </div>
            <p className="text-lg font-bold text-foreground">₩29,000</p>
          </div>

          <div className="mt-4 border-t border-border pt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">주문번호</span>
              <span className="font-medium text-foreground">AIL-20250513-00421</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">결제 방법</span>
              <span className="font-medium text-foreground">신용카드 (KB국민)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">결제 일시</span>
              <span className="font-medium text-foreground">2025.05.13 14:32</span>
            </div>
          </div>
        </div>

        {/* Install code */}
        <div className="mb-5 rounded-2xl border-2 border-brand-cyan/30 bg-brand-cyan-soft p-5">
          <div className="flex items-center gap-2 mb-3">
            <Key className="h-5 w-5 text-brand-navy" />
            <h2 className="font-bold text-brand-navy">설치코드가 발급되었습니다</h2>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-brand-navy/20 bg-white px-4 py-3">
            <code className="flex-1 text-base font-mono font-bold tracking-widest text-brand-navy">
              {installCode}
            </code>
            <Button
              size="sm"
              onClick={handleCopy}
              className={`gap-1.5 text-xs transition-all ${
                copied ? "bg-green-500 text-white" : "bg-brand-navy text-white hover:bg-brand-navy/90"
              }`}
            >
              {copied ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "복사됨" : "복사"}
            </Button>
          </div>
          <p className="mt-2 text-xs text-brand-navy/60">
            이 코드는 My Page에서도 언제든지 확인할 수 있습니다.
          </p>
        </div>

        {/* Download buttons */}
        <div className="mb-5 rounded-2xl border border-border bg-card p-5">
          <h2 className="mb-4 font-semibold text-foreground">설치파일 다운로드</h2>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button className="flex-1 gap-2 bg-brand-navy text-white hover:bg-brand-navy/90">
              <Monitor className="h-4 w-4" />
              Windows 설치파일 다운로드
            </Button>
            <Button variant="outline" className="flex-1 gap-2">
              <Apple className="h-4 w-4" />
              iOS 설치파일 다운로드
            </Button>
          </div>
        </div>

        {/* Manual + Next steps */}
        <div className="mb-5 rounded-2xl border border-border bg-card p-5">
          <h2 className="mb-4 font-semibold text-foreground">다음 단계</h2>
          <div className="space-y-3">
            {[
              { n: 1, title: "설치코드 복사", desc: "위의 설치코드를 복사해두세요." },
              { n: 2, title: "설치파일 실행", desc: "다운로드한 파일을 실행하고 설치코드를 입력합니다." },
              { n: 3, title: "토큰 연결", desc: "AI Linker 토큰을 연결하면 모든 AI 기능이 활성화됩니다." },
              { n: 4, title: "Agent 사용 시작", desc: "설치가 완료되면 바로 사용할 수 있습니다." },
            ].map((step) => (
              <div key={step.n} className="flex items-start gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-navy text-xs font-bold text-white">
                  {step.n}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{step.title}</p>
                  <p className="text-xs text-muted-foreground">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button variant="outline" className="flex-1 gap-2">
            <BookOpen className="h-4 w-4" />
            설치 매뉴얼 보기
          </Button>
          <Link href="/tokens" className="flex-1">
            <Button className="w-full gap-2 bg-brand-cyan text-brand-navy font-bold hover:bg-brand-cyan/90">
              <Zap className="h-4 w-4" />
              토큰 충전하기
            </Button>
          </Link>
          <Link href="/mypage" className="flex-1">
            <Button variant="outline" className="w-full gap-2">
              My Page 보기
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  )
}
