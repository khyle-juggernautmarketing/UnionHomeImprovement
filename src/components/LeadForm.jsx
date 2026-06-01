'use client'

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { PHONE_PRIMARY, PHONE_PRIMARY_HREF } from '@/lib/constants'
import { SERVICE_OPTIONS, TIMELINE_OPTIONS } from '@/lib/formOptions'

const STEPS = [
  { id: 1, title: 'What service do you need?' },
  { id: 2, title: 'How soon would you like to schedule production?' },
  { id: 3, title: 'Your contact details' },
]

const HTML_TAG = /<[^>]*>/g
const inputClass =
  'min-h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-base text-slate-900 placeholder:text-slate-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 sm:text-sm'

const initialForm = {
  service: '',
  timeline: '',
  name: '',
  email: '',
  phone: '',
  address: '',
  consent: false,
}

function sanitizeInput(value) {
  return value.replace(HTML_TAG, '').replace(/[\u0000-\u001F\u007F]/g, '')
}

function parseApiError(body, status) {
  if (body) {
    if (typeof body.error === 'string' && body.error.trim()) return body.error
    if (typeof body.message === 'string' && body.message.trim()) return body.message
  }
  if (status === 429) {
    return `Too many requests. Please wait a few minutes or call ${PHONE_PRIMARY}.`
  }
  if (status >= 500) {
    return `Our booking system is temporarily unavailable. Please call ${PHONE_PRIMARY}.`
  }
  return `Unable to submit right now. Please call ${PHONE_PRIMARY}.`
}

function useStepAdvanceDelay() {
  const [ms, setMs] = useState(180)
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) setMs(0)
    })
    return () => cancelAnimationFrame(id)
  }, [])
  return ms
}

