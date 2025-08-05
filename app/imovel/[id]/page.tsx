import { notFound } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { PropertyDetails } from "@/components/property-details"
import type { Property } from "@/lib/supabase"

interface PropertyPageProps {
  params: {
    id: string
  }
}

async function getProperty(id: string): Promise<Property | null> {
  try {
    const { data, error } = await supabase
      .from("properties")
      .select(`
        *,
        owners (
          id,
          name,
          email,
          phone
        )
      `)
      .eq("id", id)
      .single()

    if (error) {
      console.error("Erro ao buscar propriedade:", error)
      return null
    }

    return data as Property
  } catch (error) {
    console.error("Erro ao carregar propriedade:", error)
    return null
  }
}

export async function generateMetadata({ params }: PropertyPageProps) {
  const property = await getProperty(params.id)

  if (!property) {
    return {
      title: "Imóvel não encontrado",
    }
  }

  return {
    title: `${property.title} - Rieger Imóveis`,
    description: property.description || `${property.type} em ${property.address}`,
    openGraph: {
      title: property.title,
      description: property.description || `${property.type} em ${property.address}`,
      images: property.image_urls && property.image_urls.length > 0 ? [property.image_urls[0]] : [],
    },
  }
}

export default async function PropertyPage({ params }: PropertyPageProps) {
  const property = await getProperty(params.id)

  if (!property) {
    notFound()
  }

  return <PropertyDetails property={property} />
}
