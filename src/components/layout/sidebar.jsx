
import { useNavigate, useLocation } from "react-router-dom"
import { useState, useEffect } from "react"
import { 
  LayoutDashboard, FileText, Users, Settings, X, CreditCard, 
  BarChart3, Users2, History, Shield, Database, Activity, 
  Package, Building2, Banknote, Plus, ChevronDown, Check, ShieldCheck, Lock
} from "lucide-react"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "../ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Button } from "../ui/button"

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { id: "invoices", label: "Invoices", icon: FileText, path: "/invoices" },
  { id: "clients", label: "Clients", icon: Users, path: "/clients" },
  { id: "payments", label: "Payments", icon: CreditCard, path: "/payments" },
  { id: "reports", label: "Reports", icon: BarChart3, path: "/reports" },
  { id: "team", label: "Team", icon: Users2, path: "/team" },
  { id: "history", label: "History", icon: History, path: "/history" },
  { id: "subscription", label: "Subscription", icon: Package, path: "/subscription" },
  { id: "settings", label: "Settings", icon: Settings, path: "/settings" },
]

const adminMenuItems = [
  { id: "admin-dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/admin" },
  { id: "admin-users", label: "Users", icon: Users, path: "/admin/users" },
  { id: "admin-orgs", label: "Organizations", icon: Building2, path: "/admin/orgs" },
  { id: "admin-plans", label: "Plans", icon: Database, path: "/admin/plans" },
  { id: "admin-subscriptions", label: "Subscriptions", icon: CreditCard, path: "/admin/subscriptions" },
  { id: "admin-payments", label: "Payments", icon: Banknote, path: "/admin/payments" },
  { id: "admin-approvals", label: "Approval Requests", icon: ShieldCheck, path: "/admin/approvals" },
  { id: "admin-logs", label: "System Logs", icon: Activity, path: "/admin/logs" },
  { id: "admin-settings", label: "Settings", icon: Settings, path: "/admin/settings" },
]

