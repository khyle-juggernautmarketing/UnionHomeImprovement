'use client'

import Image from 'next/image'
import Link from 'next/link'
import {
  ADDRESS,
  BRAND_NAME,
  EMAIL,
  FOOTER_LINKS,
  FOOTER_MISSION,
  OPERATING_STANDARDS,
  PHONE_PRIMARY,
  PHONE_PRIMARY_HREF,
} from '@/lib/constants'

export function Footer() {
  return (
    <footer className="overflow-hidden border-t border-slate-800 bg-slate-950 px-4 py-16 text-slate-400">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 md:grid-cols-4">
        <div>
          <Image
            src="/logo.png"
            alt={BRAND_NAME}
            width={220}
            height={220}
            className="h-16 w-auto object-contain object-left brightness-110"
          />
          <p className="sr-only">{BRAND_NAME}</p>
          <p className="mt-3 text-sm leading-relaxed">{FOOTER_MISSION}</p>
        </div>

        <div>
          <h3 className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-white">Navigation</h3>
          <ul className="space-y-2.5 text-sm">
            {FOOTER_LINKS.map((link) => (
              <li key={link.href + link.label}>
                <a href={link.href} className="transition-colors duration-300 hover:text-white">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-white">
            Physical HQ
          </h3>
          <ul className="space-y-3 text-sm">
            <li>
              <p className="font-semibold text-white/80">Office Coverage</p>
              <p>{ADDRESS}</p>
            </li>
            <li>
              <p className="font-semibold text-white/80">Phone</p>
              <a href={PHONE_PRIMARY_HREF} className="font-bold text-white hover:text-union-gold">
                {PHONE_PRIMARY}
              </a>
            </li>
            <li>
              <p className="font-semibold text-white/80">Email</p>
              <a href={`mailto:${EMAIL}`} className="transition-colors hover:text-white">
                {EMAIL}
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-white">
            Operational Standards
          </h3>
          <p className="text-sm leading-relaxed">{OPERATING_STANDARDS}</p>
        </div>
      </div>

      <div className="mx-auto mt-14 max-w-7xl border-t border-slate-800 pt-8">
        <div className="flex flex-col items-center justify-between gap-4 text-xs sm:flex-row">
          <p>© 2026 Union Home Improvement. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="transition-colors hover:text-white">
              Privacy Policy
            </Link>
            <Link href="/terms" className="transition-colors hover:text-white">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
