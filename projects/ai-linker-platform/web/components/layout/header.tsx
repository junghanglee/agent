"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Menu, X, Zap } from "lucide-react"

const navItems = [
  { label: "Agent 마켓", href: "/agents" },
  { label: "토큰 충전", href: "/tokens" },
  { label: "커뮤니티", href: "/community" },
  { label: "고객지원", href: "/support" },
]

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const isHome = pathname === "/"

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const headerBase = isHome
    ? scrolled
      ? "bg-brand-navy/90 backdrop-blur-md border-b border-white/10 shadow-lg"
      : "bg-transparent border-b border-transparent"
    : "bg-card/95 backdrop-blur-md border-b border-border"

  const logoColor = isHome ? "text-white" : "text-foreground"
  const navColor = isHome
    ? "text-white/70 hover:text-white"
    : "text-muted-foreground hover:text-foreground"
  const ctaGhostColor = isHome
    ? "text-white/70 hover:text-white hover:bg-white/10"
    : "text-muted-foreground hover:text-foreground"

  return (
    <header
      className={`fixed top-0 z-50 w-full transition-all duration-500 ${headerBase}`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-10">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-cyan/20 ring-1 ring-brand-cyan/40 group-hover:bg-brand-cyan/30 transition-colors">
            <Zap className="h-4 w-4 text-brand-cyan" />
          </div>
          <span className={`text-[17px] font-bold tracking-tight transition-colors ${logoColor}`}>
            AI <span className="text-brand-cyan">Linker</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm font-medium transition-colors ${navColor}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden items-center gap-2 md:flex">
          <Link href="/login">
            <Button
              variant="ghost"
              size="sm"
              className={`text-sm font-medium transition-colors ${ctaGhostColor}`}
            >
              로그인
            </Button>
          </Link>
          <Link href="/agents">
            <Button
              size="sm"
              className="gap-1.5 bg-brand-cyan text-brand-navy font-bold hover:bg-brand-cyan/90 px-5"
            >
              시작하기
              <Zap className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className="flex items-center md:hidden"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="메뉴 토글"
        >
          {mobileOpen ? (
            <X className={`h-5 w-5 ${isHome ? "text-white" : "text-foreground"}`} />
          ) : (
            <Menu className={`h-5 w-5 ${isHome ? "text-white" : "text-foreground"}`} />
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          className={`border-t px-5 pb-5 pt-3 md:hidden ${
            isHome
              ? "border-white/10 bg-brand-navy/95 backdrop-blur-md"
              : "border-border bg-card"
          }`}
        >
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                  isHome
                    ? "text-white/70 hover:bg-white/10 hover:text-white"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-3 flex gap-2 border-t border-white/10 pt-4">
              <Link href="/login" className="flex-1">
                <Button
                  variant="outline"
                  size="sm"
                  className={`w-full ${isHome ? "border-white/20 bg-white/10 text-white hover:bg-white/20" : ""}`}
                >
                  로그인
                </Button>
              </Link>
              <Link href="/agents" className="flex-1">
                <Button size="sm" className="w-full bg-brand-cyan text-brand-navy font-bold">
                  시작하기
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
