"use client"

import { Label } from "@/components/ui/label"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, MapPin, Bed, DollarSign, Home, Tag } from "lucide-react" // Import Tag icon
import type { Property } from "@/lib/supabase"
import { SearchResults } from "./search-results"

export function PropertySearch() {
  const [location, setLocation] = useState("")
  const [purpose, setPurpose] = useState("Venda")
  const [bedrooms, setBedrooms] = useState("any")
  const [propertyType, setPropertyType] = useState("all")
  const [tags, setTags] = useState("") // Novo estado para tags
  const [searchResults, setSearchResults] = useState<Property[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchPerformed, setSearchPerformed] = useState(false) // Track if a search has been performed

  const handleSearch = async () => {
    setLoading(true)
    setError(null)
    setSearchPerformed(true) // Set searchPerformed to true when a search is initiated
    try {
      const params = new URLSearchParams()
      if (location) params.append("location", location)
      if (purpose) params.append("purpose", purpose)
      if (bedrooms) params.append("bedrooms", bedrooms)
      if (propertyType) params.append("propertyType", propertyType)
      if (tags) params.append("tags", tags) // Adiciona tags aos parâmetros

      const response = await fetch(`/api/properties/search?${params.toString()}`)
      if (!response.ok) {
        throw new Error("Failed to fetch properties")
      }
      const data = await response.json()
      setSearchResults(data)
    } catch (err) {
      console.error("Error during search:", err)
      setError("Não foi possível buscar imóveis. Tente novamente mais tarde.")
      setSearchResults([])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  // Initial search on component mount
  useEffect(() => {
    handleSearch()
  }, []) // Empty dependency array means it runs once on mount

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 md:py-12">
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">Encontre Seu Imóvel Ideal</h2>
        <p className="text-gray-600 text-lg">Use nossos filtros avançados para encontrar exatamente o que procura</p>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6 md:p-8 grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
        {" "}
        {/* Adjusted grid-cols */}
        <div className="space-y-2">
          <Label htmlFor="purpose" className="flex items-center gap-1 text-gray-700">
            <DollarSign className="w-4 h-4" /> Tipo
          </Label>
          <Select value={purpose} onValueChange={setPurpose}>
            <SelectTrigger id="purpose">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Venda">Venda</SelectItem>
              <SelectItem value="Locação">Locação</SelectItem>
              <SelectItem value="Temporada">Temporada</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2 md:col-span-1">
          <Label htmlFor="location" className="flex items-center gap-1 text-gray-700">
            <MapPin className="w-4 h-4" /> Localização
          </Label>
          <Input
            id="location"
            placeholder="Digite a cidade ou bairro"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            onKeyPress={handleKeyPress}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="propertyType" className="flex items-center gap-1 text-gray-700">
            <Home className="w-4 h-4" /> Tipo de Imóvel
          </Label>
          <Select value={propertyType} onValueChange={setPropertyType}>
            <SelectTrigger id="propertyType">
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              <SelectItem value="Casa">Casa</SelectItem>
              <SelectItem value="Apartamento">Apartamento</SelectItem>
              <SelectItem value="Cobertura">Cobertura</SelectItem>
              <SelectItem value="Terreno">Terreno</SelectItem>
              <SelectItem value="Comercial">Comercial</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="bedrooms" className="flex items-center gap-1 text-gray-700">
            <Bed className="w-4 h-4" /> Dormitórios
          </Label>
          <Select value={bedrooms} onValueChange={setBedrooms}>
            <SelectTrigger id="bedrooms">
              <SelectValue placeholder="Quartos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Qualquer</SelectItem>
              <SelectItem value="1">1 Quarto</SelectItem>
              <SelectItem value="2">2 Quartos</SelectItem>
              <SelectItem value="3">3 Quartos</SelectItem>
              <SelectItem value="4">4+ Quartos</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {/* New Tags Input */}
        <div className="space-y-2">
          <Label htmlFor="tags" className="flex items-center gap-1 text-gray-700">
            <Tag className="w-4 h-4" /> Tags
          </Label>
          <Input
            id="tags"
            placeholder="Ex: piscina, churrasqueira"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            onKeyPress={handleKeyPress}
          />
        </div>
        <Button onClick={handleSearch} disabled={loading} className="w-full md:w-auto h-10">
          {loading ? (
            "Buscando..."
          ) : (
            <>
              <Search className="w-4 h-4 mr-2" /> Buscar Imóveis
            </>
          )}
        </Button>
      </div>

      {error && (
        <div className="mt-8 text-center text-red-500">
          <p>{error}</p>
        </div>
      )}

      {!loading && searchResults.length === 0 && searchPerformed && !error && (
        <div className="mt-8 text-center text-gray-600">
          <p>Nenhum imóvel encontrado com os filtros selecionados.</p>
        </div>
      )}

      <SearchResults properties={searchResults} loading={loading} searchPerformed={searchPerformed} />
    </div>
  )
}
