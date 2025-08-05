import { Home, Key, FileText, Users, Calculator, Shield } from "lucide-react"

const services = [
  {
    icon: Home,
    title: "Compra e Venda",
    description: "Assessoria completa para compra e venda de imóveis residenciais e comerciais.",
  },
  {
    icon: Key,
    title: "Locação",
    description: "Gestão completa de locação, desde a captação até a administração do contrato.",
  },
  {
    icon: FileText,
    title: "Documentação",
    description: "Suporte jurídico e documental para todas as etapas da transação imobiliária.",
  },
  {
    icon: Calculator,
    title: "Avaliação",
    description: "Avaliação precisa do valor de mercado do seu imóvel por especialistas.",
  },
  {
    icon: Users,
    title: "Consultoria",
    description: "Consultoria personalizada para investimentos e oportunidades imobiliárias.",
  },
  {
    icon: Shield,
    title: "Segurança Jurídica",
    description: "Garantia de segurança jurídica em todas as transações realizadas.",
  },
]

export function RiegerServices() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Nossos Serviços</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            A Rieger Imóveis oferece uma gama completa de serviços imobiliários para atender todas as suas necessidades.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <service.icon className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">{service.title}</h3>
              <p className="text-gray-600">{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
