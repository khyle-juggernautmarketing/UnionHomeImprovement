import Link from 'next/link'
import { BRAND_NAME } from '@/lib/constants'

export const metadata = {
  title: 'Privacy Policy',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-24">
      <article className="prose prose-slate mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold text-union-navy">Privacy Policy</h1>
        <p className="mt-4 text-slate-600">
          {BRAND_NAME} respects your privacy. Information submitted through our quote form is used
          solely to respond to your inquiry regarding home improvement services. We do not sell
          personal information to third parties.
        </p>
        <p className="mt-4 text-slate-600">
          By submitting the form, you consent to be contacted by phone or text regarding your
          project, consistent with CCPA and TCPA requirements. You may opt out of marketing
          communications at any time.
        </p>
        <Link href="/" className="mt-8 inline-block font-semibold text-union-gold hover:underline">
          ← Back to home
        </Link>
      </article>
    </div>
  )
}
