"use client"

import {
  BarChart3,
  Home,
  Users,
  FileText,
  DollarSign,
  User,
  Calendar,
  UserCheck,
  Settings,
  CalendarDays,
} from "lucide-react"

interface CRMSidebarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  currentUser: any
}

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: BarChart3, permission: "dashboard" },
  { id: "calendar", label: "Calendário", icon: Calendar, permission: "calendar" },
  { id: "duty", label: "Plantão", icon: UserCheck, permission: "duty" },
  { id: "properties", label: "Imóveis", icon: Home, permission: "properties" },
  { id: "seasonal", label: "Temporada", icon: CalendarDays, permission: "seasonal" },
  { id: "owners", label: "Proprietários", icon: User, permission: "owners" },
  { id: "clients", label: "Clientes", icon: Users, permission: "clients" },
  { id: "sales", label: "Vendas", icon: DollarSign, permission: "sales" },
  { id: "reports", label: "Relatórios", icon: FileText, permission: "reports" },
  { id: "users", label: "Usuários", icon: Settings, permission: "users" },
]

export function CRMSidebar({ activeTab, setActiveTab, currentUser }: CRMSidebarProps) {
  const hasPermission = (permission: string) => {
    return currentUser.permissions.includes("all") || currentUser.permissions.includes(permission)
  }

  const filteredMenuItems = menuItems.filter((item) => hasPermission(item.permission))

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
      <nav className="p-4">
        <ul className="space-y-2">
          {filteredMenuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === item.id
                    ? "bg-blue-50 text-blue-600 border-r-2 border-blue-600"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}
