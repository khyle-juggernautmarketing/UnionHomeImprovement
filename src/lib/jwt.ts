import { createHmac } from 'node:crypto'

function base64UrlEncode(value: string | Buffer) {
  const buf = typeof value === 'string' ? Buffer.from(value, 'utf8') : value
  return buf.toString('base64url')
}

export function signJwtHS256(secret: string, payload: Record<string, unknown> = {}) {
  const header = { alg: 'HS256', typ: 'JWT' }
  const now = Math.floor(Date.now() / 1000)
  const body = {
    iss: 'union-home-improvement-landing',
    iat: now,
    exp: now + 120,
    ...payload,
  }
  const encodedHeader = base64UrlEncode(JSON.stringify(header))
  const encodedPayload = base64UrlEncode(JSON.stringify(body))
  const signingInput = `${encodedHeader}.${encodedPayload}`
  const signature = createHmac('sha256', secret).update(signingInput).digest('base64url')
  return `${signingInput}.${signature}`
}

export function isValidWebhookUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'https:' && parsed.hostname.length > 0
  } catch {
    return false
  }
}

export function isValidJwtSecret(secret: string): boolean {
  return secret.length >= 8
}

export function isAllowedWebhookHost(url: string): boolean {
  try {
    const hostname = new URL(url).hostname
    return hostname.endsWith('.hstgr.cloud') || hostname.includes('n8n')
  } catch {
    return false
  }
}
