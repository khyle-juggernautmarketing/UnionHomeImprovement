import type { Metadata, Viewport } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import {
  defaultDescription,
  defaultKeywords,
  localBusinessJsonLd,
  seoTitle,
  siteName,
  siteUrl,
  webPageJsonLd,
} from '@/lib/seo'
import './globals.css'

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#0A1D37',
}

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: seoTitle,
    template: `%s | ${siteName}`,
  },
  description: defaultDescription,
  keywords: defaultKeywords,
  authors: [{ name: siteName, url: siteUrl }],
  creator: siteName,
  publisher: siteName,
  formatDetection: { telephone: true, email: true, address: true },
  alternates: { canonical: siteUrl },
  icons: {
    icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
    apple: '/logo.png',
  },
  manifest: '/manifest.webmanifest',
  openGraph: {
    title: 'Union Home Improvement | Roofing, Painting & Remodeling — Burlington, MA',
    description: defaultDescription,
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName,
    images: [{ url: '/logo.png', width: 1200, height: 630, alt: 'Union Home Improvement logo' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Union Home Improvement | Burlington, MA',
    description: defaultDescription,
    images: ['/logo.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={jakarta.variable}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
        />
      </head>
      <body className="relative min-h-screen overflow-x-hidden bg-slate-50 font-sans text-slate-900 antialiased">
        {children}
      </body>
    </html>
  )
}
