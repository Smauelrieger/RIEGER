"use client"

import { Button } from "@/components/ui/button"

import { useEffect, useState, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Phone, Mail, Briefcase, Loader2 } from "lucide-react"
import Image from "next/image"
import { supabase, type User } from "@/lib/supabase"

export function RiegerTeam() {
  const [teamMembers, setTeamMembers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTeamMembers = useCallback(async () => {
    setLoading(true)
    setError(null)
    // Busca usuários que são 'corretor' ou 'admin' e estão 'ativo'
    const { data, error } = await supabase
      .from("users")
      .select("id, name, role, photo_url, phone, creci")
      .in("role", ["corretor", "admin"])
      .eq("status", "ativo")
      .order("name", { ascending: true })

    if (error) {
      console.error("Erro ao buscar membros da equipe:", error)
      setError("Não foi possível carregar a equipe no momento.")
    } else {
      setTeamMembers(data as User[])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchTeamMembers()
  }, [fetchTeamMembers])

  if (loading) {
    return (
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-100">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Nossa Equipe</h2>
              <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Conheça os profissionais dedicados que fazem a Rieger Imóveis acontecer.
              </p>
            </div>
            <Loader2 className="h-10 w-10 animate-spin text-gold-500" />
            <p className="text-gray-600">Carregando equipe...</p>
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-100">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Nossa Equipe</h2>
              <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Conheça os profissionais dedicados que fazem a Rieger Imóveis acontecer.
              </p>
            </div>
            <p className="text-red-600 mt-4">{error}</p>
            <Button onClick={fetchTeamMembers} className="mt-4">
              Tentar Novamente
            </Button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-100">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Nossa Equipe</h2>
            <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Conheça os profissionais dedicados que fazem a Rieger Imóveis acontecer.
            </p>
          </div>
        </div>
        {teamMembers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">Nenhum membro da equipe encontrado.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-10">
            {teamMembers.map((member) => (
              <Card
                key={member.id}
                className="flex flex-col items-center text-center p-6 shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <div className="relative w-32 h-32 rounded-full overflow-hidden mb-4 border-4 border-gold-500">
                  <Image
                    src={member.photo_url || "/placeholder.svg?height=128&width=128&text=Foto+Corretor"}
                    alt={member.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">{member.name}</h3>
                <p className="text-gold-600 font-medium mb-2 capitalize">{member.role}</p>
                <div className="space-y-1 text-sm text-gray-600">
                  {member.phone && (
                    <p className="flex items-center justify-center">
                      <Phone className="w-4 h-4 mr-2 text-gray-500" /> {member.phone}
                    </p>
                  )}
                  {member.email && (
                    <p className="flex items-center justify-center">
                      <Mail className="w-4 h-4 mr-2 text-gray-500" /> {member.email}
                    </p>
                  )}
                  {member.creci && (
                    <p className="flex items-center justify-center">
                      <Briefcase className="w-4 h-4 mr-2 text-gray-500" /> {member.creci}
                    </p>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
