import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { createHash, createHmac, timingSafeEqual } from 'crypto'
import { prisma } from '@/lib/prisma'
import { ADMIN_ROLE_PERMISSIONS, type AdminPermission, type AdminRole } from '@/lib/admin-permissions'

const ADMIN_SESSION_COOKIE = 'ai_linker_admin_session'
const SESSION_TTL_MS = 1000 * 60 * 60 * 8
const MIN_SECRET_LENGTH = 32
const LOGIN_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000
const LOGIN_RATE_LIMIT_MAX_ATTEMPTS = 5
const PLACEHOLDER_VALUES = new Set([
  'replace-with-strong-random-key',
  'replace-with-strong-random-session-secret',
  'replace-with-sha256-password-hash',
])

export type { AdminPermission, AdminRole }
export { ADMIN_ROLE_PERMISSIONS }
export type AdminSession = {
  id: string
  email: string
  name: string
  role: AdminRole
}

function isPlaceholder(value?: string) {
  return !value || PLACEHOLDER_VALUES.has(value)
}

function getSessionSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET ?? process.env.AI_LINKER_ENCRYPTION_KEY

  if (process.env.NODE_ENV === 'production') {
    if (isPlaceholder(secret) || !secret || secret.length < MIN_SECRET_LENGTH) {
      throw new Error('Production admin session secret must be set to a strong random value of at least 32 characters.')
    }
    return secret
  }

  return isPlaceholder(secret) || !secret ? 'ai-linker-local-session-secret' : secret
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

function normalizeAdminEmail(email: string) {
  return email.trim().toLowerCase()
}

async function getRequestIp() {
  const headerStore = await headers()
  const forwardedFor = headerStore.get('x-forwarded-for')
  if (forwardedFor) return forwardedFor.split(',')[0]?.trim() ?? null

  return headerStore.get('x-real-ip') ?? headerStore.get('cf-connecting-ip') ?? null
}

async function getRecentFailedLoginCount(email: string, ipAddress: string | null) {
  const since = new Date(Date.now() - LOGIN_RATE_LIMIT_WINDOW_MS)
  const identifier = ipAddress ? `${email}:${ipAddress}` : email

  return prisma.auditLog.count({
    where: {
      action: 'ADMIN_LOGIN_FAILED',
      entityType: 'AdminUser',
      entityId: identifier,
      createdAt: { gte: since },
    },
  })
}

async function recordFailedLogin(email: string, ipAddress: string | null, reason: 'email' | 'password' | 'rate_limited') {
  const identifier = ipAddress ? `${email}:${ipAddress}` : email

  await prisma.auditLog.create({
    data: {
      action: 'ADMIN_LOGIN_FAILED',
      entityType: 'AdminUser',
      entityId: identifier,
      ipAddress: ipAddress ?? undefined,
      afterData: JSON.stringify({ email, reason }),
    },
  })
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

export function hasAdminPermission(session: AdminSession | null, permission: AdminPermission) {
  if (!session) return false
  return ADMIN_ROLE_PERMISSIONS[session.role].includes(permission)
}

export function requireAdminPermission(session: AdminSession | null, permission: AdminPermission) {
  return hasAdminPermission(session, permission)
}

export async function requireAdminSession() {
  const session = await getAdminSession()
  if (!session) redirect('/admin/login')
  return session
}

export async function requireAdminPagePermission(permission: AdminPermission) {
  const session = await requireAdminSession()
  if (!hasAdminPermission(session, permission)) redirect('/admin')
  return session
}

export async function requireSuperAdminSession() {
  return requireAdminPagePermission('ADMIN_USERS_MANAGE')
}

export type AdminLoginResult = Awaited<ReturnType<typeof prisma.adminUser.upsert>> | { error: 'rate_limited' } | null

export async function validateAdminLogin(email: string, password: string): Promise<AdminLoginResult> {
  const configuredEmail = process.env.ADMIN_EMAIL ?? 'admin@ailinker.local'
  if (process.env.NODE_ENV === 'production' && configuredEmail === 'admin@ailinker.local') {
    throw new Error('Production admin email must be set with ADMIN_EMAIL.')
  }

  const normalizedEmail = normalizeAdminEmail(email)
  const normalizedConfiguredEmail = normalizeAdminEmail(configuredEmail)
  const ipAddress = await getRequestIp()
  const failedCount = await getRecentFailedLoginCount(normalizedEmail, ipAddress)

  if (failedCount >= LOGIN_RATE_LIMIT_MAX_ATTEMPTS) {
    await recordFailedLogin(normalizedEmail, ipAddress, 'rate_limited')
    return { error: 'rate_limited' as const }
  }

  const configuredPasswordHash = getAdminPasswordHash()
  const submittedPasswordHash = hashAdminPassword(password)

  if (normalizedEmail !== normalizedConfiguredEmail) {
    await recordFailedLogin(normalizedEmail, ipAddress, 'email')
    return null
  }

  if (!safeCompare(submittedPasswordHash, configuredPasswordHash)) {
    await recordFailedLogin(normalizedEmail, ipAddress, 'password')
    return null
  }

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

export async function assertAdminApiSession(permission?: AdminPermission) {
  const session = await getAdminSession()
  if (!session) {
    return Response.json({ ok: false, error: '관리자 로그인이 필요합니다.' }, { status: 401 })
  }
  if (permission && !hasAdminPermission(session, permission)) {
    return Response.json({ ok: false, error: '접근 권한이 필요합니다.' }, { status: 403 })
  }
  return null
}

export async function requireAdminApiSession(permission?: AdminPermission) {
  const session = await getAdminSession()
  if (!session) {
    return {
      session: null,
      response: Response.json({ ok: false, error: '관리자 로그인이 필요합니다.' }, { status: 401 }),
    }
  }

  if (permission && !hasAdminPermission(session, permission)) {
    return {
      session,
      response: Response.json({ ok: false, error: '접근 권한이 필요합니다.' }, { status: 403 }),
    }
  }

  return { session, response: null }
}
