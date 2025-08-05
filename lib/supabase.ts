import { createClient } from "@supabase/supabase-js"

// Define your Supabase database schema types here
// This is a simplified example, you might want to generate types from your DB
// using `supabase gen types typescript --project-id your-project-id --schema public > types/supabase.ts`
export type Database = {
  public: {
    Tables: {
      properties: {
        Row: {
          id: string
          created_at: string
          title: string
          description: string | null
          address: string | null
          city: string | null
          state: string | null
          zip_code: string | null
          price: number | null
          bedrooms: number | null
          bathrooms: number | null
          area: number | null
          purpose: string | null // 'Venda', 'Aluguel', 'Temporada'
          status: string | null // 'Disponível', 'Vendido', 'Alugado', 'Reservado'
          images: string[] | null
          daily_rate: number | null // For 'Temporada' properties
          max_guests: number | null // For 'Temporada' properties
          check_in_time: string | null // For 'Temporada' properties (e.g., "14:00")
          check_out_time: string | null // For 'Temporada' properties (e.g., "11:00")
          is_active: boolean | null
          is_featured: boolean | null
          type: string | null // Nova coluna para tipo de imóvel (Casa, Apartamento, etc.)
          owner_id: string | null
          image_urls: string[] | null
          main_image_index: number | null
          financing_accepted: string | null
          fgts_accepted: string | null
          exchange_accepted: string | null
          documentation_status: string | null
          rental_deposit: number | null
          rental_guarantee: string | null
          pets_allowed: string | null
          furnished: string | null
          minimum_rental_period: number | null
          iptu_included: string | null
          minimum_stay: number | null
          cleaning_fee: number | null
          wifi_available: string | null
          pool_available: string | null
          owners?: {
            id: string
            name: string
            email: string
            phone: string
          } | null
          tags: string[] | null
        }
        Insert: {
          id?: string
          created_at?: string
          title: string
          description?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          zip_code?: string | null
          price?: number | null
          bedrooms?: number | null
          bathrooms?: number | null
          area?: number | null
          purpose?: string | null
          status?: string | null
          images?: string[] | null
          daily_rate?: number | null
          max_guests?: number | null
          check_in_time?: string | null
          check_out_time?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          type?: string | null // Nova coluna para tipo de imóvel (Casa, Apartamento, etc.)
          owner_id?: string | null
          image_urls?: string[] | null
          main_image_index?: number | null
          financing_accepted?: string | null
          fgts_accepted?: string | null
          exchange_accepted?: string | null
          documentation_status?: string | null
          rental_deposit?: number | null
          rental_guarantee?: string | null
          pets_allowed?: string | null
          furnished?: string | null
          minimum_rental_period?: number | null
          iptu_included?: string | null
          minimum_stay?: number | null
          cleaning_fee?: number | null
          wifi_available?: string | null
          pool_available?: string | null
          owners?: {
            id: string
            name: string
            email: string
            phone: string
          } | null
          tags?: string[] | null
        }
        Update: {
          id?: string
          created_at?: string
          title?: string
          description?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          zip_code?: string | null
          price?: number | null
          bedrooms?: number | null
          bathrooms?: number | null
          area?: number | null
          purpose?: string | null
          status?: string | null
          images?: string[] | null
          daily_rate?: number | null
          max_guests?: number | null
          check_in_time?: string | null
          check_out_time?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          type?: string | null // Nova coluna para tipo de imóvel (Casa, Apartamento, etc.)
          owner_id?: string | null
          image_urls?: string[] | null
          main_image_index?: number | null
          financing_accepted?: string | null
          fgts_accepted?: string | null
          exchange_accepted?: string | null
          documentation_status?: string | null
          rental_deposit?: number | null
          rental_guarantee?: string | null
          pets_allowed?: string | null
          furnished?: string | null
          minimum_rental_period?: number | null
          iptu_included?: string | null
          minimum_stay?: number | null
          cleaning_fee?: number | null
          wifi_available?: string | null
          pool_available?: string | null
          owners?: {
            id: string
            name: string
            email: string
            phone: string
          } | null
          tags?: string[] | null
        }
      }
      seasonal_rentals: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          property_id: string | null
          property_name: string
          tenant_name: string
          tenant_phone: string | null
          check_in_date: string
          check_out_date: string
          daily_rate: number
          total_days: number
          total_amount: number
          status: string
          notes: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          property_id?: string | null
          property_name: string
          tenant_name: string
          tenant_phone?: string | null
          check_in_date: string
          check_out_date: string
          daily_rate: number
          total_days: number
          total_amount: number
          status?: string
          notes?: string | null
        }
        Update: Partial<{
          id?: string
          created_at?: string
          updated_at?: string
          property_id?: string | null
          property_name?: string
          tenant_name?: string
          tenant_phone?: string | null
          check_in_date?: string
          check_out_date?: string
          daily_rate?: number
          total_days?: number
          total_amount?: number
          status?: string
          notes?: string | null
        }>
      }
      users: {
        Row: {
          id: string
          username: string
          name: string
          email: string
          role: "admin" | "corretor" | "gerente" | "assistente"
          status: "ativo" | "inativo" | "suspenso"
          permissions: string[]
          last_login?: string
          created_at: string
          updated_at: string
          photo_url?: string
          phone?: string
          creci?: string
        }
        Insert: {
          id?: string
          username: string
          name: string
          email: string
          role: "admin" | "corretor" | "gerente" | "assistente"
          status: "ativo" | "inativo" | "suspenso"
          permissions: string[]
          last_login?: string
          created_at?: string
          updated_at?: string
          photo_url?: string
          phone?: string
          creci?: string
        }
        Update: Partial<{
          id?: string
          username?: string
          name?: string
          email?: string
          role?: "admin" | "corretor" | "gerente" | "assistente"
          status?: "ativo" | "inativo" | "suspenso"
          permissions?: string[]
          last_login?: string
          created_at?: string
          updated_at?: string
          photo_url?: string
          phone?: string
          creci?: string
        }>
      }
      owners: {
        Row: {
          id: string
          created_at: string
          name: string
          email: string | null
          phone: string
          cpf: string | null
          address: string | null
          notes: string | null
          bank_account: string | null
          profession: string | null
          marital_status: string | null
        }
        Insert: {
          name: string
          email?: string | null
          phone: string
          cpf?: string | null
          address?: string | null
          notes?: string | null
          bank_account?: string | null
          profession?: string | null
          marital_status?: string | null
        }
        Update: Partial<{
          name: string
          email?: string | null
          phone: string
          cpf?: string | null
          address?: string | null
          notes?: string | null
          bank_account?: string | null
          profession?: string | null
          marital_status?: string | null
        }>
      }
      clients: {
        Row: {
          id: string
          name: string
          email?: string
          phone: string
          type: "Comprador" | "Vendedor" | "Locatário" | "Locador"
          status: "Ativo" | "Inativo" | "Prospect"
          budget?: string
          notes?: string
          last_contact: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email?: string
          phone: string
          type: "Comprador" | "Vendedor" | "Locatário" | "Locador"
          status: "Ativo" | "Inativo" | "Prospect"
          budget?: string
          notes?: string
          last_contact: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<{
          id?: string
          name?: string
          email?: string
          phone?: string
          type?: "Comprador" | "Vendedor" | "Locatário" | "Locador"
          status?: "Ativo" | "Inativo" | "Prospect"
          budget?: string
          notes?: string
          last_contact?: string
          created_at?: string
          updated_at?: string
        }>
      }
      sales: {
        Row: {
          id: string
          property_id?: string
          property_name: string
          client_name?: string
          agent_name: string
          value: number
          commission?: number
          commission_installments?: number
          status: "Em Andamento" | "Concluída" | "Cancelada"
          type: "Venda" | "Aluguel" | "Permuta"
          semester?: string
          observations?: string
          partnership: boolean
          vgv?: number
          sale_date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          property_id?: string
          property_name: string
          client_name?: string
          agent_name: string
          value: number
          commission?: number
          commission_installments?: number
          status: "Em Andamento" | "Concluída" | "Cancelada"
          type: "Venda" | "Aluguel" | "Permuta"
          semester?: string
          observations?: string
          partnership: boolean
          vgv?: number
          sale_date: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<{
          id?: string
          property_id?: string
          property_name?: string
          client_name?: string
          agent_name?: string
          value?: number
          commission?: number
          commission_installments?: number
          status?: "Em Andamento" | "Concluída" | "Cancelada"
          type?: "Venda" | "Aluguel" | "Permuta"
          semester?: string
          observations?: string
          partnership?: boolean
          vgv?: number
          sale_date?: string
          created_at?: string
          updated_at?: string
        }>
      }
      payment_schedule: {
        Row: {
          id: string
          sale_id: string
          payment_date: string
          amount: number
          description?: string
          status: "Pendente" | "Recebido" | "Atrasado" | "Cancelado"
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          sale_id: string
          payment_date: string
          amount: number
          description?: string
          status: "Pendente" | "Recebido" | "Atrasado" | "Cancelado"
          created_at?: string
          updated_at?: string
        }
        Update: Partial<{
          id?: string
          sale_id?: string
          payment_date?: string
          amount?: number
          description?: string
          status?: "Pendente" | "Recebido" | "Atrasado" | "Cancelado"
          created_at?: string
          updated_at?: string
        }>
      }
      commission_schedule: {
        Row: {
          id: string
          sale_id: string
          payment_date: string
          amount: number
          description?: string
          status: "Pendente" | "Recebido" | "Atrasado" | "Cancelado"
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          sale_id: string
          payment_date: string
          amount: number
          description?: string
          status: "Pendente" | "Recebido" | "Atrasado" | "Cancelado"
          created_at?: string
          updated_at?: string
        }
        Update: Partial<{
          id?: string
          sale_id?: string
          payment_date?: string
          amount?: number
          description?: string
          status?: "Pendente" | "Recebido" | "Atrasado" | "Cancelado"
          created_at?: string
          updated_at?: string
        }>
      }
      calendar_events: {
        Row: {
          id: string
          title: string
          type:
            | "reuniao_construtora"
            | "conta_pagar"
            | "conta_fixa"
            | "visita_cliente"
            | "reuniao_interna"
            | "vencimento_contrato"
            | "recebimento_venda"
            | "recebimento_comissao"
          event_date: string
          event_time: string
          location?: string
          description?: string
          participants?: string[]
          amount?: number
          property_name?: string
          client_name?: string
          recipient?: string
          sale_id?: string
          payment_schedule_id?: string
          commission_schedule_id?: string
          status: "agendado" | "pendente" | "concluido" | "cancelado"
          priority: "alta" | "media" | "baixa"
          recurring: boolean
          recurring_day?: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          type:
            | "reuniao_construtora"
            | "conta_pagar"
            | "conta_fixa"
            | "visita_cliente"
            | "reuniao_interna"
            | "vencimento_contrato"
            | "recebimento_venda"
            | "recebimento_comissao"
          event_date: string
          event_time: string
          location?: string
          description?: string
          participants?: string[]
          amount?: number
          property_name?: string
          client_name?: string
          recipient?: string
          sale_id?: string
          payment_schedule_id?: string
          commission_schedule_id?: string
          status: "agendado" | "pendente" | "concluido" | "cancelado"
          priority: "alta" | "media" | "baixa"
          recurring: boolean
          recurring_day?: number
          created_at?: string
          updated_at?: string
        }
        Update: Partial<{
          id?: string
          title?: string
          type?:
            | "reuniao_construtora"
            | "conta_pagar"
            | "conta_fixa"
            | "visita_cliente"
            | "reuniao_interna"
            | "vencimento_contrato"
            | "recebimento_venda"
            | "recebimento_comissao"
          event_date?: string
          event_time?: string
          location?: string
          description?: string
          participants?: string[]
          amount?: number
          property_name?: string
          client_name?: string
          recipient?: string
          sale_id?: string
          payment_schedule_id?: string
          commission_schedule_id?: string
          status?: "agendado" | "pendente" | "concluido" | "cancelado"
          priority?: "alta" | "media" | "baixa"
          recurring?: boolean
          recurring_day?: number
          created_at?: string
          updated_at?: string
        }>
      }
      duty_schedule: {
        Row: {
          id: string
          duty_date: string
          employee_name: string
          reason?: string
          created_at: string
        }
        Insert: {
          id?: string
          duty_date: string
          employee_name: string
          reason?: string
          created_at?: string
        }
        Update: Partial<{
          id?: string
          duty_date?: string
          employee_name?: string
          reason?: string
          created_at?: string
        }>
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Property = Database["public"]["Tables"]["properties"]["Row"]
export type SeasonalRental = Database["public"]["Tables"]["seasonal_rentals"]["Row"]
export type User = Database["public"]["Tables"]["users"]["Row"]
export type Client = Database["public"]["Tables"]["clients"]["Row"]

// Crie um cliente Supabase singleton para o lado do cliente
const createBrowserClient = () => {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error("Supabase URL or Anon Key is missing!")
    // Em um ambiente de produção, você pode querer lançar um erro ou lidar com isso de forma mais robusta
    // Por enquanto, retornamos um cliente com valores vazios para evitar quebrar a aplicação
    return createClient("YOUR_SUPABASE_URL", "YOUR_SUPABASE_ANON_KEY")
  }
  return createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
}

export const supabase = createBrowserClient()

// Função genérica para upload de arquivos para um bucket
export const uploadFileToBucket = async (bucketName: string, path: string, file: File) => {
  try {
    const { data, error } = await supabase.storage.from(bucketName).upload(path, file)

    if (error) throw error

    const { data: urlData } = supabase.storage.from(bucketName).getPublicUrl(path)

    return urlData.publicUrl
  } catch (error) {
    console.error(`Erro no upload para o bucket ${bucketName}:`, error)
    throw error
  }
}

// Função genérica para deletar arquivos de um bucket
export const deleteFileFromBucket = async (bucketName: string, path: string) => {
  try {
    const { error } = await supabase.storage.from(bucketName).remove([path])

    if (error) throw error
    return true
  } catch (error) {
    console.error(`Erro ao deletar arquivo do bucket ${bucketName}:`, error)
    throw error
  }
}
