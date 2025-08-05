"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Plus, CalendarIcon, Users, Trash2, UserCheck, AlertCircle } from "lucide-react"
import { ptBR } from "date-fns/locale"
import { format, startOfWeek, addDays, isSameDay, parseISO } from "date-fns"

// Lista dos funcionários
const employees = [
  { id: 1, name: "Samuel", color: "bg-blue-100 text-blue-800" },
  { id: 2, name: "Edilson", color: "bg-green-100 text-green-800" },
  { id: 3, name: "Felipe", color: "bg-purple-100 text-purple-800" },
  { id: 4, name: "Alan", color: "bg-orange-100 text-orange-800" },
]

// Padrão de rotação baseado na tabela fornecida
const dutyPattern = [
  ["Samuel", "Edilson", "Felipe", "Alan", "Samuel", "Edilson"], // Semana 1
  ["Edilson", "Felipe", "Alan", "Samuel", "Edilson", "Felipe"], // Semana 2
  ["Felipe", "Alan", "Samuel", "Edilson", "Felipe", "Alan"], // Semana 3
  ["Alan", "Samuel", "Edilson", "Felipe", "Alan", "Samuel"], // Semana 4
]

// Data de referência (primeira segunda-feira da tabela)
const referenceDate = new Date(2025, 5, 9) // 09/06/2025

