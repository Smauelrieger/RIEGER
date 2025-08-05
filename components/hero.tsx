"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Play } from "lucide-react"

export function Hero() {
  return (
    <section className="relative h-screen overflow-hidden">
      {/* Background with overlay */}
      <div className="absolute inset-0">
        <Image
          src="/images/hero-coastal-city.webp"
          alt="Vista aérea da cidade costeira com prédios modernos"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
      </div>

      {/* Floating elements */}
      <div className="absolute top-20 right-10 w-20 h-20 bg-gold-400/20 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute bottom-40 left-20 w-32 h-32 bg-gray-800/20 rounded-full blur-xl animate-pulse delay-1000"></div>

      <div className="absolute inset-0 flex items-center">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl animate-fade-in">
            <div className="mb-6">
              <span className="inline-block px-4 py-2 bg-gold-500/20 backdrop-blur-sm text-gold-200 rounded-full text-sm font-medium border border-gold-400/30">
                ✨ Mais de 15 anos de experiência
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 text-white leading-tight">
              Encontre Seu
              <br />
              <span className="bg-gradient-to-r from-gold-400 to-gold-600 bg-clip-text text-transparent">
                Lar Perfeito
              </span>
            </h1>

            <p className="text-xl md:text-2xl mb-8 text-gray-200 max-w-2xl leading-relaxed">
              Na Rieger Imóveis, transformamos sonhos em realidade. Descubra as melhores propriedades com nossa equipe
              especializada.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Link href="/imoveis" passHref>
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white font-semibold px-8 py-4 rounded-full shadow-2xl hover:shadow-gold-500/25 transition-all duration-300 transform hover:scale-105 group"
                  asChild
                >
                  <span>
                    Explorar Imóveis
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Button>
              </Link>

              <Link
                href="https://youtube.com/@riegerimoveis1225?si=dlw1DnAEo6Od9pSg"
                target="_blank"
                rel="noopener noreferrer"
                passHref
              >
                <Button
                  variant="outline"
                  size="lg"
                  className="border-2 border-white/30 text-white hover:bg-gray-900/10 backdrop-blur-sm px-8 py-4 rounded-full font-semibold transition-all duration-300 group bg-transparent"
                  asChild
                >
                  <span>
                    <Play className="mr-2 w-5 h-5 group-hover:scale-110 transition-transform" />
                    Ver Vídeo
                  </span>
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-lg">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white mb-1">500+</div>
                <div className="text-sm text-gray-300">Imóveis Vendidos</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white mb-1">1000+</div>
                <div className="text-sm text-gray-300">Clientes Felizes</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white mb-1">15+</div>
                <div className="text-sm text-gray-300">Anos de Experiência</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/70 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  )
}
