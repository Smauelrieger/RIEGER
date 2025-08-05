"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Phone, Mail, Edit, Trash2, Loader2 } from "lucide-react"
import { supabase, type Client } from "@/lib/supabase" // Import supabase client and Client type

export function ClientsManager() {
  const [clients, setClients] = useState<Client[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingClientId, setEditingClientId] = useState<string | null>(null) // Client IDs are strings from Supabase
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false) // State for save/update loading

  const [newClient, setNewClient] = useState<
    Omit<Client, "id" | "created_at" | "updated_at" | "last_contact" | "properties">
  >({
    name: "",
    email: "",
    phone: "",
    type: "Comprador",
    status: "Ativo",
    notes: "",
    budget: "",
  })

  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    setLoading(true)
    setError(null)
    const { data, error } = await supabase.from("clients").select("*").order("created_at", { ascending: false })
    if (error) {
      console.error("Error fetching clients:", error)
      setError("Erro ao carregar clientes.")
    } else {
      setClients(data as Client[])
    }
    setLoading(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Ativo":
        return "bg-green-100 text-green-800"
      case "Inativo":
        return "bg-gray-100 text-gray-800"
      case "Prospect":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Comprador":
        return "bg-blue-100 text-blue-800"
      case "Vendedor":
        return "bg-purple-100 text-purple-800"
      case "Locatário":
        return "bg-orange-100 text-orange-800"
      case "Locador":
        return "bg-pink-100 text-pink-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleSaveClient = async () => {
    if (!newClient.name || !newClient.phone) {
      alert("Por favor, preencha os campos obrigatórios: Nome e Telefone.")
      return
    }

    setIsSaving(true)
    setError(null)

    const clientData = {
      name: newClient.name,
      email: newClient.email || null, // Ensure empty string becomes null for DB
      phone: newClient.phone,
      type: newClient.type,
      status: newClient.status,
      notes: newClient.notes || null,
      budget: newClient.budget || null,
      last_contact: new Date().toISOString(), // Supabase expects ISO string
    }

    if (editingClientId) {
      // Update existing client
      const { data, error } = await supabase.from("clients").update(clientData).eq("id", editingClientId).select()

      if (error) {
        console.error("Error updating client:", error)
        setError("Erro ao atualizar cliente.")
      } else if (data) {
        setClients(clients.map((client) => (client.id === editingClientId ? data[0] : client)))
      }
    } else {
      // Add new client
      const { data, error } = await supabase.from("clients").insert(clientData).select()

      if (error) {
        console.error("Error adding client:", error)
        setError("Erro ao adicionar cliente.")
      } else if (data) {
        setClients([data[0], ...clients]) // Add new client to the top
      }
    }

    // Reset form and close modal
    setNewClient({
      name: "",
      email: "",
      phone: "",
      type: "Comprador",
      status: "Ativo",
      notes: "",
      budget: "",
    })
    setEditingClientId(null)
    setIsModalOpen(false)
    setIsSaving(false)
  }

  const handleEditClick = (clientToEdit: Client) => {
    setEditingClientId(clientToEdit.id)
    setNewClient({
      name: clientToEdit.name,
      email: clientToEdit.email || "",
      phone: clientToEdit.phone,
      type: clientToEdit.type,
      status: clientToEdit.status,
      notes: clientToEdit.notes || "",
      budget: clientToEdit.budget || "",
    })
    setIsModalOpen(true)
  }

  const handleDeleteClick = async (clientId: string) => {
    if (confirm("Tem certeza que deseja excluir este cliente?")) {
      setError(null)
      const { error } = await supabase.from("clients").delete().eq("id", clientId)

      if (error) {
        console.error("Error deleting client:", error)
        setError("Erro ao excluir cliente.")
      } else {
        setClients(clients.filter((client) => client.id !== clientId))
      }
    }
  }

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      client.type.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gerenciar Clientes</h1>
          <p className="text-gray-600">Gerencie todos os seus clientes e contatos</p>
        </div>

        <Dialog
          open={isModalOpen}
          onOpenChange={(open) => {
            setIsModalOpen(open)
            if (!open) {
              // Reset form when modal closes
              setNewClient({
                name: "",
                email: "",
                phone: "",
                type: "Comprador",
                status: "Ativo",
                notes: "",
                budget: "",
              })
              setEditingClientId(null)
            }
          }}
        >
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Novo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingClientId ? "Editar Cliente" : "Adicionar Novo Cliente"}</DialogTitle>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo *</Label>
                <Input
                  id="name"
                  value={newClient.name}
                  onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                  placeholder="Ex: Maria Santos"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={newClient.email}
                  onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                  placeholder="maria@email.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefone *</Label>
                <Input
                  id="phone"
                  value={newClient.phone}
                  onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                  placeholder="(11) 99999-1234"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Tipo de Cliente</Label>
                <Select value={newClient.type} onValueChange={(value) => setNewClient({ ...newClient, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Comprador">Comprador</SelectItem>
                    <SelectItem value="Vendedor">Vendedor</SelectItem>
                    <SelectItem value="Locatário">Locatário</SelectItem>
                    <SelectItem value="Locador">Locador</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={newClient.status}
                  onValueChange={(value) => setNewClient({ ...newClient, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Ativo">Ativo</SelectItem>
                    <SelectItem value="Inativo">Inativo</SelectItem>
                    <SelectItem value="Prospect">Prospect</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="budget">Orçamento</Label>
                <Input
                  id="budget"
                  value={newClient.budget}
                  onChange={(e) => setNewClient({ ...newClient, budget: e.target.value })}
                  placeholder="Ex: R$ 800.000 ou R$ 3.000/mês"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  value={newClient.notes}
                  onChange={(e) => setNewClient({ ...newClient, notes: e.target.value })}
                  placeholder="Informações adicionais sobre o cliente..."
                  rows={3}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsModalOpen(false)} disabled={isSaving}>
                Cancelar
              </Button>
              <Button onClick={handleSaveClient} className="bg-blue-600 hover:bg-blue-700" disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingClientId ? "Atualizar Cliente" : "Salvar Cliente"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Buscar clientes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {error && <div className="text-red-500 text-center">{error}</div>}

      {loading ? (
        <div className="flex justify-center items-center h-48">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Carregando clientes...</span>
        </div>
      ) : filteredClients.length === 0 ? (
        <div className="text-center text-gray-500 py-10">Nenhum cliente encontrado.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map((client) => (
            <Card key={client.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{client.name}</CardTitle>
                    <div className="flex space-x-2 mt-2">
                      <Badge className={getTypeColor(client.type)}>{client.type}</Badge>
                      <Badge className={getStatusColor(client.status)}>{client.status}</Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    {client.email && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Mail className="w-4 h-4" />
                        <span>{client.email}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span>{client.phone}</span>
                    </div>
                  </div>

                  {client.budget && (
                    <div>
                      <span className="text-sm text-gray-500">Orçamento:</span>
                      <p className="font-medium text-sm">{client.budget}</p>
                    </div>
                  )}

                  {client.notes && (
                    <div>
                      <span className="text-sm text-gray-500">Observações:</span>
                      <p className="text-sm text-gray-700 truncate" title={client.notes}>
                        {client.notes}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Último Contato</span>
                      <p className="font-medium">
                        {client.last_contact ? new Date(client.last_contact).toLocaleDateString("pt-BR") : "N/A"}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">Propriedades</span>
                      <p className="font-medium">{client.properties || 0}</p> {/* Assuming properties might be null */}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 bg-transparent"
                      onClick={() => window.open(`tel:${client.phone}`)}
                    >
                      <Phone className="w-4 h-4 mr-1" />
                      Ligar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 bg-transparent"
                      onClick={() => handleEditClick(client)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700 bg-transparent"
                      onClick={() => handleDeleteClick(client.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
