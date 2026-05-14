import Link from "next/link"
import { AILinkerLogo } from "@/components/brand/ai-linker-logo"

const footerLinks = {
  "플랫폼": [
    { label: "Agent 찾기", href: "/agents" },
    { label: "토큰 충전", href: "/tokens" },
    { label: "Skill 마켓", href: "/skills" },
  ],
  "지원": [
    { label: "커뮤니티", href: "/community" },
    { label: "고객지원", href: "/support" },
    { label: "설치 가이드", href: "/guide" },
  ],
  "회사": [
    { label: "소개", href: "/about" },
    { label: "이용약관", href: "/terms" },
    { label: "개인정보처리방침", href: "/privacy" },
  ],
}

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="mb-4">
              <AILinkerLogo href="/" variant="dark" size="md" />
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              AI Agent 설치와 사용을 누구나 쉽게. 목적에 맞는 AI Agent를 골라 바로 시작하세요.
            </p>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="mb-3 text-sm font-semibold text-foreground">{category}</h4>
              <ul className="flex flex-col gap-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 md:flex-row">
          <p className="text-xs text-muted-foreground">
            © 2025 AI Linker. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-cyan/30 bg-brand-cyan-soft px-3 py-1 text-xs font-medium text-brand-navy">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-cyan animate-pulse" />
              서비스 정상 운영중
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
