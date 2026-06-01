import Link from 'next/link'
import { BRAND_NAME } from '@/lib/constants'

export const metadata = {
  title: 'Terms of Service',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-24">
      <article className="prose prose-slate mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold text-union-navy">Terms of Service</h1>
        <p className="mt-4 text-slate-600">
          Use of this website constitutes acceptance of these terms. Estimates and timelines provided
          by {BRAND_NAME} are subject to on-site inspection and written agreement. All work is
          performed by licensed, bonded, and insured contractors in accordance with applicable
          Massachusetts regulations.
        </p>
        <p className="mt-4 text-slate-600">
          Content on this site is for general information only and does not constitute a binding
          contract until a signed proposal is executed by both parties.
        </p>
        <Link href="/" className="mt-8 inline-block font-semibold text-union-gold hover:underline">
          ← Back to home
        </Link>
      </article>
    </div>
  )
}
