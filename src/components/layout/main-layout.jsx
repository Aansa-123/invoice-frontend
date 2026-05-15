import { useState, useEffect } from "react"
import { LogOut, Menu } from "lucide-react"
import { Outlet, useNavigate, Link, useLocation } from "react-router-dom"
import { Button } from "../ui/button.jsx"
import Sidebar from "./sidebar.jsx"
import { Input } from "../ui/input"

export default function MainLayout({ userId, orgId, userRole, userPlan, isAdmin = false, isExpired = false, graceDays = 0 }) {
  const [showExpiredPopup, setShowExpiredPopup] = useState(isExpired)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    // Close sidebar on route change for mobile
    if (isSidebarOpen) {
      setIsSidebarOpen(false)
    }
  }, [location.pathname])

  const handleLogout = () => {
    navigate("/logout")
  }

  return (
    <div className="flex min-h-screen bg-[#0B0A1A] text-[#E0E0E0] dark selection:bg-[#7B5BE4]/30 selection:text-white relative">
      {/* Background radial gradient glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-[100%] h-[100%] bg-[radial-gradient(circle_at_0%_0%,#1E1B3A_0%,transparent_50%)] opacity-70" />
      </div>

      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        userRole={userRole}
        userPlan={userPlan}
        isAdmin={isAdmin}
      />

      <div className="flex-1 flex flex-col min-h-screen lg:ml-52 relative z-10">
        {/* Header remains transparent/blurred */}
        <header className="h-14 flex items-center justify-between px-5 border-b border-white/[0.03] bg-transparent backdrop-blur-2xl sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="lg:hidden text-[#94A3B8] hover:text-white hover:bg-white/[0.05]"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={20} />
            </Button>
            <div className="flex flex-col">
              <h1 className="text-sm font-black text-white tracking-tight">Invoice Management</h1>
              <p className="text-[8px] text-[#94A3B8] font-bold">Welcome back, manage your billing in one place</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Button onClick={handleLogout} variant="ghost" className="gap-2 text-[#94A3B8] hover:text-white hover:bg-white/[0.05] rounded-lg h-8 px-2.5 transition-all active:scale-95 group">
              <LogOut size={14} />
              <span className="font-bold text-[10px] hidden lg:inline">Logout</span>
            </Button>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-5 w-full">
          <div className="max-w-[1400px] mx-auto bg-[#121124] border border-white/[0.05] rounded-3xl min-h-[calc(100vh-80px)] shadow-2xl overflow-hidden">
            <Outlet context={{ userId, orgId, userRole, userPlan, isAdmin }} />
          </div>
        </main>
      </div>
    </div>
  )
}
