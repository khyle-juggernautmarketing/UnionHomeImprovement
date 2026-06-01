'use client'

import { ArrowRight, Hammer, Home, Paintbrush } from 'lucide-react'
import { SERVICE_ROWS } from '@/lib/constants'
import { FadeIn } from '@/components/FadeIn'

const ICONS = { Home, Paintbrush, Hammer }

function ServiceVisual({ icon, title }) {
  const Icon = ICONS[icon] ?? Home
  return (
    <div className="group/img relative overflow-hidden rounded-2xl border border-slate-200/80 shadow-card transition-all duration-300 ease-in-out hover:-translate-y-1.5 hover:shadow-elevated">
      <div className="relative flex aspect-[4/3] items-center justify-center bg-gradient-to-br from-union-navy via-slate-800 to-union-navy sm:aspect-[16/10]">
        <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-10" aria-hidden />
        <div className="absolute inset-0 bg-gradient-to-t from-union-navy/90 via-transparent to-union-gold/10" aria-hidden />
        <Icon className="relative h-24 w-24 text-union-gold/90 transition-transform duration-500 group-hover/img:scale-110 motion-reduce:group-hover/img:scale-100 sm:h-32 sm:w-32" aria-hidden />
      </div>
      <div className="absolute bottom-0 left-0 right-0 border-t border-union-gold/30 bg-union-navy/95 px-5 py-3 backdrop-blur-sm">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-300">{title}</p>
      </div>
    </div>
  )
}

export function Services() {
  return (
    <section id="services" className="relative overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-50 px-4 py-16 sm:py-24">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-union-gold/5 via-transparent to-union-navy/5" aria-hidden />
      <div className="relative mx-auto max-w-7xl">
        <FadeIn className="mx-auto max-w-3xl text-center">
          <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-slate-500">
            Elite Architectural &amp; Remodeling
          </span>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-union-navy sm:text-4xl lg:text-5xl">
            Elite Architectural &amp; Remodeling Solutions
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
            High-durability craftsmanship for roofing, painting, siding, and structural upgrades
            within 70 miles of Burlington, MA — built for New England seasons and long-term property
            value.
          </p>
          <div className="shimmer-line mx-auto mt-6 h-1 w-16 rounded-full bg-gradient-to-r from-amber-400 via-union-gold to-amber-600" aria-hidden />
        </FadeIn>

        <div className="mt-16 space-y-16 lg:space-y-24">
          {SERVICE_ROWS.map((row, index) => (
            <FadeIn key={row.title} delay={index * 0.08}>
            <article
              className={`group grid grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-12 ${
                row.reverse ? 'lg:[&>*:first-child]:order-2' : ''
              }`}
            >
              <div className="order-2 rounded-2xl border border-slate-200/60 bg-white p-6 shadow-card transition-all duration-300 ease-in-out hover:-translate-y-1.5 hover:border-amber-400/30 hover:shadow-elevated sm:p-8 lg:order-none">
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-union-gold">
                  Service {index + 1}
                </span>
                <h3 className="mt-2 text-2xl font-bold text-union-navy sm:text-3xl">{row.title}</h3>
                <p className="mt-4 leading-relaxed text-slate-600">{row.description}</p>
                <a
                  href="#contact"
                  className="group/btn mt-8 inline-flex min-h-12 items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-union-gold px-6 text-sm font-bold text-union-navy transition-all duration-300 hover:from-amber-600 hover:to-amber-500"
                >
                  {row.cta}
                  <ArrowRight
                    className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-2"
                    aria-hidden
                  />
                </a>
              </div>

              <div className="order-1 lg:order-none">
                <ServiceVisual icon={row.icon} title={row.title} />
              </div>
            </article>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}
