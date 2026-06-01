'use client'

export function GradientOrbs({ className = '' }) {
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden>
      <div className="animate-orb-drift absolute -left-24 top-1/4 h-72 w-72 rounded-full bg-gradient-to-br from-union-gold/30 to-amber-400/10 blur-3xl sm:h-96 sm:w-96" />
      <div className="animate-orb-drift-reverse absolute -right-16 top-0 h-64 w-64 rounded-full bg-gradient-to-bl from-union-navy/25 to-sky-900/10 blur-3xl sm:h-80 sm:w-80" />
      <div className="animate-orb-pulse absolute bottom-0 left-1/3 h-56 w-56 rounded-full bg-gradient-to-t from-amber-500/20 to-transparent blur-3xl" />
    </div>
  )
}
