"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Plus,
  Edit,
  Trash2,
  Upload,
  X,
  Eye,
  EyeOff,
  Copy,
  Search,
  MapPin,
  Bed,
  Bath,
  Car,
  Star,
  ImageIcon,
} from "lucide-react"
import { supabase, uploadFileToBucket, deleteFileFromBucket } from "@/lib/supabase" // Importando as funções
import type { Property } from "@/lib/supabase"
import Image from "next/image"

interface PropertyFormData {
  title: string
  description: string
  price: number
  address: string
  city: string // Adicionado campo de cidade
  bedrooms: number
  bathrooms: number
  area: string
  garage_spaces: number
  type: string
  purpose: string
  status: string
  owner_id: string | null
  image_urls: string[]
  main_image_index: number
  is_active: boolean
  is_featured: boolean
  // Campos para Venda
  financing_accepted?: string | null
  fgts_accepted?: string | null
  exchange_accepted?: string | null
  documentation_status?: string | null
  // Campos para Locação
  rental_deposit?: number | null
  rental_guarantee?: string | null
  pets_allowed?: string | null
  furnished?: string | null
  minimum_rental_period?: number | null
  iptu_included?: string | null
  // Campos para Temporada
  daily_rate?: number | null
  max_guests?: number | null
  minimum_stay?: number | null
  cleaning_fee?: number | null
  check_in_time?: string | null
  check_out_time?: string | null
  wifi_available?: string | null
  pool_available?: string | null
}

const initialFormData: PropertyFormData = {
  title: "",
  description: "",
  price: 0,
  address: "",
  city: "", // Inicializado o campo de cidade
  bedrooms: 0,
  bathrooms: 0,
  area: "",
  garage_spaces: 0,
  type: "Casa",
  purpose: "Venda",
  status: "Disponível",
  owner_id: null,
  image_urls: [],
  main_image_index: 0,
  is_active: true,
  is_featured: false,
  // Campos para Venda
  financing_accepted: null,
  fgts_accepted: null,
  exchange_accepted: null,
  documentation_status: null,
  // Campos para Locação
  rental_deposit: null,
  rental_guarantee: null,
  pets_allowed: null,
  furnished: null,
  minimum_rental_period: null,
  iptu_included: null,
  // Campos para Temporada
  daily_rate: null,
  max_guests: null,
  minimum_stay: null,
  cleaning_fee: null,
  check_in_time: null,
  check_out_time: null,
  wifi_available: null,
  pool_available: null,
}

interface Owner {
  id: string
  name: string
  email: string
  phone: string
}

