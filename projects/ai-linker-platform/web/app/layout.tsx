import type { Metadata } from 'next'
import { Noto_Sans_KR, Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const notoSansKR = Noto_Sans_KR({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-noto-kr',
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'AI Linker - AI Agent 마켓플레이스',
  description: 'AI Agent 설치와 사용을 누구나 쉽게. AI Linker에서 목적에 맞는 Agent를 고르고 설치코드와 안전한 LLM 운영으로 바로 시작하세요.',
  generator: 'v0.app',
  icons: {
    icon: '/brand/ai-linker-mark.svg',
    shortcut: '/brand/ai-linker-mark.svg',
    apple: '/brand/ai-linker-mark.svg',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko" className={`${notoSansKR.variable} ${inter.variable} bg-background`}>
      <body className="font-sans antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
