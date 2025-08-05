"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { testConnection } from "@/lib/supabase"
import { CheckCircle, XCircle, Loader2, Database } from "lucide-react"

export function TestConnection() {
  const [isLoading, setIsLoading] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState<string>("")

  const handleTestConnection = async () => {
    setIsLoading(true)
    setConnectionStatus("idle")
    setErrorMessage("")

    try {
      const isConnected = await testConnection()
      if (isConnected) {
        setConnectionStatus("success")
      } else {
        setConnectionStatus("error")
        setErrorMessage("Falha na conexão com o banco de dados")
      }
    } catch (error: any) {
      setConnectionStatus("error")
      setErrorMessage(error.message || "Erro desconhecido")
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = () => {
    switch (connectionStatus) {
      case "success":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="w-4 h-4 mr-1" />
            Conectado
          </Badge>
        )
      case "error":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            <XCircle className="w-4 h-4 mr-1" />
            Erro
          </Badge>
        )
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800 border-gray-200">
            <Database className="w-4 h-4 mr-1" />
            Não testado
          </Badge>
        )
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5" />
          Teste de Conexão Supabase
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Status:</span>
          {getStatusBadge()}
        </div>

        {connectionStatus === "error" && errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-700">{errorMessage}</p>
          </div>
        )}

        {connectionStatus === "success" && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-700">
              Conexão estabelecida com sucesso! O banco de dados está funcionando corretamente.
            </p>
          </div>
        )}

        <Button onClick={handleTestConnection} disabled={isLoading} className="w-full">
          {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {isLoading ? "Testando..." : "Testar Conexão"}
        </Button>

        <div className="text-xs text-gray-500 space-y-1">
          <p>
            <strong>URL:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL}
          </p>
          <p>
            <strong>Projeto:</strong> eiyiwnyxthfntkhrzmcx
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
