'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Menu, Phone, X } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import {
  ANNOUNCEMENT,
  BRAND_NAME,
  NAV_LINKS,
  PHONE_PRIMARY,
  PHONE_PRIMARY_HREF,
} from '@/lib/constants'

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <header className="fixed inset-x-0 top-0 z-50 overflow-hidden">
      <div className="bg-slate-950 py-2 text-center text-xs font-semibold tracking-wide text-white md:text-sm">
        <p className="mx-auto max-w-7xl px-4">
          {ANNOUNCEMENT}
          <a href={PHONE_PRIMARY_HREF} className="font-bold text-union-gold hover:underline">
            {PHONE_PRIMARY}
          </a>
        </p>
      </div>

      <div
        className={`border-b transition-all duration-300 ease-in-out ${
          scrolled
            ? 'border-slate-200/80 bg-white shadow-md'
            : 'border-slate-200/60 bg-white shadow-sm'
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:gap-4 lg:py-4">
          <Link
            href="#"
            className="group flex shrink-0 items-center py-0.5 transition-opacity duration-200 hover:opacity-90"
            aria-label={`${BRAND_NAME} home`}
          >
            <Image
              src="/logo.png"
              alt={BRAND_NAME}
              width={220}
              height={220}
              className="h-[4rem] w-auto max-h-[4.5rem] object-contain object-left drop-shadow-[0_2px_10px_rgba(10,29,55,0.15)] transition-transform duration-200 group-hover:scale-[1.02] sm:h-[4.5rem] sm:max-h-[5rem]"
              priority
            />
          </Link>

          <nav className="hidden items-center gap-8 lg:flex" aria-label="Main navigation">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="relative text-xs font-bold uppercase tracking-widest text-slate-600 transition-colors duration-300 after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-union-gold after:transition-all hover:text-union-navy hover:after:w-full"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center lg:flex">
            <a
              href={PHONE_PRIMARY_HREF}
              className="animate-pulse-ring inline-flex min-h-12 min-w-12 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-amber-500 to-union-gold px-5 text-sm font-bold text-union-navy transition-all duration-300 hover:from-amber-600 hover:to-amber-500"
              aria-label={`Call now ${PHONE_PRIMARY}`}
            >
              <Phone className="h-4 w-4" aria-hidden />
              {PHONE_PRIMARY}
            </a>
          </div>

          <button
            type="button"
            className="inline-flex min-h-12 min-w-12 items-center justify-center rounded-lg bg-slate-100 text-slate-900 ring-1 ring-slate-200/80 lg:hidden"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            aria-expanded={open}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-union-navy/90 backdrop-blur-sm lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.nav
              className="fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col overflow-hidden bg-union-navy p-6 text-white shadow-2xl lg:hidden"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              aria-label="Mobile navigation"
            >
              <div className="-mx-6 -mt-6 mb-6 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
                <Image
                  src="/logo.png"
                  alt={BRAND_NAME}
                  width={220}
                  height={220}
                  className="h-14 w-auto object-contain object-left"
                />
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="min-h-12 min-w-12 rounded-lg text-slate-600 hover:bg-slate-100"
                  aria-label="Close menu"
                >
                  <X className="mx-auto h-6 w-6" />
                </button>
              </div>
              <div className="flex flex-col gap-1">
                {NAV_LINKS.map((link, i) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="nav-mobile-link block min-h-12 rounded-lg px-4 py-3 text-lg font-semibold text-slate-300 hover:bg-white/5 hover:text-white"
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    {link.label}
                  </a>
                ))}
              </div>
              <div className="mt-auto border-t border-white/10 pt-8">
                <a
                  href={PHONE_PRIMARY_HREF}
                  className="flex min-h-12 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-amber-500 to-union-gold font-bold text-union-navy"
                >
                  <Phone className="h-5 w-5" /> {PHONE_PRIMARY}
                </a>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </header>
  )
}
