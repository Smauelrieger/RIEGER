"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase"
import type { Property } from "@/lib/supabase"
import Image from "next/image"
import Link from "next/link"
import { MapPin, Bed, Bath, Car, Star, PhoneIcon as Whatsapp } from "lucide-react"

export function FeaturedProperties() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFeaturedProperties()
  }, [])

  const fetchFeaturedProperties = async () => {
    try {
      let query = supabase
        .from("properties")
        .select("*, owners(phone)") // Incluir o telefone do proprietário
        .eq("status", "Disponível")
        .order("created_at", { ascending: false })

      // Tentar adicionar filtro is_active se a coluna existir
      try {
        const { data: testData, error: testError } = await supabase.from("properties").select("is_active").limit(1)
        if (!testError) {
          query = query.eq("is_active", true)
        }
      } catch (e) {
        console.log("Coluna is_active não existe ainda")
      }

      // Tentar adicionar filtro is_featured se a coluna existir
      try {
        const { data: testData, error: testError } = await supabase.from("properties").select("is_featured").limit(1)
        if (!testError) {
          query = query.eq("is_featured", true)
        }
      } catch (e) {
        console.log("Coluna is_featured não existe ainda, mostrando imóveis mais recentes")
      }

      const { data, error } = await query.limit(6)

      if (error) {
        console.error("Erro ao buscar propriedades em destaque:", error)
        return
      }

      // Se não há imóveis marcados como destaque, pegar os mais recentes com imagens
      if (!data || data.length === 0) {
        const { data: fallbackData, error: fallbackError } = await supabase
          .from("properties")
          .select("*, owners(phone)") // Incluir o telefone do proprietário
          .eq("status", "Disponível")
          .not("image_urls", "is", null)
          .order("created_at", { ascending: false })
          .limit(6)

        if (!fallbackError && fallbackData) {
          setProperties(fallbackData as Property[])
        }
      } else {
        setProperties(data as Property[])
      }
    } catch (error) {
      console.error("Erro ao carregar propriedades em destaque:", error)
    } finally {
      setLoading(false)
    }
  }

  const getMainImage = (property: Property) => {
    if (!property.image_urls || property.image_urls.length === 0) return null
    const mainIndex = property.main_image_index || 0
    return property.image_urls[mainIndex] || property.image_urls[0]
  }

  const getPurposeLabel = (purpose?: string) => {
    switch (purpose) {
      case "Locação":
        return "Aluguel"
      case "Temporada":
        return "Temporada"
      default:
        return "Venda"
    }
  }

  const formatPrice = (price: number, purpose?: string) => {
    const formatted = new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)

    if (purpose === "Locação") return `${formatted}/mês`
    if (purpose === "Temporada") return `${formatted}/dia`
    return formatted
  }

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Imóveis em Destaque</h2>
            <p className="text-gray-600">Carregando...</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <Card key={index} className="animate-pulse">
                <div className="h-48 bg-gray-300 rounded-t-lg"></div>
                <CardContent className="p-4">
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                  <div className="h-6 bg-gray-300 rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (properties.length === 0) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Imóveis em Destaque</h2>
            <p className="text-gray-600">Nenhum imóvel em destaque no momento.</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Star className="w-8 h-8 text-yellow-500 fill-current" />
            <h2 className="text-3xl font-bold">Imóveis em Destaque</h2>
            <Star className="w-8 h-8 text-yellow-500 fill-current" />
          </div>
          <p className="text-gray-600">Seleção especial dos melhores imóveis disponíveis</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => {
            const mainImage = getMainImage(property)
            const whatsappMessage = encodeURIComponent(
              `Olá, tenho interesse no imóvel: ${property.title} - ${property.address}. Código: ${property.id.slice(0, 8)}.`,
            )
            const whatsappLink = `https://wa.me/554732482841?text=${whatsappMessage}`

            return (
              <Card
                key={property.id}
                className="overflow-hidden hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-yellow-200"
              >
                <Link href={`/imovel/${property.id}`}>
                  <div className="relative h-48 cursor-pointer">
                    {mainImage ? (
                      <Image
                        src={mainImage || "/placeholder.svg"}
                        alt={property.title}
                        fill
                        className="object-cover hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.svg?height=400&width=600&text=Sem+Imagem"
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-yellow-100 to-yellow-200 flex items-center justify-center">
                        <Star className="w-16 h-16 text-yellow-500" />
                      </div>
                    )}
                    {/* Watermark Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <Image
                        src="/images/rieger-logo.png"
                        alt="Rieger Imóveis Logo"
                        width={100}
                        height={100}
                        className="opacity-20"
                      />
                    </div>
                    <div className="absolute top-2 left-2 flex gap-2">
                      <Badge variant="secondary" className="bg-yellow-500 text-white font-semibold">
                        <Star className="w-3 h-3 mr-1 fill-current" />
                        DESTAQUE
                      </Badge>
                      <Badge variant="secondary" className="bg-blue-600 text-white">
                        {getPurposeLabel(property.purpose)}
                      </Badge>
                    </div>
                    {property.image_urls && property.image_urls.length > 1 && (
                      <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                        +{property.image_urls.length - 1} fotos
                      </div>
                    )}
                  </div>
                </Link>
                <CardContent className="p-4">
                  <Link href={`/imovel/${property.id}`}>
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2 hover:text-blue-600 transition-colors cursor-pointer">
                      {property.title}
                    </h3>
                  </Link>
                  <div className="flex items-center text-gray-600 mb-2">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span className="text-sm line-clamp-1">{property.address}</span>
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-2xl font-bold text-green-600">
                      {formatPrice(property.price, property.purpose)}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                    {property.bedrooms > 0 && (
                      <div className="flex items-center">
                        <Bed className="w-4 h-4 mr-1" />
                        {property.bedrooms}
                      </div>
                    )}
                    {property.bathrooms > 0 && (
                      <div className="flex items-center">
                        <Bath className="w-4 h-4 mr-1" />
                        {property.bathrooms}
                      </div>
                    )}
                    {property.garage_spaces > 0 && (
                      <div className="flex items-center">
                        <Car className="w-4 h-4 mr-1" />
                        {property.garage_spaces}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      asChild
                      className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-semibold"
                    >
                      <Link href={`/imovel/${property.id}`}>Ver Detalhes</Link>
                    </Button>
                    <Button asChild className="w-full bg-green-500 hover:bg-green-600 text-white">
                      <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                        <Whatsapp className="w-4 h-4 mr-2" /> WhatsApp
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="text-center mt-8">
          <Link href="/imoveis">
            <Button
              variant="outline"
              size="lg"
              className="border-yellow-500 text-yellow-600 hover:bg-yellow-50 bg-transparent"
            >
              Ver Todos os Imóveis
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
