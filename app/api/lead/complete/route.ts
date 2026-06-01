import { NextResponse } from 'next/server'
import { PHONE_PRIMARY } from '@/lib/constants'
import {
  APPOINTMENT_TZ,
  buildEstSlotUtc,
  formatDateLabel,
  formatSlotLabel,
  parseSlotId,
} from '@/lib/appointments'
import { createBooking, getPendingLead } from '@/lib/bookingStore'
import { sendLeadToWebhook } from '@/lib/leadWebhook'
import { prepareBookingStore } from '@/lib/pendingLeadFlush'
import { isRateLimited, rateLimitKey } from '@/lib/leadSecurity'
import { isSameOriginRequest } from '@/lib/requestSecurity'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const MAX_BODY_BYTES = 4_096
const JSON_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate',
  'X-Content-Type-Options': 'nosniff',
}

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403, headers: JSON_HEADERS })
  }

  const limiterKey = rateLimitKey(request)
  if (isRateLimited(limiterKey)) {
    return NextResponse.json(
      { error: `Too many requests. Please wait a few minutes or call ${PHONE_PRIMARY}.` },
      { status: 429, headers: JSON_HEADERS },
    )
  }

  const contentType = request.headers.get('content-type') ?? ''
  if (!contentType.includes('application/json')) {
    return NextResponse.json({ error: 'Unsupported content type' }, { status: 415, headers: JSON_HEADERS })
  }

  try {
    const raw = await request.text()
    if (raw.length > MAX_BODY_BYTES) {
      return NextResponse.json({ error: 'Request too large' }, { status: 413, headers: JSON_HEADERS })
    }

    let body: { pendingId?: string; slotId?: string }
    try {
      body = JSON.parse(raw) as { pendingId?: string; slotId?: string }
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400, headers: JSON_HEADERS })
    }

    const pendingId = String(body.pendingId ?? '').trim()
    const slotId = String(body.slotId ?? '').trim()
    if (!pendingId || !slotId) {
      return NextResponse.json({ error: 'Missing booking details' }, { status: 400, headers: JSON_HEADERS })
    }

    const parsed = parseSlotId(slotId)
    if (!parsed) {
      return NextResponse.json({ error: 'Invalid time slot' }, { status: 400, headers: JSON_HEADERS })
    }

    await prepareBookingStore()

    const pending = await getPendingLead(pendingId)
    if (!pending) {
      return NextResponse.json(
        { error: 'Your session expired. Please fill out the form again.' },
        { status: 410, headers: JSON_HEADERS },
      )
    }

    const startUtc = buildEstSlotUtc(parsed.dateKey, parsed.hour, parsed.minute).toISOString()
    const booked = await createBooking(pendingId, startUtc)
    if (!booked.ok) {
      return NextResponse.json({ error: booked.error }, { status: 409, headers: JSON_HEADERS })
    }

    const timeLabel = formatSlotLabel(parsed.dateKey, parsed.hour, parsed.minute)
    const dateLabel = formatDateLabel(parsed.dateKey)

    const webhook = await sendLeadToWebhook(pending.data, {
      submissionType: 'appointment',
      pendingId,
      appointment: {
        dateKey: parsed.dateKey,
        timeLabel,
        startUtc: booked.booking.startUtc,
        endUtc: booked.booking.endUtc,
        timezone: APPOINTMENT_TZ,
      },
    })

    if (!webhook.ok) {
      if (webhook.message === 'authentication_failed') {
        return NextResponse.json(
          { error: `Form authentication failed on the server. Please call ${PHONE_PRIMARY}.` },
          { status: 502, headers: JSON_HEADERS },
        )
      }
      return NextResponse.json(
        {
          error: webhook.message === 'timeout'
            ? `Request timed out. Please try again or call ${PHONE_PRIMARY}.`
            : `Could not reach our booking system. Please call ${PHONE_PRIMARY}.`,
        },
        { status: 503, headers: JSON_HEADERS },
      )
    }

    return NextResponse.json(
      {
        ok: true,
        appointment: {
          dateKey: parsed.dateKey,
          dateLabel,
          timeLabel,
          timezone: APPOINTMENT_TZ,
          startUtc: booked.booking.startUtc,
          endUtc: booked.booking.endUtc,
        },
      },
      { headers: JSON_HEADERS },
    )
  } catch {
    console.error('Lead complete API: unexpected error')
    return NextResponse.json(
      { error: `Server error. Please call ${PHONE_PRIMARY}.` },
      { status: 500, headers: JSON_HEADERS },
    )
  }
}
