import { NextResponse } from 'next/server'
import { PHONE_PRIMARY } from '@/lib/constants'
import { isRateLimited, rateLimitKey, validateLeadBody } from '@/lib/leadSecurity'
import { isSameOriginRequest } from '@/lib/requestSecurity'
import { isValidBearerSecret, isValidWebhookUrl } from '@/lib/webhook'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const WEBHOOK_TIMEOUT_MS = 20_000
const WEBHOOK_MAX_ATTEMPTS = 3
const MAX_BODY_BYTES = 8_192

const JSON_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate',
  'X-Content-Type-Options': 'nosniff',
}

function getWebhookConfig() {
  const url = process.env.N8N_WEBHOOK_URL?.trim()
  const bearer = process.env.N8N_AUTH_BEARER?.trim()
  if (!url || !bearer) return null
  if (!isValidWebhookUrl(url) || !isValidBearerSecret(bearer)) return null
  return { url, bearer }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function postToWebhook(url: string, bearer: string, payload: Record<string, unknown>) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), WEBHOOK_TIMEOUT_MS)

  try {
    return await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${bearer}`,
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
      cache: 'no-store',
    })
  } finally {
    clearTimeout(timeout)
  }
}

async function postToWebhookWithRetry(url: string, bearer: string, payload: Record<string, unknown>) {
  let lastResponse: Response | null = null
  let lastError: unknown = null

  for (let attempt = 1; attempt <= WEBHOOK_MAX_ATTEMPTS; attempt++) {
    try {
      const res = await postToWebhook(url, bearer, payload)
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

export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405, headers: JSON_HEADERS })
}

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403, headers: JSON_HEADERS })
  }

  const config = getWebhookConfig()
  if (!config) {
    console.error('Lead API: invalid or missing webhook configuration')
    return NextResponse.json(
      { error: `Form is not configured on the server. Please call ${PHONE_PRIMARY}.` },
      { status: 500, headers: JSON_HEADERS },
    )
  }

  const contentType = request.headers.get('content-type') ?? ''
  if (!contentType.includes('application/json')) {
    return NextResponse.json({ error: 'Unsupported content type' }, { status: 415, headers: JSON_HEADERS })
  }

  const contentLength = Number(request.headers.get('content-length') ?? 0)
  if (contentLength > MAX_BODY_BYTES) {
    return NextResponse.json({ error: 'Request too large' }, { status: 413, headers: JSON_HEADERS })
  }

  const limiterKey = rateLimitKey(request)
  if (isRateLimited(limiterKey)) {
    return NextResponse.json(
      { error: `Too many requests. Please wait a few minutes or call ${PHONE_PRIMARY}.` },
      { status: 429, headers: JSON_HEADERS },
    )
  }

  try {
    const raw = await request.text()
    if (raw.length > MAX_BODY_BYTES) {
      return NextResponse.json({ error: 'Request too large' }, { status: 413, headers: JSON_HEADERS })
    }

    let body: unknown
    try {
      body = JSON.parse(raw)
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400, headers: JSON_HEADERS })
    }

    const validated = validateLeadBody(body)
    if (!validated.ok) {
      return NextResponse.json({ error: validated.error }, { status: 400, headers: JSON_HEADERS })
    }

    const { service, timeline, name, email, phone, address, consent } = validated.data

    const payload = {
      service,
      timeline,
      name,
      email,
      phone,
      address,
      consent,
      tcpaConsent: consent,
      source: 'union-home-improvement-landing',
      submittedAt: new Date().toISOString(),
    }

    let res: Response
    try {
      res = await postToWebhookWithRetry(config.url, config.bearer, payload)
    } catch (e) {
      const aborted = e instanceof Error && e.name === 'AbortError'
      console.error('Lead API: webhook unreachable', aborted ? 'timeout' : 'network')
      return NextResponse.json(
        {
          error: aborted
            ? `Request timed out. Please try again or call ${PHONE_PRIMARY}.`
            : `Could not reach our booking system. Please try again or call ${PHONE_PRIMARY}.`,
        },
        { status: 503, headers: JSON_HEADERS },
      )
    }

    if (res.status >= 200 && res.status < 300) {
      return NextResponse.json({ ok: true }, { headers: JSON_HEADERS })
    }

    const errBody = await res.text().catch(() => '')
    console.error('Lead API: webhook rejected request', res.status, errBody.slice(0, 200))

    return NextResponse.json(
      {
        error:
          res.status === 401 || res.status === 403
            ? `Form authentication failed on the server. Please call ${PHONE_PRIMARY}.`
            : `Our booking system could not process your request. Please call ${PHONE_PRIMARY}.`,
      },
      { status: 502, headers: JSON_HEADERS },
    )
  } catch {
    console.error('Lead API: unexpected error')
    return NextResponse.json(
      { error: `Server error. Please call ${PHONE_PRIMARY}.` },
      { status: 500, headers: JSON_HEADERS },
    )
  }
}
