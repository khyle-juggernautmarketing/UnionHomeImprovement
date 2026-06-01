import Link from 'next/link'
import { CalendarCheck, Phone } from 'lucide-react'
import { Footer } from '@/components/Footer'
import { GradientOrbs } from '@/components/GradientOrbs'
import { Navbar } from '@/components/Navbar'
import { PHONE_PRIMARY, PHONE_PRIMARY_HREF } from '@/lib/constants'

type SearchParams = Promise<Record<string, string | string[] | undefined>>

function pickParam(value: string | string[] | undefined, fallback: string) {
  if (typeof value === 'string' && value.trim()) return value.trim()
  return fallback
}

export default async function ThankYouPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams
  const name = pickParam(params.name, 'there')
  const dateLabel = pickParam(params.date, '')
  const timeLabel = pickParam(params.time, '')
  const hasAppointment = Boolean(dateLabel && timeLabel)

  return (
    <>
      <Navbar />
      <main className="relative min-h-[70vh] overflow-hidden bg-gradient-to-b from-slate-50 via-white to-amber-50/40">
        <GradientOrbs />
        <div className="relative mx-auto max-w-2xl px-4 py-16 sm:py-24">
          <div className="rounded-2xl border border-slate-200/60 bg-white/95 p-8 shadow-2xl backdrop-blur-md sm:p-10">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
              <CalendarCheck className="h-9 w-9 text-union-gold" aria-hidden />
            </div>
            <h1 className="mt-6 text-center text-2xl font-bold text-union-navy sm:text-3xl">
              Thank You, {name}!
            </h1>
            <p className="mt-3 text-center text-slate-600">
              {hasAppointment
                ? 'Your free in-home assessment is scheduled. Our team will see you at the time below (Eastern Time).'
                : 'We received your request. A member of our team will contact you shortly.'}
            </p>

            {hasAppointment && (
              <div className="mt-8 rounded-xl border-2 border-amber-200 bg-amber-50/80 p-5 text-center">
                <p className="text-xs font-bold uppercase tracking-wider text-union-navy/70">
                  Scheduled appointment
                </p>
                <p className="mt-2 text-lg font-bold text-union-navy">{dateLabel}</p>
                <p className="mt-1 text-base font-semibold text-slate-700">{timeLabel} EST</p>
              </div>
            )}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <a
                href={PHONE_PRIMARY_HREF}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-union-navy px-6 text-sm font-bold text-white transition-colors hover:bg-union-navy/90"
              >
                <Phone className="h-4 w-4" aria-hidden />
                Call {PHONE_PRIMARY}
              </a>
              <Link
                href="/"
                className="inline-flex min-h-12 items-center justify-center rounded-xl border-2 border-slate-200 px-6 text-sm font-bold text-slate-900 transition-colors hover:border-amber-500 hover:bg-amber-50"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
