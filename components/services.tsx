import { Home, Key, Building, TrendingUp } from "lucide-react"

const services = [
  {
    icon: Home,
    title: "Venda sua casa",
    description: "Nossa equipe especializada ajuda você a vender sua propriedade pelo melhor preço do mercado.",
  },
  {
    icon: Key,
    title: "Alugue sua casa",
    description: "Encontre inquilinos qualificados e gerencie seu imóvel com nossa plataforma completa.",
  },
  {
    icon: Building,
    title: "Compre uma casa",
    description: "Descubra a casa dos seus sonhos com nossa ampla seleção de propriedades premium.",
  },
  {
    icon: TrendingUp,
    title: "Marketing gratuito",
    description: "Promovemos sua propriedade em múltiplas plataformas sem custo adicional.",
  },
]

export function Services() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Propriedades por Área</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Oferecemos serviços completos para todas as suas necessidades imobiliárias.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => (
            <div key={index} className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <service.icon className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">{service.title}</h3>
              <p className="text-gray-600">{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
