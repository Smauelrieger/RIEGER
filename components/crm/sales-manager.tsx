"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  Plus,
  Search,
  DollarSign,
  TrendingUp,
  Calendar,
  User,
  Home,
  Edit,
  Trash2,
  Trophy,
  BarChart3,
  Loader2,
  Wallet,
  Percent,
} from "lucide-react"
import {
  supabase,
  type Sale,
  type PaymentSchedule,
  type CommissionSchedule,
  type User as SupabaseUser,
} from "@/lib/supabase"
import { toast } from "sonner"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

export function SalesManager() {
  const [sales, setSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSemester, setSelectedSemester] = useState("all")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // State for Sale Payments
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [currentSaleIdForPayments, setCurrentSaleIdForPayments] = useState<string | null>(null)
  const [paymentSchedules, setPaymentSchedules] = useState<PaymentSchedule[]>([])
  const [newPayment, setNewPayment] = useState({
    payment_date: new Date().toISOString().split("T")[0],
    amount: "",
    description: "",
    status: "Pendente" as const,
  })
  const [editingPayment, setEditingPayment] = useState<PaymentSchedule | null>(null)

  // State for Commission Payments
  const [isCommissionModalOpen, setIsCommissionModalOpen] = useState(false)
  const [currentSaleIdForCommissions, setCurrentSaleIdForCommissions] = useState<string | null>(null)
  const [commissionSchedules, setCommissionSchedules] = useState<CommissionSchedule[]>([])
  const [newCommissionPayment, setNewCommissionPayment] = useState({
    payment_date: new Date().toISOString().split("T")[0],
    amount: "",
    description: "",
    status: "Pendente" as const,
  })
  const [editingCommissionPayment, setEditingCommissionPayment] = useState<CommissionSchedule | null>(null)

  const [currentUser, setCurrentUser] = useState<SupabaseUser | null>(null)

  // Fetch current user's role and name
  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        const { data: userData, error } = await supabase.from("users").select("name, role").eq("id", user.id).single()
        if (error) {
          console.error("Error fetching user role:", error)
          toast.error("Erro ao carregar informações do usuário.")
        } else {
          setCurrentUser(userData as SupabaseUser)
        }
      }
    }
    fetchUser()
  }, [])

  const [newSale, setNewSale] = useState({
    property_name: "",
    client_name: "",
    agent_name: "",
    value: "",
    commission: "", // Total commission
    commission_installments: "", // Novo campo
    status: "Em Andamento" as const,
    sale_date: new Date().toISOString().split("T")[0],
    type: "Venda" as const,
    observations: "",
    partnership: false,
    vgv: "",
  })

  // Carregar vendas do Supabase
  useEffect(() => {
    loadSales()
  }, [])

  const loadSales = async () => {
    try {
      const { data, error } = await supabase.from("sales").select("*").order("sale_date", { ascending: false })

      if (error) throw error
      setSales(data || [])
    } catch (error) {
      console.error("Erro ao carregar vendas:", error)
      toast.error("Erro ao carregar vendas")
    } finally {
      setLoading(false)
    }
  }

  // --- Payment Schedules (Recebimentos de Venda) ---
  const loadPaymentSchedules = async (saleId: string) => {
    try {
      const { data, error } = await supabase
        .from("payment_schedules")
        .select("*")
        .eq("sale_id", saleId)
        .order("payment_date", { ascending: true })

      if (error) throw error
      setPaymentSchedules(data || [])
    } catch (error) {
      console.error("Erro ao carregar cronograma de recebimentos:", error)
      toast.error("Erro ao carregar cronograma de recebimentos.")
    }
  }

  const handleOpenPaymentModal = (saleId: string) => {
    setCurrentSaleIdForPayments(saleId)
    loadPaymentSchedules(saleId)
    setIsPaymentModalOpen(true)
  }

  const handleAddOrUpdatePayment = async () => {
    if (!currentSaleIdForPayments || !newPayment.payment_date || !newPayment.amount) {
      toast.error("Por favor, preencha a data e o valor do recebimento.")
      return
    }

    setIsSubmitting(true)

    try {
      const paymentData = {
        sale_id: currentSaleIdForPayments,
        payment_date: newPayment.payment_date,
        amount: Number.parseFloat(newPayment.amount.replace(/[R$.,\s]/g, "")),
        description: newPayment.description || null,
        status: newPayment.status,
      }

      let error = null
      let insertedPaymentId = null

      if (editingPayment) {
        const { error: updateError } = await supabase
          .from("payment_schedules")
          .update(paymentData)
          .eq("id", editingPayment.id)
        error = updateError
        insertedPaymentId = editingPayment.id
      } else {
        const { data, error: insertError } = await supabase
          .from("payment_schedules")
          .insert([paymentData])
          .select("id")
          .single()
        error = insertError
        insertedPaymentId = data?.id
      }

      if (error) throw error

      // Create or update calendar event
      const sale = sales.find((s) => s.id === currentSaleIdForPayments)
      if (sale && insertedPaymentId) {
        const calendarEventData = {
          title: `Recebimento Venda: ${sale.property_name} - R$ ${newPayment.amount}`,
          type: "recebimento_venda" as const,
          event_date: newPayment.payment_date,
          event_time: "09:00:00", // Default time for payments
          description: newPayment.description || `Recebimento referente à venda de ${sale.property_name}`,
          amount: Number.parseFloat(newPayment.amount.replace(/[R$.,\s]/g, "")),
          sale_id: currentSaleIdForPayments,
          payment_schedule_id: insertedPaymentId,
          status: newPayment.status === "Recebido" ? "concluido" : "pendente",
          priority: "alta" as const,
        }

        if (editingPayment) {
          const { data: existingEvent, error: eventError } = await supabase
            .from("calendar_events")
            .select("*")
            .eq("payment_schedule_id", editingPayment.id)
            .single()

          if (eventError && eventError.code !== "PGRST116") {
            console.error("Error fetching existing calendar event:", eventError)
          }

          if (existingEvent) {
            await supabase.from("calendar_events").update(calendarEventData).eq("id", existingEvent.id)
          } else {
            await supabase.from("calendar_events").insert([calendarEventData])
          }
        } else {
          await supabase.from("calendar_events").insert([calendarEventData])
        }
      }

      toast.success(editingPayment ? "Recebimento atualizado com sucesso!" : "Recebimento adicionado com sucesso!")
      setNewPayment({
        payment_date: new Date().toISOString().split("T")[0],
        amount: "",
        description: "",
        status: "Pendente",
      })
      setEditingPayment(null)
      loadPaymentSchedules(currentSaleIdForPayments)
    } catch (error) {
      console.error("Erro ao salvar recebimento:", error)
      toast.error("Erro ao salvar recebimento.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeletePayment = async (paymentId: string) => {
    if (!confirm("Tem certeza que deseja excluir este recebimento?")) return

    try {
      const { error } = await supabase.from("payment_schedules").delete().eq("id", paymentId)
      if (error) throw error

      await supabase.from("calendar_events").delete().eq("payment_schedule_id", paymentId)

      toast.success("Recebimento excluído com sucesso!")
      loadPaymentSchedules(currentSaleIdForPayments!)
    } catch (error) {
      console.error("Erro ao excluir recebimento:", error)
      toast.error("Erro ao excluir recebimento.")
    }
  }

  const handleEditPayment = (payment: PaymentSchedule) => {
    setEditingPayment(payment)
    setNewPayment({
      payment_date: payment.payment_date,
      amount: payment.amount.toString(),
      description: payment.description || "",
      status: payment.status,
    })
  }

  // --- Commission Schedules (Parcelas de Comissão) ---
  const loadCommissionSchedules = async (saleId: string) => {
    try {
      const { data, error } = await supabase
        .from("commission_schedules")
        .select("*")
        .eq("sale_id", saleId)
        .order("payment_date", { ascending: true })

      if (error) throw error
      setCommissionSchedules(data || [])
    } catch (error) {
      console.error("Erro ao carregar cronograma de comissões:", error)
      toast.error("Erro ao carregar cronograma de comissões.")
    }
  }

  const handleOpenCommissionModal = (saleId: string) => {
    setCurrentSaleIdForCommissions(saleId)
    loadCommissionSchedules(saleId)
    setIsCommissionModalOpen(true)
  }

  const handleAddOrUpdateCommissionPayment = async () => {
    if (!currentSaleIdForCommissions || !newCommissionPayment.payment_date || !newCommissionPayment.amount) {
      toast.error("Por favor, preencha a data e o valor da parcela de comissão.")
      return
    }

    setIsSubmitting(true)

    try {
      const commissionPaymentData = {
        sale_id: currentSaleIdForCommissions,
        payment_date: newCommissionPayment.payment_date,
        amount: Number.parseFloat(newCommissionPayment.amount.replace(/[R$.,\s]/g, "")),
        description: newCommissionPayment.description || null,
        status: newCommissionPayment.status,
      }

      let error = null
      let insertedCommissionPaymentId = null

      if (editingCommissionPayment) {
        const { error: updateError } = await supabase
          .from("commission_schedules")
          .update(commissionPaymentData)
          .eq("id", editingCommissionPayment.id)
        error = updateError
        insertedCommissionPaymentId = editingCommissionPayment.id
      } else {
        const { data, error: insertError } = await supabase
          .from("commission_schedules")
          .insert([commissionPaymentData])
          .select("id")
          .single()
        error = insertError
        insertedCommissionPaymentId = data?.id
      }

      if (error) throw error

      // Create or update calendar event
      const sale = sales.find((s) => s.id === currentSaleIdForCommissions)
      if (sale && insertedCommissionPaymentId) {
        const calendarEventData = {
          title: `Recebimento Comissão: ${sale.agent_name} - R$ ${newCommissionPayment.amount}`,
          type: "recebimento_comissao" as const,
          event_date: newCommissionPayment.payment_date,
          event_time: "10:00:00", // Default time for commission payments
          description: newCommissionPayment.description || `Recebimento de comissão da venda de ${sale.property_name}`,
          amount: Number.parseFloat(newCommissionPayment.amount.replace(/[R$.,\s]/g, "")),
          sale_id: currentSaleIdForCommissions,
          commission_schedule_id: insertedCommissionPaymentId,
          status: newCommissionPayment.status === "Recebido" ? "concluido" : "pendente",
          priority: "alta" as const,
        }

        if (editingCommissionPayment) {
          const { data: existingEvent, error: eventError } = await supabase
            .from("calendar_events")
            .select("*")
            .eq("commission_schedule_id", editingCommissionPayment.id)
            .single()

          if (eventError && eventError.code !== "PGRST116") {
            console.error("Error fetching existing calendar event:", eventError)
          }

          if (existingEvent) {
            await supabase.from("calendar_events").update(calendarEventData).eq("id", existingEvent.id)
          } else {
            await supabase.from("calendar_events").insert([calendarEventData])
          }
        } else {
          await supabase.from("calendar_events").insert([calendarEventData])
        }
      }

      toast.success(
        editingCommissionPayment ? "Parcela de comissão atualizada!" : "Parcela de comissão adicionada com sucesso!",
      )
      setNewCommissionPayment({
        payment_date: new Date().toISOString().split("T")[0],
        amount: "",
        description: "",
        status: "Pendente",
      })
      setEditingCommissionPayment(null)
      loadCommissionSchedules(currentSaleIdForCommissions)
    } catch (error) {
      console.error("Erro ao salvar parcela de comissão:", error)
      toast.error("Erro ao salvar parcela de comissão.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteCommissionPayment = async (commissionPaymentId: string) => {
    if (!confirm("Tem certeza que deseja excluir esta parcela de comissão?")) return

    try {
      const { error } = await supabase.from("commission_schedules").delete().eq("id", commissionPaymentId)
      if (error) throw error

      await supabase.from("calendar_events").delete().eq("commission_schedule_id", commissionPaymentId)

      toast.success("Parcela de comissão excluída com sucesso!")
      loadCommissionSchedules(currentSaleIdForCommissions!)
    } catch (error) {
      console.error("Erro ao excluir parcela de comissão:", error)
      toast.error("Erro ao excluir parcela de comissão.")
    }
  }

  const handleEditCommissionPayment = (commissionPayment: CommissionSchedule) => {
    setEditingCommissionPayment(commissionPayment)
    setNewCommissionPayment({
      payment_date: commissionPayment.payment_date,
      amount: commissionPayment.amount.toString(),
      description: commissionPayment.description || "",
      status: commissionPayment.status,
    })
  }

  // --- General Sale Management ---
  const handleAddSale = async () => {
    if (!newSale.property_name || !newSale.agent_name || !newSale.value) {
      toast.error("Por favor, preencha os campos obrigatórios: Propriedade, Corretor e Valor.")
      return
    }

    setIsSubmitting(true)

    try {
      const semester = new Date(newSale.sale_date).getMonth() < 6 ? "1º Semestre" : "2º Semestre"

      const saleData = {
        property_name: newSale.property_name,
        client_name: newSale.client_name || null,
        agent_name: newSale.agent_name,
        value: Number.parseFloat(newSale.value.replace(/[R$.,\s]/g, "")),
        commission: newSale.commission ? Number.parseFloat(newSale.commission.replace(/[R$.,\s]/g, "")) : null,
        commission_installments: newSale.commission_installments
          ? Number.parseInt(newSale.commission_installments)
          : null, // Salva o número de parcelas
        status: newSale.status,
        sale_date: newSale.sale_date,
        type: newSale.type,
        semester: semester,
        observations: newSale.observations || null,
        partnership: newSale.partnership,
        vgv: newSale.vgv ? Number.parseFloat(newSale.vgv.replace(/[R$.,\s]/g, "")) : null,
      }

      const { error } = await supabase.from("sales").insert([saleData])

      if (error) throw error

      toast.success("Venda adicionada com sucesso!")
      setNewSale({
        property_name: "",
        client_name: "",
        agent_name: "",
        value: "",
        commission: "",
        commission_installments: "", // Limpa o campo
        status: "Em Andamento",
        sale_date: new Date().toISOString().split("T")[0],
        type: "Venda",
        observations: "",
        partnership: false,
        vgv: "",
      })
      setIsModalOpen(false)
      loadSales()
    } catch (error) {
      console.error("Erro ao adicionar venda:", error)
      toast.error("Erro ao adicionar venda")
    } finally {
      setIsSubmitting(false)
    }
  }

  const deleteSale = async (id: string) => {
    if (
      !confirm(
        "Tem certeza que deseja excluir esta venda? Isso também excluirá todos os recebimentos e parcelas de comissão associados.",
      )
    )
      return

    try {
      const { error } = await supabase.from("sales").delete().eq("id", id)

      if (error) throw error

      // Cascade delete should handle payment_schedules and commission_schedules
      // Also delete associated calendar events
      await supabase.from("calendar_events").delete().eq("sale_id", id)

      toast.success("Venda excluída com sucesso!")
      loadSales()
    } catch (error) {
      console.error("Erro ao excluir venda:", error)
      toast.error("Erro ao excluir venda")
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Concluída":
        return "bg-green-100 text-green-800"
      case "Em Andamento":
        return "bg-yellow-100 text-yellow-800"
      case "Cancelada":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Venda":
        return "bg-blue-100 text-blue-800"
      case "Permuta":
        return "bg-purple-100 text-purple-800"
      case "Aluguel":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "Pendente":
        return "bg-yellow-100 text-yellow-800"
      case "Recebido":
        return "bg-green-100 text-green-800"
      case "Atrasado":
        return "bg-red-100 text-red-800"
      case "Cancelado":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Calcular ranking de corretores
  const getAgentRanking = () => {
    const agentStats: Record<string, any> = {}

    sales
      .filter((sale) => sale.status === "Concluída")
      .forEach((sale) => {
        if (!agentStats[sale.agent_name]) {
          agentStats[sale.agent_name] = {
            name: sale.agent_name,
            totalSales: 0,
            totalValue: 0,
            totalCommission: 0,
            salesCount: 0,
          }
        }

        agentStats[sale.agent_name].totalValue += sale.value
        agentStats[sale.agent_name].totalCommission += sale.commission || 0
        agentStats[sale.agent_name].salesCount += 1
      })

    return Object.values(agentStats).sort((a: any, b: any) => b.totalCommission - a.totalCommission)
  }

  // Calcular vendas por semestre
  const getSemesterStats = () => {
    const semesterStats = {
      "1º Semestre": { count: 0, value: 0, commission: 0 },
      "2º Semestre": { count: 0, value: 0, commission: 0 },
    }

    sales
      .filter((sale) => sale.status === "Concluída")
      .forEach((sale) => {
        const semester = sale.semester || "1º Semestre"
        semesterStats[semester].count += 1
        semesterStats[semester].value += sale.value
        semesterStats[semester].commission += sale.commission || 0
      })

    return semesterStats
  }

  const filteredSales = sales.filter((sale) => {
    const matchesSearch =
      sale.property_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (sale.client_name && sale.client_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      sale.agent_name.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesSemester = selectedSemester === "all" || sale.semester === selectedSemester

    return matchesSearch && matchesSemester
  })

  const agentRanking = getAgentRanking()
  const semesterStats = getSemesterStats()
  const totalSales = sales.filter((sale) => sale.status === "Concluída").length
  const totalValue = sales.filter((sale) => sale.status === "Concluída").reduce((acc, sale) => acc + sale.value, 0)

  const totalCommission = sales
    .filter((sale) => sale.status === "Concluída")
    .reduce((acc, sale) => acc + (sale.commission || 0), 0)

  // Check if current user can view private schedules (payments or commissions)
  const canViewPrivateSchedules = (saleAgentName: string) => {
    if (!currentUser) return false
    return currentUser.role === "admin" || currentUser.name === saleAgentName
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Vendas 2025</h1>
          <p className="text-gray-600">Acompanhe todas as vendas e comissões do ano</p>
        </div>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Nova Venda
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Adicionar Nova Venda</DialogTitle>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="property_name">Propriedade *</Label>
                <Input
                  id="property_name"
                  value={newSale.property_name}
                  onChange={(e) => setNewSale({ ...newSale, property_name: e.target.value })}
                  placeholder="Nome da propriedade"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="client_name">Cliente</Label>
                <Input
                  id="client_name"
                  value={newSale.client_name}
                  onChange={(e) => setNewSale({ ...newSale, client_name: e.target.value })}
                  placeholder="Nome do cliente"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="agent_name">Corretor *</Label>
                <Select
                  value={newSale.agent_name}
                  onValueChange={(value) => setNewSale({ ...newSale, agent_name: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o corretor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Samuel">Samuel</SelectItem>
                    <SelectItem value="Edilson">Edilson</SelectItem>
                    <SelectItem value="Felipe">Felipe</SelectItem>
                    <SelectItem value="Alan">Alan</SelectItem>
                    <SelectItem value="Anderson">Anderson</SelectItem>
                    <SelectItem value="Ricardo">Ricardo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Tipo *</Label>
                <Select
                  value={newSale.type}
                  onValueChange={(value: "Venda" | "Aluguel" | "Permuta") => setNewSale({ ...newSale, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Venda">Venda</SelectItem>
                    <SelectItem value="Aluguel">Aluguel</SelectItem>
                    <SelectItem value="Permuta">Permuta</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="value">Valor *</Label>
                <Input
                  id="value"
                  value={newSale.value}
                  onChange={(e) => setNewSale({ ...newSale, value: e.target.value })}
                  placeholder="850000.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="commission">Comissão Total</Label>
                <Input
                  id="commission"
                  value={newSale.commission}
                  onChange={(e) => setNewSale({ ...newSale, commission: e.target.value })}
                  placeholder="42500.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="commission_installments">Parcelas Comissão</Label>
                <Input
                  id="commission_installments"
                  type="number"
                  value={newSale.commission_installments}
                  onChange={(e) => setNewSale({ ...newSale, commission_installments: e.target.value })}
                  placeholder="Ex: 3"
                  min="1"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sale_date">Data</Label>
                <Input
                  id="sale_date"
                  type="date"
                  value={newSale.sale_date}
                  onChange={(e) => setNewSale({ ...newSale, sale_date: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={newSale.partnership}
                    onChange={(e) => setNewSale({ ...newSale, partnership: e.target.checked })}
                    className="rounded"
                  />
                  <span>Parceria</span>
                </Label>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="observations">Observações</Label>
                <Textarea
                  id="observations"
                  value={newSale.observations}
                  onChange={(e) => setNewSale({ ...newSale, observations: e.target.value })}
                  placeholder="Observações sobre a venda"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={newSale.status}
                  onValueChange={(value: "Em Andamento" | "Concluída" | "Cancelada") =>
                    setNewSale({ ...newSale, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Em Andamento">Em Andamento</SelectItem>
                    <SelectItem value="Concluída">Concluída</SelectItem>
                    <SelectItem value="Cancelada">Cancelada</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="vgv">VGV</Label>
                <Input
                  id="vgv"
                  value={newSale.vgv}
                  onChange={(e) => setNewSale({ ...newSale, vgv: e.target.value })}
                  placeholder="15873666.32"
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddSale} className="bg-blue-600 hover:bg-blue-700" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Salvar Venda
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Vendas Concluídas</p>
                <p className="text-xl font-bold">{totalSales}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Valor Total</p>
                <p className="text-xl font-bold">R$ {(totalValue / 1000000).toFixed(1)}M</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">Comissões</p>
                <p className="text-xl font-bold">R$ {(totalCommission / 1000).toFixed(0)}K</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-sm text-gray-600">Ano 2025</p>
                <p className="text-xl font-bold">{sales.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ranking de Corretores e Gráfico por Semestre */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ranking de Corretores */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Trophy className="w-5 h-5 mr-2 text-gold-500" />
              Ranking de Corretores 2025
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {agentRanking.map((agent: any, index) => (
                <div key={agent.name} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        index === 0
                          ? "bg-gold-100 text-gold-600"
                          : index === 1
                            ? "bg-gray-100 text-gray-600"
                            : index === 2
                              ? "bg-orange-100 text-orange-600"
                              : "bg-blue-100 text-blue-600"
                      }`}
                    >
                      <span className="text-sm font-bold">{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium">{agent.name}</p>
                      <p className="text-sm text-gray-500">{agent.salesCount} vendas</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">R$ {(agent.totalCommission / 1000).toFixed(0)}K</p>
                    <p className="text-xs text-gray-500">comissão</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Vendas por Semestre */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-blue-500" />
              Vendas por Semestre 2025
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {Object.entries(semesterStats).map(([semester, stats]) => (
                <div key={semester} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{semester}</span>
                    <span className="text-sm text-gray-500">{stats.count} vendas</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Valor Total:</span>
                      <span className="font-medium text-green-600">R$ {(stats.value / 1000000).toFixed(1)}M</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Comissões:</span>
                      <span className="font-medium text-blue-600">R$ {(stats.commission / 1000).toFixed(0)}K</span>
                    </div>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full">
                    <div
                      className="h-2 bg-blue-600 rounded-full"
                      style={{ width: `${totalSales > 0 ? (stats.count / totalSales) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Buscar vendas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedSemester} onValueChange={setSelectedSemester}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Semestres</SelectItem>
            <SelectItem value="1º Semestre">1º Semestre</SelectItem>
            <SelectItem value="2º Semestre">2º Semestre</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSales.map((sale) => (
          <Card key={sale.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg flex items-center">
                    <Home className="w-5 h-5 mr-2 text-blue-600" />
                    {sale.property_name}
                  </CardTitle>
                  <div className="flex space-x-2 mt-2">
                    <Badge className={getStatusColor(sale.status)}>{sale.status}</Badge>
                    <Badge className={getTypeColor(sale.type)}>{sale.type}</Badge>
                    <Badge variant="outline">{sale.semester}</Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  {sale.client_name && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <User className="w-4 h-4" />
                      <span>Cliente: {sale.client_name}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <User className="w-4 h-4" />
                    <span>Corretor: {sale.agent_name}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>Data: {new Date(sale.sale_date).toLocaleDateString("pt-BR")}</span>
                  </div>
                  {sale.partnership && (
                    <div className="flex items-center space-x-2 text-sm text-orange-600">
                      <span>🤝 Parceria</span>
                    </div>
                  )}
                </div>

                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Valor:</span>
                      <span className="font-bold text-green-600">R$ {sale.value.toLocaleString("pt-BR")}</span>
                    </div>
                    {sale.commission && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Comissão Total:</span>
                        <span className="font-bold text-blue-600">R$ {sale.commission.toLocaleString("pt-BR")}</span>
                      </div>
                    )}
                    {sale.commission_installments && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Parcelas Comissão:</span>
                        <span className="font-bold text-blue-600">{sale.commission_installments}x</span>
                      </div>
                    )}
                    {sale.vgv && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">VGV:</span>
                        <span className="font-bold text-purple-600">R$ {sale.vgv.toLocaleString("pt-BR")}</span>
                      </div>
                    )}
                  </div>
                </div>

                {sale.observations && (
                  <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                    <strong>Obs:</strong> {sale.observations}
                  </div>
                )}

                {canViewPrivateSchedules(sale.agent_name) && (
                  <>
                    <div className="mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full flex items-center justify-center text-purple-600 hover:text-purple-700 bg-transparent"
                        onClick={() => handleOpenPaymentModal(sale.id)}
                      >
                        <Wallet className="w-4 h-4 mr-2" />
                        Cronograma de Recebimentos
                      </Button>
                    </div>
                    <div className="mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full flex items-center justify-center text-indigo-600 hover:text-indigo-700 bg-transparent"
                        onClick={() => handleOpenCommissionModal(sale.id)}
                      >
                        <Percent className="w-4 h-4 mr-2" />
                        Parcelas de Comissão
                      </Button>
                    </div>
                  </>
                )}

                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                    <Edit className="w-4 h-4 mr-1" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700 bg-transparent"
                    onClick={() => deleteSale(sale.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal de Cronograma de Recebimentos (Venda) */}
      <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Cronograma de Recebimentos (Venda)</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <h3 className="text-lg font-semibold">Adicionar/Editar Recebimento</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="payment_date">Data do Recebimento *</Label>
                <Input
                  id="payment_date"
                  type="date"
                  value={newPayment.payment_date}
                  onChange={(e) => setNewPayment({ ...newPayment, payment_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="payment_amount">Valor *</Label>
                <Input
                  id="payment_amount"
                  value={newPayment.amount}
                  onChange={(e) => setNewPayment({ ...newPayment, amount: e.target.value })}
                  placeholder="Ex: 15000.00"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="payment_description">Descrição</Label>
                <Textarea
                  id="payment_description"
                  value={newPayment.description}
                  onChange={(e) => setNewPayment({ ...newPayment, description: e.target.value })}
                  placeholder="Ex: Parcela inicial, Comissão final"
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="payment_status">Status</Label>
                <Select
                  value={newPayment.status}
                  onValueChange={(value: "Pendente" | "Recebido" | "Atrasado" | "Cancelado") =>
                    setNewPayment({ ...newPayment, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pendente">Pendente</SelectItem>
                    <SelectItem value="Recebido">Recebido</SelectItem>
                    <SelectItem value="Atrasado">Atrasado</SelectItem>
                    <SelectItem value="Cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setEditingPayment(null)
                  setNewPayment({
                    payment_date: new Date().toISOString().split("T")[0],
                    amount: "",
                    description: "",
                    status: "Pendente",
                  })
                }}
              >
                Limpar
              </Button>
              <Button
                onClick={handleAddOrUpdatePayment}
                className="bg-blue-600 hover:bg-blue-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {editingPayment ? "Atualizar Recebimento" : "Adicionar Recebimento"}
              </Button>
            </div>

            <h3 className="text-lg font-semibold mt-6">Recebimentos Cadastrados</h3>
            {paymentSchedules.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Nenhum recebimento cadastrado para esta venda.</p>
            ) : (
              <div className="space-y-3">
                {paymentSchedules.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Wallet className="w-5 h-5 text-purple-500" />
                      <div>
                        <p className="font-medium text-sm">
                          R${" "}
                          {payment.amount.toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </p>
                        <p className="text-xs text-gray-500">
                          {format(new Date(payment.payment_date), "dd/MM/yyyy", { locale: ptBR })}
                          {payment.description && ` - ${payment.description}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getPaymentStatusColor(payment.status)}>{payment.status}</Badge>
                      <Button variant="outline" size="sm" onClick={() => handleEditPayment(payment)}>
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 bg-transparent"
                        onClick={() => handleDeletePayment(payment.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPaymentModalOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Parcelas de Comissão */}
      <Dialog open={isCommissionModalOpen} onOpenChange={setIsCommissionModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Parcelas de Comissão</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <h3 className="text-lg font-semibold">Adicionar/Editar Parcela de Comissão</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="commission_payment_date">Data do Recebimento *</Label>
                <Input
                  id="commission_payment_date"
                  type="date"
                  value={newCommissionPayment.payment_date}
                  onChange={(e) => setNewCommissionPayment({ ...newCommissionPayment, payment_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="commission_payment_amount">Valor *</Label>
                <Input
                  id="commission_payment_amount"
                  value={newCommissionPayment.amount}
                  onChange={(e) => setNewCommissionPayment({ ...newCommissionPayment, amount: e.target.value })}
                  placeholder="Ex: 5000.00"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="commission_payment_description">Descrição</Label>
                <Textarea
                  id="commission_payment_description"
                  value={newCommissionPayment.description}
                  onChange={(e) => setNewCommissionPayment({ ...newCommissionPayment, description: e.target.value })}
                  placeholder="Ex: 1ª Parcela, Saldo final"
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="commission_payment_status">Status</Label>
                <Select
                  value={newCommissionPayment.status}
                  onValueChange={(value: "Pendente" | "Recebido" | "Atrasado" | "Cancelado") =>
                    setNewCommissionPayment({ ...newCommissionPayment, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pendente">Pendente</SelectItem>
                    <SelectItem value="Recebido">Recebido</SelectItem>
                    <SelectItem value="Atrasado">Atrasado</SelectItem>
                    <SelectItem value="Cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setEditingCommissionPayment(null)
                  setNewCommissionPayment({
                    payment_date: new Date().toISOString().split("T")[0],
                    amount: "",
                    description: "",
                    status: "Pendente",
                  })
                }}
              >
                Limpar
              </Button>
              <Button
                onClick={handleAddOrUpdateCommissionPayment}
                className="bg-blue-600 hover:bg-blue-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {editingCommissionPayment ? "Atualizar Parcela" : "Adicionar Parcela"}
              </Button>
            </div>

            <h3 className="text-lg font-semibold mt-6">Parcelas Cadastradas</h3>
            {commissionSchedules.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Nenhuma parcela de comissão cadastrada para esta venda.</p>
            ) : (
              <div className="space-y-3">
                {commissionSchedules.map((commissionPayment) => (
                  <div key={commissionPayment.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Percent className="w-5 h-5 text-indigo-500" />
                      <div>
                        <p className="font-medium text-sm">
                          R${" "}
                          {commissionPayment.amount.toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </p>
                        <p className="text-xs text-gray-500">
                          {format(new Date(commissionPayment.payment_date), "dd/MM/yyyy", { locale: ptBR })}
                          {commissionPayment.description && ` - ${commissionPayment.description}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getPaymentStatusColor(commissionPayment.status)}>
                        {commissionPayment.status}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditCommissionPayment(commissionPayment)}
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 bg-transparent"
                        onClick={() => handleDeleteCommissionPayment(commissionPayment.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCommissionModalOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
