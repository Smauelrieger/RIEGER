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
  CalendarIcon,
  MapPin,
  DollarSign,
  Home,
  User,
  Edit,
  Trash2,
  Loader2,
  Clock,
  Repeat,
  CalendarDays,
  Users,
  Building,
  FileText,
  Wallet,
  Percent,
  AlertCircle,
} from "lucide-react"
import { supabase, type CalendarEvent, type User as SupabaseUser } from "@/lib/supabase"
import { toast } from "sonner"
import {
  format,
  parseISO,
  isSameDay,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  addMonths,
  subMonths,
} from "date-fns"
import { ptBR } from "date-fns/locale"

export function CalendarManager() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [tableExists, setTableExists] = useState(false)

  const [newEvent, setNewEvent] = useState({
    title: "",
    type: "visita_cliente" as CalendarEvent["type"],
    event_date: new Date().toISOString().split("T")[0],
    event_time: "09:00",
    location: "",
    description: "",
    participants: [] as string[],
    amount: "",
    property_name: "",
    client_name: "",
    recipient: "",
    status: "agendado" as CalendarEvent["status"],
    priority: "media" as CalendarEvent["priority"],
    recurring: false,
    recurring_day: undefined as number | undefined,
  })

  const [currentUser, setCurrentUser] = useState<SupabaseUser | null>(null)

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

  useEffect(() => {
    checkTableExists()
  }, [])

  useEffect(() => {
    if (tableExists) {
      loadEvents()
    }
  }, [currentMonth, tableExists])

  const checkTableExists = async () => {
    try {
      const { data, error } = await supabase.from("calendar_events").select("count").limit(1)
      if (error) {
        if (error.message.includes("does not exist")) {
          setTableExists(false)
          toast.error("Tabela calendar_events não existe. Execute os scripts SQL primeiro.")
        } else {
          console.error("Erro ao verificar tabela:", error)
          toast.error("Erro ao verificar estrutura do banco de dados.")
        }
      } else {
        setTableExists(true)
      }
    } catch (error) {
      console.error("Erro ao verificar tabela:", error)
      setTableExists(false)
    } finally {
      setLoading(false)
    }
  }

  const loadEvents = async () => {
    if (!tableExists) return

    setLoading(true)
    try {
      const start = format(startOfMonth(currentMonth), "yyyy-MM-dd")
      const end = format(endOfMonth(currentMonth), "yyyy-MM-dd")

      const { data, error } = await supabase
        .from("calendar_events")
        .select("*")
        .gte("event_date", start)
        .lte("event_date", end)
        .order("event_date", { ascending: true })
        .order("event_time", { ascending: true })

      if (error) throw error
      setEvents(data || [])
    } catch (error) {
      console.error("Erro ao carregar eventos:", error)
      toast.error("Erro ao carregar eventos.")
    } finally {
      setLoading(false)
    }
  }

  const handleAddOrUpdateEvent = async () => {
    if (!tableExists) {
      toast.error("Tabela não existe. Execute os scripts SQL primeiro.")
      return
    }

    if (!newEvent.title || !newEvent.event_date || !newEvent.event_time || !newEvent.type) {
      toast.error("Por favor, preencha os campos obrigatórios: Título, Data, Hora e Tipo.")
      return
    }

    setIsSubmitting(true)

    try {
      const eventData = {
        title: newEvent.title,
        type: newEvent.type,
        event_date: newEvent.event_date,
        event_time: newEvent.event_time,
        location: newEvent.location || null,
        description: newEvent.description || null,
        participants: newEvent.participants.length > 0 ? newEvent.participants : null,
        amount: newEvent.amount ? Number.parseFloat(newEvent.amount.replace(/[R$.,\s]/g, "")) : null,
        property_name: newEvent.property_name || null,
        client_name: newEvent.client_name || null,
        recipient: newEvent.recipient || null,
        status: newEvent.status,
        priority: newEvent.priority,
        recurring: newEvent.recurring,
        recurring_day: newEvent.recurring ? new Date(newEvent.event_date).getDate() : null,
      }

      let error = null
      if (selectedEvent) {
        const { error: updateError } = await supabase
          .from("calendar_events")
          .update(eventData)
          .eq("id", selectedEvent.id)
        error = updateError
      } else {
        const { error: insertError } = await supabase.from("calendar_events").insert([eventData])
        error = insertError
      }

      if (error) throw error

      toast.success(selectedEvent ? "Evento atualizado com sucesso!" : "Evento adicionado com sucesso!")
      resetForm()
      setIsModalOpen(false)
      loadEvents()
    } catch (error) {
      console.error("Erro ao salvar evento:", error)
      toast.error("Erro ao salvar evento.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteEvent = async (id: string) => {
    if (!tableExists) {
      toast.error("Tabela não existe. Execute os scripts SQL primeiro.")
      return
    }

    if (!confirm("Tem certeza que deseja excluir este evento?")) return

    try {
      const { error } = await supabase.from("calendar_events").delete().eq("id", id)

      if (error) throw error

      toast.success("Evento excluído com sucesso!")
      loadEvents()
    } catch (error) {
      console.error("Erro ao excluir evento:", error)
      toast.error("Erro ao excluir evento.")
    }
  }

  const handleEditEvent = (event: CalendarEvent) => {
    setSelectedEvent(event)
    setNewEvent({
      title: event.title,
      type: event.type,
      event_date: event.event_date,
      event_time: event.event_time,
      location: event.location || "",
      description: event.description || "",
      participants: event.participants || [],
      amount: event.amount?.toString() || "",
      property_name: event.property_name || "",
      client_name: event.client_name || "",
      recipient: event.recipient || "",
      status: event.status,
      priority: event.priority,
      recurring: event.recurring,
      recurring_day: event.recurring_day || undefined,
    })
    setIsModalOpen(true)
  }

  const resetForm = () => {
    setSelectedEvent(null)
    setNewEvent({
      title: "",
      type: "visita_cliente",
      event_date: new Date().toISOString().split("T")[0],
      event_time: "09:00",
      location: "",
      description: "",
      participants: [],
      amount: "",
      property_name: "",
      client_name: "",
      recipient: "",
      status: "agendado",
      priority: "media",
      recurring: false,
      recurring_day: undefined,
    })
  }

  const getEventTypeIcon = (type: CalendarEvent["type"]) => {
    switch (type) {
      case "reuniao_construtora":
        return <Building className="w-4 h-4 text-blue-500" />
      case "conta_pagar":
        return <DollarSign className="w-4 h-4 text-red-500" />
      case "conta_fixa":
        return <FileText className="w-4 h-4 text-gray-500" />
      case "visita_cliente":
        return <User className="w-4 h-4 text-green-500" />
      case "reuniao_interna":
        return <Users className="w-4 h-4 text-purple-500" />
      case "vencimento_contrato":
        return <CalendarDays className="w-4 h-4 text-orange-500" />
      case "recebimento_venda":
        return <Wallet className="w-4 h-4 text-lime-600" />
      case "recebimento_comissao":
        return <Percent className="w-4 h-4 text-indigo-600" />
      default:
        return <CalendarIcon className="w-4 h-4 text-gray-500" />
    }
  }

  const getEventStatusColor = (status: CalendarEvent["status"]) => {
    switch (status) {
      case "agendado":
        return "bg-blue-100 text-blue-800"
      case "pendente":
        return "bg-yellow-100 text-yellow-800"
      case "concluido":
        return "bg-green-100 text-green-800"
      case "cancelado":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: CalendarEvent["priority"]) => {
    switch (priority) {
      case "alta":
        return "text-red-500"
      case "media":
        return "text-yellow-500"
      case "baixa":
        return "text-green-500"
      default:
        return "text-gray-500"
    }
  }

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  })

  const firstDayOfMonth = startOfMonth(currentMonth).getDay() // 0 for Sunday, 1 for Monday...
  const paddingDays = Array.from({ length: firstDayOfMonth }).map((_, i) => i)

  const goToPreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1))
  }

  const goToNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1))
  }

  const getEventsForDay = (day: Date) => {
    return events.filter((event) => isSameDay(parseISO(event.event_date), day))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  if (!tableExists) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <AlertCircle className="w-16 h-16 text-red-500" />
        <h2 className="text-2xl font-bold text-gray-900">Tabelas não encontradas</h2>
        <p className="text-gray-600 text-center max-w-md">
          As tabelas do banco de dados não foram criadas ainda. Execute os scripts SQL primeiro:
        </p>
        <div className="bg-gray-100 p-4 rounded-lg">
          <p className="text-sm font-mono">scripts/01-create-tables.sql</p>
          <p className="text-sm font-mono">scripts/02-insert-initial-data.sql</p>
        </div>
        <Button onClick={checkTableExists} className="mt-4">
          Verificar Novamente
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Calendário de Eventos</h1>
          <p className="text-gray-600">Gerencie seus compromissos e recebimentos</p>
        </div>

        <Dialog
          open={isModalOpen}
          onOpenChange={(open) => {
            setIsModalOpen(open)
            if (!open) resetForm()
          }}
        >
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Novo Evento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedEvent ? "Editar Evento" : "Adicionar Novo Evento"}</DialogTitle>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  placeholder="Título do evento"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Tipo *</Label>
                <Select
                  value={newEvent.type}
                  onValueChange={(value: CalendarEvent["type"]) => setNewEvent({ ...newEvent, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="visita_cliente">Visita a Cliente</SelectItem>
                    <SelectItem value="reuniao_interna">Reunião Interna</SelectItem>
                    <SelectItem value="reuniao_construtora">Reunião Construtora</SelectItem>
                    <SelectItem value="conta_pagar">Conta a Pagar</SelectItem>
                    <SelectItem value="conta_fixa">Conta Fixa</SelectItem>
                    <SelectItem value="vencimento_contrato">Vencimento de Contrato</SelectItem>
                    <SelectItem value="recebimento_venda">Recebimento de Venda</SelectItem>
                    <SelectItem value="recebimento_comissao">Recebimento de Comissão</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="event_date">Data *</Label>
                <Input
                  id="event_date"
                  type="date"
                  value={newEvent.event_date}
                  onChange={(e) => setNewEvent({ ...newEvent, event_date: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="event_time">Hora *</Label>
                <Input
                  id="event_time"
                  type="time"
                  value={newEvent.event_time}
                  onChange={(e) => setNewEvent({ ...newEvent, event_time: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Local</Label>
                <Input
                  id="location"
                  value={newEvent.location}
                  onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                  placeholder="Local do evento"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  placeholder="Detalhes do evento"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="participants">Participantes (separados por vírgula)</Label>
                <Input
                  id="participants"
                  value={newEvent.participants.join(", ")}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, participants: e.target.value.split(",").map((p) => p.trim()) })
                  }
                  placeholder="Nome 1, Nome 2"
                />
              </div>

              {(newEvent.type === "conta_pagar" ||
                newEvent.type === "conta_fixa" ||
                newEvent.type === "recebimento_venda" ||
                newEvent.type === "recebimento_comissao") && (
                <div className="space-y-2">
                  <Label htmlFor="amount">Valor</Label>
                  <Input
                    id="amount"
                    value={newEvent.amount}
                    onChange={(e) => setNewEvent({ ...newEvent, amount: e.target.value })}
                    placeholder="Ex: 1500.00"
                  />
                </div>
              )}

              {(newEvent.type === "visita_cliente" ||
                newEvent.type === "recebimento_venda" ||
                newEvent.type === "recebimento_comissao") && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="property_name">Propriedade</Label>
                    <Input
                      id="property_name"
                      value={newEvent.property_name}
                      onChange={(e) => setNewEvent({ ...newEvent, property_name: e.target.value })}
                      placeholder="Nome da propriedade"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="client_name">Cliente</Label>
                    <Input
                      id="client_name"
                      value={newEvent.client_name}
                      onChange={(e) => setNewEvent({ ...newEvent, client_name: e.target.value })}
                      placeholder="Nome do cliente"
                    />
                  </div>
                </>
              )}

              {(newEvent.type === "conta_pagar" || newEvent.type === "conta_fixa") && (
                <div className="space-y-2">
                  <Label htmlFor="recipient">Destinatário</Label>
                  <Input
                    id="recipient"
                    value={newEvent.recipient}
                    onChange={(e) => setNewEvent({ ...newEvent, recipient: e.target.value })}
                    placeholder="Nome do destinatário"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={newEvent.status}
                  onValueChange={(value: CalendarEvent["status"]) => setNewEvent({ ...newEvent, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="agendado">Agendado</SelectItem>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="concluido">Concluído</SelectItem>
                    <SelectItem value="cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Prioridade</Label>
                <Select
                  value={newEvent.priority}
                  onValueChange={(value: CalendarEvent["priority"]) => setNewEvent({ ...newEvent, priority: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="alta">Alta</SelectItem>
                    <SelectItem value="media">Média</SelectItem>
                    <SelectItem value="baixa">Baixa</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={newEvent.recurring}
                    onChange={(e) => setNewEvent({ ...newEvent, recurring: e.target.checked })}
                    className="rounded"
                  />
                  <span>Evento Recorrente (mensalmente no mesmo dia)</span>
                </Label>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleAddOrUpdateEvent}
                className="bg-blue-600 hover:bg-blue-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {selectedEvent ? "Atualizar Evento" : "Salvar Evento"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <Button variant="ghost" onClick={goToPreviousMonth}>
            Anterior
          </Button>
          <CardTitle className="text-xl">{format(currentMonth, "MMMM yyyy", { locale: ptBR })}</CardTitle>
          <Button variant="ghost" onClick={goToNextMonth}>
            Próximo
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 text-center text-sm font-medium text-gray-700 mb-2">
            <div>Dom</div>
            <div>Seg</div>
            <div>Ter</div>
            <div>Qua</div>
            <div>Qui</div>
            <div>Sex</div>
            <div>Sáb</div>
          </div>
          <div className="grid grid-cols-7 gap-1">
            {paddingDays.map((_, i) => (
              <div key={`pad-${i}`} className="h-24 bg-gray-50 rounded-md" />
            ))}
            {daysInMonth.map((day) => {
              const dayEvents = getEventsForDay(day)
              const isToday = isSameDay(day, new Date())
              return (
                <div
                  key={day.toISOString()}
                  className={`h-24 p-2 rounded-md border ${
                    isToday ? "border-blue-500 bg-blue-50" : "bg-white"
                  } flex flex-col overflow-hidden`}
                >
                  <span className={`text-sm font-semibold ${isToday ? "text-blue-700" : "text-gray-900"}`}>
                    {format(day, "d")}
                  </span>
                  <div className="flex-1 overflow-y-auto text-xs mt-1 space-y-1">
                    {dayEvents.map((event) => (
                      <div
                        key={event.id}
                        className={`flex items-center space-x-1 p-1 rounded-sm cursor-pointer ${getEventStatusColor(
                          event.status,
                        )}`}
                        onClick={() => handleEditEvent(event)}
                        role="button"
                        tabIndex={0}
                      >
                        {getEventTypeIcon(event.type)}
                        <span className="truncate">{event.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <h2 className="text-2xl font-bold text-gray-900 mt-8">Próximos Eventos</h2>
      {events.length === 0 ? (
        <p className="text-gray-500 text-center py-4">Nenhum evento agendado para este mês.</p>
      ) : (
        <div className="space-y-4">
          {events.map((event) => (
            <Card key={event.id}>
              <CardContent className="p-4 flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">{getEventTypeIcon(event.type)}</div>
                  <div>
                    <p className="font-semibold text-lg flex items-center gap-2">
                      {event.title}
                      <Badge className={getEventStatusColor(event.status)}>{event.status}</Badge>
                    </p>
                    <p className="text-sm text-gray-600 flex items-center space-x-2">
                      <CalendarIcon className="w-4 h-4" />
                      <span>{format(parseISO(event.event_date), "dd/MM/yyyy", { locale: ptBR })}</span>
                      <Clock className="w-4 h-4" />
                      <span>{event.event_time}</span>
                      {event.location && (
                        <>
                          <MapPin className="w-4 h-4" />
                          <span>{event.location}</span>
                        </>
                      )}
                    </p>
                    {event.description && <p className="text-xs text-gray-500 mt-1">{event.description}</p>}
                    {event.participants && event.participants.length > 0 && (
                      <p className="text-xs text-gray-500 mt-1">Participantes: {event.participants.join(", ")}</p>
                    )}
                    {event.amount &&
                      (event.type === "conta_pagar" ||
                        event.type === "conta_fixa" ||
                        event.type === "recebimento_venda" ||
                        event.type === "recebimento_comissao") && (
                        <p className="text-sm text-gray-700 mt-1 flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          Valor: <span className="font-bold">R$ {event.amount.toLocaleString("pt-BR")}</span>
                        </p>
                      )}
                    {event.property_name && (
                      <p className="text-sm text-gray-700 mt-1 flex items-center gap-1">
                        <Home className="w-4 h-4" />
                        Propriedade: {event.property_name}
                      </p>
                    )}
                    {event.client_name && (
                      <p className="text-sm text-gray-700 mt-1 flex items-center gap-1">
                        <User className="w-4 h-4" />
                        Cliente: {event.client_name}
                      </p>
                    )}
                    {event.recipient && (
                      <p className="text-sm text-gray-700 mt-1 flex items-center gap-1">
                        <User className="w-4 h-4" />
                        Destinatário: {event.recipient}
                      </p>
                    )}
                    {event.recurring && (
                      <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                        <Repeat className="w-3 h-3" />
                        Recorrente (dia {event.recurring_day})
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => handleEditEvent(event)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 bg-transparent"
                    onClick={() => handleDeleteEvent(event.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
