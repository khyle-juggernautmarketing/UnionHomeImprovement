'use client'

import { GEO_CITIES } from '@/lib/constants'
import { FadeIn } from '@/components/FadeIn'

export function GeoTargeting() {
  return (
    <section
      id="locations"
      className="overflow-hidden border-t border-slate-100 bg-gradient-to-b from-white to-slate-50 px-4 py-16 text-center sm:py-20"
    >
      <div className="mx-auto max-w-4xl">
        <FadeIn>
        <h2 className="text-3xl font-extrabold tracking-tight text-union-navy sm:text-4xl">
          Serving Burlington &amp; Eastern Massachusetts
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-slate-600">
          Rapid regional dispatch across a comprehensive 70-mile radius surrounding Burlington —
          from Lexington and Woburn to Boston, Cambridge, Lowell, and the North Shore.
        </p>

        </FadeIn>
        <div className="mx-auto mt-8 flex max-w-4xl flex-wrap justify-center gap-2">
          {GEO_CITIES.map((city, i) => (
            <FadeIn key={city.name} delay={0.02 * i} y={8} className="inline-flex">
            <span
              className={`inline-flex cursor-default items-center rounded-full border py-2 px-4 text-sm font-medium transition-all duration-200 ${
                city.featured
                  ? 'scale-105 border-amber-500 bg-amber-50 font-bold text-slate-900 ring-2 ring-amber-400/50'
                  : 'border-slate-200/60 bg-slate-100 text-slate-800 hover:scale-105 hover:border-amber-400 hover:bg-amber-50'
              }`}
            >
              {city.name}
            </span>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}
