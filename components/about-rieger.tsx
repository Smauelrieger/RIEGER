import Image from "next/image"

export function AboutRieger() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800">Nossa História e Missão</h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            A Rieger Imóveis nasceu da paixão por conectar pessoas aos seus lares e investimentos ideais. Com anos de
            experiência no mercado imobiliário, construímos uma reputação sólida baseada na confiança, transparência e
            excelência no atendimento. Nossa missão é ir além da simples transação, buscando entender as necessidades e
            sonhos de cada cliente para oferecer soluções personalizadas e duradouras.
          </p>
          <p className="text-lg text-gray-700 leading-relaxed">
            Acreditamos que um imóvel é mais do que um espaço físico; é um lugar onde histórias são construídas e
            futuros são planejados. Por isso, nossa equipe está sempre atualizada com as tendências do mercado e as
            melhores práticas, garantindo que você tenha acesso às melhores oportunidades e ao suporte necessário em
            todas as etapas do processo.
          </p>
        </div>
        <div className="relative w-full h-96 rounded-lg overflow-hidden shadow-lg">
          <Image
            src="/images/rieger-office-front.png"
            alt="Fachada da Rieger Imóveis"
            layout="fill"
            objectFit="cover"
            className="transition-transform duration-300 hover:scale-105"
          />
        </div>
      </div>
    </section>
  )
}
