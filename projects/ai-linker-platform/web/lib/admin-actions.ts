'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireAdminPagePermission } from '@/lib/admin-auth'
import { recordAdminAudit } from '@/lib/admin-audit'
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
  const session = await requireAdminPagePermission('PRODUCTS_MANAGE')

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

  const product = await prisma.agentProduct.create({
    data: {
      ...parsed.data,
      purposeTags: JSON.stringify(parsed.data.purposeTags),
      supportedPlatforms: JSON.stringify(parsed.data.supportedPlatforms),
    },
  })

  await recordAdminAudit({ session, action: 'AGENT_PRODUCT_CREATE', entityType: 'AgentProduct', entityId: product.id, afterData: product })

  revalidatePath('/admin/products')
}

export async function updateProductAction(formData: FormData) {
  const session = await requireAdminPagePermission('PRODUCTS_MANAGE')

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

  const before = await prisma.agentProduct.findUnique({ where: { id } })
  const { purposeTags, supportedPlatforms, ...rest } = parsed.data
  const product = await prisma.agentProduct.update({
    where: { id },
    data: {
      ...rest,
      ...(purposeTags ? { purposeTags: JSON.stringify(purposeTags) } : {}),
      ...(supportedPlatforms ? { supportedPlatforms: JSON.stringify(supportedPlatforms) } : {}),
    },
  })

  await recordAdminAudit({ session, action: 'AGENT_PRODUCT_UPDATE', entityType: 'AgentProduct', entityId: product.id, beforeData: before, afterData: product })

  revalidatePath('/admin/products')
}

export async function archiveProductAction(formData: FormData) {
  const session = await requireAdminPagePermission('PRODUCTS_MANAGE')

  const id = String(formData.get('id') ?? '')
  if (!id) throw new Error('상품 ID가 필요합니다.')
  const before = await prisma.agentProduct.findUnique({ where: { id } })
  const product = await prisma.agentProduct.update({ where: { id }, data: { status: 'ARCHIVED' } })
  await recordAdminAudit({ session, action: 'AGENT_PRODUCT_ARCHIVE', entityType: 'AgentProduct', entityId: product.id, beforeData: before, afterData: product })
  revalidatePath('/admin/products')
}

export async function createReleaseAction(formData: FormData) {
  const session = await requireAdminPagePermission('RELEASES_MANAGE')

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

  const { installerFile, installerFileId: _installerFileId, isLatest, agentProductId, platform, ...releaseData } = parsed.data
  const release = await prisma.$transaction(async (tx) => {
    if (isLatest) {
      await tx.agentRelease.updateMany({
        where: { agentProductId, platform },
        data: { isLatest: false },
      })
    }

    return tx.agentRelease.create({
      data: {
        ...releaseData,
        agentProduct: { connect: { id: agentProductId } },
        platform,
        isLatest,
        installerFile: { create: { ...installerFile!, platform } },
      },
      include: { installerFile: true },
    })
  })

  await recordAdminAudit({ session, action: 'AGENT_RELEASE_CREATE', entityType: 'AgentRelease', entityId: release.id, afterData: release })

  revalidatePath('/admin/releases')
}

