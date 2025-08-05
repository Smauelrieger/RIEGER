import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const location = searchParams.get("location")
  const purpose = searchParams.get("purpose")
  const bedrooms = searchParams.get("bedrooms")
  const propertyType = searchParams.get("propertyType")
  const tags = searchParams.get("tags") // Novo parâmetro para tags

  let query = supabase.from("properties").select("*").eq("is_active", true)

  if (location) {
    query = query.or(
      `city.ilike.%${location}%,address.ilike.%${location}%,description.ilike.%${location}%,title.ilike.%${location}%`,
    )
  }

  if (purpose && purpose !== "all") {
    query = query.eq("purpose", purpose)
  }

  if (bedrooms && bedrooms !== "any") {
    const numBedrooms = Number.parseInt(bedrooms)
    if (!isNaN(numBedrooms)) {
      if (numBedrooms >= 4) {
        query = query.gte("bedrooms", numBedrooms)
      } else {
        query = query.eq("bedrooms", numBedrooms)
      }
    }
  }

  if (propertyType && propertyType !== "all") {
    query = query.eq("type", propertyType)
  }

  if (tags) {
    const tagArray = tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean)
    if (tagArray.length > 0) {
      // Use the 'cs' (contains) operator for array columns
      query = query.contains("tags", tagArray)
    }
  }

  try {
    const { data, error } = await query.order("created_at", { ascending: false })

    if (error) {
      console.error("Error searching properties:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error searching properties:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
