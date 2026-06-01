import { Footer } from '@/components/Footer'
import { GeoTargeting } from '@/components/GeoTargeting'
import { Hero } from '@/components/Hero'
import { Navbar } from '@/components/Navbar'
import { Process } from '@/components/Process'
import { Services } from '@/components/Services'
import { StatsRibbon } from '@/components/StatsRibbon'

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="overflow-hidden">
        <Hero />
        <StatsRibbon />
        <Services />
        <Process />
        <GeoTargeting />
      </main>
      <Footer />
    </>
  )
}
