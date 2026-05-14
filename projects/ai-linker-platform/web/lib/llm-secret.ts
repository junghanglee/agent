import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const LOCAL_FALLBACK_KEY = 'ai-linker-local-llm-secret-key'

function getEncryptionKey() {
  const raw = process.env.AI_LINKER_ENCRYPTION_KEY

  if (process.env.NODE_ENV === 'production') {
    if (!raw || raw === 'replace-with-strong-random-key' || raw.length < 32) {
      throw new Error('Production AI_LINKER_ENCRYPTION_KEY must be set to a strong random value of at least 32 characters.')
    }
    return createHash('sha256').update(raw).digest()
  }

  return createHash('sha256').update(raw && raw !== 'replace-with-strong-random-key' ? raw : LOCAL_FALLBACK_KEY).digest()
}

export function encryptLLMSecret(secret: string) {
  const iv = randomBytes(12)
  const cipher = createCipheriv(ALGORITHM, getEncryptionKey(), iv)
  const encrypted = Buffer.concat([cipher.update(secret, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return `v1:${iv.toString('base64')}:${tag.toString('base64')}:${encrypted.toString('base64')}`
}

export function decryptLLMSecret(payload: string) {
  const [version, ivText, tagText, encryptedText] = payload.split(':')
  if (version !== 'v1' || !ivText || !tagText || !encryptedText) throw new Error('Unsupported encrypted secret format.')

  const decipher = createDecipheriv(ALGORITHM, getEncryptionKey(), Buffer.from(ivText, 'base64'))
  decipher.setAuthTag(Buffer.from(tagText, 'base64'))
  const decrypted = Buffer.concat([decipher.update(Buffer.from(encryptedText, 'base64')), decipher.final()])
  return decrypted.toString('utf8')
}

export function maskSecret(payload: string | null | undefined) {
  if (!payload) return '—'
  if (!payload.startsWith('v1:')) return '저장됨(레거시)'
  return '암호화 저장됨'
}
