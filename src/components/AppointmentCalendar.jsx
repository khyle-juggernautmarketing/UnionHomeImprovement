'use client'

import { CalendarDays, Clock, Loader2 } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { PHONE_PRIMARY } from '@/lib/constants'

const inputClass =
  'min-h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800 transition-all duration-200 hover:border-amber-500 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20'

export function AppointmentCalendar({ pendingId, onBooked, onError }) {
  const [dates, setDates] = useState([])
  const [slots, setSlots] = useState([])
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedSlotId, setSelectedSlotId] = useState('')
  const [loadingDates, setLoadingDates] = useState(true)
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [timezone, setTimezone] = useState('America/New_York')

  const loadAvailability = useCallback(async (dateKey) => {
    const qs = dateKey ? `?date=${encodeURIComponent(dateKey)}` : ''
    const res = await fetch(`/api/bookings/availability${qs}`, {
      cache: 'no-store',
      credentials: 'same-origin',
    })
    const body = await res.json().catch(() => null)
    if (!res.ok) {
      throw new Error(body?.error ?? 'Could not load availability')
    }
    return body
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoadingDates(true)
      try {
        const data = await loadAvailability()
        if (cancelled) return
        setTimezone(data.timezone ?? 'America/New_York')
        setDates(data.dates ?? [])
        if (data.dates?.length && !selectedDate) {
          setSelectedDate(data.dates[0].dateKey)
        }
      } catch (e) {
        if (!cancelled) onError(e instanceof Error ? e.message : 'Could not load calendar')
      } finally {
        if (!cancelled) setLoadingDates(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [loadAvailability, onError])

  useEffect(() => {
    if (!selectedDate) return
    let cancelled = false
    ;(async () => {
      setLoadingSlots(true)
      setSelectedSlotId('')
      try {
        const data = await loadAvailability(selectedDate)
        if (cancelled) return
        setSlots(data.slots ?? [])
      } catch (e) {
        if (!cancelled) onError(e instanceof Error ? e.message : 'Could not load times')
      } finally {
        if (!cancelled) setLoadingSlots(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [selectedDate, loadAvailability, onError])

  const confirmBooking = async () => {
    if (!selectedSlotId) {
      onError('Please select a time for your appointment.')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/lead/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ pendingId, slotId: selectedSlotId }),
        cache: 'no-store',
        credentials: 'same-origin',
      })
      const body = await res.json().catch(() => null)
      if (!res.ok) {
        onError(body?.error ?? `Unable to book. Please call ${PHONE_PRIMARY}.`)
        return
      }
      onBooked(body.appointment)
    } catch {
      onError(`Network error. Please call ${PHONE_PRIMARY}.`)
    } finally {
      setSubmitting(false)
    }
  }

  if (loadingDates) {
    return (
      <div className="flex min-h-[200px] items-center justify-center gap-2 text-slate-600">
        <Loader2 className="h-5 w-5 animate-spin text-union-gold" aria-hidden />
        Loading available times…
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <p className="text-xs text-slate-500">
        All times are Eastern (EST/EDT). Appointments are available Monday–Saturday, 8:00 AM–7:00 PM,
        within the next 3 days. Each booking reserves a 90-minute window.
      </p>

      <div>
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-800">
          <CalendarDays className="h-4 w-4 text-union-gold" aria-hidden />
          Select a date
        </div>
        <div className="flex flex-wrap gap-2">
          {dates.map((d) => (
            <button
              key={d.dateKey}
              type="button"
              onClick={() => setSelectedDate(d.dateKey)}
              className={`${inputClass} ${selectedDate === d.dateKey ? 'border-amber-500 bg-amber-50 ring-2 ring-amber-500/25' : ''}`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {selectedDate && (
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-800">
            <Clock className="h-4 w-4 text-union-gold" aria-hidden />
            Select a time ({timezone.replace('_', ' ')})
          </div>
          {loadingSlots ? (
            <div className="flex items-center gap-2 py-6 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Loading times…
            </div>
          ) : slots.length === 0 ? (
            <p className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              No times left on this date. Please choose another day.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {slots.map((slot) => (
                <button
                  key={slot.slotId}
                  type="button"
                  onClick={() => setSelectedSlotId(slot.slotId)}
                  className={`${inputClass} text-center ${selectedSlotId === slot.slotId ? 'border-amber-500 bg-amber-50 ring-2 ring-amber-500/25' : ''}`}
                >
                  {slot.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <button
        type="button"
        disabled={submitting || !selectedSlotId}
        onClick={confirmBooking}
        className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-union-gold text-sm font-bold uppercase tracking-wide text-union-navy shadow-md transition-all duration-300 hover:from-amber-600 hover:to-amber-500 disabled:opacity-60"
      >
        {submitting ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
            Confirming…
          </>
        ) : (
          'Confirm Appointment'
        )}
      </button>
    </div>
  )
}
