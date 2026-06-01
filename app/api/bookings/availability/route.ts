import { NextResponse } from 'next/server'
import { PHONE_PRIMARY } from '@/lib/constants'
import {
  APPOINTMENT_TZ,
  formatDateLabel,
  getAvailableSlots,
  getBookableDateKeys,
} from '@/lib/appointments'
import { getActiveBookings, readStore } from '@/lib/bookingStore'
import { prepareBookingStore } from '@/lib/pendingLeadFlush'
import { isSameOriginRequest } from '@/lib/requestSecurity'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const JSON_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate',
  'X-Content-Type-Options': 'nosniff',
}

export async function GET(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403, headers: JSON_HEADERS })
  }

  try {
    await prepareBookingStore()
    const store = await readStore()
    const bookings = getActiveBookings(store).map((b) => ({
      startUtc: b.startUtc,
      endUtc: b.endUtc,
    }))

    const { searchParams } = new URL(request.url)
    const dateKey = searchParams.get('date')

    const dates = getBookableDateKeys().map((key) => ({
      dateKey: key,
      label: formatDateLabel(key),
    }))

    if (!dateKey) {
      return NextResponse.json(
        { timezone: APPOINTMENT_TZ, dates, slots: [] },
        { headers: JSON_HEADERS },
      )
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey) || !getBookableDateKeys().includes(dateKey)) {
      return NextResponse.json({ error: 'Invalid date' }, { status: 400, headers: JSON_HEADERS })
    }

    const slots = getAvailableSlots(dateKey, bookings).map((slot) => ({
      slotId: `${slot.dateKey}-${String(slot.hour).padStart(2, '0')}-${String(slot.minute).padStart(2, '0')}`,
      startUtc: slot.startUtc,
      endUtc: slot.endUtc,
      label: slot.label,
    }))

    return NextResponse.json(
      { timezone: APPOINTMENT_TZ, dates, slots },
      { headers: JSON_HEADERS },
    )
  } catch {
    console.error('Availability API: unexpected error')
    return NextResponse.json(
      { error: `Server error. Please call ${PHONE_PRIMARY}.` },
      { status: 500, headers: JSON_HEADERS },
    )
  }
}
