import { Header } from "@/components/header"
import { LatestProperties } from "@/components/latest-properties"
import { Footer } from "@/components/footer"

export default function TemporadaPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-32">
        <section className="py-16 bg-gradient-to-br from-blue-50 to-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <div className="inline-block px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-4">
                🏖️ Temporada 2024
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
                Aluguel de{" "}
                <span className="bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent">
                  Temporada
                </span>
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Desfrute das suas férias em imóveis exclusivos e confortáveis. Temos as melhores opções para sua estadia
                perfeita na praia.
              </p>
            </div>
          </div>
        </section>

        <LatestProperties />

        {/* Seção de informações sobre temporada */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-800 mb-6">Aluguel de Temporada</h2>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-blue-600 text-sm">✓</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">Imóveis Mobiliados</h3>
                      <p className="text-gray-600">
                        Todos os imóveis são completamente mobiliados e equipados para sua comodidade.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-blue-600 text-sm">✓</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">Localização Privilegiada</h3>
                      <p className="text-gray-600">Próximos às melhores praias e pontos turísticos da região.</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-blue-600 text-sm">✓</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">Suporte 24h</h3>
                      <p className="text-gray-600">
                        Atendimento completo durante toda sua estadia para garantir o melhor conforto.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-blue-600 text-sm">✓</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">Flexibilidade</h3>
                      <p className="text-gray-600">
                        Períodos flexíveis de locação, desde fins de semana até temporadas completas.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative h-96">
                <img
                  src="/images/Verao-Itapema.jpg"
                  alt="Praia de Itapema com muitos guarda-sóis e edifícios"
                  className="w-full h-full object-cover rounded-lg shadow-lg"
                />
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
