"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  MapPin,
  Bed,
  Bath,
  Car,
  Home,
  Heart,
  Share2,
  Phone,
  Mail,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Users,
  Clock,
  Wifi,
  Waves,
  PawPrint,
  Shield,
  CreditCard,
  PhoneIcon as Whatsapp,
} from "lucide-react"
import type { Property } from "@/lib/supabase"
import Image from "next/image"
import Link from "next/link"

interface PropertyDetailsProps {
  property: Property
}

export function PropertyDetails({ property }: PropertyDetailsProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isFavorited, setIsFavorited] = useState(false)
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false)
  const [fullscreenImageIndex, setFullscreenImageIndex] = useState(0)

  const images = property.image_urls || []
  const hasImages = images.length > 0

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price)
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: property.title,
          text: property.description || "",
          url: window.location.href,
        })
      } catch (error) {
        console.log("Erro ao compartilhar:", error)
      }
    } else {
      // Fallback para copiar URL
      navigator.clipboard.writeText(window.location.href)
      alert("Link copiado para a área de transferência!")
    }
  }

  const openFullscreen = (index: number) => {
    setFullscreenImageIndex(index)
    setIsFullscreenOpen(true)
  }

  const closeFullscreen = () => {
    setIsFullscreenOpen(false)
  }

  const nextFullscreenImage = () => {
    setFullscreenImageIndex((prev) => (prev + 1) % images.length)
  }

  const prevFullscreenImage = () => {
    setFullscreenImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const renderPurposeSpecificInfo = () => {
    if (property.purpose === "Venda") {
      return (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <CreditCard className="w-5 h-5 mr-2" />
              Informações de Venda
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {property.financing_accepted && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Aceita Financiamento:</span>
                  <Badge variant={property.financing_accepted === "sim" ? "default" : "secondary"}>
                    {property.financing_accepted === "sim" ? "Sim" : "Não"}
                  </Badge>
                </div>
              )}
              {property.fgts_accepted && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Aceita FGTS:</span>
                  <Badge variant={property.fgts_accepted === "sim" ? "default" : "secondary"}>
                    {property.fgts_accepted === "sim" ? "Sim" : "Não"}
                  </Badge>
                </div>
              )}
              {property.exchange_accepted && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Aceita Permuta:</span>
                  <Badge variant={property.exchange_accepted === "sim" ? "default" : "secondary"}>
                    {property.exchange_accepted === "sim" ? "Sim" : "Não"}
                  </Badge>
                </div>
              )}
              {property.documentation_status && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Documentação:</span>
                  <Badge
                    variant={
                      property.documentation_status === "regular"
                        ? "default"
                        : property.documentation_status === "pendente"
                          ? "secondary"
                          : "destructive"
                    }
                  >
                    {property.documentation_status === "regular"
                      ? "Regular"
                      : property.documentation_status === "pendente"
                        ? "Pendente"
                        : "Irregular"}
                  </Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )
    }

    if (property.purpose === "Locação") {
      return (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Informações de Locação
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {property.rental_deposit && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Depósito:</span>
                  <span className="font-medium">{formatPrice(property.rental_deposit)}</span>
                </div>
              )}
              {property.rental_guarantee && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Garantia:</span>
                  <Badge variant="secondary">
                    {property.rental_guarantee === "fiador"
                      ? "Fiador"
                      : property.rental_guarantee === "seguro"
                        ? "Seguro Fiança"
                        : property.rental_guarantee === "deposito"
                          ? "Depósito"
                          : "Título de Capitalização"}
                  </Badge>
                </div>
              )}
              {property.pets_allowed && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 flex items-center">
                    <PawPrint className="w-4 h-4 mr-1" />
                    Pets:
                  </span>
                  <Badge
                    variant={
                      property.pets_allowed === "sim"
                        ? "default"
                        : property.pets_allowed === "nao"
                          ? "destructive"
                          : "secondary"
                    }
                  >
                    {property.pets_allowed === "sim"
                      ? "Permitido"
                      : property.pets_allowed === "nao"
                        ? "Não Permitido"
                        : "A Negociar"}
                  </Badge>
                </div>
              )}
              {property.furnished && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Mobiliado:</span>
                  <Badge variant="secondary">
                    {property.furnished === "sim" ? "Sim" : property.furnished === "nao" ? "Não" : "Semi-mobiliado"}
                  </Badge>
                </div>
              )}
              {property.minimum_rental_period && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Período Mínimo:</span>
                  <span className="font-medium">{property.minimum_rental_period} meses</span>
                </div>
              )}
              {property.iptu_included && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">IPTU Incluso:</span>
                  <Badge variant={property.iptu_included === "sim" ? "default" : "secondary"}>
                    {property.iptu_included === "sim" ? "Sim" : "Não"}
                  </Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )
    }

    if (property.purpose === "Temporada") {
      return (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Informações de Temporada
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {property.daily_rate && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Diária:</span>
                  <span className="font-medium text-green-600">{formatPrice(property.daily_rate)}</span>
                </div>
              )}
              {property.weekly_rate && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Semanal:</span>
                  <span className="font-medium text-green-600">{formatPrice(property.weekly_rate)}</span>
                </div>
              )}
              {property.monthly_rate && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Mensal:</span>
                  <span className="font-medium text-green-600">{formatPrice(property.monthly_rate)}</span>
                </div>
              )}
              {property.max_guests && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    Máx. Hóspedes:
                  </span>
                  <span className="font-medium">{property.max_guests}</span>
                </div>
              )}
              {property.minimum_stay && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Estadia Mínima:</span>
                  <span className="font-medium">{property.minimum_stay} dias</span>
                </div>
              )}
              {property.cleaning_fee && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Taxa de Limpeza:</span>
                  <span className="font-medium">{formatPrice(property.cleaning_fee)}</span>
                </div>
              )}
              {property.check_in_time && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    Check-in:
                  </span>
                  <span className="font-medium">{property.check_in_time}</span>
                </div>
              )}
              {property.check_out_time && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    Check-out:
                  </span>
                  <span className="font-medium">{property.check_out_time}</span>
                </div>
              )}
              {property.wifi_available && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 flex items-center">
                    <Wifi className="w-4 h-4 mr-1" />
                    Wi-Fi:
                  </span>
                  <Badge variant={property.wifi_available === "sim" ? "default" : "secondary"}>
                    {property.wifi_available === "sim" ? "Disponível" : "Não Disponível"}
                  </Badge>
                </div>
              )}
              {property.pool_available && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 flex items-center">
                    <Waves className="w-4 h-4 mr-1" />
                    Piscina:
                  </span>
                  <Badge variant={property.pool_available === "sim" ? "default" : "secondary"}>
                    {property.pool_available === "sim" ? "Disponível" : "Não Disponível"}
                  </Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )
    }

    return null
  }

  // Suporte para teclas do teclado no modal
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isFullscreenOpen) return

      switch (event.key) {
        case "Escape":
          closeFullscreen()
          break
        case "ArrowLeft":
          if (images.length > 1) prevFullscreenImage()
          break
        case "ArrowRight":
          if (images.length > 1) nextFullscreenImage()
          break
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [isFullscreenOpen, images.length])

  const whatsappMessage = encodeURIComponent(
    `Olá, tenho interesse no imóvel: ${property.title} - ${property.address}. Código: ${property.id.slice(0, 8)}.`,
  )
  const whatsappLink = `https://wa.me/554732482841?text=${whatsappMessage}`

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center text-sm text-gray-600">
            <Link href="/" className="hover:text-blue-600">
              Início
            </Link>
            <span className="mx-2">/</span>
            <Link href="/imoveis" className="hover:text-blue-600">
              Imóveis
            </Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900">{property.title}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Galeria de Imagens */}
            <Card className="overflow-hidden">
              <div
                className="relative h-96 md:h-[500px] cursor-pointer"
                onClick={() => openFullscreen(currentImageIndex)}
              >
                {hasImages ? (
                  <>
                    <Image
                      src={images[currentImageIndex] || "/placeholder.svg"}
                      alt={property.title}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg?height=500&width=800&text=Sem+Imagem"
                      }}
                    />
                    {/* Watermark Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <Image
                        src="/images/rieger-logo.png"
                        alt="Rieger Imóveis Logo"
                        width={150}
                        height={150}
                        className="opacity-20"
                      />
                    </div>
                    {images.length > 1 && (
                      <>
                        <Button
                          variant="outline"
                          size="icon"
                          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white z-10"
                          onClick={(e) => {
                            e.stopPropagation()
                            prevImage()
                          }}
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white z-10"
                          onClick={(e) => {
                            e.stopPropagation()
                            nextImage()
                          }}
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                          {currentImageIndex + 1} / {images.length}
                        </div>
                      </>
                    )}
                    {/* Indicador de tela cheia */}
                    <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                        />
                      </svg>
                      Tela cheia
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <div className="text-center">
                      <Home className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">Nenhuma imagem disponível</p>
                    </div>
                    {/* Watermark Overlay for fallback */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <Image
                        src="/images/rieger-logo.png"
                        alt="Rieger Imóveis Logo"
                        width={150}
                        height={150}
                        className="opacity-20"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="p-4">
                  <div className="flex gap-2 overflow-x-auto">
                    {images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => openFullscreen(index)}
                        className={`relative w-20 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 ${
                          index === currentImageIndex ? "border-blue-500" : "border-gray-200"
                        }`}
                      >
                        <Image
                          src={image || "/placeholder.svg"}
                          alt={`Thumbnail ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </Card>

            {/* Informações Principais */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary">{property.purpose || "Venda"}</Badge>
                      <Badge variant={property.status === "Disponível" ? "default" : "secondary"}>
                        {property.status}
                      </Badge>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold mb-2">{property.title}</h1>
                    <div className="flex items-center text-gray-600 mb-4">
                      <MapPin className="w-5 h-5 mr-2" />
                      <span>{property.address}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setIsFavorited(!isFavorited)}
                      className={isFavorited ? "text-red-500" : ""}
                    >
                      <Heart className={`w-5 h-5 ${isFavorited ? "fill-current" : ""}`} />
                    </Button>
                    <Button variant="outline" size="icon" onClick={handleShare}>
                      <Share2 className="w-5 h-5" />
                    </Button>
                  </div>
                </div>

                <div className="text-3xl font-bold text-green-600 mb-6">
                  {formatPrice(property.price)}
                  {(property.purpose === "Locação" || property.purpose === "Temporada") && "/mês"}
                </div>

                {/* Características */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {property.bedrooms > 0 && (
                    <div className="flex items-center">
                      <Bed className="w-5 h-5 mr-2 text-gray-600" />
                      <span>{property.bedrooms} quartos</span>
                    </div>
                  )}
                  {property.bathrooms > 0 && (
                    <div className="flex items-center">
                      <Bath className="w-5 h-5 mr-2 text-gray-600" />
                      <span>{property.bathrooms} banheiros</span>
                    </div>
                  )}
                  {property.garage_spaces > 0 && (
                    <div className="flex items-center">
                      <Car className="w-5 h-5 mr-2 text-gray-600" />
                      <span>{property.garage_spaces} vagas</span>
                    </div>
                  )}
                  {property.area && (
                    <div className="flex items-center">
                      <Home className="w-5 h-5 mr-2 text-gray-600" />
                      <span>{property.area}</span>
                    </div>
                  )}
                </div>

                {property.description && (
                  <>
                    <Separator className="my-6" />
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Descrição</h3>
                      <p className="text-gray-700 leading-relaxed">{property.description}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Informações Específicas por Finalidade */}
            {renderPurposeSpecificInfo()}
          </div>

          {/* Sidebar de Contato */}
          <div className="space-y-6">
            <Card className="sticky top-4">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Entre em Contato</h3>
                <div className="space-y-4">
                  <Button className="w-full bg-green-500 hover:bg-green-600 text-white" size="lg" asChild>
                    <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                      <Whatsapp className="w-5 h-5 mr-2" /> WhatsApp
                    </a>
                  </Button>
                </div>

                <Separator className="my-6" />

                <div className="space-y-3">
                  <h4 className="font-medium">Rieger Imóveis</h4>
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="w-4 h-4 mr-2" />
                    <span>(47) 3248-2841</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="w-4 h-4 mr-2" />
                    <span>riegerimoveis@gmail.com</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Informações Adicionais */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Informações do Imóvel</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tipo:</span>
                    <span className="font-medium">{property.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className="font-medium">{property.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Código:</span>
                    <span className="font-medium">#{property.id.slice(0, 8)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      {/* Modal de Tela Cheia */}
      {isFullscreenOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Botão Fechar */}
            <Button
              variant="outline"
              size="icon"
              className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 text-white border-white/30 z-10"
              onClick={closeFullscreen}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Button>

            {/* Imagem */}
            <div className="relative max-w-full max-h-full">
              <Image
                src={images[fullscreenImageIndex] || "/placeholder.svg"}
                alt={property.title}
                width={1200}
                height={800}
                className="max-w-full max-h-full object-contain"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.svg?height=800&width=1200&text=Sem+Imagem"
                }}
              />
              {/* Watermark Overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <Image
                  src="/images/rieger-logo.png"
                  alt="Rieger Imóveis Logo"
                  width={200}
                  height={200}
                  className="opacity-20"
                />
              </div>
            </div>

            {/* Navegação */}
            {images.length > 1 && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white border-white/30"
                  onClick={prevFullscreenImage}
                >
                  <ChevronLeft className="w-6 h-6" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white border-white/30"
                  onClick={nextFullscreenImage}
                >
                  <ChevronRight className="w-6 h-6" />
                </Button>

                {/* Contador */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full">
                  {fullscreenImageIndex + 1} / {images.length}
                </div>
              </>
            )}

            {/* Thumbnails na parte inferior */}
            {images.length > 1 && (
              <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 max-w-full overflow-x-auto">
                <div className="flex gap-2 px-4">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setFullscreenImageIndex(index)}
                      className={`relative w-16 h-12 rounded-lg overflow-hidden flex-shrink-0 border-2 ${
                        index === fullscreenImageIndex ? "border-white" : "border-white/30"
                      }`}
                    >
                      <Image
                        src={image || "/placeholder.svg"}
                        alt={`Thumbnail ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
