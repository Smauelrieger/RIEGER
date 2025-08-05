import { Header } from "@/components/header"
import { AboutRieger } from "@/components/about-rieger"
import { Footer } from "@/components/footer"

export default function SobrePage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-32">
        <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
                Sobre a{" "}
                <span className="bg-gradient-to-r from-gold-500 to-gold-600 bg-clip-text text-transparent">
                  Rieger Imóveis
                </span>
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Conheça nossa história, nossa missão e a equipe que trabalha todos os dias para realizar seus sonhos
                imobiliários.
              </p>
            </div>
          </div>
        </section>
        <AboutRieger />
      </main>
      <Footer />
    </div>
  )
}
