"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Bot, Download, Key, Zap, CheckCircle2 } from "lucide-react"

// ─── Canvas particle network animation (plani.co.kr-style) ───────────────────
function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animId: number
    let width = 0
    let height = 0

    type Particle = {
      x: number
      y: number
      vx: number
      vy: number
      r: number
      alpha: number
    }

    const PARTICLE_COUNT = 90
    const LINE_DIST = 130
    const particles: Particle[] = []

    const resize = () => {
      width = canvas.offsetWidth
      height = canvas.offsetHeight
      canvas.width = width * devicePixelRatio
      canvas.height = height * devicePixelRatio
      ctx.scale(devicePixelRatio, devicePixelRatio)
    }

    const spawn = (): Particle => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      r: Math.random() * 1.6 + 0.6,
      alpha: Math.random() * 0.5 + 0.2,
    })

    resize()
    window.addEventListener("resize", resize)
    for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(spawn())

    const draw = () => {
      ctx.clearRect(0, 0, width, height)

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]

        // Move
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0 || p.x > width) p.vx *= -1
        if (p.y < 0 || p.y > height) p.vy *= -1

        // Draw dot
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(103,232,249,${p.alpha})`  // brand-cyan
        ctx.fill()

        // Draw lines to nearby particles
        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j]
          const dx = p.x - q.x
          const dy = p.y - q.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < LINE_DIST) {
            const lineAlpha = (1 - dist / LINE_DIST) * 0.18
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(q.x, q.y)
            ctx.strokeStyle = `rgba(103,232,249,${lineAlpha})`
            ctx.lineWidth = 0.8
            ctx.stroke()
          }
        }
      }

      animId = requestAnimationFrame(draw)
    }

    draw()
    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener("resize", resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full"
      aria-hidden="true"
    />
  )
}

// ─── Rotating keyword text ─────────────────────────────────────────────────
const keywords = ["업무자동화", "고객상담", "데이터분석", "이메일 작성", "일정 관리", "코드 생성"]

function RotatingKeyword() {
  const [idx, setIdx] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setIdx((i) => (i + 1) % keywords.length)
        setVisible(true)
      }, 350)
    }, 2400)
    return () => clearInterval(interval)
  }, [])

  return (
    <span
      style={{
        display: "inline-block",
        transition: "opacity 0.35s ease, transform 0.35s ease",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(8px)",
      }}
      className="text-brand-cyan"
    >
      {keywords[idx]}
    </span>
  )
}

// ─── Category Tab Bar (plani.co.kr bottom nav style) ──────────────────────
const categories = [
  { icon: Bot, label: "Agent 마켓", href: "/agents" },
  { icon: Zap, label: "Skill 마켓", href: "/skills" },
  { icon: Key, label: "토큰 충전", href: "/tokens" },
  { icon: Download, label: "설치 가이드", href: "/guide" },
  { icon: CheckCircle2, label: "커뮤니티", href: "/community" },
]

// ─── Main ──────────────────────────────────────────────────────────────────
export function HeroSection() {
  return (
    <section className="relative flex min-h-screen flex-col overflow-hidden bg-brand-navy">
      {/* Particle canvas background */}
      <ParticleCanvas />

      {/* Radial glow overlays */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
      >
        <div
          className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            width: "700px",
            height: "700px",
            background:
              "radial-gradient(circle, rgba(103,232,249,0.07) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute -bottom-24 -right-24 rounded-full"
          style={{
            width: "500px",
            height: "500px",
            background:
              "radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)",
          }}
        />
      </div>

      {/* ─── Main Content ─── */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-5 pb-0 pt-28 text-center md:px-10 md:pt-36">
        {/* Eyebrow tag */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-cyan/30 bg-brand-cyan/10 px-5 py-1.5 text-sm font-semibold tracking-widest text-brand-cyan uppercase">
          <Zap className="h-3.5 w-3.5" />
          AI Agent Marketplace
        </div>

        {/* Headline */}
        <h1 className="text-balance text-4xl font-extrabold leading-tight text-white md:text-6xl lg:text-7xl">
          <RotatingKeyword />
          {" "}을 위한
          <br />
          <span className="text-white">AI Agent를</span>
          <br />
          <span
            style={{
              background: "linear-gradient(90deg, #67e8f9 0%, #a78bfa 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            지금 바로 시작하세요
          </span>
        </h1>

        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/60 md:text-xl">
          목적에 맞는 Agent를 고르고, 설치코드 한 번으로 설치한 뒤,{" "}
          <span className="text-white/85 font-medium">AI Linker 전용 토큰</span>으로 바로 사용하세요.
          <br className="hidden md:block" />
          복잡한 설정 없이, 누구나 쉽게.
        </p>

        {/* CTA buttons */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link href="/agents">
            <Button
              size="lg"
              className="gap-2 bg-brand-cyan px-8 py-6 text-base font-bold text-brand-navy shadow-lg shadow-brand-cyan/20 hover:bg-brand-cyan/90 hover:shadow-brand-cyan/30"
            >
              내게 맞는 Agent 찾기
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/tokens">
            <Button
              size="lg"
              variant="outline"
              className="gap-2 border-white/20 bg-white/8 px-8 py-6 text-base text-white backdrop-blur-sm hover:bg-white/15"
            >
              토큰 요금 보기
            </Button>
          </Link>
        </div>

        {/* Trust badges */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-5 text-sm text-white/45">
          {[
            { icon: CheckCircle2, text: "무료 체험 가능" },
            { icon: CheckCircle2, text: "즉시 설치코드 발급" },
            { icon: CheckCircle2, text: "시장가 대비 50% 저렴" },
          ].map((item) => (
            <span key={item.text} className="flex items-center gap-1.5">
              <item.icon className="h-4 w-4 text-brand-cyan/70" />
              {item.text}
            </span>
          ))}
        </div>

        {/* Scroll indicator */}
        <div className="mt-14 flex flex-col items-center gap-2 text-white/30">
          <span className="text-xs tracking-widest uppercase">Scroll</span>
          <div className="relative h-8 w-0.5 overflow-hidden rounded-full bg-white/10">
            <div
              className="absolute top-0 h-4 w-full rounded-full bg-brand-cyan/60"
              style={{
                animation: "scrollBar 1.8s ease-in-out infinite",
              }}
            />
          </div>
        </div>
      </div>

      {/* ─── Bottom category tab bar (plani.co.kr-style) ─── */}
      <div className="relative z-10 mt-10">
        <div className="mx-auto max-w-5xl px-5 md:px-10">
          <div className="grid grid-cols-3 gap-px overflow-hidden rounded-t-2xl border border-b-0 border-white/10 bg-white/5 backdrop-blur-md md:grid-cols-5">
            {categories.map((cat) => (
              <Link
                key={cat.href}
                href={cat.href}
                className="group flex flex-col items-center gap-2 px-4 py-5 transition-colors hover:bg-brand-cyan/10"
              >
                <cat.icon className="h-5 w-5 text-white/40 transition-colors group-hover:text-brand-cyan" />
                <span className="text-xs font-medium text-white/50 transition-colors group-hover:text-white">
                  {cat.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll bar animation keyframes */}
      <style>{`
        @keyframes scrollBar {
          0%   { transform: translateY(-100%); opacity: 1; }
          80%  { opacity: 1; }
          100% { transform: translateY(300%); opacity: 0; }
        }
      `}</style>
    </section>
  )
}
