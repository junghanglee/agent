import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'

type AILinkerLogoProps = {
  href?: string
  variant?: 'light' | 'dark' | 'mark'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  priority?: boolean
}

const sizeMap = {
  sm: { width: 138, height: 30, className: 'h-7 w-auto' },
  md: { width: 184, height: 40, className: 'h-9 w-auto' },
  lg: { width: 230, height: 50, className: 'h-12 w-auto' },
}

export function AILinkerLogo({ href, variant = 'dark', size = 'md', className, priority }: AILinkerLogoProps) {
  const selected = sizeMap[size]
  const src = variant === 'mark' ? '/brand/ai-linker-mark.svg' : variant === 'light' ? '/brand/ai-linker-logo-light.svg' : '/brand/ai-linker-logo-dark.svg'
  const alt = variant === 'mark' ? 'AI Linker' : 'AI Linker logo'
  const logo = (
    <Image
      src={src}
      alt={alt}
      width={variant === 'mark' ? selected.height : selected.width}
      height={selected.height}
      priority={priority}
      className={cn(variant === 'mark' ? 'h-9 w-9' : selected.className, className)}
    />
  )

  if (!href) return logo
  return <Link href={href} className="inline-flex items-center">{logo}</Link>
}
