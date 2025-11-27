
import { useState } from "react"
import { LogOut, Menu } from "lucide-react"
import { Button } from "../ui/button.jsx"
import Sidebar from "../layout/sidebar.jsx"
import DashboardContent from "./dashboard-content.jsx"
import InvoicesPage from "../invoices/invoices-page.jsx"
import ClientsPage from "../clients/clients-page.jsx"
import SettingsPage from "../settings/settings-page.jsx"

export default function Dashboard() {
  const [currentPage, setCurrentPage] = useState("dashboard")
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token")
      
      await fetch(`${import.meta.env.VITE_API_URL}/api/auth/logout`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      })
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      localStorage.removeItem("token")
      window.location.href = "/"
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        currentPage={currentPage}
        onNavigate={setCurrentPage}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-card border-b border-border h-16 flex items-center justify-between px-6 shadow-sm">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 hover:bg-muted rounded-lg">
              <Menu size={20} />
            </button>
            <h1 className="text-xl font-semibold text-foreground">Invoice Management</h1>
          </div>

          <Button onClick={handleLogout} variant="outline" className="gap-2 bg-transparent">
            <LogOut size={16} />
            Logout
          </Button>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          {currentPage === "dashboard" && <DashboardContent onNavigate={setCurrentPage} />}
          {currentPage === "invoices" && <InvoicesPage />}
          {currentPage === "clients" && <ClientsPage />}
          {currentPage === "settings" && <SettingsPage />}
        </main>
      </div>
    </div>
  )
}
