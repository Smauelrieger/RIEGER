import { Header } from "@/components/header"
import { RiegerServices } from "@/components/rieger-services"
import { Footer } from "@/components/footer"

export default function ServicosPage() {
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
                  Serviços
                </span>
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Oferecemos uma gama completa de serviços imobiliários para atender todas as suas necessidades com
                excelência e profissionalismo.
              </p>
            </div>
          </div>
        </section>
        <RiegerServices />

        {/* Seção adicional de diferenciais */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Por que escolher a Rieger Imóveis?</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-gold-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🏆</span>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">Experiência Comprovada</h3>
                <p className="text-gray-600">
                  Mais de 15 anos no mercado imobiliário com centenas de negócios realizados com sucesso.
                </p>
              </div>

              <div className="text-center p-6">
                <div className="w-16 h-16 bg-gold-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🤝</span>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">Atendimento Personalizado</h3>
                <p className="text-gray-600">
                  Cada cliente é único. Oferecemos soluções personalizadas para suas necessidades específicas.
                </p>
              </div>

              <div className="text-center p-6">
                <div className="w-16 h-16 bg-gold-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🔒</span>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">Segurança Jurídica</h3>
                <p className="text-gray-600">
                  Todos os nossos processos seguem rigorosamente a legislação, garantindo total segurança.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
