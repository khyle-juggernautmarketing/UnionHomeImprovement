export const APPOINTMENT_TZ = 'America/New_York'
export const SLOT_INTERVAL_MINUTES = 15
export const BLOCK_DURATION_MINUTES = 90
export const OPEN_HOUR = 8
/** Last slot starts at 18:45 (ends 19:00). */
export const LAST_SLOT_HOUR = 18
export const LAST_SLOT_MINUTE = 45
export const MAX_DAYS_OUT = 3
export const PENDING_LEAD_TTL_MS = 10 * 60 * 1000

export type EstParts = {
  dateKey: string
  hour: number
  minute: number
  weekday: string
}

export function getEstParts(instant: Date): EstParts {
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: APPOINTMENT_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    weekday: 'short',
    hour12: false,
  })
  const map: Record<string, string> = {}
  for (const p of fmt.formatToParts(instant)) {
    if (p.type !== 'literal') map[p.type] = p.value
  }
  return {
    dateKey: `${map.year}-${map.month}-${map.day}`,
    hour: Number(map.hour),
    minute: Number(map.minute),
    weekday: map.weekday ?? '',
  }
}

export function getEstTodayKey(): string {
  return getEstParts(new Date()).dateKey
}

export function isSundayDateKey(dateKey: string): boolean {
  const noon = buildEstSlotUtc(dateKey, 12, 0)
  const weekday = getEstParts(noon).weekday
  return weekday === 'Sun'
}

export function addDaysToDateKey(dateKey: string, days: number): string {
  const noon = buildEstSlotUtc(dateKey, 12, 0)
  const next = new Date(noon.getTime() + days * 86_400_000)
  return getEstParts(next).dateKey
}

/** Bookable dates: today through +MAX_DAYS_OUT (EST), Mon–Sat only. */
export function getBookableDateKeys(): string[] {
  const today = getEstTodayKey()
  const keys: string[] = []
  for (let offset = 0; offset <= MAX_DAYS_OUT; offset++) {
    const key = addDaysToDateKey(today, offset)
    if (!isSundayDateKey(key)) keys.push(key)
  }
  return keys
}

export function buildEstSlotUtc(dateKey: string, hour: number, minute: number): Date {
  const [y, m, d] = dateKey.split('-').map(Number)
  let guess = Date.UTC(y, m - 1, d, hour + 5, minute)

  for (let i = 0; i < 32; i++) {
    const p = getEstParts(new Date(guess))
    if (p.dateKey === dateKey && p.hour === hour && p.minute === minute) {
      return new Date(guess)
    }

    const targetMinutes = hour * 60 + minute
    const actualMinutes = p.hour * 60 + p.minute
    let deltaMinutes = targetMinutes - actualMinutes

    if (p.dateKey < dateKey) deltaMinutes += 24 * 60
    if (p.dateKey > dateKey) deltaMinutes -= 24 * 60

    guess += deltaMinutes * 60_000
  }

  return new Date(guess)
}

export function formatSlotLabel(dateKey: string, hour: number, minute: number): string {
  const d = buildEstSlotUtc(dateKey, hour, minute)
  return new Intl.DateTimeFormat('en-US', {
    timeZone: APPOINTMENT_TZ,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(d)
}

export function formatDateLabel(dateKey: string): string {
  const d = buildEstSlotUtc(dateKey, 12, 0)
  return new Intl.DateTimeFormat('en-US', {
    timeZone: APPOINTMENT_TZ,
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(d)
}

export type SlotDefinition = {
  dateKey: string
  hour: number
  minute: number
  startUtc: string
  endUtc: string
  label: string
}

export function generateDaySlots(dateKey: string): SlotDefinition[] {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey) || isSundayDateKey(dateKey)) return []

  const today = getEstTodayKey()
  const lastAllowed = addDaysToDateKey(today, MAX_DAYS_OUT)
  if (dateKey < today || dateKey > lastAllowed) return []

  const slots: SlotDefinition[] = []
  for (let hour = OPEN_HOUR; hour <= LAST_SLOT_HOUR; hour++) {
    for (let minute = 0; minute < 60; minute += SLOT_INTERVAL_MINUTES) {
      if (hour === LAST_SLOT_HOUR && minute > LAST_SLOT_MINUTE) break
      const start = buildEstSlotUtc(dateKey, hour, minute)
      const end = new Date(start.getTime() + SLOT_INTERVAL_MINUTES * 60_000)
      slots.push({
        dateKey,
        hour,
        minute,
        startUtc: start.toISOString(),
        endUtc: end.toISOString(),
        label: formatSlotLabel(dateKey, hour, minute),
      })
    }
  }
  return slots
}

export type BookedRange = { startUtc: string; endUtc: string }

export function slotIsBlocked(
  slotStartUtc: string,
  slotEndUtc: string,
  bookings: BookedRange[],
): boolean {
  const slotStart = Date.parse(slotStartUtc)
  const slotEnd = Date.parse(slotEndUtc)
  if (!Number.isFinite(slotStart) || !Number.isFinite(slotEnd)) return true

  for (const b of bookings) {
    const blockStart = Date.parse(b.startUtc)
    const blockEnd = Date.parse(b.endUtc)
    if (!Number.isFinite(blockStart) || !Number.isFinite(blockEnd)) continue
    if (slotStart < blockEnd && slotEnd > blockStart) return true
  }
  return false
}

export function getAvailableSlots(dateKey: string, bookings: BookedRange[]): SlotDefinition[] {
  return generateDaySlots(dateKey).filter(
    (slot) => !slotIsBlocked(slot.startUtc, slot.endUtc, bookings),
  )
}

export function bookingRangeFromSlotStart(startUtc: string): BookedRange {
  const start = Date.parse(startUtc)
  const end = start + BLOCK_DURATION_MINUTES * 60_000
  return { startUtc: new Date(start).toISOString(), endUtc: new Date(end).toISOString() }
}

export function parseSlotId(slotId: string): { dateKey: string; hour: number; minute: number } | null {
  const match = /^(\d{4}-\d{2}-\d{2})-(\d{2})-(\d{2})$/.exec(slotId)
  if (!match) return null
  const hour = Number(match[2])
  const minute = Number(match[3])
  if (hour < OPEN_HOUR || hour > LAST_SLOT_HOUR) return null
  if (minute % SLOT_INTERVAL_MINUTES !== 0) return null
  if (hour === LAST_SLOT_HOUR && minute > LAST_SLOT_MINUTE) return null
  return { dateKey: match[1], hour, minute }
}

export function slotIdFromParts(dateKey: string, hour: number, minute: number): string {
  return `${dateKey}-${String(hour).padStart(2, '0')}-${String(minute).padStart(2, '0')}`
}