export async function updateReleaseAction(formData: FormData) {
  const session = await requireAdminPagePermission('RELEASES_MANAGE')

  const id = String(formData.get('id') ?? '')
  if (!id) throw new Error('릴리즈 ID가 필요합니다.')

  const fileName = optionalString(formData.get('fileName'))
  const storageKey = optionalString(formData.get('storageKey'))
  const downloadUrl = optionalString(formData.get('downloadUrl'))
  const sha256 = optionalString(formData.get('sha256'))
  const shouldUpdateInstallerFile = Boolean(fileName || storageKey || downloadUrl || sha256)

  const parsed = updateReleaseSchema.safeParse({
    agentProductId: formData.get('agentProductId'),
    platform: formData.get('platform'),
    version: formData.get('version'),
    releaseNotes: formData.get('releaseNotes') ?? '',
    isLatest: formData.get('isLatest') === 'on',
    isRequired: formData.get('isRequired') === 'on',
    status: formData.get('status') || 'DRAFT',
    ...(shouldUpdateInstallerFile
      ? {
          installerFile: {
            fileName,
            storageKey,
            downloadUrl,
            platform: formData.get('platform'),
            sizeBytes: formData.get('sizeBytes') || '0',
            sha256,
          },
        }
      : {}),
  })

  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? '릴리즈 입력값이 올바르지 않습니다.')

  const { isLatest, agentProductId, installerFile, installerFileId, ...rest } = parsed.data
  const { before, release } = await prisma.$transaction(async (tx) => {
    const current = await tx.agentRelease.findUnique({ where: { id } })
    if (!current) throw new Error('릴리즈를 찾을 수 없습니다.')

    const nextAgentProductId = agentProductId ?? current.agentProductId
    const platform = rest.platform ?? current.platform

    if (isLatest) {
      await tx.agentRelease.updateMany({
        where: { agentProductId: nextAgentProductId, platform, id: { not: id } },
        data: { isLatest: false },
      })
    }

    let nextInstallerFileId = installerFileId
    if (installerFile) {
      if (current.installerFileId) {
        await tx.installerFile.update({
          where: { id: current.installerFileId },
          data: { ...installerFile, platform: installerFile.platform ?? platform },
        })
        nextInstallerFileId = current.installerFileId
      } else {
        const createdInstallerFile = await tx.installerFile.create({
          data: { ...installerFile, platform: installerFile.platform ?? platform },
        })
        nextInstallerFileId = createdInstallerFile.id
      }
    }

    const release = await tx.agentRelease.update({
      where: { id },
      data: {
        ...rest,
        ...(agentProductId ? { agentProduct: { connect: { id: agentProductId } } } : {}),
        ...(typeof nextInstallerFileId !== 'undefined'
          ? nextInstallerFileId
            ? { installerFile: { connect: { id: nextInstallerFileId } } }
            : { installerFile: { disconnect: true } }
          : {}),
        isLatest,
      },
    })
    return { before: current, release }
  })

  await recordAdminAudit({ session, action: 'AGENT_RELEASE_UPDATE', entityType: 'AgentRelease', entityId: release.id, beforeData: before, afterData: release })

  revalidatePath('/admin/releases')
}

export async function archiveReleaseAction(formData: FormData) {
  const session = await requireAdminPagePermission('RELEASES_MANAGE')

  const id = String(formData.get('id') ?? '')
  if (!id) throw new Error('릴리즈 ID가 필요합니다.')
  const before = await prisma.agentRelease.findUnique({ where: { id } })
  const release = await prisma.agentRelease.update({ where: { id }, data: { status: 'ARCHIVED', isLatest: false } })
  await recordAdminAudit({ session, action: 'AGENT_RELEASE_ARCHIVE', entityType: 'AgentRelease', entityId: release.id, beforeData: before, afterData: release })
  revalidatePath('/admin/releases')
}

export async function publishReleaseAction(formData: FormData) {
  const session = await requireAdminPagePermission('RELEASES_MANAGE')

  const id = String(formData.get('id') ?? '')
  if (!id) throw new Error('릴리즈 ID가 필요합니다.')
  const before = await prisma.agentRelease.findUnique({ where: { id } })
  if (!before) throw new Error('릴리즈를 찾을 수 없습니다.')
  const release = await prisma.agentRelease.update({ where: { id }, data: { status: 'PUBLISHED' } })
  await recordAdminAudit({ session, action: 'AGENT_RELEASE_PUBLISH', entityType: 'AgentRelease', entityId: release.id, beforeData: before, afterData: release })
  revalidatePath('/admin/releases')
}

