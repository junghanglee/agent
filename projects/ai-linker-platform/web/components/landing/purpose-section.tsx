import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Download, FileText, MessageSquare, Zap, ArrowRight } from "lucide-react"

const steps = [
  { icon: FileText, label: "소개 확인", desc: "AI Linker가 제공하는 Agent와 토큰 구조를 확인합니다." },
  { icon: Download, label: "설치파일 다운로드", desc: "회원가입 없이 필요한 설치파일을 다운로드합니다." },
  { icon: Zap, label: "토큰 충전요청", desc: "원하는 플랜과 연락처를 남기면 관리자가 확인합니다." },
  { icon: MessageSquare, label: "문의 접수", desc: "설치나 충전 문제가 있으면 간단히 문의를 남깁니다." },
]

export function PurposeSection() {
  return (
    <section className="bg-muted/40 py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="mb-10 text-center">
          <h2 className="text-balance text-3xl font-bold text-foreground md:text-4xl">서비스 이용 흐름은 단순합니다</h2>
          <p className="mt-3 text-base text-muted-foreground">로그인/회원제 없이 소개, 다운로드, 충전요청만으로 운영합니다.</p>
        </div>

        <div className="mb-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <div key={step.label} className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-cyan-soft"><step.icon className="h-5 w-5 text-brand-navy" /></div>
                <span className="text-xs font-bold text-muted-foreground">STEP {index + 1}</span>
              </div>
              <h3 className="font-semibold text-foreground">{step.label}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{step.desc}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/agents"><Button className="gap-2 bg-brand-navy text-white hover:bg-brand-navy/90">다운로드 페이지 <ArrowRight className="h-4 w-4" /></Button></Link>
          <Link href="/tokens"><Button variant="outline" className="gap-2 border-brand-navy text-brand-navy">충전요청 페이지</Button></Link>
        </div>
      </div>
    </section>
  )
}
