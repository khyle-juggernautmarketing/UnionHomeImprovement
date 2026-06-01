import { NextResponse } from 'next/server'
import { PHONE_PRIMARY } from '@/lib/constants'
import { getPendingLead, markPendingFlushed } from '@/lib/bookingStore'
import { PENDING_LEAD_TTL_MS } from '@/lib/appointments'
import { sendLeadToWebhook } from '@/lib/leadWebhook'
import { prepareBookingStore } from '@/lib/pendingLeadFlush'
import { isSameOriginRequest } from '@/lib/requestSecurity'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const JSON_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate',
  'X-Content-Type-Options': 'nosniff',
}

/** Client calls after 10 minutes if calendar step was not completed. */
export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403, headers: JSON_HEADERS })
  }

  try {
    const body = (await request.json().catch(() => ({}))) as { pendingId?: string }
    const pendingId = String(body.pendingId ?? '').trim()
    if (!pendingId) {
      return NextResponse.json({ error: 'Missing pendingId' }, { status: 400, headers: JSON_HEADERS })
    }

    await prepareBookingStore()
    const pending = await getPendingLead(pendingId)
    if (!pending) {
      return NextResponse.json({ ok: true, skipped: true }, { headers: JSON_HEADERS })
    }

    const age = Date.now() - Date.parse(pending.createdAt)
    if (age < PENDING_LEAD_TTL_MS) {
      return NextResponse.json({ ok: true, waiting: true }, { headers: JSON_HEADERS })
    }

    const result = await sendLeadToWebhook(pending.data, {
      submissionType: 'form_only_timeout',
      pendingId,
    })

    if (!result.ok) {
      return NextResponse.json(
        { error: `Could not submit your request. Please call ${PHONE_PRIMARY}.` },
        { status: 502, headers: JSON_HEADERS },
      )
    }

    await markPendingFlushed(pendingId)
    return NextResponse.json({ ok: true, flushed: true }, { headers: JSON_HEADERS })
  } catch {
    return NextResponse.json(
      { error: `Server error. Please call ${PHONE_PRIMARY}.` },
      { status: 500, headers: JSON_HEADERS },
    )
  }
}
