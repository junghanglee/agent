import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { Bot, Download, Monitor, Apple, ArrowRight, CheckCircle2, Zap } from 'lucide-react'

const agents = [
  {
    id: 'hermes',
    name: 'Hermes AI Agent',
    tagline: '업무 자동화를 위한 기본 AI Agent',
    desc: 'Windows에서 설치해 이메일, 일정, 문서 작업을 자동화하는 AI Agent입니다.',
    os: ['Windows'],
    version: 'v1.0.0',
    status: '다운로드 가능',
    badge: '대표 Agent',
  },
  {
    id: 'openclaw',
    name: 'OpenClaw Assistant',
    tagline: '코딩과 자동화 작업을 돕는 Agent',
    desc: '개발, 파일 작업, 브라우저 자동화 등 고급 작업을 지원하는 Agent입니다.',
    os: ['Windows'],
    version: '준비 중',
    status: '출시 준비',
    badge: 'Coming Soon',
  },
  {
    id: 'business-messenger',
    name: 'Business Messenger Agent',
    tagline: '메신저 요약과 알림 자동화',
    desc: '업무 메신저와 알림 흐름을 자동화하는 Agent입니다.',
    os: ['Windows', 'iOS'],
    version: '준비 중',
    status: '출시 준비',
    badge: 'Coming Soon',
  },
]

function AgentCard({ agent }: { agent: (typeof agents)[number] }) {
  const isReady = agent.id === 'hermes'
  return (
    <div className="group flex flex-col rounded-2xl border border-border bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg">
      <div className="relative flex h-40 items-center justify-center rounded-t-2xl bg-gradient-to-br from-brand-navy to-brand-violet/80">
        <Bot className="h-16 w-16 text-brand-cyan/85" />
        <span className="absolute right-3 top-3 rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-semibold text-white backdrop-blur">
          {agent.badge}
        </span>
        <div className="absolute bottom-3 left-3 flex gap-1.5">
          {agent.os.includes('Windows') && <span className="flex items-center gap-1 rounded-md bg-white/20 px-2 py-0.5 text-xs text-white"><Monitor className="h-3 w-3" />Win</span>}
          {agent.os.includes('iOS') && <span className="flex items-center gap-1 rounded-md bg-white/20 px-2 py-0.5 text-xs text-white"><Apple className="h-3 w-3" />iOS</span>}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${isReady ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'}`}>{agent.status}</span>
            <span className="text-xs text-muted-foreground">{agent.version}</span>
          </div>
          <h3 className="font-bold text-foreground leading-tight">{agent.name}</h3>
          <p className="mt-0.5 text-xs font-medium text-brand-cyan">{agent.tagline}</p>
        </div>

        <p className="text-sm leading-relaxed text-muted-foreground">{agent.desc}</p>

        <div className="mt-auto flex items-center justify-between border-t border-border pt-4">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <CheckCircle2 className="h-3.5 w-3.5 text-brand-cyan" />로그인 없이 확인
          </div>
          <Link href={`/agents/${agent.id}`}>
            <Button size="sm" className="gap-1 bg-brand-navy text-white text-xs hover:bg-brand-navy/90">
              {isReady ? '다운로드' : '상세보기'} <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function AgentsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="border-b border-border bg-brand-navy pt-20">
        <div className="mx-auto max-w-7xl px-4 py-14 md:px-8">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-brand-cyan">AI Agent 다운로드</p>
          <h1 className="text-3xl font-extrabold text-white md:text-4xl">필요한 Agent 설치파일을 다운로드하세요</h1>
          <p className="mt-3 max-w-xl text-base text-white/70">
            회원가입 없이 소개를 확인하고 설치파일을 받을 수 있습니다. 토큰은 별도 충전요청으로 처리합니다.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <span className="flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-sm text-white/80"><Bot className="h-3.5 w-3.5 text-brand-cyan" />Agent 소개</span>
            <span className="flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-sm text-white/80"><Download className="h-3.5 w-3.5 text-brand-cyan" />설치파일 제공</span>
            <span className="flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-sm text-white/80"><Zap className="h-3.5 w-3.5 text-brand-cyan" />충전요청 처리</span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12 md:px-8">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {agents.map((agent) => <AgentCard key={agent.id} agent={agent} />)}
        </div>
      </div>

      <div className="border-y border-border bg-brand-navy/5">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 py-10 text-center md:px-8">
          <Download className="h-8 w-8 text-brand-cyan" />
          <h3 className="text-xl font-bold text-foreground">다운로드 후 충전요청만 남기면 됩니다</h3>
          <p className="max-w-md text-sm text-muted-foreground">
            설치파일을 내려받아 설치하고, 필요한 토큰은 충전요청 페이지에서 이름과 연락처만 남겨 주세요.
          </p>
          <div className="flex gap-3">
            <Link href="/tokens"><Button variant="outline" className="gap-2 border-brand-navy text-brand-navy">충전요청 보기</Button></Link>
            <Link href="/support"><Button className="gap-2 bg-brand-navy text-white hover:bg-brand-navy/90">문의 남기기</Button></Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
