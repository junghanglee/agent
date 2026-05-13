'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import {
  createProductSchema,
  createReleaseSchema,
  issueInstallCodeSchema,
  updateLicenseSchema,
  updateProductSchema,
  updateReleaseSchema,
} from '@/lib/admin-validation'

function splitList(value: FormDataEntryValue | null) {
  return String(value ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

function optionalString(value: FormDataEntryValue | null) {
  const text = String(value ?? '').trim()
  return text.length > 0 ? text : undefined
}

function optionalDateString(value: FormDataEntryValue | null) {
  const text = String(value ?? '').trim()
  return text.length > 0 ? text : null
}

export async function createProductAction(formData: FormData) {
  const parsed = createProductSchema.safeParse({
    slug: formData.get('slug'),
    name: formData.get('name'),
    shortDescription: formData.get('shortDescription'),
    description: formData.get('description'),
    category: formData.get('category'),
    purposeTags: splitList(formData.get('purposeTags')),
    skillLevel: formData.get('skillLevel'),
    supportedPlatforms: formData.getAll('supportedPlatforms'),
    price: formData.get('price'),
    status: formData.get('status') || 'DRAFT',
    thumbnailUrl: optionalString(formData.get('thumbnailUrl')),
  })

  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? '상품 입력값이 올바르지 않습니다.')

  await prisma.agentProduct.create({
    data: {
      ...parsed.data,
      purposeTags: JSON.stringify(parsed.data.purposeTags),
      supportedPlatforms: JSON.stringify(parsed.data.supportedPlatforms),
    },
  })

  revalidatePath('/admin/products')
}

export async function updateProductAction(formData: FormData) {
  const id = String(formData.get('id') ?? '')
  if (!id) throw new Error('상품 ID가 필요합니다.')

  const parsed = updateProductSchema.safeParse({
    slug: formData.get('slug'),
    name: formData.get('name'),
    shortDescription: formData.get('shortDescription'),
    description: formData.get('description'),
    category: formData.get('category'),
    purposeTags: splitList(formData.get('purposeTags')),
    skillLevel: formData.get('skillLevel'),
    supportedPlatforms: formData.getAll('supportedPlatforms'),
    price: formData.get('price'),
    status: formData.get('status'),
    thumbnailUrl: optionalString(formData.get('thumbnailUrl')),
  })

  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? '상품 입력값이 올바르지 않습니다.')

  const { purposeTags, supportedPlatforms, ...rest } = parsed.data
  await prisma.agentProduct.update({
    where: { id },
    data: {
      ...rest,
      ...(purposeTags ? { purposeTags: JSON.stringify(purposeTags) } : {}),
      ...(supportedPlatforms ? { supportedPlatforms: JSON.stringify(supportedPlatforms) } : {}),
    },
  })

  revalidatePath('/admin/products')
}

export async function archiveProductAction(formData: FormData) {
  const id = String(formData.get('id') ?? '')
  if (!id) throw new Error('상품 ID가 필요합니다.')
  await prisma.agentProduct.update({ where: { id }, data: { status: 'ARCHIVED' } })
  revalidatePath('/admin/products')
}

export async function createReleaseAction(formData: FormData) {
  const parsed = createReleaseSchema.safeParse({
    agentProductId: formData.get('agentProductId'),
    platform: formData.get('platform'),
    version: formData.get('version'),
    releaseNotes: formData.get('releaseNotes') ?? '',
    isLatest: formData.get('isLatest') === 'on',
    isRequired: formData.get('isRequired') === 'on',
    status: formData.get('status') || 'DRAFT',
    installerFile: {
      fileName: formData.get('fileName'),
      storageKey: formData.get('storageKey'),
      downloadUrl: formData.get('downloadUrl'),
      platform: formData.get('platform'),
      sizeBytes: formData.get('sizeBytes') || '0',
      sha256: formData.get('sha256'),
    },
  })

  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? '릴리즈 입력값이 올바르지 않습니다.')

  const { installerFile, isLatest, ...releaseData } = parsed.data
  await prisma.$transaction(async (tx) => {
    if (isLatest) {
      await tx.agentRelease.updateMany({
        where: { agentProductId: releaseData.agentProductId, platform: releaseData.platform },
        data: { isLatest: false },
      })
    }

    await tx.agentRelease.create({
      data: {
        ...releaseData,
        isLatest,
        installerFile: { create: { ...installerFile!, platform: releaseData.platform } },
      },
    })
  })

  revalidatePath('/admin/releases')
}

