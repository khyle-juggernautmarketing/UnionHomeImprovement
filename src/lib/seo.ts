import {
  ADDRESS,
  BRAND_NAME,
  EMAIL,
  GEO_CITIES,
  OWNER_NAME,
  PHONE_PRIMARY,
  SITE_URL,
  ZIP,
} from '@/lib/constants'

export const siteName = BRAND_NAME
export const siteUrl = SITE_URL

export const defaultDescription =
  'Union Home Improvement delivers premium roofing, painting, siding, and remodeling across Burlington, MA and Greater Boston. Owner-supervised by Adimilson Guimaraes. Free in-home assessments within a 70-mile radius. Fully licensed, bonded, and insured Massachusetts contractors.'

export const seoTitle =
  'Union Home Improvement | Roofing, Painting & Remodeling — Burlington, MA'

export const defaultKeywords = [
  'home improvement Burlington MA',
  'roofing contractor Greater Boston',
  'exterior painting Eastern Massachusetts',
  'siding installation Burlington',
  'home remodeling Massachusetts',
  'licensed contractor 01803',
  'Union Home Improvement',
  'Adimilson Guimaraes contractor',
]

export const localBusinessJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'HomeAndConstructionBusiness',
  name: siteName,
  url: siteUrl,
  logo: `${siteUrl}/logo.png`,
  image: `${siteUrl}/logo.png`,
  telephone: '+17815550177',
  email: EMAIL,
  description: defaultDescription,
  founder: {
    '@type': 'Person',
    name: OWNER_NAME,
  },
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Burlington',
    addressRegion: 'MA',
    postalCode: ZIP,
    addressCountry: 'US',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 42.5048,
    longitude: -71.1956,
  },
  areaServed: GEO_CITIES.map((c) => ({
    '@type': 'City',
    name: c.name.replace(', MA (01803)', '').replace(', MA', ''),
  })),
  priceRange: '$$',
  sameAs: [siteUrl],
}

export const webPageJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: `${siteName} — Home Improvement — Burlington, MA`,
  description: defaultDescription,
  url: siteUrl,
  inLanguage: 'en-US',
  isPartOf: { '@type': 'WebSite', name: siteName, url: siteUrl },
}

export { ADDRESS, BRAND_NAME }
