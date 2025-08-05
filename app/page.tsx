import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { PropertySearch } from "@/components/property-search"
import { FeaturedProperties } from "@/components/featured-properties"
import { LatestProperties } from "@/components/latest-properties"
import { AboutRieger } from "@/components/about-rieger"
import { RiegerServices } from "@/components/rieger-services"
import { CallToAction } from "@/components/call-to-action"
import { Footer } from "@/components/footer"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      <PropertySearch />
      <FeaturedProperties />
      <LatestProperties />
      <AboutRieger />
      <RiegerServices />
      {/* <RiegerTeam /> Removido conforme solicitação */}
      <CallToAction />
      <Footer />
    </div>
  )
}
