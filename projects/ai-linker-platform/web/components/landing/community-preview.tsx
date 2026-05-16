import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MessageCircle, HelpCircle, Wrench, Headphones, ArrowRight, Send } from "lucide-react"

const supports = [
  { icon: HelpCircle, title: "설치 문의", desc: "설치 중 막히는 부분을 문의로 남기면 관리자가 확인합니다.", count: "수동 확인", color: "text-blue-500", bg: "bg-blue-50" },
  { icon: Wrench, title: "다운로드 안내", desc: "최신 설치파일과 릴리스 안내를 한 곳에서 확인합니다.", count: "최신 버전", color: "text-emerald-500", bg: "bg-emerald-50" },
  { icon: MessageCircle, title: "충전요청", desc: "토큰 충전은 요청서 접수 후 관리자가 처리합니다.", count: "요청 기반", color: "text-brand-violet", bg: "bg-purple-50" },
  { icon: Headphones, title: "운영자 확인", desc: "로그인 없이 남긴 문의도 관리자 화면에서 확인할 수 있습니다.", count: "관리자 처리", color: "text-brand-cyan", bg: "bg-brand-cyan-soft" },
]

export function CommunityPreview() {
  return (
    <section className="bg-muted/40 py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="mb-10 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm font-medium text-muted-foreground">
            <Send className="h-3.5 w-3.5" />로그인 없는 요청 처리
          </div>
          <h2 className="text-balance text-3xl font-bold text-foreground md:text-4xl">문의와 충전요청만 남기면 됩니다</h2>
          <p className="mt-3 text-muted-foreground">커뮤니티 회원제가 아니라, 필요한 요청을 간단히 접수하는 구조입니다.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {supports.map((s) => (
            <div key={s.title} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl ${s.bg}`}><s.icon className={`h-5 w-5 ${s.color}`} /></div>
              <h3 className="font-semibold text-foreground">{s.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
              <span className="mt-3 inline-block rounded-full bg-muted px-3 py-0.5 text-xs font-medium text-foreground">{s.count}</span>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link href="/support">
            <Button className="gap-2 bg-brand-navy text-white hover:bg-brand-navy/90">
              문의 남기기 <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