export default function Sidebar({ isOpen, onToggle, userRole, userPlan = "Free", isAdmin = false }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [organizations, setOrganizations] = useState([])
  const [currentOrg, setCurrentOrg] = useState(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [lockedFeature, setLockedFeature] = useState("")
  const [newOrgData, setNewOrgData] = useState({ name: "", email: "" })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isAdmin) {
      fetchOrganizations()
    }
  }, [isAdmin])

  const fetchOrganizations = async () => {
    try {
      const token = localStorage.getItem("token")
      const [orgsRes, meRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/api/organizations`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ])

      if (orgsRes.ok && meRes.ok) {
        const orgsData = await orgsRes.json()
        const meData = await meRes.json()
        setOrganizations(orgsData.data || [])
        const current = orgsData.data.find(o => o._id === meData.user.currentOrganization?._id || o._id === meData.user.currentOrganization)
        setCurrentOrg(current)
      }
    } catch (error) {
      console.error("Failed to fetch organizations", error)
    }
  }

  const handleSwitchOrg = async (id) => {
    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/organizations/switch/${id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      })

      if (res.ok) {
        window.location.reload()
      }
    } catch (error) {
      console.error("Failed to switch organization", error)
    }
  }

  const handleCreateOrg = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/organizations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newOrgData)
      })

      if (res.ok) {
        const data = await res.json()
        if (data.data.status === "pending") {
          alert("Organization created and pending admin approval.")
        } else {
          window.location.reload()
        }
        setIsCreateModalOpen(false)
      } else {
        const err = await res.json()
        alert(err.error || "Failed to create organization")
      }
    } catch (error) {
      console.error("Error creating organization", error)
      alert("Error creating organization")
    } finally {
      setLoading(false)
    }
  }

  const getIsActive = (path) => {
    return location.pathname === path
  }

  const itemsToRender = isAdmin ? adminMenuItems : menuItems.filter(item => {
    if (item.id === "team" || item.id === "settings") {
      return userRole === "Owner" || userRole === "Admin"
    }
    return true
  })

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
        <div className="p-6 border-b border-border flex flex-col gap-4">
          <div className="flex items-center justify-between w-full">
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

          {!isAdmin && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center justify-between w-full p-2 bg-muted/50 hover:bg-muted rounded-lg border border-border transition-colors group">
                  <div className="flex items-center gap-2 overflow-hidden text-left">
                    <div className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center shrink-0">
                      <Building2 className="text-primary" size={14} />
                    </div>
                    <span className="font-medium text-sm truncate">{currentOrg ? currentOrg.name : "Select Organization"}</span>
                  </div>
                  <ChevronDown size={14} className="text-muted-foreground group-hover:text-foreground transition-colors" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="start">
                <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Switch Organization
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {organizations.length > 0 ? (
                  organizations.map((org) => (
                    <DropdownMenuItem
                      key={org._id}
                      onClick={() => handleSwitchOrg(org._id)}
                      className="flex items-center justify-between cursor-pointer"
                    >
                      <span className={`truncate ${currentOrg && org._id === currentOrg._id ? "font-bold" : ""}`}>
                        {org.name}
                      </span>
                      {currentOrg && org._id === currentOrg._id && <Check size={14} className="text-primary" />}
                      {org.status === "pending" && <span className="text-[8px] bg-orange-100 text-orange-600 px-1 rounded ml-2">PENDING</span>}
                    </DropdownMenuItem>
                  ))
                ) : (
                  <div className="p-2 text-xs text-muted-foreground text-center">No organizations found</div>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setIsCreateModalOpen(true)} className="cursor-pointer text-primary">
                  <Plus size={14} className="mr-2" /> Create New Organization
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {itemsToRender.map((item) => {
            const Icon = item.icon
            const isActive = getIsActive(item.path)
            const isLocked = !isAdmin && (userPlan === "Free" || !userPlan) && (item.id === "reports" || item.id === "team")

            return (
              <button
                key={item.id}
                onClick={() => {
                  if (isLocked) {
                    setLockedFeature(item.label)
                    setShowUpgradeModal(true)
                    return
                  }
                  navigate(item.path)
                  if (window.innerWidth < 1024) onToggle()
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors group ${
                  isActive ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"
                }`}
                title={isLocked ? `Upgrade to unlock ${item.label}` : ""}
              >
                <div className="flex items-center gap-3">
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </div>
                {isLocked && <Lock size={14} className="text-muted-foreground group-hover:text-foreground transition-colors" />}
              </button>
            )
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">© 2025 Invoice Pro</p>
        </div>
      </aside>

      {/* Create Org Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Organization</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateOrg} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="orgName">Organization Name</Label>
              <Input
                id="orgName"
                value={newOrgData.name}
                onChange={(e) => setNewOrgData({ ...newOrgData, name: e.target.value })}
                placeholder="Acme Inc."
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="orgEmail">Business Email</Label>
              <Input
                id="orgEmail"
                type="email"
                value={newOrgData.email}
                onChange={(e) => setNewOrgData({ ...newOrgData, email: e.target.value })}
                placeholder="billing@acme.com"
                required
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Additional organizations require admin approval before they can be accessed.
            </p>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Submit Approval Request"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Feature Locked Modal */}
      <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mb-4 mx-auto">
              <Lock className="text-amber-600 dark:text-amber-400" size={24} />
            </div>
            <DialogTitle className="text-center text-xl font-bold">Feature Locked</DialogTitle>
          </DialogHeader>
          <div className="text-center py-4 space-y-3">
            <p className="text-muted-foreground">
              <strong>{lockedFeature}</strong> is only available in paid plans.
            </p>
            <p className="text-sm font-medium">
              Upgrade your plan to unlock team collaboration, advanced reporting, and more.
            </p>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button 
              variant="outline" 
              onClick={() => setShowUpgradeModal(false)}
              className="w-full"
            >
              Cancel
            </Button>
            <Button 
              onClick={() => {
                setShowUpgradeModal(false)
                navigate("/subscription")
              }}
              className="w-full bg-primary hover:bg-primary/90 font-bold"
            >
              Upgrade Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
