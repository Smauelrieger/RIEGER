"use client"

import { Mail, Phone, PhoneIcon as Whatsapp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function ContactInfo() {
  const whatsappMessage = encodeURIComponent("Olá, gostaria de mais informações sobre os imóveis da Rieger Imóveis.")
  const whatsappLink = `https://wa.me/554732482841?text=${whatsappMessage}`

  return (
    <section id="contact" className="bg-gray-900 text-white py-16 md:py-24">
      <div className="container mx-auto px-4 text-center">
        <div className="mb-12">
          <span className="inline-block bg-yellow-500 text-gray-900 text-xs font-semibold px-3 py-1 rounded-full mb-4">
            Fale Conosco
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Pronto para Encontrar Seu Próximo Lar?</h2>
          <p className="text-gray-300 max-w-3xl mx-auto">
            Nossa equipe de especialistas está pronta para ajudá-lo a encontrar o imóvel perfeito. Entre em contato e
            descubra as melhores oportunidades do mercado.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <Phone className="w-8 h-8 text-yellow-500 mb-4 mx-auto" />
            <h3 className="text-xl font-semibold mb-2">Ligue Agora</h3>
            <p className="text-gray-400 mb-2">Atendimento imediato</p>
            <a href="tel:+554732482841" className="text-yellow-400 hover:underline font-medium">
              (47) 3248-2841
            </a>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <Whatsapp className="w-8 h-8 text-green-500 mb-4 mx-auto" />
            <h3 className="text-xl font-semibold mb-2">WhatsApp</h3>
            <p className="text-gray-400 mb-2">Resposta rápida</p>
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-400 hover:underline font-medium"
            >
              (47) 3248-2841
            </a>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <Mail className="w-8 h-8 text-blue-500 mb-4 mx-auto" />
            <h3 className="text-xl font-semibold mb-2">E-mail</h3>
            <p className="text-gray-400 mb-2">Suporte completo</p>
            <a href="mailto:riegerimoveis@gmail.com" className="text-blue-400 hover:underline font-medium">
              riegerimoveis@gmail.com
            </a>
          </div>
        </div>

        <div className="bg-gray-800 p-8 rounded-lg shadow-lg max-w-2xl mx-auto">
          <h3 className="text-2xl font-bold mb-4">Receba Ofertas Exclusivas</h3>
          <p className="text-gray-300 mb-6">
            Cadastre-se e seja o primeiro a saber sobre novos imóveis e oportunidades especiais.
          </p>
          <form className="flex flex-col sm:flex-row gap-4">
            <Input
              type="email"
              placeholder="Seu melhor e-mail"
              className="flex-1 bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-yellow-500 focus:ring-yellow-500"
            />
            <Button type="submit" className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold">
              Cadastrar →
            </Button>
          </form>
        </div>
      </div>
    </section>
  )
}
