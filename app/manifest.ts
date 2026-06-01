import type { MetadataRoute } from 'next'
import { siteName, siteUrl } from '@/lib/seo'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${siteName} — Burlington, MA`,
    short_name: 'Union Home',
    description:
      'Roofing, painting, siding, and remodeling across Greater Boston. Owner-supervised craftsmanship.',
    start_url: '/',
    display: 'standalone',
    background_color: '#f8fafc',
    theme_color: '#0A1D37',
    icons: [
      { src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml' },
      { src: '/logo.png', sizes: '512x512', type: 'image/png' },
    ],
  }
}
