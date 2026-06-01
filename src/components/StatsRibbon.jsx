'use client'

import { STATS_RIBBON } from '@/lib/constants'
import { FadeIn } from '@/components/FadeIn'

export function StatsRibbon() {
  return (
    <section
      id="stats"
      className="relative overflow-hidden border-y border-slate-200/60 bg-gradient-to-r from-white via-amber-50/30 to-white py-10 my-12"
    >
      <div className="mx-auto max-w-7xl px-4">
        <FadeIn>
          <div className="grid grid-cols-2 gap-4 text-center sm:gap-6 md:grid-cols-4">
          {STATS_RIBBON.map((stat, i) => (
            <FadeIn key={stat.value} delay={i * 0.06} y={16}>
            <div
              className="rounded-xl border border-slate-200/60 bg-white/90 px-4 py-6 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-amber-400/50 hover:shadow-card-lg"
            >
              <p className="text-2xl font-extrabold text-union-navy sm:text-3xl">{stat.value}</p>
              <p className="mt-2 text-xs font-medium leading-snug text-slate-600 sm:text-sm">
                {stat.label}
              </p>
            </div>
            </FadeIn>
          ))}
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