export async function updateReleaseAction(formData: FormData) {
  const id = String(formData.get('id') ?? '')
  if (!id) throw new Error('릴리즈 ID가 필요합니다.')

  const parsed = updateReleaseSchema.safeParse({
    agentProductId: formData.get('agentProductId'),
    platform: formData.get('platform'),
    version: formData.get('version'),
    releaseNotes: formData.get('releaseNotes') ?? '',
    isLatest: formData.get('isLatest') === 'on',
    isRequired: formData.get('isRequired') === 'on',
    status: formData.get('status') || 'DRAFT',
  })

  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? '릴리즈 입력값이 올바르지 않습니다.')

  const { isLatest, ...rest } = parsed.data
  await prisma.$transaction(async (tx) => {
    const current = await tx.agentRelease.findUnique({ where: { id } })
    if (!current) throw new Error('릴리즈를 찾을 수 없습니다.')

    const agentProductId = rest.agentProductId ?? current.agentProductId
    const platform = rest.platform ?? current.platform

    if (isLatest) {
      await tx.agentRelease.updateMany({
        where: { agentProductId, platform, id: { not: id } },
        data: { isLatest: false },
      })
    }

    await tx.agentRelease.update({ where: { id }, data: { ...rest, isLatest } })
  })

  revalidatePath('/admin/releases')
}

export async function archiveReleaseAction(formData: FormData) {
  const id = String(formData.get('id') ?? '')
  if (!id) throw new Error('릴리즈 ID가 필요합니다.')
  await prisma.agentRelease.update({ where: { id }, data: { status: 'ARCHIVED', isLatest: false } })
  revalidatePath('/admin/releases')
}

export async function issueInstallCodeAction(formData: FormData) {
  const parsed = issueInstallCodeSchema.safeParse({
    purchaseId: formData.get('purchaseId'),
    maxActivations: formData.get('maxActivations') || 1,
    expiresAt: optionalDateString(formData.get('expiresAt')),
    status: 'ACTIVE',
  })

  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? '설치코드 입력값이 올바르지 않습니다.')

  const block = () => Math.random().toString(36).slice(2, 6).toUpperCase()
  const code = `AIL-${block()}-${block()}-${block()}`

  await prisma.$transaction(async (tx) => {
    const purchase = await tx.purchase.findUnique({ where: { id: parsed.data.purchaseId } })
    if (!purchase?.agentProductId) throw new Error('유효한 구매 내역을 찾을 수 없습니다.')

    const installCode = await tx.installCode.create({
      data: {
        purchaseId: purchase.id,
        userId: purchase.userId,
        code,
        status: parsed.data.status,
        maxActivations: parsed.data.maxActivations,
        expiresAt: parsed.data.expiresAt,
      },
    })

    await tx.license.create({
      data: {
        userId: purchase.userId,
        agentProductId: purchase.agentProductId,
        purchaseId: purchase.id,
        installCodeId: installCode.id,
        status: 'ACTIVE',
        endsAt: parsed.data.expiresAt,
      },
    })
  })

  revalidatePath('/admin/licenses')
}

export async function revokeInstallCodeAction(formData: FormData) {
  const id = String(formData.get('id') ?? '')
  if (!id) throw new Error('설치코드 ID가 필요합니다.')
  await prisma.installCode.update({ where: { id }, data: { status: 'REVOKED', revokedAt: new Date() } })
  revalidatePath('/admin/licenses')
}

export async function updateLicenseStatusAction(formData: FormData) {
  const id = String(formData.get('id') ?? '')
  if (!id) throw new Error('라이선스 ID가 필요합니다.')

  const parsed = updateLicenseSchema.safeParse({ status: formData.get('status') })
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? '라이선스 입력값이 올바르지 않습니다.')

  await prisma.license.update({ where: { id }, data: parsed.data })
  revalidatePath('/admin/licenses')
}

export async function searchLicensesAction(formData: FormData) {
  const query = String(formData.get('q') ?? '').trim()
  redirect(query ? `/admin/licenses?q=${encodeURIComponent(query)}` : '/admin/licenses')
}