export function PropertiesManager() {
  const [properties, setProperties] = useState<Property[]>([])
  const [owners, setOwners] = useState<Owner[]>([])
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState<PropertyFormData>(initialFormData)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [uploadingImages, setUploadingImages] = useState(false)
  const [hasIsActiveColumn, setHasIsActiveColumn] = useState(false)
  const [hasMainImageIndexColumn, setHasMainImageIndexColumn] = useState(false)
  const [hasIsFeaturedColumn, setHasIsFeaturedColumn] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [activeFilter, setActiveFilter] = useState<string>("all")
  const [purposeFilter, setPurposeFilter] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [draggedImageIndex, setDraggedImageIndex] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState("dados")

  const [isOwnerModalOpen, setIsOwnerModalOpen] = useState(false)
  const [newOwnerData, setNewOwnerData] = useState({
    name: "",
    email: "",
    phone: "",
    cpf: "",
    address: "",
    notes: "",
    bank_account: "",
    profession: "",
    marital_status: "",
  })
  const [isSubmittingOwner, setIsSubmittingOwner] = useState(false)

  useEffect(() => {
    checkColumns()
    fetchProperties()
    fetchOwners()
  }, [])

  useEffect(() => {
    filterProperties()
  }, [properties, searchTerm, statusFilter, activeFilter, purposeFilter])

  const checkColumns = async () => {
    try {
      // Verificar se a coluna is_active existe
      const { data: testActiveData, error: testActiveError } = await supabase
        .from("properties")
        .select("is_active")
        .limit(1)

      if (!testActiveError) {
        setHasIsActiveColumn(true)
      }

      // Verificar se a coluna main_image_index existe
      const { data: testMainImageData, error: testMainImageError } = await supabase
        .from("properties")
        .select("main_image_index")
        .limit(1)

      if (!testMainImageError) {
        setHasMainImageIndexColumn(true)
      }

      // Verificar se a coluna is_featured existe
      const { data: testFeaturedData, error: testFeaturedError } = await supabase
        .from("properties")
        .select("is_featured")
        .limit(1)

      if (!testFeaturedError) {
        setHasIsFeaturedColumn(true)
      }
    } catch (error) {
      console.log("Algumas colunas podem não existir ainda")
    }
  }

  const fetchProperties = async () => {
    try {
      const { data, error } = await supabase
        .from("properties")
        .select(`
          *,
          owners (
            id,
            name,
            email,
            phone
          )
        `)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Erro ao buscar propriedades:", error)
        return
      }

      setProperties(data as Property[])
    } catch (error) {
      console.error("Erro ao carregar propriedades:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterProperties = () => {
    let filtered = properties

    if (searchTerm) {
      filtered = filtered.filter(
        (property) =>
          property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          property.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (property.city || "").toLowerCase().includes(searchTerm.toLowerCase()) || // Incluído filtro por cidade, com fallback
          property.type.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((property) => property.status === statusFilter)
    }

    if (activeFilter !== "all" && hasIsActiveColumn) {
      const isActive = activeFilter === "active"
      filtered = filtered.filter((property) => property.is_active === isActive)
    }

    if (purposeFilter !== "all") {
      filtered = filtered.filter((property) => property.purpose === purposeFilter)
    }

    setFilteredProperties(filtered)
  }

  const fetchOwners = async () => {
    try {
      const { data, error } = await supabase.from("owners").select("*").order("name")

      if (error) {
        console.error("Erro ao buscar proprietários:", error)
        return
      }

      setOwners(data as Owner[])
    } catch (error) {
      console.error("Erro ao carregar proprietários:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const submitData: any = {
        title: formData.title,
        description: formData.description,
        price: formData.purpose === "Temporada" ? formData.daily_rate || 0 : formData.price, // Adjust price for Temporada
        address: formData.address,
        city: formData.city, // Incluído no submit
        bedrooms: formData.bedrooms,
        bathrooms: formData.bathrooms,
        area: formData.area || null,
        garage_spaces: formData.garage_spaces,
        type: formData.type,
        purpose: formData.purpose === "none" ? null : formData.purpose,
        status: formData.status,
        owner_id: formData.owner_id === "none" ? null : formData.owner_id,
        image_urls: formData.image_urls,
        // Campos para Venda
        financing_accepted: formData.financing_accepted,
        fgts_accepted: formData.fgts_accepted,
        exchange_accepted: formData.exchange_accepted,
        documentation_status: formData.documentation_status,
        // Campos para Locação
        rental_deposit: formData.rental_deposit,
        rental_guarantee: formData.rental_guarantee,
        pets_allowed: formData.pets_allowed,
        furnished: formData.furnished,
        minimum_rental_period: formData.minimum_rental_period,
        iptu_included: formData.iptu_included,
        // Campos para Temporada
        daily_rate: formData.daily_rate,
        max_guests: formData.max_guests,
        minimum_stay: formData.minimum_stay,
        cleaning_fee: formData.cleaning_fee,
        check_in_time: formData.check_in_time,
        check_out_time: formData.check_out_time,
        wifi_available: formData.wifi_available,
        pool_available: formData.pool_available,
      }

      // Adicionar colunas condicionalmente
      if (hasMainImageIndexColumn) {
        submitData.main_image_index = formData.main_image_index
      }

      if (hasIsActiveColumn) {
        submitData.is_active = formData.is_active
      }

      if (hasIsFeaturedColumn) {
        submitData.is_featured = formData.is_featured
      }

      if (editingId) {
        const { error } = await supabase.from("properties").update(submitData).eq("id", editingId)

        if (error) throw error
      } else {
        const { error } = await supabase.from("properties").insert([submitData])

        if (error) throw error
      }

      setFormData(initialFormData)
      setEditingId(null)
      setIsDialogOpen(false)
      setActiveTab("dados")
      fetchProperties()
    } catch (error) {
      console.error("Erro ao salvar propriedade:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (property: Property) => {
    setFormData({
      title: property.title,
      description: property.description || "",
      price: property.price,
      address: property.address,
      city: property.city || "", // Carregado o campo de cidade, com fallback para string vazia
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      area: property.area || "",
      garage_spaces: property.garage_spaces,
      type: property.type || "Casa", // Default para 'Casa' se for null/undefined
      purpose: property.purpose || "Venda", // Default para 'Venda' se for null/undefined
      status: property.status || "Disponível", // Default para 'Disponível' se for null/undefined
      owner_id: property.owner_id || "none",
      image_urls: property.image_urls || [],
      main_image_index: property.main_image_index || 0,
      is_active: property.is_active ?? true, // Usar nullish coalescing para booleanos
      is_featured: property.is_featured ?? false, // Usar nullish coalescing para booleanos
      // Campos para Venda
      financing_accepted: property.financing_accepted ?? null,
      fgts_accepted: property.fgts_accepted ?? null,
      exchange_accepted: property.exchange_accepted ?? null,
      documentation_status: property.documentation_status ?? null,
      // Campos para Locação
      rental_deposit: property.rental_deposit ?? null,
      rental_guarantee: property.rental_guarantee ?? null,
      pets_allowed: property.pets_allowed ?? null,
      furnished: property.furnished ?? null,
      minimum_rental_period: property.minimum_rental_period ?? null,
      iptu_included: property.iptu_included ?? null,
      // Campos para Temporada
      daily_rate: property.daily_rate ?? null,
      max_guests: property.max_guests ?? null,
      minimum_stay: property.minimum_stay ?? null,
      cleaning_fee: property.cleaning_fee ?? null,
      check_in_time: property.check_in_time ?? null,
      check_out_time: property.check_out_time ?? null,
      wifi_available: property.wifi_available ?? null,
      pool_available: property.pool_available ?? null,
    })
    setEditingId(property.id)
    setActiveTab("dados")
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    try {
      // Opcional: Deletar imagens do storage antes de deletar a propriedade
      const propertyToDelete = properties.find((p) => p.id === id)
      if (propertyToDelete && propertyToDelete.image_urls && propertyToDelete.image_urls.length > 0) {
        for (const imageUrl of propertyToDelete.image_urls) {
          // Extrair o caminho do arquivo da URL pública
          const pathSegments = imageUrl.split("/")
          const filePath = pathSegments.slice(pathSegments.indexOf("property-images") + 1).join("/")
          await deleteFileFromBucket("property-images", filePath)
        }
      }

      const { error } = await supabase.from("properties").delete().eq("id", id)

      if (error) throw error

      fetchProperties()
    } catch (error) {
      console.error("Erro ao deletar propriedade:", error)
    }
  }

  const handleDuplicate = async (property: Property) => {
    try {
      const duplicateData: any = {
        title: `${property.title} - Cópia`,
        description: property.description,
        price: property.price,
        address: property.address,
        city: property.city, // Incluído no duplicar
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        area: property.area,
        garage_spaces: property.garage_spaces,
        type: property.type,
        purpose: property.purpose,
        status: "Disponível",
        owner_id: property.owner_id,
        image_urls: property.image_urls || [],
        // Campos para Venda
        financing_accepted: property.financing_accepted,
        fgts_accepted: property.fgts_accepted,
        exchange_accepted: property.exchange_accepted,
        documentation_status: property.documentation_status,
        // Campos para Locação
        rental_deposit: property.rental_deposit,
        rental_guarantee: property.rental_guarantee,
        pets_allowed: property.pets_allowed,
        furnished: property.furnished,
        minimum_rental_period: property.minimum_rental_period,
        iptu_included: property.iptu_included,
        // Campos para Temporada
        daily_rate: property.daily_rate,
        max_guests: property.max_guests,
        minimum_stay: property.minimum_stay,
        cleaning_fee: property.cleaning_fee,
        check_in_time: property.check_in_time,
        check_out_time: property.check_out_time,
        wifi_available: property.wifi_available,
        pool_available: property.pool_available,
      }

      // Adicionar colunas condicionalmente
      if (hasMainImageIndexColumn) {
        duplicateData.main_image_index = property.main_image_index || 0
      }

      if (hasIsActiveColumn) {
        duplicateData.is_active = true
      }

      if (hasIsFeaturedColumn) {
        duplicateData.is_featured = false
      }

      const { error } = await supabase.from("properties").insert([duplicateData])

      if (error) throw error

      fetchProperties()
    } catch (error) {
      console.error("Erro ao duplicar propriedade:", error)
    }
  }

  const toggleActiveStatus = async (property: Property) => {
    if (!hasIsActiveColumn) return

    try {
      const newStatus = !property.is_active
      const { error } = await supabase.from("properties").update({ is_active: newStatus }).eq("id", property.id)

      if (error) throw error

      fetchProperties()
    } catch (error) {
      console.error("Erro ao alterar status ativo:", error)
    }
  }

  const toggleFeaturedStatus = async (property: Property) => {
    if (!hasIsFeaturedColumn) return

    try {
      const newStatus = !property.is_featured
      const { error } = await supabase.from("properties").update({ is_featured: newStatus }).eq("id", property.id)

      if (error) throw error

      fetchProperties()
    } catch (error) {
      console.error("Erro ao alterar status de destaque:", error)
    }
  }

  const handleImageUpload = async (files: FileList) => {
    if (!files.length) return

    setUploadingImages(true)
    const uploadedUrls: string[] = []

    try {
      for (const file of Array.from(files)) {
        const fileExt = file.name.split(".").pop()
        const fileName = `${Math.random()}.${fileExt}`
        const filePath = `properties/${fileName}`

        const publicUrl = await uploadFileToBucket("property-images", filePath, file) // Usando a função exportada

        uploadedUrls.push(publicUrl)
      }

      setFormData((prev) => ({
        ...prev,
        image_urls: [...prev.image_urls, ...uploadedUrls],
      }))
    } catch (error) {
      console.error("Erro ao fazer upload das imagens:", error)
    } finally {
      setUploadingImages(false)
    }
  }

  const removeImage = async (index: number) => {
    const imageUrlToRemove = formData.image_urls[index]
    if (!imageUrlToRemove) return

    try {
      // Extrair o caminho do arquivo da URL pública
      const pathSegments = imageUrlToRemove.split("/")
      const filePath = pathSegments.slice(pathSegments.indexOf("property-images") + 1).join("/")

      await deleteFileFromBucket("property-images", filePath) // Usando a função exportada

      setFormData((prev) => {
        const newImageUrls = prev.image_urls.filter((_, i) => i !== index)
        let newMainImageIndex = prev.main_image_index

        if (newImageUrls.length === 0) {
          newMainImageIndex = 0
        } else if (newMainImageIndex === index) {
          newMainImageIndex = 0
        } else if (newMainImageIndex > index) {
          newMainImageIndex--
        }

        return {
          ...prev,
          image_urls: newImageUrls,
          main_image_index: newMainImageIndex,
        }
      })
    } catch (error) {
      console.error("Erro ao remover imagem:", error)
      alert("Erro ao remover imagem. Tente novamente.")
    }
  }

  const setMainImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      main_image_index: index,
    }))
  }

  const resetForm = () => {
    setFormData(initialFormData)
    setEditingId(null)
    setActiveTab("dados")
  }

  const getMainImage = (property: Property) => {
    if (!property.image_urls || property.image_urls.length === 0) return null
    const mainIndex = property.main_image_index || 0
    return property.image_urls[mainIndex] || property.image_urls[0]
  }

  // Helper function to format price for display based on purpose
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

  // Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent<HTMLDivElement> | undefined, index: number) => {
    if (!e) {
      console.error("Drag event is undefined. Cannot start drag operation.")
      return
    }

    setDraggedImageIndex(index)
    e.dataTransfer.effectAllowed = "move"
    // Set a dummy image for drag feedback to avoid showing the actual image
    const img = new Image()
    img.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
    e.dataTransfer.setDragImage(img, 0, 0)
  }

  // Também vou adicionar verificações de segurança nas outras funções de drag
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    if (!e) return
    e.preventDefault() // Necessary to allow dropping
    e.dataTransfer.dropEffect = "move"
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, dropIndex: number) => {
    if (!e) return
    e.preventDefault()
    if (draggedImageIndex === null || draggedImageIndex === dropIndex) {
      return
    }

    const newImageUrls = [...formData.image_urls]
    const [draggedItem] = newImageUrls.splice(draggedImageIndex, 1)
    newImageUrls.splice(dropIndex, 0, draggedItem)

    let newMainImageIndex = formData.main_image_index
    if (draggedImageIndex === formData.main_image_index) {
      newMainImageIndex = dropIndex
    } else if (draggedImageIndex < formData.main_image_index && dropIndex >= formData.main_image_index) {
      newMainImageIndex--
    } else if (draggedImageIndex > formData.main_image_index && dropIndex <= formData.main_image_index) {
      newMainImageIndex++
    }

    setFormData((prev) => ({
      ...prev,
      image_urls: newImageUrls,
      main_image_index: newMainImageIndex,
    }))
    setDraggedImageIndex(null)
  }

  const handleDragEnd = () => {
    setDraggedImageIndex(null)
  }

  const handleSaveNewOwner = async () => {
    if (!newOwnerData.name || !newOwnerData.phone) {
      alert("Por favor, preencha os campos obrigatórios: Nome Completo e Telefone.")
      return
    }

    setIsSubmittingOwner(true)

    try {
      const { data, error } = await supabase
        .from("owners")
        .insert([
          {
            name: newOwnerData.name,
            email: newOwnerData.email || null,
            phone: newOwnerData.phone,
            cpf: newOwnerData.cpf || null,
            address: newOwnerData.address || null,
            notes: newOwnerData.notes || null,
            bank_account: newOwnerData.bank_account || null,
            profession: newOwnerData.profession || null,
            marital_status: newOwnerData.marital_status || null,
          },
        ])
        .select()

      if (error) throw error

      // Atualizar lista de proprietários
      await fetchOwners()

      // Selecionar o proprietário recém-criado
      if (data && data[0]) {
        setFormData((prev) => ({ ...prev, owner_id: data[0].id }))
      }

      // Resetar formulário e fechar modal
      setNewOwnerData({
        name: "",
        email: "",
        phone: "",
        cpf: "",
        address: "",
        notes: "",
        bank_account: "",
        profession: "",
        marital_status: "",
      })
      setIsOwnerModalOpen(false)

      alert("Proprietário adicionado com sucesso!")
    } catch (error) {
      console.error("Erro ao salvar proprietário:", error)
      alert("Erro ao salvar proprietário.")
    } finally {
      setIsSubmittingOwner(false)
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64">Carregando...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gerenciar Imóveis</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Imóvel
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? "Editar Imóvel" : "Adicionar Novo Imóvel"}</DialogTitle>
            </DialogHeader>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="dados">Dados do Imóvel</TabsTrigger>
                <TabsTrigger value="imagens" className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  Imagens ({formData.image_urls.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="dados" className="space-y-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Título</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="price">Preço (R$)</Label>
                      <Input
                        id="price"
                        type="number"
                        value={formData.purpose === "Temporada" ? (formData.daily_rate ?? "") : formData.price} // Usar ?? para garantir valor
                        onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                        required
                        disabled={formData.purpose === "Temporada"}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="address">Endereço</Label>
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">Cidade</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="bedrooms">Quartos</Label>
                      <Input
                        id="bedrooms"
                        type="number"
                        min="0"
                        value={formData.bedrooms}
                        onChange={(e) => setFormData({ ...formData, bedrooms: Number(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bathrooms">Banheiros</Label>
                      <Input
                        id="bathrooms"
                        type="number"
                        min="0"
                        value={formData.bathrooms}
                        onChange={(e) => setFormData({ ...formData, bathrooms: Number(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="area">Área (m²)</Label>
                      <Input
                        id="area"
                        value={formData.area}
                        onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="garage_spaces">Vagas Garagem</Label>
                      <Input
                        id="garage_spaces"
                        type="number"
                        min="0"
                        value={formData.garage_spaces}
                        onChange={(e) => setFormData({ ...formData, garage_spaces: Number(e.target.value) })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="type">Tipo do Imóvel</Label>
                      <Select
                        value={formData.type}
                        onValueChange={(value) => setFormData({ ...formData, type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Casa">Casa</SelectItem>
                          <SelectItem value="Apartamento">Apartamento</SelectItem>
                          <SelectItem value="Cobertura">Cobertura</SelectItem>
                          <SelectItem value="Terreno">Terreno</SelectItem>
                          <SelectItem value="Comercial">Comercial</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="purpose">Finalidade</Label>
                      <Select
                        value={formData.purpose}
                        onValueChange={(value) => setFormData({ ...formData, purpose: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Venda">Venda</SelectItem>
                          <SelectItem value="Locação">Locação</SelectItem>
                          <SelectItem value="Temporada">Temporada</SelectItem>
                          <SelectItem value="none">Não especificado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value) => setFormData({ ...formData, status: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Disponível">Disponível</SelectItem>
                          <SelectItem value="Vendido">Vendido</SelectItem>
                          <SelectItem value="Alugado">Alugado</SelectItem>
                          <SelectItem value="Reservado">Reservado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Campos específicos por finalidade */}
                  {formData.purpose === "Venda" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg">
                      <h4 className="col-span-full font-medium text-blue-800">Opções para Venda</h4>
                      <div className="space-y-2">
                        <Label htmlFor="financing_accepted">Aceita Financiamento</Label>
                        <Select
                          value={formData.financing_accepted ?? "none"} // Usar ?? para garantir valor
                          onValueChange={(value) =>
                            setFormData({ ...formData, financing_accepted: value === "none" ? null : value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Não especificado</SelectItem>
                            <SelectItem value="sim">Sim</SelectItem>
                            <SelectItem value="nao">Não</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="fgts_accepted">Aceita FGTS</Label>
                        <Select
                          value={formData.fgts_accepted ?? "none"} // Usar ?? para garantir valor
                          onValueChange={(value) =>
                            setFormData({ ...formData, fgts_accepted: value === "none" ? null : value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Não especificado</SelectItem>
                            <SelectItem value="sim">Sim</SelectItem>
                            <SelectItem value="nao">Não</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="exchange_accepted">Aceita Permuta</Label>
                        <Select
                          value={formData.exchange_accepted ?? "none"} // Usar ?? para garantir valor
                          onValueChange={(value) =>
                            setFormData({ ...formData, exchange_accepted: value === "none" ? null : value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Não especificado</SelectItem>
                            <SelectItem value="sim">Sim</SelectItem>
                            <SelectItem value="nao">Não</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="documentation_status">Status da Documentação</Label>
                        <Select
                          value={formData.documentation_status ?? "none"} // Usar ?? para garantir valor
                          onValueChange={(value) =>
                            setFormData({ ...formData, documentation_status: value === "none" ? null : value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Não especificado</SelectItem>
                            <SelectItem value="regular">Regular</SelectItem>
                            <SelectItem value="pendente">Pendente</SelectItem>
                            <SelectItem value="irregular">Irregular</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  {formData.purpose === "Locação" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-green-50 rounded-lg">
                      <h4 className="col-span-full font-medium text-green-800">Opções para Locação</h4>
                      <div className="space-y-2">
                        <Label htmlFor="rental_deposit">Valor do Depósito (R$)</Label>
                        <Input
                          id="rental_deposit"
                          type="number"
                          value={formData.rental_deposit ?? ""} // Usar ?? para garantir valor
                          onChange={(e) => setFormData({ ...formData, rental_deposit: Number(e.target.value) || null })}
                          placeholder="Ex: 2000"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="rental_guarantee">Tipo de Garantia</Label>
                        <Select
                          value={formData.rental_guarantee ?? "none"} // Usar ?? para garantir valor
                          onValueChange={(value) =>
                            setFormData({ ...formData, rental_guarantee: value === "none" ? null : value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Não especificado</SelectItem>
                            <SelectItem value="fiador">Fiador</SelectItem>
                            <SelectItem value="seguro">Seguro Fiança</SelectItem>
                            <SelectItem value="deposito">Depósito</SelectItem>
                            <SelectItem value="titulo">Título de Capitalização</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="pets_allowed">Aceita Pets</Label>
                        <Select
                          value={formData.pets_allowed ?? "none"} // Usar ?? para garantir valor
                          onValueChange={(value) =>
                            setFormData({ ...formData, pets_allowed: value === "none" ? null : value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Não especificado</SelectItem>
                            <SelectItem value="sim">Sim</SelectItem>
                            <SelectItem value="nao">Não</SelectItem>
                            <SelectItem value="negociar">A negociar</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="furnished">Mobiliado</Label>
                        <Select
                          value={formData.furnished ?? "none"} // Usar ?? para garantir valor
                          onValueChange={(value) =>
                            setFormData({ ...formData, furnished: value === "none" ? null : value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Não especificado</SelectItem>
                            <SelectItem value="sim">Sim</SelectItem>
                            <SelectItem value="nao">Não</SelectItem>
                            <SelectItem value="semi">Semi-mobiliado</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="minimum_rental_period">Período Mínimo (meses)</Label>
                        <Input
                          id="minimum_rental_period"
                          type="number"
                          min="1"
                          value={formData.minimum_rental_period ?? ""} // Usar ?? para garantir valor
                          onChange={(e) =>
                            setFormData({ ...formData, minimum_rental_period: Number(e.target.value) || null })
                          }
                          placeholder="Ex: 12"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="iptu_included">IPTU Incluso</Label>
                        <Select
                          value={formData.iptu_included ?? "none"} // Usar ?? para garantir valor
                          onValueChange={(value) =>
                            setFormData({ ...formData, iptu_included: value === "none" ? null : value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Não especificado</SelectItem>
                            <SelectItem value="sim">Sim</SelectItem>
                            <SelectItem value="nao">Não</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  {formData.purpose === "Temporada" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-orange-50 rounded-lg">
                      <h4 className="col-span-full font-medium text-orange-800">Opções para Temporada</h4>
                      <div className="space-y-2">
                        <Label htmlFor="daily_rate">Diária (R$)</Label>
                        <Input
                          id="daily_rate"
                          type="number"
                          value={formData.daily_rate ?? ""} // Usar ?? para garantir valor
                          onChange={(e) => setFormData({ ...formData, daily_rate: Number(e.target.value) || null })}
                          placeholder="Ex: 150"
                          required // Daily rate is now required for seasonal
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="max_guests">Máximo de Hóspedes</Label>
                        <Input
                          id="max_guests"
                          type="number"
                          min="1"
                          value={formData.max_guests ?? ""} // Usar ?? para garantir valor
                          onChange={(e) => setFormData({ ...formData, max_guests: Number(e.target.value) || null })}
                          placeholder="Ex: 6"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="minimum_stay">Estadia Mínima (dias)</Label>
                        <Input
                          id="minimum_stay"
                          type="number"
                          min="1"
                          value={formData.minimum_stay ?? ""} // Usar ?? para garantir valor
                          onChange={(e) => setFormData({ ...formData, minimum_stay: Number(e.target.value) || null })}
                          placeholder="Ex: 3"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cleaning_fee">Taxa de Limpeza (R$)</Label>
                        <Input
                          id="cleaning_fee"
                          type="number"
                          value={formData.cleaning_fee ?? ""} // Usar ?? para garantir valor
                          onChange={(e) => setFormData({ ...formData, cleaning_fee: Number(e.target.value) || null })}
                          placeholder="Ex: 100"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="check_in_time">Horário Check-in</Label>
                        <Input
                          id="check_in_time"
                          type="time"
                          value={formData.check_in_time ?? ""} // Usar ?? para garantir valor
                          onChange={(e) => setFormData({ ...formData, check_in_time: e.target.value || null })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="check_out_time">Horário Check-out</Label>
                        <Input
                          id="check_out_time"
                          type="time"
                          value={formData.check_out_time ?? ""} // Usar ?? para garantir valor
                          onChange={(e) => setFormData({ ...formData, check_out_time: e.target.value || null })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="wifi_available">Wi-Fi Disponível</Label>
                        <Select
                          value={formData.wifi_available ?? "none"} // Usar ?? para garantir valor
                          onValueChange={(value) =>
                            setFormData({ ...formData, wifi_available: value === "none" ? null : value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Não especificado</SelectItem>
                            <SelectItem value="sim">Sim</SelectItem>
                            <SelectItem value="nao">Não</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="pool_available">Piscina Disponível</Label>
                        <Select
                          value={formData.pool_available ?? "none"} // Usar ?? para garantir valor
                          onValueChange={(value) =>
                            setFormData({ ...formData, pool_available: value === "none" ? null : value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Não especificado</SelectItem>
                            <SelectItem value="sim">Sim</SelectItem>
                            <SelectItem value="nao">Não</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="owner_id">Proprietário</Label>
                    <div className="flex gap-2">
                      <Select
                        value={formData.owner_id ?? "none"} // Usar ?? para garantir valor
                        onValueChange={(value) => setFormData({ ...formData, owner_id: value })}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Selecionar proprietário</SelectItem>
                          {owners.map((owner) => (
                            <SelectItem key={owner.id} value={owner.id}>
                              {owner.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setIsOwnerModalOpen(true)}
                        title="Adicionar novo proprietário"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {hasIsActiveColumn && (
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="is_active"
                        checked={formData.is_active}
                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                        className="rounded"
                      />
                      <Label htmlFor="is_active">Imóvel ativo (visível no site)</Label>
                    </div>
                  )}

                  {hasIsFeaturedColumn && (
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="is_featured"
                        checked={formData.is_featured}
                        onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                        className="rounded"
                      />
                      <Label htmlFor="is_featured">Imóvel em destaque (aparece na seção de destaques)</Label>
                    </div>
                  )}

                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={loading}>
                      {loading ? "Salvando..." : editingId ? "Atualizar" : "Criar"}
                    </Button>
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="imagens" className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-lg font-medium">Gerenciar Imagens</Label>
                    <p className="text-sm text-gray-600">
                      {formData.image_urls.length} imagem{formData.image_urls.length !== 1 ? "s" : ""} adicionada
                      {formData.image_urls.length !== 1 ? "s" : ""}
                    </p>
                  </div>

                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
                      className="hidden"
                      id="image-upload"
                    />
                    <label htmlFor="image-upload" className="cursor-pointer">
                      <div className="text-center">
                        <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                        <p className="text-lg text-gray-600 mb-2">
                          {uploadingImages ? "Enviando imagens..." : "Clique para selecionar imagens"}
                        </p>
                        <p className="text-sm text-gray-500">Suporte para múltiplas imagens (JPG, PNG, WebP)</p>
                      </div>
                    </label>
                  </div>

                  {formData.image_urls.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-700">Arraste as imagens para reordenar</p>
                        {hasMainImageIndexColumn && (
                          <p className="text-sm text-gray-600">Imagem principal: {formData.main_image_index + 1}</p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {formData.image_urls.map((url, index) => (
                          <div
                            key={`${url}-${index}`}
                            draggable="true"
                            onDragStart={(e) => handleDragStart(e, index)}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, index)}
                            onDragEnd={handleDragEnd}
                            className={`relative group cursor-grab transition-all duration-200 hover:scale-105 ${
                              draggedImageIndex === index ? "opacity-50 scale-95" : ""
                            }`}
                          >
                            <div className="relative aspect-square">
                              <Image
                                src={url || "/placeholder.svg"}
                                alt={`Imagem ${index + 1}`}
                                fill
                                className={`object-cover rounded-lg border-2 ${
                                  formData.main_image_index === index ? "border-blue-500 border-4" : "border-gray-200"
                                }`}
                                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                              />

                              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                {hasMainImageIndexColumn && (
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant={formData.main_image_index === index ? "default" : "secondary"}
                                    onClick={() => setMainImage(index)}
                                    className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
                                    title="Definir como imagem principal"
                                  >
                                    <Star
                                      className={`w-4 h-4 ${formData.main_image_index === index ? "fill-current" : ""}`}
                                    />
                                  </Button>
                                )}
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => removeImage(index)}
                                  className="h-8 w-8 p-0 bg-red-500/90 hover:bg-red-500"
                                  title="Remover imagem"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>

                              {formData.main_image_index === index && (
                                <div className="absolute bottom-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                                  Principal
                                </div>
                              )}

                              <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                                {index + 1}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end space-x-2 pt-4 border-t">
                    <Button type="button" variant="outline" onClick={() => setActiveTab("dados")}>
                      Voltar aos Dados
                    </Button>
                    <Button
                      type="button"
                      onClick={handleSubmit}
                      disabled={loading}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {loading ? "Salvando..." : editingId ? "Atualizar Imóvel" : "Criar Imóvel"}
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {/* Modal para adicionar novo proprietário */}
            <Dialog open={isOwnerModalOpen} onOpenChange={setIsOwnerModalOpen}>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Adicionar Novo Proprietário</DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="owner_name">Nome Completo *</Label>
                    <Input
                      id="owner_name"
                      value={newOwnerData.name}
                      onChange={(e) => setNewOwnerData({ ...newOwnerData, name: e.target.value })}
                      placeholder="Ex: João Silva"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="owner_email">E-mail</Label>
                    <Input
                      id="owner_email"
                      type="email"
                      value={newOwnerData.email}
                      onChange={(e) => setNewOwnerData({ ...newOwnerData, email: e.target.value })}
                      placeholder="joao@email.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="owner_phone">Telefone *</Label>
                    <Input
                      id="owner_phone"
                      value={newOwnerData.phone}
                      onChange={(e) => setNewOwnerData({ ...newOwnerData, phone: e.target.value })}
                      placeholder="(47) 99999-1234"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="owner_cpf">CPF</Label>
                    <Input
                      id="owner_cpf"
                      value={newOwnerData.cpf}
                      onChange={(e) => setNewOwnerData({ ...newOwnerData, cpf: e.target.value })}
                      placeholder="123.456.789-00"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="owner_profession">Profissão</Label>
                    <Input
                      id="owner_profession"
                      value={newOwnerData.profession}
                      onChange={(e) => setNewOwnerData({ ...newOwnerData, profession: e.target.value })}
                      placeholder="Ex: Empresário"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="owner_marital_status">Estado Civil</Label>
                    <Input
                      id="owner_marital_status"
                      value={newOwnerData.marital_status}
                      onChange={(e) => setNewOwnerData({ ...newOwnerData, marital_status: e.target.value })}
                      placeholder="Ex: Casado"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="owner_address">Endereço</Label>
                    <Input
                      id="owner_address"
                      value={newOwnerData.address}
                      onChange={(e) => setNewOwnerData({ ...newOwnerData, address: e.target.value })}
                      placeholder="Rua das Flores, 456 - Centro"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="owner_bank_account">Dados Bancários</Label>
                    <Input
                      id="owner_bank_account"
                      value={newOwnerData.bank_account}
                      onChange={(e) => setNewOwnerData({ ...newOwnerData, bank_account: e.target.value })}
                      placeholder="Banco do Brasil - Ag: 1234 - CC: 56789-0"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="owner_notes">Observações</Label>
                    <Textarea
                      id="owner_notes"
                      value={newOwnerData.notes}
                      onChange={(e) => setNewOwnerData({ ...newOwnerData, notes: e.target.value })}
                      placeholder="Informações importantes sobre o proprietário..."
                      rows={3}
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsOwnerModalOpen(false)}>
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSaveNewOwner}
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled={isSubmittingOwner}
                  >
                    {isSubmittingOwner ? "Salvando..." : "Salvar Proprietário"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 max-w-md min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Buscar imóveis..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="Disponível">Disponível</SelectItem>
            <SelectItem value="Vendido">Vendido</SelectItem>
            <SelectItem value="Alugado">Alugado</SelectItem>
            <SelectItem value="Reservado">Reservado</SelectItem>
          </SelectContent>
        </Select>
        {hasIsActiveColumn && (
          <Select value={activeFilter} onValueChange={setActiveFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrar por ativo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="active">Apenas Ativos</SelectItem>
              <SelectItem value="inactive">Apenas Inativos</SelectItem>
            </SelectContent>
          </Select>
        )}
        <Select value={purposeFilter} onValueChange={setPurposeFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar por finalidade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as finalidades</SelectItem>
            <SelectItem value="Venda">Venda</SelectItem>
            <SelectItem value="Locação">Locação</SelectItem>
            <SelectItem value="Temporada">Temporada</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProperties.map((property) => {
          const mainImage = getMainImage(property)
          const isInactive = hasIsActiveColumn && !property.is_active
          const isFeatured = hasIsFeaturedColumn && property.is_featured

          return (
            <Card key={property.id} className={`overflow-hidden ${isInactive ? "opacity-60" : ""}`}>
              <div className="relative h-48">
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
                {property.image_urls && property.image_urls.length > 1 && (
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                    +{property.image_urls.length - 1} fotos
                  </div>
                )}
                <div className="absolute top-2 left-2 flex gap-2">
                  <Badge variant="secondary">{property.purpose || "Venda"}</Badge>
                  <Badge variant={property.status === "Disponível" ? "default" : "secondary"}>{property.status}</Badge>
                  {isInactive && <Badge variant="destructive">Inativo</Badge>}
                  {isFeatured && <Badge className="bg-yellow-500 text-white">Destaque</Badge>}
                </div>
              </div>
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
                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(property)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="outline">
                          <Copy className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Duplicar Imóvel</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja duplicar este imóvel? Uma cópia será criada com todas as informações
                            e fotos.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDuplicate(property)}>Duplicar</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    {hasIsActiveColumn && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleActiveStatus(property)}
                        className={property.is_active ? "text-green-600" : "text-gray-400"}
                      >
                        {property.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </Button>
                    )}
                    {hasIsFeaturedColumn && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleFeaturedStatus(property)}
                        className={property.is_featured ? "text-yellow-500" : "text-gray-400"}
                      >
                        <Star className={`w-4 h-4 ${property.is_featured ? "fill-current" : ""}`} />
                      </Button>
                    )}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja excluir este imóvel? Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(property.id)}>Excluir</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                  <span className="text-xs text-gray-500">#{property.id.slice(0, 8)}</span>
                </div>
                {property.owners && (
                  <div className="mt-2 text-sm text-gray-600">
                    <strong>Proprietário:</strong> {property.owners.name}
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredProperties.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600">Nenhum imóvel encontrado.</p>
        </div>
      )}
    </div>
  )
}
