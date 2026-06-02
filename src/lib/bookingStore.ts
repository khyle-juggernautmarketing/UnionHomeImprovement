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

function normalizeStore(raw: unknown): BookingStore {
  if (!raw || typeof raw !== 'object') return emptyStore()
  const data = raw as Partial<BookingStore>
  return {
    bookings: Array.isArray(data.bookings) ? data.bookings : [],
    pending: Array.isArray(data.pending) ? data.pending : [],
  }
}

function newId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

async function upstashCommand<T>(command: (string | number)[]): Promise<T | null> {
  const url = process.env.KV_REST_API_URL
  const token = process.env.KV_REST_API_TOKEN
  if (!url || !token) return null

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(command),
      cache: 'no-store',
    })
    if (!res.ok) return null
    const json = (await res.json()) as { result?: T }
    return json.result ?? null
  } catch {
    return null
  }
}

function kvConfigured(): boolean {
  return Boolean(process.env.KV_REST_API_URL?.trim() && process.env.KV_REST_API_TOKEN?.trim())
}

async function loadFromKv(): Promise<BookingStore | null> {
  if (!kvConfigured()) return null

  const result = await upstashCommand<string | null>(['GET', STORE_KEY])
  if (result === null) return emptyStore()
  if (typeof result !== 'string') return normalizeStore(result)
  try {
    return normalizeStore(JSON.parse(result))
  } catch {
    return emptyStore()
  }
}

async function saveToKv(store: BookingStore): Promise<boolean> {
  if (!kvConfigured()) return false
  const result = await upstashCommand<string>(['SET', STORE_KEY, JSON.stringify(store)])
  return result === 'OK'
}

async function loadFromFile(): Promise<BookingStore> {
  try {
    const raw = await fs.readFile(DATA_PATH, 'utf8')
    return normalizeStore(JSON.parse(raw))
  } catch {
    return emptyStore()
  }
}

async function saveToFile(store: BookingStore): Promise<boolean> {
  try {
    await fs.mkdir(path.dirname(DATA_PATH), { recursive: true })
    await fs.writeFile(DATA_PATH, JSON.stringify(store, null, 2), 'utf8')
    return true
  } catch {
    return false
  }
}

export async function readStore(): Promise<BookingStore> {
  try {
    if (kvConfigured()) {
      const fromKv = await loadFromKv()
      if (fromKv) {
        globalThis.__uhiBookingStore = fromKv
        return fromKv
      }
    }
  } catch {
    // fall through
  }

  if (globalThis.__uhiBookingStore) return globalThis.__uhiBookingStore

  try {
    const fromFile = await loadFromFile()
    globalThis.__uhiBookingStore = fromFile
    return fromFile
  } catch {
    const fallback = emptyStore()
    globalThis.__uhiBookingStore = fallback
    return fallback
  }
}

export async function writeStore(store: BookingStore): Promise<void> {
  globalThis.__uhiBookingStore = store
  try {
    const savedKv = await saveToKv(store)
    if (!savedKv) await saveToFile(store)
  } catch {
    // In-memory store remains valid (required on Vercel read-only filesystem).
  }
}

export function getActiveBookings(store: BookingStore): StoredBooking[] {
  return store.bookings
}

export async function addPendingLead(data: LeadFormData): Promise<PendingLead> {
  const store = await readStore()
  const pending: PendingLead = {
    id: newId(),
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
    id: newId(),
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
