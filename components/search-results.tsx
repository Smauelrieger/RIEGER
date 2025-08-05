"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { MapPin, Bed, Bath, Car, PhoneIcon as Whatsapp } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { Property } from "@/lib/supabase"

interface SearchResultsProps {
  properties: Property[]
  loading: boolean
  searchPerformed: boolean
}

export function SearchResults({ properties, loading, searchPerformed }: SearchResultsProps) {
  const formatPriceForDisplay = (property: Property) => {
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

  const getMainImage = (property: Property) => {
    if (!property.image_urls || property.image_urls.length === 0) return null
    const mainIndex = property.main_image_index || 0
    return property.image_urls[mainIndex] || property.image_urls[0]
  }

  const results = properties

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <Skeleton className="w-full h-48" />
            <CardContent className="p-4 space-y-2">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-1/2" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-20" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (searchPerformed && results.length === 0) {
    return (
      <div className="text-center py-12 mt-8 bg-white rounded-lg shadow-lg">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Nenhum imóvel encontrado.</h3>
        <p className="text-gray-600">Tente ajustar seus filtros de busca.</p>
      </div>
    )
  }

  if (!searchPerformed) {
    return (
      <div className="text-center py-12 mt-8 bg-white rounded-lg shadow-lg">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Comece sua busca!</h3>
        <p className="text-gray-600">Use os filtros acima para encontrar o imóvel ideal para você.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
      {results.map((property) => {
        const mainImage = getMainImage(property)
        const whatsappMessage = encodeURIComponent(
          `Olá, tenho interesse no imóvel: ${property.title} - ${property.address}. Código: ${property.id.slice(0, 8)}.`,
        )
        const whatsappLink = `https://wa.me/554732482841?text=${whatsappMessage}`

        return (
          <Card key={property.id} className="overflow-hidden hover:shadow-xl transition-shadow duration-300">
            <Link href={`/imovel/${property.id}`} className="block relative h-48">
              {mainImage ? (
                <Image
                  src={mainImage || "/placeholder.svg"}
                  alt={property.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
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
              {property.image_urls && property.image_urls.length > 1 && (
                <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                  +{property.image_urls.length - 1} fotos
                </div>
              )}
              <div className="absolute top-2 left-2 flex gap-2">
                <Badge variant="secondary">{property.purpose || "Venda"}</Badge>
                <Badge variant={property.status === "Disponível" ? "default" : "secondary"}>{property.status}</Badge>
              </div>
            </Link>
            <CardContent className="p-4">
              <h3 className="font-semibold text-lg mb-2 line-clamp-2">{property.title}</h3>
              <div className="flex items-center text-gray-600 mb-2">
                <MapPin className="w-4 h-4 mr-1" />
                <span className="text-sm line-clamp-1">
                  {property.address}, {property.city}
                </span>
              </div>
              <div className="text-2xl font-bold text-green-600 mb-3">{formatPriceForDisplay(property)}</div>
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
              {property.tags && property.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {property.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
              <div className="flex flex-col sm:flex-row gap-2">
                <Button asChild className="flex-1">
                  <Link href={`/imovel/${property.id}`}>Ver Detalhes</Link>
                </Button>
                <Button asChild className="flex-1 bg-green-500 hover:bg-green-600 text-white">
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
  )
}
