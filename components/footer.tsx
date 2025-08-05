import Link from "next/link"
import Image from "next/image"
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin, Clock } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-gradient-to-br from-gray-900 to-black text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Company info */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <Image src="/images/rieger-logo.png" alt="Rieger Imóveis" width={120} height={40} />
            </div>
            <p className="text-gray-300 mb-6 leading-relaxed max-w-md">
              A Rieger Imóveis é referência no mercado imobiliário há mais de 15 anos, oferecendo soluções completas em
              compra, venda e locação de imóveis com excelência e confiança.
            </p>
            <div className="flex space-x-4">
              <Link
                href="https://www.facebook.com/RiegerImoveis/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-gold-500 transition-all duration-300 group"
              >
                <Facebook className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </Link>
              <Link
                href="https://www.instagram.com/riegerimoveis/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-gold-500 transition-all duration-300 group"
              >
                <Instagram className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </Link>
              <Link
                href="https://twitter.com/riegerimoveis"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-gold-500 transition-all duration-300 group"
              >
                <Twitter className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </Link>
              <Link
                href="https://youtube.com/@riegerimoveis1225?si=dlw1DnAEo6Od9pSg" // Link do YouTube corrigido
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-gold-500 transition-all duration-300 group"
              >
                <Youtube className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-gold-400">Links Rápidos</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-gray-300 hover:text-gold-400 transition-colors duration-300">
                  Início
                </Link>
              </li>
              <li>
                <Link href="/imoveis" className="text-gray-300 hover:text-gold-400 transition-colors duration-300">
                  Imóveis
                </Link>
              </li>
              <li>
                <Link href="/sobre" className="text-gray-300 hover:text-gold-400 transition-colors duration-300">
                  Sobre Nós
                </Link>
              </li>
              <li>
                <Link href="/servicos" className="text-gray-300 hover:text-gold-400 transition-colors duration-300">
                  Serviços
                </Link>
              </li>
              <li>
                <Link href="/temporada" className="text-gray-300 hover:text-gold-400 transition-colors duration-300">
                  Temporada
                </Link>
              </li>
              <li>
                <Link
                  href="/#contact-section"
                  className="text-gray-300 hover:text-gold-400 transition-colors duration-300"
                >
                  Contato
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact info */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-gold-400">Contato</h4>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-gray-300">
                <MapPin className="w-5 h-5 text-gold-400 flex-shrink-0" />
                <div>
                  <p>Rua 252,267</p>
                  <p>Meia Praia - Itapema-SC</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 text-gray-300">
                <Phone className="w-5 h-5 text-gold-400 flex-shrink-0" />
                <div>
                  <p>(47) 3248-2841</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 text-gray-300">
                <Mail className="w-5 h-5 text-gold-400 flex-shrink-0" />
                <p>riegerimoveis@gmail.com</p>
              </div>
              <div className="flex items-center space-x-3 text-gray-300">
                <Clock className="w-5 h-5 text-gold-400 flex-shrink-0" />
                <div>
                  <p>Seg-Sex: 08:00-18:00</p>
                  <p>Sáb: 08:00-17:00</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">© 2024 Rieger Imóveis. Todos os direitos reservados.</p>
            <div className="flex items-center space-x-6 text-sm">
              <Link href="/privacidade" className="hover:text-gold-400 transition-colors">
                Política de Privacidade
              </Link>
              <Link href="/termos" className="hover:text-gold-400 transition-colors">
                Termos de Uso
              </Link>
              <Link href="/cookies" className="hover:text-gold-400 transition-colors">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
