'use client'

import { OWNER_NAME, PROCESS_STEPS } from '@/lib/constants'
import { FadeIn } from '@/components/FadeIn'
import { GradientOrbs } from '@/components/GradientOrbs'

export function Process() {
  return (
    <section className="overflow-hidden px-4 py-12 sm:py-16">
      <div
        id="process"
        className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl bg-gradient-to-br from-union-navy via-slate-900 to-slate-950 p-8 text-white shadow-elevated lg:p-12"
      >
        <GradientOrbs className="opacity-40" />
        <div
          className="pointer-events-none absolute inset-0 bg-grid-pattern bg-grid opacity-[0.05]"
          aria-hidden
        />

        <FadeIn className="relative text-center">
          <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-union-gold">
            The Union Guarantee
          </span>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
            The Union Guarantee: Flawless Project Lifecycles
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-400 sm:text-base">
            Proactive communication, meticulous cleanup, and premium quality controls supervised by{' '}
            {OWNER_NAME} — from your first digital consultation through final walkthrough.
          </p>
        </FadeIn>

        <div className="relative mt-8 grid grid-cols-1 gap-6 md:grid-cols-4">
          {PROCESS_STEPS.map((item, i) => (
            <FadeIn key={item.step} delay={i * 0.08} y={20}>
            <div
              className="rounded-2xl border border-slate-700/80 bg-slate-950/60 p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-amber-500/50 hover:shadow-[0_8px_30px_rgba(230,161,30,0.12)]"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-union-gold bg-union-gold/10 text-lg font-black text-union-gold">
                {item.step}
              </div>
              <h3 className="mt-4 text-base font-bold">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{item.description}</p>
            </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}
