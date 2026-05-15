
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
    <div className="flex h-screen bg-[#0B0A1A] text-[#E0E0E0] relative overflow-hidden">
      {/* Background radial gradient glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-[100%] h-[100%] bg-[radial-gradient(circle_at_0%_0%,#1E1B3A_0%,transparent_50%)] opacity-70" />
      </div>

      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        currentPage={currentPage}
        onNavigate={setCurrentPage}
      />

      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 relative z-10 ${sidebarOpen ? "lg:ml-52" : ""}`}>
        {/* Header */}
        <header className="bg-transparent backdrop-blur-2xl border-b border-white/5 h-14 flex items-center justify-between px-4 lg:px-6 shadow-sm">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-1.5 hover:bg-muted rounded-lg">
              <Menu size={18} />
            </button>
            <h1 className="text-sm font-black text-white tracking-tight">Invoice Management</h1>
          </div>

          <Button onClick={handleLogout} variant="outline" size="sm" className="gap-2 bg-transparent h-8 text-xs border-white/10 text-[#94A3B8] hover:text-white">
            <LogOut size={14} />
            Logout
          </Button>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-5 overflow-auto">
          <div className="max-w-[1400px] mx-auto bg-[#121124] border border-white/[0.05] rounded-3xl min-h-full shadow-2xl overflow-hidden">
            {currentPage === "dashboard" && <DashboardContent onNavigate={setCurrentPage} />}
            {currentPage === "invoices" && <InvoicesPage />}
            {currentPage === "clients" && <ClientsPage />}
            {currentPage === "settings" && <SettingsPage />}
          </div>
        </main>
      </div>
    </div>
  )
}