export function DutySchedule() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [customDuties, setCustomDuties] = useState<
    Array<{
      id: number
      date: string
      employee: string
      reason: string
    }>
  >([])

  const [newCustomDuty, setNewCustomDuty] = useState({
    date: format(new Date(), "yyyy-MM-dd"),
    employee: "",
    reason: "",
  })

  // Função para calcular quem está de plantão em uma data específica
  const getDutyEmployee = (date: Date): string => {
    // Verifica se há plantão customizado para esta data
    const customDuty = customDuties.find((duty) => isSameDay(parseISO(duty.date), date))
    if (customDuty) {
      return customDuty.employee
    }

    // Calcula baseado no padrão rotativo
    const daysDiff = Math.floor((date.getTime() - referenceDate.getTime()) / (1000 * 60 * 60 * 24))
    const weekNumber = Math.floor(daysDiff / 7) % 4 // Ciclo de 4 semanas
    const dayOfWeek = ((daysDiff % 7) + 7) % 7 // 0 = segunda, 1 = terça, etc.

    // Ajusta para sábado (índice 5 no padrão)
    const patternIndex = dayOfWeek > 5 ? 5 : dayOfWeek

    return dutyPattern[weekNumber][patternIndex]
  }

  // Função para obter a cor do funcionário
  const getEmployeeColor = (employeeName: string): string => {
    const employee = employees.find((emp) => emp.name === employeeName)
    return employee?.color || "bg-gray-100 text-gray-800"
  }

  // Função para obter plantão de hoje
  const getTodayDuty = (): string => {
    return getDutyEmployee(new Date())
  }

  // Função para obter próximos plantões
  const getUpcomingDuties = (days = 7) => {
    const duties = []
    const today = new Date()

    for (let i = 0; i < days; i++) {
      const date = addDays(today, i)
      const employee = getDutyEmployee(date)
      duties.push({
        date,
        employee,
        isToday: i === 0,
      })
    }

    return duties
  }

  // Função para obter semana atual
  const getCurrentWeekDuties = () => {
    const startWeek = startOfWeek(selectedDate, { weekStartsOn: 1 }) // Segunda-feira
    const weekDuties = []

    for (let i = 0; i < 7; i++) {
      const date = addDays(startWeek, i)
      const employee = getDutyEmployee(date)
      weekDuties.push({
        date,
        employee,
        dayName: format(date, "EEEE", { locale: ptBR }),
        dayNumber: format(date, "dd"),
      })
    }

    return weekDuties
  }

  // Função para adicionar plantão customizado
  const handleAddCustomDuty = () => {
    if (!newCustomDuty.date || !newCustomDuty.employee) {
      alert("Por favor, preencha todos os campos obrigatórios.")
      return
    }

    const customDuty = {
      id: customDuties.length + 1,
      date: newCustomDuty.date,
      employee: newCustomDuty.employee,
      reason: newCustomDuty.reason,
    }

    setCustomDuties([...customDuties, customDuty])
    setNewCustomDuty({
      date: format(new Date(), "yyyy-MM-dd"),
      employee: "",
      reason: "",
    })
    setIsModalOpen(false)
  }

  // Função para remover plantão customizado
  const removeCustomDuty = (id: number) => {
    setCustomDuties(customDuties.filter((duty) => duty.id !== id))
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Calendário de Plantão</h1>
          <p className="text-gray-600">Gerencie a escala de plantão dos corretores</p>
        </div>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Plantão Especial
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Adicionar Plantão Especial</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="date">Data *</Label>
                <Input
                  id="date"
                  type="date"
                  value={newCustomDuty.date}
                  onChange={(e) => setNewCustomDuty({ ...newCustomDuty, date: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="employee">Funcionário *</Label>
                <Select
                  value={newCustomDuty.employee}
                  onValueChange={(value) => setNewCustomDuty({ ...newCustomDuty, employee: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o funcionário" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.name}>
                        {employee.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Motivo</Label>
                <Input
                  id="reason"
                  value={newCustomDuty.reason}
                  onChange={(e) => setNewCustomDuty({ ...newCustomDuty, reason: e.target.value })}
                  placeholder="Ex: Troca de plantão, feriado..."
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddCustomDuty} className="bg-blue-600 hover:bg-blue-700">
                Salvar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <UserCheck className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Plantão Hoje</p>
                <p className="text-xl font-bold">{getTodayDuty()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Total Funcionários</p>
                <p className="text-xl font-bold">{employees.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-sm text-gray-600">Plantões Especiais</p>
                <p className="text-xl font-bold">{customDuties.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CalendarIcon className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">Semana Atual</p>
                <p className="text-xl font-bold">{format(selectedDate, "ww", { locale: ptBR })}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendário */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Calendário de Plantão</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              locale={ptBR}
              className="rounded-md border w-full"
              modifiers={{
                hasCustomDuty: (date) => customDuties.some((duty) => isSameDay(parseISO(duty.date), date)),
              }}
              modifiersStyles={{
                hasCustomDuty: {
                  backgroundColor: "#fef3c7",
                  color: "#d97706",
                  fontWeight: "bold",
                },
              }}
            />

            {/* Plantão do dia selecionado */}
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium mb-2">Plantão - {format(selectedDate, "dd/MM/yyyy", { locale: ptBR })}</h3>
              <div className="flex items-center space-x-2">
                <UserCheck className="w-5 h-5 text-blue-500" />
                <Badge className={getEmployeeColor(getDutyEmployee(selectedDate))} variant="secondary">
                  {getDutyEmployee(selectedDate)}
                </Badge>
                {customDuties.find((duty) => isSameDay(parseISO(duty.date), selectedDate)) && (
                  <Badge className="bg-yellow-100 text-yellow-800" variant="secondary">
                    Especial
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Próximos plantões */}
        <Card>
          <CardHeader>
            <CardTitle>Próximos 7 Dias</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {getUpcomingDuties().map((duty, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-3 border rounded-lg ${
                    duty.isToday ? "bg-blue-50 border-blue-200" : "hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-center">
                      <p className="text-xs text-gray-500">{format(duty.date, "EEE", { locale: ptBR })}</p>
                      <p className="font-medium">{format(duty.date, "dd")}</p>
                    </div>
                    <div>
                      <Badge className={getEmployeeColor(duty.employee)} variant="secondary">
                        {duty.employee}
                      </Badge>
                      {duty.isToday && (
                        <Badge className="ml-2 bg-blue-100 text-blue-800" variant="secondary">
                          Hoje
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Semana atual */}
      <Card>
        <CardHeader>
          <CardTitle>
            Semana de {format(startOfWeek(selectedDate, { weekStartsOn: 1 }), "dd/MM", { locale: ptBR })} a{" "}
            {format(addDays(startOfWeek(selectedDate, { weekStartsOn: 1 }), 6), "dd/MM", { locale: ptBR })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-4">
            {getCurrentWeekDuties().map((duty, index) => (
              <div key={index} className="text-center p-3 border rounded-lg hover:bg-gray-50">
                <p className="text-sm font-medium text-gray-600 mb-1">{duty.dayName}</p>
                <p className="text-lg font-bold mb-2">{duty.dayNumber}</p>
                <Badge className={getEmployeeColor(duty.employee)} variant="secondary">
                  {duty.employee}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Plantões especiais */}
      {customDuties.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Plantões Especiais</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {customDuties.map((duty) => (
                <div key={duty.id} className="flex items-center justify-between p-3 border rounded-lg bg-yellow-50">
                  <div className="flex items-center space-x-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600" />
                    <div>
                      <p className="font-medium text-sm">
                        {format(parseISO(duty.date), "dd/MM/yyyy", { locale: ptBR })} - {duty.employee}
                      </p>
                      {duty.reason && <p className="text-xs text-gray-500">{duty.reason}</p>}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeCustomDuty(duty.id)}
                    className="text-red-600 bg-transparent"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
