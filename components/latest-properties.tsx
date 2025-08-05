"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Bed, Bath, Car, PhoneIcon as Whatsapp } from "lucide-react"
import { supabase } from "@/lib/supabase"
import type { Property } from "@/lib/supabase"

export function LatestProperties() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchLatestProperties = async () => {
      try {
        let query = supabase
          .from("properties")
          .select("*, owners(phone)") // Incluir o telefone do proprietário
          .eq("status", "Disponível")
          .order("created_at", { ascending: false })
          .limit(6) // Limit to 6 latest properties

        // Try to add is_active filter if column exists
        try {
          const { data: testData, error: testError } = await supabase.from("properties").select("is_active").limit(1)
          if (!testError) {
            query = query.eq("is_active", true)
          }
        } catch (e) {
          console.log("Coluna is_active não existe ainda, mostrando todos os imóveis disponíveis")
        }

        const { data, error } = await query

        if (error) {
          throw error
        }

        setProperties(data || [])
      } catch (err: any) {
        console.error("Erro ao buscar últimos imóveis:", err.message)
        setError("Falha ao carregar os últimos imóveis. Tente novamente.")
      } finally {
        setLoading(false)
      }
    }

    fetchLatestProperties()
  }, [])

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

  const formatPrice = (property: Property) => {
    const price = property.price || 0
    const dailyRate = property.daily_rate || 0
    const purpose = property.purpose

    if (purpose === "Temporada") {
      return (
        new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(dailyRate) + "/dia"
      )
    } else if (purpose === "Locação") {
      return (
        new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(price) + "/mês"
      )
    } else {
      return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(price)
    }
  }

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Últimos Imóveis</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Confira os imóveis mais recentes em nossa carteira</p>
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

  if (error) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Últimos Imóveis</h2>
            <p className="text-red-500 max-w-2xl mx-auto">{error}</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Últimos Imóveis</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">Confira os imóveis mais recentes em nossa carteira</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => {
            const mainImage = getMainImage(property)
            const whatsappMessage = encodeURIComponent(
              `Olá, tenho interesse no imóvel: ${property.title} - ${property.address}. Código: ${property.id.slice(0, 8)}.`,
            )
            const whatsappLink = `https://wa.me/554732482841?text=${whatsappMessage}`

            return (
              <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow">
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
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400">Sem imagem</span>
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
                    <div className="absolute top-2 left-2">
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
                    <div className="text-2xl font-bold text-green-600">{formatPrice(property)}</div>
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
                    <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
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

        {properties.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">Nenhum imóvel disponível no momento.</p>
          </div>
        )}

        <div className="text-center mt-8">
          <Link href="/imoveis">
            <Button variant="outline" size="lg">
              Ver Todos os Imóveis
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
