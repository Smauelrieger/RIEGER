"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Phone, Mail, User, Calendar } from "lucide-react"

const initialLeads = [
  {
    id: 1,
    name: "Carlos Oliveira",
    email: "carlos.oliveira@email.com",
    phone: "(11) 99999-3456",
    source: "Website",
    status: "Novo",
    interest: "Casa em Alphaville",
    createdAt: "2024-01-15",
    score: 85,
    budget: "R$ 850.000",
    notes: "Interessado em casa com piscina",
  },
  {
    id: 2,
    name: "Fernanda Lima",
    email: "fernanda.lima@email.com",
    phone: "(11) 99999-7890",
    source: "Facebook",
    status: "Contatado",
    interest: "Apartamento no Centro",
    createdAt: "2024-01-14",
    score: 72,
    budget: "R$ 450.000",
    notes: "Precisa de financiamento",
  },
  {
    id: 3,
    name: "Roberto Mendes",
    email: "roberto.mendes@email.com",
    phone: "(11) 99999-2468",
    source: "Indicação",
    status: "Qualificado",
    interest: "Cobertura em Jardins",
    createdAt: "2024-01-13",
    score: 95,
    budget: "R$ 1.200.000",
    notes: "Cliente premium, pagamento à vista",
  },
]

const sources = ["Website", "Facebook", "Instagram", "Google", "Indicação", "Telefone", "WhatsApp", "Outros"]

export function LeadsManager() {
  const [leads, setLeads] = useState(initialLeads)
  const [searchTerm, setSearchTerm] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)

  const [newLead, setNewLead] = useState({
    name: "",
    email: "",
    phone: "",
    source: "Website",
    status: "Novo",
    interest: "",
    budget: "",
    notes: "",
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Novo":
        return "bg-blue-100 text-blue-800"
      case "Contatado":
        return "bg-yellow-100 text-yellow-800"
      case "Qualificado":
        return "bg-green-100 text-green-800"
      case "Perdido":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const handleAddLead = () => {
    if (!newLead.name || !newLead.phone) {
      alert("Por favor, preencha os campos obrigatórios: Nome e Telefone.")
      return
    }

    const lead = {
      id: leads.length + 1,
      name: newLead.name,
      email: newLead.email,
      phone: newLead.phone,
      source: newLead.source,
      status: newLead.status,
      interest: newLead.interest,
      createdAt: new Date().toISOString().split("T")[0],
      score: Math.floor(Math.random() * 40) + 60, // Score aleatório entre 60-100
      budget: newLead.budget,
      notes: newLead.notes,
    }

    setLeads([...leads, lead])
    setNewLead({
      name: "",
      email: "",
      phone: "",
      source: "Website",
      status: "Novo",
      interest: "",
      budget: "",
      notes: "",
    })
    setIsModalOpen(false)
  }

  const filteredLeads = leads.filter(
    (lead) =>
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.source.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gerenciar Leads</h1>
          <p className="text-gray-600">Acompanhe e converta seus leads em clientes</p>
        </div>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Novo Lead
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Adicionar Novo Lead</DialogTitle>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo *</Label>
                <Input
                  id="name"
                  value={newLead.name}
                  onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
                  placeholder="Ex: Carlos Oliveira"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={newLead.email}
                  onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                  placeholder="carlos@email.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefone *</Label>
                <Input
                  id="phone"
                  value={newLead.phone}
                  onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
                  placeholder="(11) 99999-3456"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="source">Fonte</Label>
                <Select value={newLead.source} onValueChange={(value) => setNewLead({ ...newLead, source: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sources.map((source) => (
                      <SelectItem key={source} value={source}>
                        {source}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={newLead.status} onValueChange={(value) => setNewLead({ ...newLead, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Novo">Novo</SelectItem>
                    <SelectItem value="Contatado">Contatado</SelectItem>
                    <SelectItem value="Qualificado">Qualificado</SelectItem>
                    <SelectItem value="Perdido">Perdido</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="budget">Orçamento</Label>
                <Input
                  id="budget"
                  value={newLead.budget}
                  onChange={(e) => setNewLead({ ...newLead, budget: e.target.value })}
                  placeholder="Ex: R$ 850.000"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="interest">Interesse</Label>
                <Input
                  id="interest"
                  value={newLead.interest}
                  onChange={(e) => setNewLead({ ...newLead, interest: e.target.value })}
                  placeholder="Ex: Casa em Alphaville"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  value={newLead.notes}
                  onChange={(e) => setNewLead({ ...newLead, notes: e.target.value })}
                  placeholder="Informações adicionais sobre o lead..."
                  rows={3}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddLead} className="bg-blue-600 hover:bg-blue-700">
                Salvar Lead
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Buscar leads..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLeads.map((lead) => (
          <Card key={lead.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{lead.name}</CardTitle>
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge className={getStatusColor(lead.status)}>{lead.status}</Badge>
                    <span className={`text-sm font-medium ${getScoreColor(lead.score)}`}>Score: {lead.score}</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span>{lead.email}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span>{lead.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <User className="w-4 h-4" />
                    <span>Fonte: {lead.source}</span>
                  </div>
                </div>

                {lead.interest && (
                  <div>
                    <span className="text-sm text-gray-500">Interesse:</span>
                    <p className="font-medium text-sm">{lead.interest}</p>
                  </div>
                )}

                {lead.budget && (
                  <div>
                    <span className="text-sm text-gray-500">Orçamento:</span>
                    <p className="font-medium text-sm">{lead.budget}</p>
                  </div>
                )}

                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  <span>Criado em {new Date(lead.createdAt).toLocaleDateString("pt-BR")}</span>
                </div>

                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                    <Phone className="w-4 h-4 mr-1" />
                    Ligar
                  </Button>
                  <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700">
                    Converter
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
