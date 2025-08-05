"use client"

import { useState, useEffect, useCallback } from "react"
import { supabase, type Property, type SeasonalRental } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Loader2, Search, Plus, Edit, Trash2, Filter, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function SeasonalManager() {
  const { toast } = useToast()
  const [properties, setProperties] = useState<Property[]>([])
  const [rentals, setRentals] = useState<SeasonalRental[]>([])
  const [loadingProperties, setLoadingProperties] = useState(true)
  const [loadingRentals, setLoadingRentals] = useState(true)
  const [errorProperties, setErrorProperties] = useState<string | null>(null)
  const [errorRentals, setErrorRentals] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [showRentalForm, setShowRentalForm] = useState(false)
  const [editingRental, setEditingRental] = useState<SeasonalRental | null>(null)

  // Form states
  const [propertyName, setPropertyName] = useState("")
  const [selectedPropertyId, setSelectedPropertyId] = useState("")
  const [tenantName, setTenantName] = useState("")
  const [tenantPhone, setTenantPhone] = useState("")
  const [checkInDate, setCheckInDate] = useState("")
  const [checkOutDate, setCheckOutDate] = useState("")
  const [dailyRate, setDailyRate] = useState("")
  const [notes, setNotes] = useState("")

  const fetchProperties = useCallback(async () => {
    setLoadingProperties(true)
    setErrorProperties(null)
    try {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("purpose", "Temporada")
        .order("title", { ascending: true })

      if (error) {
        throw error
      }
      setProperties(data || [])
    } catch (err: any) {
      console.error("Erro ao buscar imóveis:", err.message)
      setErrorProperties("Falha ao carregar imóveis. Tente novamente.")
    } finally {
      setLoadingProperties(false)
    }
  }, [])

  const fetchRentals = useCallback(async () => {
    setLoadingRentals(true)
    setErrorRentals(null)
    try {
      let query = supabase.from("seasonal_rentals").select("*")

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter)
      }

      if (searchTerm) {
        query = query.or(`property_name.ilike.%${searchTerm}%,tenant_name.ilike.%${searchTerm}%`)
      }

      const { data, error } = await query.order("created_at", { ascending: false })

      if (error) {
        throw error
      }
      setRentals(data || [])
    } catch (err: any) {
      console.error("Erro ao buscar aluguéis:", err.message)
      setErrorRentals("Falha ao carregar aluguéis. Tente novamente.")
    } finally {
      setLoadingRentals(false)
    }
  }, [statusFilter, searchTerm])

  useEffect(() => {
    fetchProperties()
  }, [fetchProperties])

  useEffect(() => {
    fetchRentals()
  }, [fetchRentals])

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString("pt-BR")
  }

  const calculateDays = () => {
    if (!checkInDate || !checkOutDate) return 0
    const startDate = new Date(checkInDate)
    const endDate = new Date(checkOutDate)
    const timeDiff = endDate.getTime() - startDate.getTime()
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24))
    return daysDiff > 0 ? daysDiff : 0
  }

  const calculateTotal = () => {
    const days = calculateDays()
    const daily = Number.parseFloat(dailyRate) || 0
    return days * daily
  }

  const handlePropertyChange = (propertyId: string) => {
    setSelectedPropertyId(propertyId)
    const property = properties.find((p) => p.id === propertyId)
    if (property) {
      setPropertyName(property.title)
      if (property.daily_rate) {
        setDailyRate(property.daily_rate.toString())
      }
    }
  }

  const resetForm = () => {
    setPropertyName("")
    setSelectedPropertyId("")
    setTenantName("")
    setTenantPhone("")
    setCheckInDate("")
    setCheckOutDate("")
    setDailyRate("")
    setNotes("")
    setEditingRental(null)
    setShowRentalForm(false)
  }

  const handleCreateOrUpdateRental = async () => {
    if (!propertyName || !tenantName || !checkInDate || !checkOutDate || !dailyRate) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      })
      return
    }

    const totalDays = calculateDays()
    const totalAmount = calculateTotal()

    const rentalData = {
      property_id: selectedPropertyId || null,
      property_name: propertyName,
      tenant_name: tenantName,
      tenant_phone: tenantPhone || null,
      check_in_date: checkInDate,
      check_out_date: checkOutDate,
      daily_rate: Number.parseFloat(dailyRate),
      total_days: totalDays,
      total_amount: totalAmount,
      status: editingRental ? editingRental.status : "pending",
      notes: notes || null,
    }

    try {
      if (editingRental) {
        const { error } = await supabase.from("seasonal_rentals").update(rentalData).eq("id", editingRental.id)

        if (error) throw error
        toast({
          title: "Aluguel atualizado!",
          description: `O aluguel para ${tenantName} foi atualizado com sucesso.`,
        })
      } else {
        const { error } = await supabase.from("seasonal_rentals").insert(rentalData)

        if (error) throw error
        toast({
          title: "Aluguel criado!",
          description: `Um novo aluguel para ${tenantName} foi criado com sucesso.`,
        })
      }
      resetForm()
      fetchRentals()
    } catch (err: any) {
      console.error("Erro ao salvar aluguel:", err.message)
      toast({
        title: "Erro ao salvar aluguel",
        description: `Falha ao salvar o aluguel: ${err.message}`,
        variant: "destructive",
      })
    }
  }

  const handleEditClick = (rental: SeasonalRental) => {
    setEditingRental(rental)
    setPropertyName(rental.property_name)
    setSelectedPropertyId(rental.property_id || "")
    setTenantName(rental.tenant_name)
    setTenantPhone(rental.tenant_phone || "")
    setCheckInDate(rental.check_in_date)
    setCheckOutDate(rental.check_out_date)
    setDailyRate(rental.daily_rate.toString())
    setNotes(rental.notes || "")
    setShowRentalForm(true)
  }

  const handleDeleteRental = async (id: string, tenantName: string) => {
    try {
      const { error } = await supabase.from("seasonal_rentals").delete().eq("id", id)

      if (error) throw error

      toast({
        title: "Aluguel excluído!",
        description: `O aluguel de ${tenantName} foi removido com sucesso.`,
      })
      fetchRentals()
    } catch (err: any) {
      console.error("Erro ao excluir aluguel:", err.message)
      toast({
        title: "Erro ao excluir aluguel",
        description: `Falha ao excluir o aluguel: ${err.message}`,
        variant: "destructive",
      })
    }
  }

  const handleStatusChange = async (rentalId: string, newStatus: string) => {
    try {
      const { error } = await supabase.from("seasonal_rentals").update({ status: newStatus }).eq("id", rentalId)

      if (error) throw error

      toast({
        title: "Status atualizado!",
        description: "O status do aluguel foi atualizado com sucesso.",
      })
      fetchRentals()
    } catch (err: any) {
      console.error("Erro ao atualizar status:", err.message)
      toast({
        title: "Erro ao atualizar status",
        description: `Falha ao atualizar o status: ${err.message}`,
        variant: "destructive",
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "checked_in":
        return "bg-blue-100 text-blue-800"
      case "checked_out":
        return "bg-purple-100 text-purple-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "confirmed":
        return "Confirmado"
      case "pending":
        return "Pendente"
      case "checked_in":
        return "Check-in"
      case "checked_out":
        return "Check-out"
      case "cancelled":
        return "Cancelado"
      default:
        return status
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Calendar className="h-6 w-6" />
            Gestão de Temporada
            <Button
              onClick={() => {
                resetForm()
                setShowRentalForm(true)
              }}
              className="bg-green-600 hover:bg-green-700"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Aluguel
            </Button>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative w-64">
              <Input
                placeholder="Buscar por imóvel ou locatário..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="confirmed">Confirmado</SelectItem>
                <SelectItem value="checked_in">Check-in</SelectItem>
                <SelectItem value="checked_out">Check-out</SelectItem>
                <SelectItem value="cancelled">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loadingRentals ? (
          <div className="flex justify-center items-center h-48">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <span className="ml-2 text-gray-600">Carregando aluguéis...</span>
          </div>
        ) : errorRentals ? (
          <div className="text-red-500 text-center py-4">{errorRentals}</div>
        ) : rentals.length === 0 ? (
          <div className="text-center text-gray-500 py-4">Nenhum aluguel encontrado.</div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Imóvel</TableHead>
                  <TableHead>Locatário</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Check-in</TableHead>
                  <TableHead>Check-out</TableHead>
                  <TableHead>Dias</TableHead>
                  <TableHead>Diária</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rentals.map((rental) => (
                  <TableRow key={rental.id}>
                    <TableCell className="font-medium">{rental.property_name}</TableCell>
                    <TableCell>{rental.tenant_name}</TableCell>
                    <TableCell>{rental.tenant_phone || "N/A"}</TableCell>
                    <TableCell>{formatDate(rental.check_in_date)}</TableCell>
                    <TableCell>{formatDate(rental.check_out_date)}</TableCell>
                    <TableCell>{rental.total_days}</TableCell>
                    <TableCell>
                      {rental.daily_rate.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </TableCell>
                    <TableCell>
                      {rental.total_amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </TableCell>
                    <TableCell>
                      <Select value={rental.status} onValueChange={(value) => handleStatusChange(rental.id, value)}>
                        <SelectTrigger className="w-32">
                          <SelectValue>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(rental.status)}`}
                            >
                              {getStatusLabel(rental.status)}
                            </span>
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pendente</SelectItem>
                          <SelectItem value="confirmed">Confirmado</SelectItem>
                          <SelectItem value="checked_in">Check-in</SelectItem>
                          <SelectItem value="checked_out">Check-out</SelectItem>
                          <SelectItem value="cancelled">Cancelado</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleEditClick(rental)} className="h-8 w-8">
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Editar</span>
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700">
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Excluir</span>
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta ação não pode ser desfeita. Isso excluirá permanentemente o aluguel de{" "}
                                <span className="font-semibold">{rental.tenant_name}</span> para o imóvel{" "}
                                <span className="font-semibold">{rental.property_name}</span>.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteRental(rental.id, rental.tenant_name)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      {showRentalForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-[600px] max-w-[90vw] max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">{editingRental ? "Editar Aluguel" : "Novo Aluguel"}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Imóvel *</label>
                {properties.length > 0 ? (
                  <select
                    className="w-full p-2 border rounded-md"
                    value={selectedPropertyId}
                    onChange={(e) => handlePropertyChange(e.target.value)}
                  >
                    <option value="">Selecione um imóvel</option>
                    {properties.map((property) => (
                      <option key={property.id} value={property.id}>
                        {property.title} -{" "}
                        {property.daily_rate?.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) || "N/A"}
                        /dia
                      </option>
                    ))}
                  </select>
                ) : (
                  <Input
                    placeholder="Nome do imóvel"
                    value={propertyName}
                    onChange={(e) => setPropertyName(e.target.value)}
                    required
                  />
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nome do Locatário *</label>
                  <Input
                    placeholder="Nome completo"
                    value={tenantName}
                    onChange={(e) => setTenantName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Telefone do Locatário</label>
                  <Input
                    placeholder="(00) 00000-0000"
                    value={tenantPhone}
                    onChange={(e) => setTenantPhone(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Check-in *</label>
                  <Input type="date" value={checkInDate} onChange={(e) => setCheckInDate(e.target.value)} required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Check-out *</label>
                  <Input type="date" value={checkOutDate} onChange={(e) => setCheckOutDate(e.target.value)} required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Valor da Diária (R$) *</label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0,00"
                    value={dailyRate}
                    onChange={(e) => setDailyRate(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Observações</label>
                <textarea
                  className="w-full p-2 border rounded-md resize-none"
                  rows={3}
                  placeholder="Observações adicionais sobre o aluguel..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Período:</span>
                  <span>
                    {calculateDays()} {calculateDays() === 1 ? "dia" : "dias"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Valor da Diária:</span>
                  <span>
                    {(Number.parseFloat(dailyRate) || 0).toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </span>
                </div>
                <hr className="my-2" />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total:</span>
                  <span className="text-green-600">
                    {calculateTotal().toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={resetForm}>
                Cancelar
              </Button>
              <Button className="bg-green-600 hover:bg-green-700" onClick={handleCreateOrUpdateRental}>
                {editingRental ? "Salvar Alterações" : "Criar Aluguel"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}
