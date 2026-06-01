const ALLOWED_HOSTS = new Set(['n8n.srv1405965.hstgr.cloud'])

export function isValidWebhookUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    if (parsed.protocol !== 'https:') return false
    if (!ALLOWED_HOSTS.has(parsed.hostname)) return false
    return parsed.pathname.includes('/webhook/')
  } catch {
    return false
  }
}

export function isValidBearerSecret(secret: string): boolean {
  return secret.length >= 12 && secret.length <= 256 && !/\s/.test(secret)
}
