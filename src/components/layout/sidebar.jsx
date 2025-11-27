
import { useNavigate, useLocation } from "react-router-dom"
import { LayoutDashboard, FileText, Users, Settings, X } from "lucide-react"

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { id: "invoices", label: "Invoices", icon: FileText, path: "/invoices" },
  { id: "clients", label: "Clients", icon: Users, path: "/clients" },
  { id: "settings", label: "Settings", icon: Settings, path: "/settings" },
]

export default function Sidebar({ isOpen, onToggle }) {
  const navigate = useNavigate()
  const location = useLocation()

  const getIsActive = (path) => {
    return location.pathname === path
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && <div className="fixed inset-0 bg-black/50 lg:hidden" onClick={() => onToggle()} />}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-card border-r border-border transform transition-transform duration-200 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } lg:translate-x-0 flex flex-col`}
      >
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <FileText className="text-primary-foreground" size={18} />
            </div>
            <h2 className="font-bold text-lg text-foreground">Invoice Pro</h2>
          </div>
          <button onClick={() => onToggle()} className="lg:hidden p-1 hover:bg-muted rounded">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = getIsActive(item.path)

            return (
              <button
                key={item.id}
                onClick={() => {
                  navigate(item.path)
                  if (window.innerWidth < 1024) onToggle()
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </button>
            )
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">© 2025 Invoice Pro</p>
        </div>
      </aside>
    </>
  )
}