export async function unpublishReleaseAction(formData: FormData) {
  const session = await requireAdminPagePermission('RELEASES_MANAGE')

  const id = String(formData.get('id') ?? '')
  if (!id) throw new Error('릴리즈 ID가 필요합니다.')
  const before = await prisma.agentRelease.findUnique({ where: { id } })
  if (!before) throw new Error('릴리즈를 찾을 수 없습니다.')
  const release = await prisma.agentRelease.update({ where: { id }, data: { status: 'DRAFT', isLatest: false } })
  await recordAdminAudit({ session, action: 'AGENT_RELEASE_UNPUBLISH', entityType: 'AgentRelease', entityId: release.id, beforeData: before, afterData: release })
  revalidatePath('/admin/releases')
}

export async function issueInstallCodeAction(formData: FormData) {
  const session = await requireAdminPagePermission('LICENSES_MANAGE')

  const parsed = issueInstallCodeSchema.safeParse({
    purchaseId: formData.get('purchaseId'),
    maxActivations: formData.get('maxActivations') || 1,
    expiresAt: optionalDateString(formData.get('expiresAt')),
    status: 'ACTIVE',
  })

  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? '설치코드 입력값이 올바르지 않습니다.')

  const block = () => Math.random().toString(36).slice(2, 6).toUpperCase()
  const code = `AIL-${block()}-${block()}-${block()}`

  const result = await prisma.$transaction(async (tx) => {
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

    const license = await tx.license.create({
      data: {
        userId: purchase.userId,
        agentProductId: purchase.agentProductId,
        purchaseId: purchase.id,
        installCodeId: installCode.id,
        status: 'ACTIVE',
        endsAt: parsed.data.expiresAt,
      },
    })

    return { installCode, license }
  })

  await recordAdminAudit({ session, action: 'INSTALL_CODE_ISSUE', entityType: 'InstallCode', entityId: result.installCode.id, afterData: result })

  revalidatePath('/admin/licenses')
}

export async function revokeInstallCodeAction(formData: FormData) {
  const session = await requireAdminPagePermission('LICENSES_MANAGE')

  const id = String(formData.get('id') ?? '')
  if (!id) throw new Error('설치코드 ID가 필요합니다.')
  const before = await prisma.installCode.findUnique({ where: { id } })
  const installCode = await prisma.installCode.update({ where: { id }, data: { status: 'REVOKED', revokedAt: new Date() } })
  await recordAdminAudit({ session, action: 'INSTALL_CODE_REVOKE', entityType: 'InstallCode', entityId: installCode.id, beforeData: before, afterData: installCode })
  revalidatePath('/admin/licenses')
}

export async function reactivateInstallCodeAction(formData: FormData) {
  const session = await requireAdminPagePermission('LICENSES_MANAGE')

  const id = String(formData.get('id') ?? '')
  if (!id) throw new Error('설치코드 ID가 필요합니다.')
  const before = await prisma.installCode.findUnique({ where: { id } })
  const installCode = await prisma.installCode.update({ where: { id }, data: { status: 'ACTIVE', revokedAt: null } })
  await recordAdminAudit({ session, action: 'INSTALL_CODE_REACTIVATE', entityType: 'InstallCode', entityId: installCode.id, beforeData: before, afterData: installCode })
  revalidatePath('/admin/licenses')
}

export async function updateLicenseStatusAction(formData: FormData) {
  const session = await requireAdminPagePermission('LICENSES_MANAGE')

  const id = String(formData.get('id') ?? '')
  if (!id) throw new Error('라이선스 ID가 필요합니다.')

  const parsed = updateLicenseSchema.safeParse({ status: formData.get('status') })
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? '라이선스 입력값이 올바르지 않습니다.')

  const before = await prisma.license.findUnique({ where: { id } })
  const license = await prisma.license.update({ where: { id }, data: parsed.data })
  await recordAdminAudit({ session, action: 'LICENSE_UPDATE', entityType: 'License', entityId: license.id, beforeData: before, afterData: license })
  revalidatePath('/admin/licenses')
}

export async function searchLicensesAction(formData: FormData) {
  await requireAdminPagePermission('LICENSES_MANAGE')

  const query = String(formData.get('q') ?? '').trim()
  redirect(query ? `/admin/licenses?q=${encodeURIComponent(query)}` : '/admin/licenses')
}
