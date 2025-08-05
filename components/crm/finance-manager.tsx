"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, DollarSign, Wallet, Percent, FileText, Loader2, ArrowLeft, ArrowRight } from "lucide-react"
import {
  supabase,
  type CommissionSchedule,
  type PaymentSchedule,
  type CalendarEvent,
  type User as SupabaseUser,
} from "@/lib/supabase"
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

interface FinanceManagerProps {
  currentUser: SupabaseUser | null
}

export function FinanceManager({ currentUser }: FinanceManagerProps) {
  const [loading, setLoading] = useState(true)
  const [commissionSchedules, setCommissionSchedules] = useState<CommissionSchedule[]>([])
  const [paymentSchedules, setPaymentSchedules] = useState<PaymentSchedule[]>([])
  const [fixedExpenses, setFixedExpenses] = useState<CalendarEvent[]>([])
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value)
  }

  useEffect(() => {
    if (currentUser) {
      loadFinancialData()
    }
  }, [currentMonth, currentUser])

  const loadFinancialData = async () => {
    setLoading(true)
    try {
      const start = format(startOfMonth(currentMonth), "yyyy-MM-dd")
      const end = format(endOfMonth(currentMonth), "yyyy-MM-dd")

      // Fetch Commission Schedules
      let commissionQuery = supabase
        .from("commission_schedules")
        .select("*, sales(agent_name)")
        .gte("payment_date", start)
        .lte("payment_date", end)
        .order("payment_date", { ascending: true })

      if (currentUser?.role === "corretor") {
        commissionQuery = commissionQuery.eq("sales.agent_name", currentUser.name)
      }
      const { data: commissionsData, error: commissionsError } = await commissionQuery

      if (commissionsError) throw commissionsError
      setCommissionSchedules(commissionsData || [])

      // Fetch Payment Schedules (Recebimentos de Vendas)
      const { data: paymentsData, error: paymentsError } = await supabase
        .from("payment_schedules")
        .select("*")
        .gte("payment_date", start)
        .lte("payment_date", end)
        .order("payment_date", { ascending: true })

      if (paymentsError) throw paymentsError
      setPaymentSchedules(paymentsData || [])

      // Fetch Fixed Expenses (Contas Fixas) from Calendar Events
      const { data: fixedExpensesData, error: fixedExpensesError } = await supabase
        .from("calendar_events")
        .select("*")
        .eq("type", "conta_fixa")
        .gte("event_date", start)
        .lte("event_date", end)
        .order("event_date", { ascending: true })
        .order("event_time", { ascending: true })

      if (fixedExpensesError) throw fixedExpensesError
      setFixedExpenses(fixedExpensesData || [])
    } catch (error) {
      console.error("Erro ao carregar dados financeiros:", error)
      toast.error("Erro ao carregar dados financeiros.")
    } finally {
      setLoading(false)
    }
  }

  const getEventStatusColor = (status: string) => {
    switch (status) {
      case "Pendente":
      case "agendado":
        return "bg-yellow-100 text-yellow-800"
      case "Recebido":
      case "concluido":
        return "bg-green-100 text-green-800"
      case "Atrasado":
        return "bg-red-100 text-red-800"
      case "Cancelado":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case "recebimento_comissao":
        return <Percent className="w-4 h-4 text-indigo-600" />
      case "recebimento_venda":
        return <Wallet className="w-4 h-4 text-lime-600" />
      case "conta_fixa":
        return <FileText className="w-4 h-4 text-gray-500" />
      default:
        return <CalendarIcon className="w-4 h-4 text-gray-500" />
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

  const getFinancialEventsForDay = (day: Date) => {
    const eventsForDay: { type: string; title: string; amount: number; status: string; id: string }[] = []

    commissionSchedules.forEach((cs) => {
      if (isSameDay(parseISO(cs.payment_date), day)) {
        eventsForDay.push({
          id: cs.id,
          type: "recebimento_comissao",
          title: `Comissão: ${cs.description || "Parcela"}`,
          amount: cs.amount,
          status: cs.status,
        })
      }
    })

    paymentSchedules.forEach((ps) => {
      if (isSameDay(parseISO(ps.payment_date), day)) {
        eventsForDay.push({
          id: ps.id,
          type: "recebimento_venda",
          title: `Recebimento: ${ps.description || "Parcela"}`,
          amount: ps.amount,
          status: ps.status,
        })
      }
    })

    fixedExpenses.forEach((fe) => {
      if (isSameDay(parseISO(fe.event_date), day)) {
        eventsForDay.push({
          id: fe.id,
          type: "conta_fixa",
          title: `Conta Fixa: ${fe.title}`,
          amount: fe.amount || 0,
          status: fe.status,
        })
      }
    })

    return eventsForDay.sort((a, b) => a.title.localeCompare(b.title))
  }

  const totalCommissionsPending = commissionSchedules
    .filter((cs) => cs.status === "Pendente" || cs.status === "Atrasado")
    .reduce((sum, cs) => sum + cs.amount, 0)

  const totalPaymentsPending = paymentSchedules
    .filter((ps) => ps.status === "Pendente" || ps.status === "Atrasado")
    .reduce((sum, ps) => sum + ps.amount, 0)

  const totalFixedExpensesPending = fixedExpenses
    .filter((fe) => fe.status === "pendente")
    .reduce((sum, fe) => sum + (fe.amount || 0), 0)

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
          <h1 className="text-3xl font-bold text-gray-900">Financeiro</h1>
          <p className="text-gray-600">Visão geral de recebimentos e despesas</p>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-4 flex items-center space-x-3">
            <Percent className="w-6 h-6 text-indigo-600" />
            <div>
              <p className="text-sm text-gray-600">Comissões a Receber (Mês)</p>
              <p className="text-xl font-bold">{formatCurrency(totalCommissionsPending)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center space-x-3">
            <Wallet className="w-6 h-6 text-lime-600" />
            <div>
              <p className="text-sm text-gray-600">Recebimentos Vendas (Mês)</p>
              <p className="text-xl font-bold">{formatCurrency(totalPaymentsPending)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center space-x-3">
            <FileText className="w-6 h-6 text-gray-600" />
            <div>
              <p className="text-sm text-gray-600">Contas Fixas Pendentes (Mês)</p>
              <p className="text-xl font-bold">{formatCurrency(totalFixedExpensesPending)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center space-x-3">
            <DollarSign className="w-6 h-6 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Saldo Projetado (Mês)</p>
              <p className="text-xl font-bold">
                {formatCurrency(totalCommissionsPending + totalPaymentsPending - totalFixedExpensesPending)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Calendário Financeiro */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <Button variant="ghost" onClick={goToPreviousMonth}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <CardTitle className="text-xl">{format(currentMonth, "MMMM yyyy", { locale: ptBR })}</CardTitle>
          <Button variant="ghost" onClick={goToNextMonth}>
            <ArrowRight className="w-5 h-5" />
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
              <div key={`pad-${i}`} className="h-28 bg-gray-50 rounded-md" />
            ))}
            {daysInMonth.map((day) => {
              const dayEvents = getFinancialEventsForDay(day)
              const isToday = isSameDay(day, new Date())
              return (
                <div
                  key={day.toISOString()}
                  className={`h-28 p-2 rounded-md border ${
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
                        className={`flex items-center space-x-1 p-1 rounded-sm ${getEventStatusColor(event.status)}`}
                        title={`${event.title}: ${formatCurrency(event.amount)} (${event.status})`}
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

      {/* Listagem Detalhada */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Percent className="w-5 h-5 text-indigo-600" />
              <span>Comissões a Receber</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {commissionSchedules.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Nenhuma comissão agendada para este mês.</p>
            ) : (
              <div className="space-y-3">
                {commissionSchedules.map((cs) => (
                  <div key={cs.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Percent className="w-5 h-5 text-indigo-600" />
                      <div>
                        <p className="font-medium text-sm">{cs.description || `Parcela de Comissão`}</p>
                        <p className="text-xs text-gray-500">
                          Vencimento: {format(parseISO(cs.payment_date), "dd/MM/yyyy", { locale: ptBR })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-indigo-600">{formatCurrency(cs.amount)}</p>
                      <Badge className={getEventStatusColor(cs.status)} variant="secondary">
                        {cs.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Wallet className="w-5 h-5 text-lime-600" />
              <span>Recebimentos de Vendas</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {paymentSchedules.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Nenhum recebimento de venda agendado para este mês.</p>
            ) : (
              <div className="space-y-3">
                {paymentSchedules.map((ps) => (
                  <div key={ps.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Wallet className="w-5 h-5 text-lime-600" />
                      <div>
                        <p className="font-medium text-sm">{ps.description || `Recebimento de Venda`}</p>
                        <p className="text-xs text-gray-500">
                          Vencimento: {format(parseISO(ps.payment_date), "dd/MM/yyyy", { locale: ptBR })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lime-600">{formatCurrency(ps.amount)}</p>
                      <Badge className={getEventStatusColor(ps.status)} variant="secondary">
                        {ps.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-gray-600" />
              <span>Contas Fixas do Mês</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {fixedExpenses.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Nenhuma conta fixa para este mês.</p>
            ) : (
              <div className="space-y-3">
                {fixedExpenses.map((fe) => (
                  <div key={fe.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="font-medium text-sm">{fe.title}</p>
                        <p className="text-xs text-gray-500">
                          Vencimento: {format(parseISO(fe.event_date), "dd/MM/yyyy", { locale: ptBR })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-700">{formatCurrency(fe.amount || 0)}</p>
                      <Badge className={getEventStatusColor(fe.status)} variant="secondary">
                        {fe.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
