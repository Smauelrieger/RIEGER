"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Home, Users, UserPlus, DollarSign, TrendingUp, TrendingDown, UserCheck, Clock, Calendar } from "lucide-react"
import { format, subDays, startOfMonth, endOfMonth, startOfWeek } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useState, useEffect, useCallback } from "react"
import { supabase, type SeasonalRental } from "@/lib/supabase"

const employees = [
  { id: 1, name: "Samuel", color: "bg-blue-100 text-blue-800" },
  { id: 2, name: "Edilson", color: "bg-green-100 text-green-800" },
  { id: 3, name: "Felipe", color: "bg-purple-100 text-purple-800" },
  { id: 4, name: "Alan", color: "bg-orange-100 text-orange-800" },
]

const dutyPattern = [
  ["Samuel", "Edilson", "Felipe", "Alan", "Samuel", "Edilson"], // Semana 1
  ["Edilson", "Felipe", "Alan", "Samuel", "Edilson", "Felipe"], // Semana 2
  ["Felipe", "Alan", "Samuel", "Edilson", "Felipe", "Alan"], // Semana 3
  ["Alan", "Samuel", "Edilson", "Felipe", "Alan", "Samuel"], // Semana 4
]

const referenceDate = new Date(2025, 5, 9) // 09/06/2025

