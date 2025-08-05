"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Plus, Edit, Trash2, Lock } from "lucide-react" // Adicionado Lock icon
import { supabase, uploadFileToBucket, deleteFileFromBucket, type User } from "@/lib/supabase"
import { toast } from "sonner"
import Image from "next/image"

interface UserFormData {
  id?: string
  username: string
  name: string
  email: string
  role: "admin" | "corretor" | "gerente" | "assistente"
  status: "ativo" | "inativo" | "suspenso"
  permissions: string[]
  photo_url?: string | null
  phone?: string | null
  creci?: string | null
}

const initialFormData: UserFormData = {
  username: "",
  name: "",
  email: "",
  role: "corretor",
  status: "ativo",
  permissions: [],
  photo_url: null,
  phone: null,
  creci: null,
}

interface UsersManagerProps {
  currentUser: User // Adicionando a prop currentUser
}

export function UsersManager({ currentUser }: UsersManagerProps) {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState<UserFormData>(initialFormData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentFile, setCurrentFile] = useState<File | null>(null)

  // Verifica se o usuário atual tem permissão de administrador
  const isAdmin = currentUser.role === "admin"

  const fetchUsers = useCallback(async () => {
    if (!isAdmin) {
      setLoading(false)
      setError("Você não tem permissão para visualizar esta página.")
      return
    }

    setLoading(true)
    setError(null)
    const { data, error } = await supabase.from("users").select("*").order("name", { ascending: true })

    if (error) {
      console.error("Erro ao buscar usuários:", error)
      setError("Não foi possível carregar os usuários.")
      toast.error("Erro ao carregar usuários.")
    } else {
      setUsers(data as User[])
    }
    setLoading(false)
  }, [isAdmin])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleSelectChange = (id: keyof UserFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCurrentFile(e.target.files[0])
    } else {
      setCurrentFile(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    let photoUrl = formData.photo_url

    try {
      if (currentFile) {
        const fileExt = currentFile.name.split(".").pop()
        // Usar o ID do usuário se estiver editando, senão um timestamp para novos usuários
        const userIdForPath = formData.id || `new-user-${Date.now()}`
        const fileName = `users/${userIdForPath}/${Date.now()}.${fileExt}` // Path dentro do bucket

        // Se estiver editando e já houver uma foto, remova a antiga
        if (formData.id && formData.photo_url) {
          // Extrai o caminho do arquivo do URL público
          const oldPath = formData.photo_url.split("property-images/")[1]
          if (oldPath) {
            await deleteFileFromBucket("property-images", oldPath)
          }
        }
        // O uploadFileToBucket espera (bucketName, path, file)
        photoUrl = await uploadFileToBucket(currentFile, "property-images", fileName)
        toast.success("Foto enviada com sucesso!")
      } else if (formData.photo_url === "") {
        // Se a foto foi explicitamente limpa no formulário
        if (formData.id && formData.photo_url) {
          const oldPath = formData.photo_url.split("property-images/")[1]
          if (oldPath) {
            await deleteFileFromBucket("property-images", oldPath)
          }
        }
        photoUrl = null
      }

      const dataToSave = {
        username: formData.username,
        name: formData.name,
        email: formData.email,
        role: formData.role,
        status: formData.status,
        permissions: formData.permissions,
        photo_url: photoUrl,
        phone: formData.phone,
        creci: formData.creci,
      }

      if (formData.id) {
        // Update existing user
        const { error } = await supabase.from("users").update(dataToSave).eq("id", formData.id)

        if (error) throw error
        toast.success("Usuário atualizado com sucesso!")
      } else {
        // Create new user
        const { error } = await supabase.from("users").insert(dataToSave)

        if (error) throw error
        toast.success("Usuário adicionado com sucesso!")
      }

      setIsModalOpen(false)
      setFormData(initialFormData)
      setCurrentFile(null)
      fetchUsers()
    } catch (err: any) {
      console.error("Erro ao salvar usuário:", err)
      toast.error(`Erro ao salvar usuário: ${err.message || err.toString()}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (user: User) => {
    setFormData({
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      permissions: user.permissions || [],
      photo_url: user.photo_url || null,
      phone: user.phone || null,
      creci: user.creci || null,
    })
    setCurrentFile(null) // Clear current file when editing
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string, photo_url?: string | null) => {
    if (!window.confirm("Tem certeza que deseja deletar este usuário?")) return

    try {
      // Delete user photo from storage if exists
      if (photo_url) {
        const path = photo_url.split("property-images/")[1]
        if (path) {
          await deleteFileFromBucket("property-images", path)
        }
      }

      const { error } = await supabase.from("users").delete().eq("id", id)

      if (error) throw error
      toast.success("Usuário deletado com sucesso!")
      fetchUsers()
    } catch (err: any) {
      console.error("Erro ao deletar usuário:", err)
      toast.error(`Erro ao deletar usuário: ${err.message || err.toString()}`)
    }
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[500px] text-center p-4">
        <Lock className="h-16 w-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Acesso Negado</h2>
        <p className="text-gray-600">Você não tem permissão para acessar esta funcionalidade.</p>
        <p className="text-gray-500 text-sm mt-2">Apenas administradores podem gerenciar usuários.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-10 w-10 animate-spin text-gold-500" />
        <p className="ml-4 text-gray-600">Carregando usuários...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">{error}</p>
        <Button onClick={fetchUsers} className="mt-4">
          Tentar Novamente
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Gerenciar Usuários</h1>
        <Button
          onClick={() => {
            setFormData(initialFormData)
            setCurrentFile(null)
            setIsModalOpen(true)
          }}
        >
          <Plus className="mr-2 h-4 w-4" /> Adicionar Usuário
        </Button>
      </div>

      <div className="overflow-x-auto rounded-lg shadow-md">
        <Table className="min-w-full bg-white">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Foto</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>CRECI</TableHead>
              <TableHead>Função</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                  Nenhum usuário encontrado.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="relative w-12 h-12 rounded-full overflow-hidden">
                      <Image
                        src={user.photo_url || "/placeholder.svg?height=48&width=48&text=Foto"}
                        alt={user.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.phone || "N/A"}</TableCell>
                  <TableCell>{user.creci || "N/A"}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>{user.status}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(user)}>
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Editar</span>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(user.id, user.photo_url)}>
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Deletar</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{formData.id ? "Editar Usuário" : "Adicionar Novo Usuário"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nome
              </Label>
              <Input id="name" value={formData.name} onChange={handleInputChange} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="username" className="text-right">
                Username
              </Label>
              <Input
                id="username"
                value={formData.username}
                onChange={handleInputChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                Telefone
              </Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone || ""}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="creci" className="text-right">
                CRECI
              </Label>
              <Input id="creci" value={formData.creci || ""} onChange={handleInputChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                Função
              </Label>
              <Select
                value={formData.role}
                onValueChange={(value: "admin" | "corretor" | "gerente" | "assistente") =>
                  handleSelectChange("role", value)
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecione a função" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="corretor">Corretor</SelectItem>
                  <SelectItem value="gerente">Gerente</SelectItem>
                  <SelectItem value="assistente">Assistente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value: "ativo" | "inativo" | "suspenso") => handleSelectChange("status", value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="inativo">Inativo</SelectItem>
                  <SelectItem value="suspenso">Suspenso</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="photo_url" className="text-right">
                Foto
              </Label>
              <div className="col-span-3 flex items-center gap-2">
                <Input id="photo_url" type="file" onChange={handleFileChange} className="flex-grow" />
                {formData.photo_url && (
                  <div className="relative w-16 h-16 rounded-full overflow-hidden border">
                    <Image
                      src={formData.photo_url || "/placeholder.svg"}
                      alt="Foto atual"
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                {formData.photo_url && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setFormData((prev) => ({ ...prev, photo_url: "" }))}
                    title="Remover foto atual"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...
                  </>
                ) : (
                  "Salvar Usuário"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
