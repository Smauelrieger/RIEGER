import { Header } from "@/components/header"
import { PropertySearch } from "@/components/property-search"
import { AllProperties } from "@/components/all-properties" // Import the new component
import { Footer } from "@/components/footer"

export default function ImoveisPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-32">
        <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
                Nossos{" "}
                <span className="bg-gradient-to-r from-gold-500 to-gold-600 bg-clip-text text-transparent">
                  Imóveis
                </span>
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Encontre o imóvel perfeito para você. Temos uma ampla seleção de casas, apartamentos e coberturas nas
                melhores localizações.
              </p>
            </div>
          </div>
        </section>
        <PropertySearch />
        <AllProperties /> {/* Use the new AllProperties component */}
      </main>
      <Footer />
    </div>
  )
}
