import { z } from 'zod'

export const platformSchema = z.enum(['WINDOWS', 'MACOS', 'IOS', 'ANDROID', 'WEB'])
export const productStatusSchema = z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED'])
export const releaseStatusSchema = z.enum(['DRAFT', 'PUBLISHED', 'ROLLED_BACK', 'ARCHIVED'])
export const installCodeStatusSchema = z.enum(['PENDING', 'ACTIVE', 'USED', 'EXPIRED', 'REVOKED'])
export const licenseStatusSchema = z.enum(['ACTIVE', 'EXPIRED', 'REVOKED', 'SUSPENDED'])
export const adminRoleSchema = z.enum(['ADMIN', 'SUPER_ADMIN'])
export const adminUserStatusSchema = z.enum(['ACTIVE', 'PENDING', 'SUSPENDED', 'DELETED'])
export const creditAdjustmentTypeSchema = z.enum(['GRANT', 'DEDUCT'])
export const walletStatusSchema = z.enum(['ACTIVE', 'SUSPENDED'])
export const providerStatusSchema = z.enum(['ACTIVE', 'WARNING', 'CRITICAL', 'DISABLED'])
export const paymentProviderEventStatusSchema = z.enum(['PENDING', 'PAID', 'FAILED', 'CANCELLED', 'REFUNDED'])
export const ticketStatusSchema = z.enum(['OPEN', 'IN_PROGRESS', 'WAITING_CUSTOMER', 'CLOSED'])
export const contentStatusSchema = z.enum(['DRAFT', 'PUBLISHED', 'HIDDEN', 'DELETED'])

const stringArraySchema = z.array(z.string().trim().min(1)).default([])
const installerFileSchema = z.object({
  fileName: z.string().trim().min(1).max(255),
  storageKey: z.string().trim().min(1).max(255),
  downloadUrl: z.string().trim().url(),
  platform: platformSchema.optional(),
  sizeBytes: z.coerce.bigint().nonnegative(),
  sha256: z.string().trim().min(16).max(128),
  uploadedByAdminId: z.string().trim().min(1).optional().nullable(),
})

const createProductBaseSchema = z.object({
  slug: z.string().trim().min(2).max(80).regex(/^[a-z0-9-]+$/, 'slug는 영문 소문자, 숫자, 하이픈만 허용됩니다.'),
  name: z.string().trim().min(1).max(120),
  shortDescription: z.string().trim().min(1).max(240),
  description: z.string().trim().min(1),
  category: z.string().trim().min(1).max(80),
  purposeTags: stringArraySchema,
  skillLevel: z.string().trim().min(1).max(80),
  supportedPlatforms: z.array(platformSchema).min(1),
  price: z.coerce.number().min(0),
  status: productStatusSchema.default('DRAFT'),
  thumbnailUrl: z.string().trim().url().optional().nullable(),
})

const createReleaseBaseSchema = z.object({
  agentProductId: z.string().trim().min(1),
  platform: platformSchema,
  version: z.string().trim().min(1).max(40),
  releaseNotes: z.string().trim().default(''),
  isLatest: z.boolean().default(false),
  isRequired: z.boolean().default(false),
  status: releaseStatusSchema.default('DRAFT'),
  installerFile: installerFileSchema.optional(),
  installerFileId: z.string().trim().min(1).optional().nullable(),
})

export const createProductSchema = createProductBaseSchema
export const updateProductSchema = createProductBaseSchema.partial().refine((value) => Object.keys(value).length > 0, {
  message: '수정할 필드가 필요합니다.',
})

export const createReleaseSchema = createReleaseBaseSchema.refine((value) => !(value.installerFile && value.installerFileId), {
  message: 'installerFile과 installerFileId는 동시에 사용할 수 없습니다.',
  path: ['installerFile'],
})

export const updateReleaseSchema = createReleaseBaseSchema.partial().refine((value) => Object.keys(value).length > 0, {
  message: '수정할 필드가 필요합니다.',
}).refine((value) => !(value.installerFile && value.installerFileId), {
  message: 'installerFile과 installerFileId는 동시에 사용할 수 없습니다.',
  path: ['installerFile'],
})

export const issueInstallCodeSchema = z.object({
  purchaseId: z.string().trim().min(1),
  maxActivations: z.coerce.number().int().min(1).max(20).default(1),
  expiresAt: z.coerce.date().optional().nullable(),
  status: installCodeStatusSchema.default('ACTIVE'),
})

export const updateInstallCodeSchema = z.object({
  status: installCodeStatusSchema.optional(),
  maxActivations: z.coerce.number().int().min(1).max(20).optional(),
  expiresAt: z.coerce.date().optional().nullable(),
}).refine((value) => Object.keys(value).length > 0, { message: '수정할 필드가 필요합니다.' })

