import { PENDING_LEAD_TTL_MS } from '@/lib/appointments'
import {
  listExpiredPending,
  markPendingFlushed,
  readStore,
} from '@/lib/bookingStore'
import { sendLeadToWebhook } from '@/lib/leadWebhook'

export async function flushExpiredPendingLeads(): Promise<number> {
  const expired = await listExpiredPending(PENDING_LEAD_TTL_MS)
  let flushed = 0

  for (const pending of expired) {
    const result = await sendLeadToWebhook(pending.data, {
      submissionType: 'form_only_timeout',
      pendingId: pending.id,
    })
    if (result.ok) {
      await markPendingFlushed(pending.id)
      flushed += 1
    }
  }

  return flushed
}

/** Ensures store is loaded and expired pendings are flushed before reads. */
export async function prepareBookingStore(): Promise<void> {
  await readStore()
  await flushExpiredPendingLeads()
}
