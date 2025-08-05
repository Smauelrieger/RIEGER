"use client"

import { useState } from "react"
import { LoginForm } from "@/components/crm/login-form"
import { CRMHeader } from "@/components/crm/crm-header"
import { CRMSidebar } from "@/components/crm/crm-sidebar"
import { Dashboard } from "@/components/crm/dashboard"
import { PropertiesManager } from "@/components/crm/properties-manager"
import { OwnersManager } from "@/components/crm/owners-manager"
import { ClientsManager } from "@/components/crm/clients-manager"
import { SalesManager } from "@/components/crm/sales-manager"
import { ReportsView } from "@/components/crm/reports-view"
import { CalendarManager } from "@/components/crm/calendar-manager"
import { DutySchedule } from "@/components/crm/duty-schedule"
import { UsersManager } from "@/components/crm/users-manager"
import { SeasonalManager } from "@/components/crm/seasonal-manager"

export default function CRMPage() {
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("dashboard")

  const handleLogin = (userData: any) => {
    setCurrentUser(userData)
  }

  const handleLogout = () => {
    setCurrentUser(null)
    setActiveTab("dashboard")
  }

  // Se não estiver logado, mostra a tela de login
  if (!currentUser) {
    return <LoginForm onLogin={handleLogin} />
  }

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />
      case "calendar":
        return <CalendarManager />
      case "duty":
        return <DutySchedule />
      case "properties":
        return <PropertiesManager />
      case "seasonal":
        return <SeasonalManager />
      case "owners":
        return <OwnersManager />
      case "clients":
        return <ClientsManager />
      case "sales":
        return <SalesManager currentUser={currentUser} />
      case "reports":
        return <ReportsView />
      case "users":
        return <UsersManager currentUser={currentUser} />
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <CRMHeader currentUser={currentUser} onLogout={handleLogout} />
      <div className="flex">
        <CRMSidebar activeTab={activeTab} setActiveTab={setActiveTab} currentUser={currentUser} />
        <main className="flex-1 p-6">{renderContent()}</main>
      </div>
    </div>
  )
}
