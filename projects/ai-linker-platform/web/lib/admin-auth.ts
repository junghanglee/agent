import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createHash, createHmac, timingSafeEqual } from 'crypto'
import { prisma } from '@/lib/prisma'

const ADMIN_SESSION_COOKIE = 'ai_linker_admin_session'
const SESSION_TTL_MS = 1000 * 60 * 60 * 8
const MIN_SECRET_LENGTH = 32
const PLACEHOLDER_VALUES = new Set([
  'replace-with-strong-random-key',
  'replace-with-strong-random-session-secret',
  'replace-with-sha256-password-hash',
])

export type AdminSession = {
  id: string
  email: string
  name: string
  role: 'ADMIN' | 'SUPER_ADMIN'
}

function isPlaceholder(value?: string) {
  return !value || PLACEHOLDER_VALUES.has(value)
}

function getSessionSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET ?? process.env.AI_LINKER_ENCRYPTION_KEY

  if (process.env.NODE_ENV === 'production') {
    if (isPlaceholder(secret) || secret.length < MIN_SECRET_LENGTH) {
      throw new Error('Production admin session secret must be set to a strong random value of at least 32 characters.')
    }
    return secret
  }

  return isPlaceholder(secret) ? 'ai-linker-local-session-secret' : secret
}

function getAdminPasswordHash() {
  const configuredHash = process.env.ADMIN_PASSWORD_HASH
  if (configuredHash && !isPlaceholder(configuredHash)) return configuredHash

  if (process.env.NODE_ENV === 'production') {
    throw new Error('Production admin password hash must be set with ADMIN_PASSWORD_HASH.')
  }

  return createHash('sha256').update(process.env.ADMIN_PASSWORD ?? 'admin1234').digest('hex')
}

export function hashAdminPassword(password: string) {
  return createHash('sha256').update(password).digest('hex')
}

function safeCompare(a: string, b: string) {
  const left = Buffer.from(a)
  const right = Buffer.from(b)
  if (left.length !== right.length) return false
  return timingSafeEqual(left, right)
}

function signSession(adminId: string, expiresAtMs: number) {
  return createHmac('sha256', getSessionSecret()).update(`${adminId}.${expiresAtMs}`).digest('hex')
}

function parseSessionCookie(raw?: string) {
  if (!raw) return null
  const [adminId, expiresAtMsText, signature] = raw.split('.')
  const expiresAtMs = Number(expiresAtMsText)
  if (!adminId || !Number.isFinite(expiresAtMs) || !signature) return null
  if (Date.now() > expiresAtMs) return null

  const expected = signSession(adminId, expiresAtMs)
  if (!safeCompare(signature, expected)) return null

  return { adminId, expiresAtMs }
}

export async function createAdminSession(adminId: string) {
  const expiresAtMs = Date.now() + SESSION_TTL_MS
  const expiresAt = new Date(expiresAtMs)
  const signature = signSession(adminId, expiresAtMs)

  await prisma.auditLog.create({
    data: {
      adminUserId: adminId,
      action: 'ADMIN_LOGIN',
      entityType: 'AdminUser',
      entityId: adminId,
      afterData: JSON.stringify({ expiresAt }),
    },
  })

  const cookieStore = await cookies()
  cookieStore.set(ADMIN_SESSION_COOKIE, `${adminId}.${expiresAtMs}.${signature}`, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires: expiresAt,
  })
}

export async function clearAdminSession() {
  const cookieStore = await cookies()
  cookieStore.delete(ADMIN_SESSION_COOKIE)
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies()
  const parsed = parseSessionCookie(cookieStore.get(ADMIN_SESSION_COOKIE)?.value)
  if (!parsed) return null

  const admin = await prisma.adminUser.findUnique({
    where: { id: parsed.adminId },
    select: { id: true, email: true, name: true, role: true, status: true },
  })

  if (!admin || admin.status !== 'ACTIVE') return null
  if (admin.role !== 'ADMIN' && admin.role !== 'SUPER_ADMIN') return null

  return {
    id: admin.id,
    email: admin.email,
    name: admin.name,
    role: admin.role,
  }
}

export async function requireAdminSession() {
  const session = await getAdminSession()
  if (!session) redirect('/admin/login')
  return session
}

export async function validateAdminLogin(email: string, password: string) {
  const configuredEmail = process.env.ADMIN_EMAIL ?? 'admin@ailinker.local'
  if (process.env.NODE_ENV === 'production' && configuredEmail === 'admin@ailinker.local') {
    throw new Error('Production admin email must be set with ADMIN_EMAIL.')
  }

  const configuredPasswordHash = getAdminPasswordHash()
  const submittedPasswordHash = hashAdminPassword(password)

  if (email.trim().toLowerCase() !== configuredEmail.trim().toLowerCase()) return null
  if (!safeCompare(submittedPasswordHash, configuredPasswordHash)) return null

  const admin = await prisma.adminUser.upsert({
    where: { email: configuredEmail },
    update: { status: 'ACTIVE', passwordHash: configuredPasswordHash },
    create: {
      email: configuredEmail,
      name: process.env.ADMIN_NAME ?? 'AI Linker Admin',
      passwordHash: configuredPasswordHash,
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
    },
  })

  return admin
}

export async function assertAdminApiSession() {
  const session = await getAdminSession()
  if (!session) {
    return Response.json({ ok: false, error: '관리자 로그인이 필요합니다.' }, { status: 401 })
  }
  return null
}
