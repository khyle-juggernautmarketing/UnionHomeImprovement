'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { Check } from 'lucide-react'
import { OWNER_NAME, VALUE_PROPS, YEAR_EST } from '@/lib/constants'
import { LeadForm } from '@/components/LeadForm'
import { GradientOrbs } from '@/components/GradientOrbs'

export function Hero() {
  const prefersReducedMotion = useReducedMotion()

  return (
    <section
      id="contact"
      className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-amber-50/40 pt-28 sm:pt-32"
    >
      <GradientOrbs />
      <div className="pointer-events-none absolute inset-0 bg-grid-pattern bg-grid opacity-[0.35]" aria-hidden />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white/80 to-transparent"
        aria-hidden
      />

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-8 px-4 py-16 lg:grid-cols-12">
        <motion.div
          className="lg:col-span-7"
          initial={prefersReducedMotion ? false : { opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200/80 bg-gradient-to-r from-emerald-50 to-white px-4 py-1.5 text-xs font-semibold text-emerald-800 shadow-sm sm:text-sm">
            <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-emerald-500" aria-hidden />
            Local &amp; Owner-Operated — Supervised by {OWNER_NAME} in Burlington, MA
          </span>

          <h1 className="text-balance mt-6 text-3xl font-extrabold leading-tight tracking-tight text-union-navy sm:text-4xl lg:text-6xl">
            Complete{' '}
            <span className="text-gradient-gold">Home Improvement Solutions</span> Engineered to
            Elevate Your Value &amp; Protection
          </h1>

          <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
            The premier general remodeling and exterior contractors serving Eastern Massachusetts.
            Delivering dependable architectural roofing, elite painting, precision siding, and
            tailored local craftsmanship built to withstand extreme New England winters.
          </p>

          <ul className="mt-8 space-y-3.5">
            {VALUE_PROPS.map((prop, i) => (
              <motion.li
                key={prop}
                className="flex items-start gap-3"
                initial={prefersReducedMotion ? false : { opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + i * 0.08, duration: 0.45 }}
              >
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-100 to-amber-50 ring-1 ring-amber-400/50">
                  <Check className="h-4 w-4 text-union-gold" strokeWidth={3} aria-hidden />
                </span>
                <span className="text-sm font-medium text-slate-700 sm:text-base">{prop}</span>
              </motion.li>
            ))}
          </ul>

          <p className="mt-6 text-xs font-semibold uppercase tracking-widest text-slate-500">
            {YEAR_EST} · Greater Boston &amp; Eastern Massachusetts
          </p>
        </motion.div>

        <motion.div
          className="lg:col-span-5"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
        >
          <LeadForm />
        </motion.div>
      </div>
    </section>
  )
}
