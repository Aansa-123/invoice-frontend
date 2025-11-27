import { useState } from "react"
import { LogOut, Menu } from "lucide-react"
import { Outlet, useNavigate } from "react-router-dom"
import { Button } from "../ui/button.jsx"
import Sidebar from "./sidebar.jsx"

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const navigate = useNavigate()

  const handleLogout = () => {
    navigate("/logout")
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
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

        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
