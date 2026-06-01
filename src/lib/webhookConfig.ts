import { isAllowedWebhookHost, isValidJwtSecret, isValidWebhookUrl } from '@/lib/jwt'

/** n8n HS256 signing secret (also documented in .env.local.example). */
export const N8N_JWT_SIGNING_SECRET = 'UnionHomeImprovement@123'

export const N8N_WEBHOOK_URL_DEFAULT =
  'https://n8n.srv1405965.hstgr.cloud/webhook/d0c5cf3f-db22-47e2-a531-88b8a27f83e1'

function readEnv(name: string): string | undefined {
  const value = process.env[name]?.trim()
  return value || undefined
}

export function getWebhookConfig(): { url: string; jwtSecret: string } | null {
  const url = readEnv('UHI_N8N_WEBHOOK_URL') ?? readEnv('N8N_WEBHOOK_URL') ?? N8N_WEBHOOK_URL_DEFAULT
  const jwtSecret = N8N_JWT_SIGNING_SECRET

  if (!isValidWebhookUrl(url) || !isValidJwtSecret(jwtSecret) || !isAllowedWebhookHost(url)) {
    return null
  }

  return { url, jwtSecret }
}