export function Dashboard() {
  const [totalProperties, setTotalProperties] = useState<number | null>(null)
  const [activeClients, setActiveClients] = useState<number | null>(null)
  const [newLeads, setNewLeads] = useState<number | null>(null)
  const [monthlySales, setMonthlySales] = useState<number | null>(null)
  const [upcomingRentals, setUpcomingRentals] = useState<SeasonalRental[]>([])
  const [recentActivities, setRecentActivities] = useState<any[]>([])
  const [loadingStats, setLoadingStats] = useState(true)
  const [loadingRentals, setLoadingRentals] = useState(true)
  const [loadingActivities, setLoadingActivities] = useState(true)

  const getTodayDuty = useCallback((): string => {
    const today = new Date()
    const daysDiff = Math.floor((today.getTime() - referenceDate.getTime()) / (1000 * 60 * 60 * 24))
    const weekNumber = Math.floor(daysDiff / 7) % 4
    const dayOfWeek = ((daysDiff % 7) + 7) % 7
    const patternIndex = dayOfWeek > 5 ? 5 : dayOfWeek

    return dutyPattern[weekNumber][patternIndex]
  }, [])

  const getEmployeeColor = useCallback((employeeName: string): string => {
    const employee = employees.find((emp) => emp.name === employeeName)
    return employee?.color || "bg-gray-100 text-gray-800"
  }, [])

  const fetchDashboardData = useCallback(async () => {
    setLoadingStats(true)
    try {
      // Total Properties
      const { count: propertiesCount, error: propertiesError } = await supabase
        .from("properties")
        .select("*", { count: "exact", head: true })
      if (propertiesError) throw propertiesError
      setTotalProperties(propertiesCount)

      // Active Clients (status 'Ativo')
      const { count: clientsCount, error: clientsError } = await supabase
        .from("clients")
        .select("*", { count: "exact", head: true })
        .eq("status", "Ativo")
      if (clientsError) throw clientsError
      setActiveClients(clientsCount)

      // New Leads (clients with status 'Prospect' created in last 30 days)
      const thirtyDaysAgo = subDays(new Date(), 30).toISOString()
      const { count: leadsCount, error: leadsError } = await supabase
        .from("clients") // Changed from 'leads' to 'clients'
        .select("*", { count: "exact", head: true })
        .eq("status", "Prospect") // Filter for prospects
        .gte("created_at", thirtyDaysAgo)
      if (leadsError) throw leadsError
      setNewLeads(leadsCount)

      // Monthly Sales (current month from sales table)
      const startOfCurrentMonth = format(startOfMonth(new Date()), "yyyy-MM-dd")
      const endOfCurrentMonth = format(endOfMonth(new Date()), "yyyy-MM-dd")
      const { data: monthlySalesData, error: salesError } = await supabase
        .from("sales")
        .select("value")
        .gte("sale_date", startOfCurrentMonth)
        .lte("sale_date", endOfCurrentMonth)
        .eq("status", "Concluída") // Assuming 'Concluída' means a completed sale
      if (salesError) throw salesError
      const totalMonthlySales = monthlySalesData?.reduce((sum, sale) => sum + sale.value, 0) || 0
      setMonthlySales(totalMonthlySales)
    } catch (error) {
      console.error("Erro ao buscar dados do dashboard:", error)
    } finally {
      setLoadingStats(false)
    }
  }, [])

  const fetchUpcomingRentals = useCallback(async () => {
    setLoadingRentals(true)
    try {
      const today = new Date()
      const nextWeek = new Date()
      nextWeek.setDate(today.getDate() + 7)

      const { data, error } = await supabase
        .from("seasonal_rentals")
        .select("*")
        .in("status", ["confirmed", "checked_in"])
        .or(
          `check_in_date.gte.${today.toISOString().split("T")[0]},check_out_date.gte.${today.toISOString().split("T")[0]}`,
        )
        .lte("check_in_date", nextWeek.toISOString().split("T")[0])
        .order("check_in_date", { ascending: true })
        .limit(10)

      if (error) throw error
      setUpcomingRentals(data || [])
    } catch (error) {
      console.error("Erro ao buscar aluguéis próximos:", error)
    } finally {
      setLoadingRentals(false)
    }
  }, [])

  const fetchRecentActivities = useCallback(async () => {
    setLoadingActivities(true)
    try {
      const twoDaysAgo = subDays(new Date(), 2).toISOString()

      // Fetch recent properties
      const { data: newProperties, error: propError } = await supabase
        .from("properties")
        .select("id, title, created_at")
        .gte("created_at", twoDaysAgo)
        .order("created_at", { ascending: false })
        .limit(3)
      if (propError) throw propError

      const propertyActivities =
        newProperties?.map((p) => ({
          type: "property",
          description: `Nova propriedade cadastrada: ${p.title}`,
          timestamp: p.created_at,
        })) || []

      // Fetch recent converted leads (clients whose status changed from Prospect to Ativo recently)
      const { data: convertedClients, error: clientError } = await supabase
        .from("clients") // Changed from 'leads' to 'clients'
        .select("id, name, updated_at")
        .eq("status", "Ativo") // Assuming 'Ativo' means converted
        .gte("updated_at", twoDaysAgo)
        .order("updated_at", { ascending: false })
        .limit(3)
      if (clientError) throw clientError

      const clientActivities =
        convertedClients?.map((c) => ({
          type: "client", // Changed type to 'client'
          description: `Lead convertido em cliente: ${c.name}`,
          timestamp: c.updated_at,
        })) || []

      // Fetch recent sales
      const { data: recentSales, error: salesError } = await supabase
        .from("sales")
        .select("id, property_name, client_name, sale_date")
        .gte("sale_date", twoDaysAgo)
        .order("sale_date", { ascending: false })
        .limit(3)
      if (salesError) throw salesError

      const salesActivities =
        recentSales?.map((s) => ({
          type: "sale",
          description: `Venda concluída: ${s.property_name} para ${s.client_name || "cliente desconhecido"}`,
          timestamp: s.sale_date,
        })) || []

      // Combine and sort activities
      const combinedActivities = [...propertyActivities, ...clientActivities, ...salesActivities].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      )
      setRecentActivities(combinedActivities.slice(0, 5)) // Show top 5 recent activities
    } catch (error) {
      console.error("Erro ao buscar atividades recentes:", error)
    } finally {
      setLoadingActivities(false)
    }
  }, [])

  useEffect(() => {
    fetchDashboardData()
    fetchUpcomingRentals()
    fetchRecentActivities()
  }, [fetchDashboardData, fetchUpcomingRentals, fetchRecentActivities])

  const todayDuty = getTodayDuty()
  const currentTime = format(new Date(), "HH:mm")
  const currentDate = format(new Date(), "dd/MM/yyyy", { locale: ptBR })

  const stats = [
    {
      title: "Total de Imóveis",
      value: totalProperties !== null ? totalProperties.toString() : "...",
      change: "+12%", // Placeholder, needs real calculation
      trend: "up",
      icon: Home,
    },
    {
      title: "Clientes Ativos",
      value: activeClients !== null ? activeClients.toString() : "...",
      change: "+8%", // Placeholder
      trend: "up",
      icon: Users,
    },
    {
      title: "Novos Leads",
      value: newLeads !== null ? newLeads.toString() : "...",
      change: "+23%", // Placeholder
      trend: "up",
      icon: UserPlus,
    },
    {
      title: "Vendas do Mês",
      value:
        monthlySales !== null ? monthlySales.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "...",
      change: "-5%", // Placeholder
      trend: "down",
      icon: DollarSign,
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Visão geral do seu negócio imobiliário</p>
      </div>

      {/* Card de Plantão do Dia - Destaque */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <UserCheck className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Plantão de Hoje</h2>
                <p className="text-sm text-gray-600">
                  {currentDate} - {currentTime}
                </p>
              </div>
            </div>
            <div className="text-right">
              <Badge className={`${getEmployeeColor(todayDuty)} text-lg px-4 py-2`} variant="secondary">
                {todayDuty}
              </Badge>
              <p className="text-xs text-gray-500 mt-1">Corretor responsável</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loadingStats
          ? Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Carregando...</CardTitle>
                  <Clock className="w-4 h-4 animate-spin text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="h-8 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mt-2 animate-pulse"></div>
                </CardContent>
              </Card>
            ))
          : stats.map((stat, index) => (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
                  <stat.icon className="w-4 h-4 text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div
                    className={`flex items-center text-xs ${stat.trend === "up" ? "text-green-600" : "text-red-600"}`}
                  >
                    {stat.trend === "up" ? (
                      <TrendingUp className="w-3 h-3 mr-1" />
                    ) : (
                      <TrendingDown className="w-3 h-3 mr-1" />
                    )}
                    {stat.change} em relação ao mês anterior
                  </div>
                </CardContent>
              </Card>
            ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Atividades Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingActivities ? (
              <div className="flex justify-center items-center h-32">
                <Clock className="w-4 h-4 animate-spin text-blue-500 mr-2" />
                <span className="text-sm text-gray-600">Carregando atividades...</span>
              </div>
            ) : recentActivities.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <Calendar className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">Nenhuma atividade recente.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        activity.type === "property"
                          ? "bg-blue-600"
                          : activity.type === "client"
                            ? "bg-green-600"
                            : "bg-purple-600"
                      }`}
                    ></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.description}</p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(activity.timestamp), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="w-5 h-5 text-blue-500" />
              <span>Avisos de Check-in e Check-out</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingRentals ? (
              <div className="flex justify-center items-center h-32">
                <Clock className="w-4 h-4 animate-spin text-blue-500 mr-2" />
                <span className="text-sm text-gray-600">Carregando...</span>
              </div>
            ) : upcomingRentals.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <Calendar className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">Nenhum check-in ou check-out próximo</p>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingRentals.map((rental) => {
                  const today = new Date()
                  const checkInDate = new Date(rental.check_in_date)
                  const checkOutDate = new Date(rental.check_out_date)
                  const isCheckIn = checkInDate >= today && rental.status === "confirmed"
                  const isCheckOut = checkOutDate >= today && rental.status === "checked_in"

                  return (
                    <div key={rental.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                      <div className={`w-3 h-3 rounded-full ${isCheckIn ? "bg-green-500" : "bg-blue-500"}`}></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {isCheckIn ? "Check-in" : "Check-out"}: {rental.tenant_name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {rental.property_name} -{" "}
                          {format(isCheckIn ? checkInDate : checkOutDate, "dd/MM/yyyy", { locale: ptBR })}
                        </p>
                        {rental.tenant_phone && <p className="text-xs text-gray-400">Tel: {rental.tenant_phone}</p>}
                      </div>
                      <div className="text-right">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            isCheckIn ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {isCheckIn ? "Entrada" : "Saída"}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          {rental.total_amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Resumo da Semana de Plantão */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-blue-500" />
            <span>Plantão da Semana</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-4">
            {["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map((day, index) => {
              const today = new Date()
              const startOfWeekDate = startOfWeek(today, { weekStartsOn: 1 }) // Monday as start of week
              const dayDate = new Date(startOfWeekDate)
              dayDate.setDate(startOfWeekDate.getDate() + index)

              const daysDiff = Math.floor((dayDate.getTime() - referenceDate.getTime()) / (1000 * 60 * 60 * 24))
              const weekNumber = Math.floor(daysDiff / 7) % 4
              const dayOfWeek = ((daysDiff % 7) + 7) % 7
              const patternIndex = dayOfWeek > 5 ? 5 : dayOfWeek
              const dutyEmployee = dutyPattern[weekNumber][patternIndex]

              const isToday = dayDate.toDateString() === new Date().toDateString()

              return (
                <div
                  key={index}
                  className={`text-center p-3 border rounded-lg ${isToday ? "bg-blue-50 border-blue-200" : "hover:bg-gray-50"}`}
                >
                  <p className="text-sm font-medium text-gray-600 mb-1">{day}</p>
                  <p className="text-lg font-bold mb-2">{dayDate.getDate()}</p>
                  <Badge className={getEmployeeColor(dutyEmployee)} variant="secondary">
                    {dutyEmployee}
                  </Badge>
                  {isToday && <p className="text-xs text-blue-600 mt-1 font-medium">Hoje</p>}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
