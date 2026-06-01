import { promises as fs } from 'node:fs'
import path from 'node:path'
import type { LeadFormData } from '@/lib/leadSecurity'
import { bookingRangeFromSlotStart } from '@/lib/appointments'

const STORE_KEY = 'union-home-improvement:booking-store'
const DATA_PATH = path.join(process.cwd(), '.data', 'booking-store.json')

export type StoredBooking = {
  id: string
  startUtc: string
  endUtc: string
  pendingId: string
  createdAt: string
}

export type PendingLead = {
  id: string
  data: LeadFormData
  createdAt: string
  flushedAt?: string
}

type BookingStore = {
  bookings: StoredBooking[]
  pending: PendingLead[]
}

declare global {
  // eslint-disable-next-line no-var
  var __uhiBookingStore: BookingStore | undefined
}

function emptyStore(): BookingStore {
  return { bookings: [], pending: [] }
}

function defaultStore(): BookingStore {
  return globalThis.__uhiBookingStore ?? emptyStore()
}

async function loadFromKv(): Promise<BookingStore | null> {
  const url = process.env.KV_REST_API_URL
  const token = process.env.KV_REST_API_TOKEN
  if (!url || !token) return null

  try {
    const res = await fetch(`${url}/get/${encodeURIComponent(STORE_KEY)}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    })
    if (!res.ok) return null
    const json = (await res.json()) as { result?: string | null }
    if (!json.result) return emptyStore()
    return JSON.parse(json.result) as BookingStore
  } catch {
    return null
  }
}

async function saveToKv(store: BookingStore): Promise<boolean> {
  const url = process.env.KV_REST_API_URL
  const token = process.env.KV_REST_API_TOKEN
  if (!url || !token) return false

  try {
    const res = await fetch(`${url}/set/${encodeURIComponent(STORE_KEY)}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(store),
      cache: 'no-store',
    })
    return res.ok
  } catch {
    return false
  }
}

async function loadFromFile(): Promise<BookingStore> {
  try {
    const raw = await fs.readFile(DATA_PATH, 'utf8')
    return JSON.parse(raw) as BookingStore
  } catch {
    return emptyStore()
  }
}

async function saveToFile(store: BookingStore): Promise<void> {
  await fs.mkdir(path.dirname(DATA_PATH), { recursive: true })
  await fs.writeFile(DATA_PATH, JSON.stringify(store, null, 2), 'utf8')
}

export async function readStore(): Promise<BookingStore> {
  const fromKv = await loadFromKv()
  if (fromKv) {
    globalThis.__uhiBookingStore = fromKv
    return fromKv
  }

  if (globalThis.__uhiBookingStore) return globalThis.__uhiBookingStore

  const fromFile = await loadFromFile()
  globalThis.__uhiBookingStore = fromFile
  return fromFile
}

export async function writeStore(store: BookingStore): Promise<void> {
  globalThis.__uhiBookingStore = store
  const savedKv = await saveToKv(store)
  if (!savedKv) await saveToFile(store)
}

export function getActiveBookings(store: BookingStore): StoredBooking[] {
  return store.bookings
}

export async function addPendingLead(data: LeadFormData): Promise<PendingLead> {
  const store = await readStore()
  const pending: PendingLead = {
    id: crypto.randomUUID(),
    data,
    createdAt: new Date().toISOString(),
  }
  store.pending.push(pending)
  await writeStore(store)
  return pending
}

export async function getPendingLead(id: string): Promise<PendingLead | null> {
  const store = await readStore()
  return store.pending.find((p) => p.id === id && !p.flushedAt) ?? null
}

export async function removePendingLead(id: string): Promise<void> {
  const store = await readStore()
  store.pending = store.pending.filter((p) => p.id !== id)
  await writeStore(store)
}

export async function markPendingFlushed(id: string): Promise<void> {
  const store = await readStore()
  const row = store.pending.find((p) => p.id === id)
  if (row) row.flushedAt = new Date().toISOString()
  await writeStore(store)
}

export async function createBooking(
  pendingId: string,
  slotStartUtc: string,
): Promise<{ ok: true; booking: StoredBooking } | { ok: false; error: string }> {
  const store = await readStore()
  const pending = store.pending.find((p) => p.id === pendingId && !p.flushedAt)
  if (!pending) return { ok: false, error: 'Session expired. Please restart the form.' }

  const range = bookingRangeFromSlotStart(slotStartUtc)
  const blocked = store.bookings.some((b) => {
    const blockStart = Date.parse(b.startUtc)
    const blockEnd = Date.parse(b.endUtc)
    const slotStart = Date.parse(range.startUtc)
    const slotEnd = Date.parse(range.endUtc)
    return slotStart < blockEnd && slotEnd > blockStart
  })

  if (blocked) return { ok: false, error: 'That time was just booked. Please choose another slot.' }

  const booking: StoredBooking = {
    id: crypto.randomUUID(),
    startUtc: range.startUtc,
    endUtc: range.endUtc,
    pendingId,
    createdAt: new Date().toISOString(),
  }

  store.bookings.push(booking)
  store.pending = store.pending.filter((p) => p.id !== pendingId)
  await writeStore(store)
  return { ok: true, booking }
}

export async function listExpiredPending(maxAgeMs: number): Promise<PendingLead[]> {
  const store = await readStore()
  const now = Date.now()
  return store.pending.filter((p) => {
    if (p.flushedAt) return false
    return now - Date.parse(p.createdAt) >= maxAgeMs
  })
}
