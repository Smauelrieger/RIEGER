"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Phone, Mail, MessageCircle, ArrowRight } from "lucide-react"

export function CallToAction() {
  return (
    <section
      id="contact-section"
      className="py-20 bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white relative overflow-hidden"
    >
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gold-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gray-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center animate-fade-in">
          <div className="inline-block px-4 py-2 bg-gold-500/20 backdrop-blur-sm text-gold-200 rounded-full text-sm font-medium mb-6 border border-gold-400/30">
            💬 Fale Conosco
          </div>

          <h2 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Pronto para Encontrar
            <br />
            <span className="bg-gradient-to-r from-gold-400 to-gold-600 bg-clip-text text-transparent">
              Seu Próximo Lar?
            </span>
          </h2>

          <p className="text-xl md:text-2xl mb-12 text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Nossa equipe de especialistas está pronta para ajudá-lo a encontrar o imóvel perfeito. Entre em contato e
            descubra as melhores oportunidades do mercado.
          </p>

          {/* Contact options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300 group">
              <Phone className="w-8 h-8 text-gold-400 mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-lg font-semibold mb-2">Ligue Agora</h3>
              <p className="text-gray-300 text-sm mb-3">Atendimento imediato</p>
              <p className="text-gold-400 font-bold">(47) 3248-2841</p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300 group">
              <MessageCircle className="w-8 h-8 text-green-400 mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-lg font-semibold mb-2">WhatsApp</h3>
              <p className="text-gray-300 text-sm mb-3">Resposta rápida</p>
              <p className="text-green-400 font-bold">(47) 3248-2841</p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300 group">
              <Mail className="w-8 h-8 text-gray-400 mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-lg font-semibold mb-2">E-mail</h3>
              <p className="text-gray-300 text-sm mb-3">Suporte completo</p>
              <p className="text-gray-400 font-bold">riegerimoveis@gmail.com</p>
            </div>
          </div>

          {/* Newsletter signup */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold mb-4">Receba Ofertas Exclusivas</h3>
            <p className="text-gray-300 mb-6">
              Cadastre-se e seja o primeiro a saber sobre novos imóveis e oportunidades especiais.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Input
                placeholder="Seu melhor e-mail"
                className="flex-1 h-12 bg-white/10 border-white/20 text-white placeholder:text-gray-400 rounded-xl focus:border-gold-500"
              />
              <Button className="bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white font-semibold px-8 h-12 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 group">
                Cadastrar
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
