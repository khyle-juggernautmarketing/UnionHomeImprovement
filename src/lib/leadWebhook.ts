import { signJwtHS256 } from '@/lib/jwt'
import { getWebhookConfig } from '@/lib/webhookConfig'
import type { LeadFormData } from '@/lib/leadSecurity'

const WEBHOOK_TIMEOUT_MS = 20_000
const WEBHOOK_MAX_ATTEMPTS = 3

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function postToWebhook(url: string, jwtSecret: string, payload: Record<string, unknown>) {
  const token = signJwtHS256(jwtSecret, { sub: 'lead-form' })
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), WEBHOOK_TIMEOUT_MS)

  try {
    return await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json, text/plain, */*',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
      cache: 'no-store',
    })
  } finally {
    clearTimeout(timeout)
  }
}

async function postToWebhookWithRetry(
  url: string,
  jwtSecret: string,
  payload: Record<string, unknown>,
) {
  let lastResponse: Response | null = null
  let lastError: unknown = null

  for (let attempt = 1; attempt <= WEBHOOK_MAX_ATTEMPTS; attempt++) {
    try {
      const res = await postToWebhook(url, jwtSecret, payload)
      if (res.status >= 200 && res.status < 300) return res

      lastResponse = res
      if (res.status >= 400 && res.status < 500 && res.status !== 408 && res.status !== 429) {
        return res
      }
    } catch (error) {
      lastError = error
    }

    if (attempt < WEBHOOK_MAX_ATTEMPTS) {
      await sleep(350 * attempt)
    }
  }

  if (lastResponse) return lastResponse
  throw lastError ?? new Error('Webhook unreachable')
}

export type AppointmentPayload = {
  dateKey: string
  timeLabel: string
  startUtc: string
  endUtc: string
  timezone: string
}

export function buildWebhookPayload(
  data: LeadFormData,
  options?: {
    appointment?: AppointmentPayload
    submissionType?: 'appointment' | 'form_only_timeout'
    pendingId?: string
  },
): Record<string, unknown> {
  return {
    service: data.service,
    timeline: data.timeline,
    name: data.name,
    email: data.email,
    phone: data.phone,
    address: data.address,
    consent: data.consent,
    tcpaConsent: data.consent,
    source: 'union-home-improvement-landing',
    submittedAt: new Date().toISOString(),
    submissionType: options?.submissionType ?? (options?.appointment ? 'appointment' : 'form_only_timeout'),
    pendingId: options?.pendingId,
    appointment: options?.appointment ?? null,
  }
}

export type WebhookResult =
  | { ok: true }
  | { ok: false; status: number; message: string }

export async function sendLeadToWebhook(
  data: LeadFormData,
  options?: Parameters<typeof buildWebhookPayload>[1],
): Promise<WebhookResult> {
  const config = getWebhookConfig()
  if (!config) {
    return { ok: false, status: 500, message: 'Webhook is not configured' }
  }

  const payload = buildWebhookPayload(data, options)

  try {
    const res = await postToWebhookWithRetry(config.url, config.jwtSecret, payload)
    if (res.status >= 200 && res.status < 300) return { ok: true }

    const errBody = await res.text().catch(() => '')
    console.error('Lead webhook rejected', res.status, errBody.slice(0, 200))
    return {
      ok: false,
      status: res.status,
      message: res.status === 401 || res.status === 403 ? 'authentication_failed' : 'webhook_error',
    }
  } catch (e) {
    const aborted = e instanceof Error && e.name === 'AbortError'
    console.error('Lead webhook unreachable', aborted ? 'timeout' : 'network')
    return { ok: false, status: 503, message: aborted ? 'timeout' : 'network' }
  }
}