function ProgressBar({ step }) {
  const pct = (step / STEPS.length) * 100
  return (
    <div className="mb-5 h-1.5 w-full overflow-hidden rounded-full bg-slate-200" aria-hidden>
      <div
        className="h-full rounded-full bg-union-gold transition-all duration-300 ease-in-out"
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

function OptionCard({ label, icon: Icon, selected, onSelect, index }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      style={{ animationDelay: `${index * 40}ms` }}
      className={`animate-form-option flex min-h-12 cursor-pointer flex-col rounded-xl border-2 p-4 text-left text-sm font-semibold text-slate-800 transition-all duration-200 ${
        selected
          ? 'border-amber-500 bg-amber-50 ring-2 ring-amber-500/25'
          : 'border-slate-200 bg-white hover:border-amber-500'
      }`}
    >
      {Icon && <Icon className="mb-2 h-6 w-6 text-union-gold" aria-hidden />}
      {label}
      {selected && <CheckCircle2 className="mt-2 h-4 w-4 text-union-gold" aria-hidden />}
    </button>
  )
}

function SuccessMarks() {
  return (
    <svg className="h-28 w-28 text-union-gold" viewBox="0 0 64 64" aria-hidden>
      <circle cx="32" cy="32" r="28" fill="rgba(230,161,30,0.15)" />
      <path
        className="animate-check-stroke"
        stroke="currentColor"
        strokeWidth="3.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M18 34l8 8 20-22"
      />
    </svg>
  )
}

export function LeadForm() {
  const prefersReducedMotion = useReducedMotion()
  const [step, setStep] = useState(1)
  const [data, setData] = useState(initialForm)
  const [status, setStatus] = useState('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [honeypot, setHoneypot] = useState('')
  const stepAdvanceDelayMs = useStepAdvanceDelay()

  const selectService = useCallback(
    (service) => {
      setData((d) => ({ ...d, service }))
      setErrorMsg('')
      setTimeout(() => setStep(2), stepAdvanceDelayMs)
    },
    [stepAdvanceDelayMs],
  )

  const selectTimeline = useCallback(
    (timeline) => {
      setData((d) => ({ ...d, timeline }))
      setErrorMsg('')
      setTimeout(() => setStep(3), stepAdvanceDelayMs)
    },
    [stepAdvanceDelayMs],
  )

  const submit = async (e) => {
    e.preventDefault()
    setErrorMsg('')

    if (honeypot) return

    if (!data.service) {
      setErrorMsg('Please select a service.')
      setStep(1)
      return
    }
    if (!data.timeline) {
      setErrorMsg('Please select a timeline.')
      setStep(2)
      return
    }

    const name = sanitizeInput(data.name.trim())
    const email = sanitizeInput(data.email.trim())
    const phone = sanitizeInput(data.phone.trim())
    const address = sanitizeInput(data.address.trim())

    if (!name || !email || !phone || !address) {
      setErrorMsg('Please fill in all fields.')
      return
    }
    if (name.length < 2) {
      setErrorMsg('Please enter your full name.')
      return
    }
    const phoneDigits = phone.replace(/\D/g, '')
    if (phoneDigits.length < 10) {
      setErrorMsg('Please enter a valid phone number.')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMsg('Please enter a valid email.')
      return
    }
    if (address.length < 8) {
      setErrorMsg('Please enter your full property address.')
      return
    }
    if (!data.consent) {
      setErrorMsg('Please authorize contact to submit your request.')
      return
    }

    const payload = {
      service: data.service,
      timeline: data.timeline,
      name,
      email,
      phone,
      address,
      consent: data.consent,
      tcpaConsent: data.consent,
      source: 'union-home-improvement-landing',
      submittedAt: new Date().toISOString(),
    }

    setStatus('loading')
    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
        cache: 'no-store',
        credentials: 'same-origin',
      })

      let body = null
      const raw = await res.text()
      if (raw) {
        try {
          body = JSON.parse(raw)
        } catch {
          body = null
        }
      }

      if (!res.ok) {
        setStatus('idle')
        setErrorMsg(parseApiError(body, res.status))
        return
      }

      setData(initialForm)
      setStep(1)
      setStatus('success')
    } catch {
      setStatus('idle')
      setErrorMsg(`Network error. Please try again or call ${PHONE_PRIMARY}.`)
    }
  }

  const motionDur = prefersReducedMotion ? 0 : 0.35

  if (status === 'success') {
    return (
      <div className="rounded-2xl border border-slate-200/60 bg-white/95 p-6 shadow-2xl backdrop-blur-md sm:p-8">
        <div className="animate-form-success flex min-h-[280px] flex-col items-center justify-center text-center">
          <SuccessMarks />
          <h3 className="mt-6 text-xl font-bold text-slate-900">Request Received!</h3>
          <p className="mt-2 max-w-sm text-slate-600">
            Our team will reach out shortly. For urgent needs, call{' '}
            <a
              href={PHONE_PRIMARY_HREF}
              className="font-semibold text-union-navy underline decoration-union-gold underline-offset-2"
            >
              {PHONE_PRIMARY}
            </a>
            .
          </p>
          <button
            type="button"
            onClick={() => setStatus('idle')}
            className="mt-8 min-h-12 rounded-xl border-2 border-slate-200 px-6 text-sm font-bold text-slate-900 transition-all duration-300 hover:border-amber-500 hover:bg-amber-50"
          >
            Submit another request
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-slate-200/60 bg-white/95 p-6 shadow-2xl backdrop-blur-md sm:p-8">
      <div className="mb-4 text-center">
        <h3 className="text-lg font-bold text-slate-900 sm:text-xl">Free In-Home Assessment</h3>
        <p className="mt-1 text-xs text-slate-500 sm:text-sm">Three quick steps — zero obligation.</p>
      </div>

      <ProgressBar step={step} />

      <div
        className="mb-4 flex items-center justify-center gap-2"
        aria-label={`Step ${step} of ${STEPS.length}`}
      >
        {STEPS.map((s) => (
          <span
            key={s.id}
            className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all duration-300 ${
              step >= s.id ? 'bg-union-gold text-union-navy' : 'border-2 border-slate-200 bg-white text-slate-400'
            }`}
          >
            {s.id}
          </span>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: prefersReducedMotion ? 0 : -8 }}
          transition={{ duration: motionDur, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="mb-4 text-sm font-semibold text-slate-800">{STEPS[step - 1].title}</p>

          {step === 1 && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {SERVICE_OPTIONS.map((opt, i) => (
                <OptionCard
                  key={opt.value}
                  label={opt.label}
                  icon={opt.icon}
                  selected={data.service === opt.value}
                  onSelect={() => selectService(opt.value)}
                  index={i}
                />
              ))}
            </div>
          )}

          {step === 2 && (
            <div className="grid grid-cols-1 gap-3">
              {TIMELINE_OPTIONS.map((opt, i) => (
                <OptionCard
                  key={opt.value}
                  label={opt.label}
                  icon={opt.icon}
                  selected={data.timeline === opt.value}
                  onSelect={() => selectTimeline(opt.value)}
                  index={i}
                />
              ))}
            </div>
          )}

          {step === 3 && (
            <form onSubmit={submit} className="space-y-3">
              <label className="sr-only" aria-hidden>
                Website
                <input
                  type="text"
                  name="website"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                  tabIndex={-1}
                  autoComplete="off"
                  className="hidden"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-slate-600">Full Name</span>
                <input
                  required
                  autoComplete="name"
                  value={data.name}
                  onChange={(e) => setData({ ...data, name: sanitizeInput(e.target.value) })}
                  className={inputClass}
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-slate-600">Email</span>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={data.email}
                  onChange={(e) => setData({ ...data, email: sanitizeInput(e.target.value) })}
                  className={inputClass}
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-slate-600">Phone Number</span>
                <input
                  type="tel"
                  required
                  autoComplete="tel"
                  value={data.phone}
                  onChange={(e) => setData({ ...data, phone: sanitizeInput(e.target.value) })}
                  className={inputClass}
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-slate-600">Property Address</span>
                <input
                  required
                  autoComplete="street-address"
                  placeholder="Street, city, state, ZIP"
                  value={data.address}
                  onChange={(e) => setData({ ...data, address: sanitizeInput(e.target.value) })}
                  className={inputClass}
                />
              </label>
              <label className="flex min-h-12 cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                <input
                  type="checkbox"
                  checked={data.consent}
                  onChange={(e) => setData({ ...data, consent: e.target.checked })}
                  className="mt-1 h-5 w-5 shrink-0 rounded border-slate-300 text-amber-500 focus:ring-amber-500"
                />
                <span className="text-[11px] leading-relaxed text-slate-600 sm:text-xs">
                  By clicking submit, you authorize Union Home Improvement to text or call regarding
                  this free quote under CCPA &amp; TCPA privacy compliance standards.
                </span>
              </label>
              {errorMsg && (
                <p className="text-sm text-red-600" role="alert">
                  {errorMsg}
                </p>
              )}
              <button
                type="submit"
                disabled={status === 'loading'}
                className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-union-gold text-sm font-bold uppercase tracking-wide text-union-navy shadow-md transition-all duration-300 ease-in-out hover:from-amber-600 hover:to-amber-500 disabled:opacity-70"
              >
                {status === 'loading' ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
                    Sending...
                  </>
                ) : (
                  'Submit Free Quote Request'
                )}
              </button>
            </form>
          )}
        </motion.div>
      </AnimatePresence>

      {errorMsg && step !== 3 && (
        <p className="mt-3 text-sm text-red-600" role="alert">
          {errorMsg}
        </p>
      )}

      {step > 1 && (
        <div className="mt-4 border-t border-slate-200/60 pt-4">
          <button
            type="button"
            onClick={() => {
              setErrorMsg('')
              setStep((s) => Math.max(1, s - 1))
            }}
            className="flex min-h-12 items-center text-sm font-semibold text-slate-500 transition-colors duration-300 hover:text-slate-900"
          >
            ← Back
          </button>
        </div>
      )}
    </div>
  )
}
