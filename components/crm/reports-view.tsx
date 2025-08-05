"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart,
  LineChart,
  PieChart,
  Bar,
  Line,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts"
import { useState, useEffect, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Clock } from "lucide-react"

// Colors for Pie Chart
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"]

export function ReportsView() {
  const [salesByMonth, setSalesByMonth] = useState<any[]>([])
  const [propertiesByType, setPropertiesByType] = useState<any[]>([])
  const [topAgents, setTopAgents] = useState<any[]>([])
  const [loadingReports, setLoadingReports] = useState(true)

  const fetchReportsData = useCallback(async () => {
    setLoadingReports(true)
    try {
      // Sales by Month (from 'sales' table)
      const { data: salesData, error: salesError } = await supabase
        .from("sales")
        .select("sale_date, value")
        .eq("status", "Concluída")
        .order("sale_date", { ascending: true })

      if (salesError) throw salesError

      const monthlySalesMap = new Map<string, number>()
      salesData.forEach((sale) => {
        const date = new Date(sale.sale_date)
        const monthYear = format(date, "MMM/yyyy", { locale: ptBR })
        monthlySalesMap.set(monthYear, (monthlySalesMap.get(monthYear) || 0) + sale.value)
      })

      const formattedSalesByMonth = Array.from(monthlySalesMap.entries()).map(([monthYear, totalValue]) => ({
        name: monthYear,
        Vendas: totalValue,
      }))
      setSalesByMonth(formattedSalesByMonth)

      // Properties by Type (from 'properties' table, using 'purpose')
      const { data: propertiesData, error: propertiesError } = await supabase
        .from("properties")
        .select("purpose")
        .not("purpose", "is", null)

      if (propertiesError) throw propertiesError

      const propertyTypeMap = new Map<string, number>()
      propertiesData.forEach((property) => {
        const purpose = property.purpose || "Outros"
        propertyTypeMap.set(purpose, (propertyTypeMap.get(purpose) || 0) + 1)
      })

      const formattedPropertiesByType = Array.from(propertyTypeMap.entries()).map(([name, value]) => ({
        name,
        value,
      }))
      setPropertiesByType(formattedPropertiesByType)

      // Top Agents (from 'sales' table, counting sales by agent_name)
      const { data: agentSalesData, error: agentSalesError } = await supabase
        .from("sales")
        .select("agent_name")
        .eq("status", "Concluída")
        .not("agent_name", "is", null)

      if (agentSalesError) throw agentSalesError

      const agentSalesCountMap = new Map<string, number>()
      agentSalesData.forEach((sale) => {
        const agentName = sale.agent_name || "Desconhecido"
        agentSalesCountMap.set(agentName, (agentSalesCountMap.get(agentName) || 0) + 1)
      })

      const formattedTopAgents = Array.from(agentSalesCountMap.entries())
        .map(([name, salesCount]) => ({
          name,
          Vendas: salesCount,
        }))
        .sort((a, b) => b.Vendas - a.Vendas)
        .slice(0, 5) // Top 5 agents
      setTopAgents(formattedTopAgents)
    } catch (error) {
      console.error("Erro ao buscar dados dos relatórios:", error)
    } finally {
      setLoadingReports(false)
    }
  }, [])

  useEffect(() => {
    fetchReportsData()
  }, [fetchReportsData])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Relatórios</h1>
        <p className="text-gray-600">Análise detalhada do desempenho do seu negócio</p>
      </div>

      {loadingReports ? (
        <div className="flex justify-center items-center h-64">
          <Clock className="w-6 h-6 animate-spin text-blue-500 mr-3" />
          <span className="text-lg text-gray-600">Carregando relatórios...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Gráfico de Vendas por Mês */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Vendas por Mês</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={salesByMonth} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip
                    formatter={(value: number) => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="Vendas" stroke="#8884d8" activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Gráfico de Imóveis por Tipo */}
          <Card>
            <CardHeader>
              <CardTitle>Imóveis por Tipo</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={propertiesByType}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {propertiesByType.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => value.toLocaleString()} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Gráfico de Top Corretores */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Top Corretores (Vendas)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topAgents} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Vendas" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Outros Relatórios (Exemplo) */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Resumo Financeiro</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <span className="text-sm font-medium text-gray-600">Receita Total (Ano)</span>
                  <span className="text-lg font-bold text-green-600">R$ 15.8M</span>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <span className="text-sm font-medium text-gray-600">Comissões Pagas (Ano)</span>
                  <span className="text-lg font-bold text-red-600">R$ 1.2M</span>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <span className="text-sm font-medium text-gray-600">Média de Venda</span>
                  <span className="text-lg font-bold text-blue-600">R$ 650K</span>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <span className="text-sm font-medium text-gray-600">Tempo Médio de Venda</span>
                  <span className="text-lg font-bold text-purple-600">45 dias</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