export const updateLicenseSchema = z.object({
  status: licenseStatusSchema.optional(),
  endsAt: z.coerce.date().optional().nullable(),
}).refine((value) => Object.keys(value).length > 0, { message: '수정할 필드가 필요합니다.' })

export const adjustCreditSchema = z.object({
  userId: z.string().trim().min(1),
  type: creditAdjustmentTypeSchema,
  amountUsd: z.coerce.number().positive().max(100000),
  reason: z.string().trim().min(2).max(500),
})

export const updateWalletStatusSchema = z.object({
  userId: z.string().trim().min(1),
  status: walletStatusSchema,
  reason: z.string().trim().min(2).max(500),
})

export const updateUserStatusSchema = z.object({
  userId: z.string().trim().min(1),
  status: z.enum(['ACTIVE', 'SUSPENDED']),
  reason: z.string().trim().min(2).max(500),
})

export const updatePaymentStatusSchema = z.object({
  paymentId: z.string().trim().min(1),
  status: z.enum(['FAILED', 'CANCELLED', 'REFUNDED']),
  reason: z.string().trim().min(2).max(500),
})

export const updateSupportTicketStatusSchema = z.object({
  ticketId: z.string().trim().min(1),
  status: ticketStatusSchema,
})

export const replySupportTicketSchema = z.object({
  ticketId: z.string().trim().min(1),
  message: z.string().trim().min(1).max(2000),
})

export const updateCommunityPostStatusSchema = z.object({
  postId: z.string().trim().min(1),
  status: contentStatusSchema,
})

export const updateCommunityCommentStatusSchema = z.object({
  commentId: z.string().trim().min(1),
  status: contentStatusSchema,
})

export const paymentProviderEventSchema = z.object({
  provider: z.string().trim().min(1).max(80),
  paymentKey: z.string().trim().min(1).max(255),
  purchaseId: z.string().trim().min(1).optional().nullable(),
  status: paymentProviderEventStatusSchema,
  amount: z.coerce.number().min(0).max(1000000000),
  currency: z.string().trim().min(3).max(8).default('KRW'),
  paidAt: z.coerce.date().optional().nullable(),
  cancelledAt: z.coerce.date().optional().nullable(),
  rawData: z.unknown().optional(),
  tokenCreditUsd: z.coerce.number().positive().max(1000000).optional().nullable(),
})

export const approvePaymentSchema = z.object({
  provider: z.string().trim().min(1).max(80).default('manual'),
  paymentKey: z.string().trim().min(1).max(255),
  purchaseId: z.string().trim().min(1).optional().nullable(),
  amount: z.coerce.number().min(0).max(1000000000),
  currency: z.string().trim().min(3).max(8).default('KRW'),
  tokenCreditUsd: z.coerce.number().positive().max(1000000).optional().nullable(),
  rawData: z.unknown().optional(),
})

export const createLLMProviderSchema = z.object({
  name: z.string().trim().min(1).max(120),
  type: z.string().trim().min(1).max(80),
  status: providerStatusSchema.default('ACTIVE'),
})

export const updateLLMProviderSchema = createLLMProviderSchema.partial().refine((value) => Object.keys(value).length > 0, {
  message: '수정할 필드가 필요합니다.',
})

export const createLLMAccountSchema = z.object({
  providerId: z.string().trim().min(1),
  name: z.string().trim().min(1).max(120),
  apiKey: z.string().trim().min(8).max(4096),
  monthlyLimitUsd: z.coerce.number().min(0).max(1000000).default(0),
  status: providerStatusSchema.default('ACTIVE'),
  priority: z.coerce.number().int().min(0).max(100000).default(100),
})

export const updateLLMAccountSchema = z.object({
  providerId: z.string().trim().min(1).optional(),
  name: z.string().trim().min(1).max(120).optional(),
  apiKey: z.string().trim().min(8).max(4096).optional(),
  monthlyLimitUsd: z.coerce.number().min(0).max(1000000).optional(),
  usedThisMonthUsd: z.coerce.number().min(0).max(1000000).optional(),
  status: providerStatusSchema.optional(),
  priority: z.coerce.number().int().min(0).max(100000).optional(),
}).refine((value) => Object.keys(value).length > 0, { message: '수정할 필드가 필요합니다.' })

export const createAdminUserSchema = z.object({
  email: z.string().trim().email().max(255),
  name: z.string().trim().min(1).max(120),
  password: z.string().min(8).max(128),
  role: adminRoleSchema.default('ADMIN'),
  status: adminUserStatusSchema.default('ACTIVE'),
})

export const updateAdminUserSchema = createAdminUserSchema.partial().refine((value) => Object.keys(value).length > 0, {
  message: '수정할 필드가 필요합니다.',
})

export function parseJsonBody<T>(schema: z.ZodType<T>, body: unknown) {
  return schema.safeParse(body)
}
