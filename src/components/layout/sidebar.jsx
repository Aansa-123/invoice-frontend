
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
  { id: "reports", label: "Reports", icon: BarChart3, path: "/reports", pro: true },
  { id: "team", label: "Team", icon: Users2, path: "/team", pro: true },
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

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-52 bg-[#1A1635] border-r border-white/[0.02] flex flex-col shadow-2xl transition-all duration-300 ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        <div className="p-3 flex flex-col gap-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#7B5BE4] to-cyan-400 flex items-center justify-center shadow-lg shadow-[#7B5BE4]/20">
                <FileText className="text-white" size={14} strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="font-black text-xs text-white tracking-tight leading-none">Invoice Pro</h2>
                <p className="text-[7px] text-[#71717A] font-bold mt-0.5">Billing made simple</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="lg:hidden text-[#71717A] hover:text-white h-7 w-7" 
              onClick={() => onToggle()}
            >
              <X size={16} />
            </Button>
          </div>

          {!isAdmin && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center justify-between w-full p-2 bg-white/[0.03] hover:bg-white/[0.05] rounded-xl border border-white/[0.05] transition-all group active:scale-[0.98]">
                  <div className="flex items-center gap-2 overflow-hidden text-left">
                    <div className="w-5 h-5 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0 border border-indigo-500/10">
                      <Building2 className="text-indigo-400" size={10} />
                    </div>
                    <span className="font-bold text-[9px] truncate text-white/70 group-hover:text-white transition-colors">{currentOrg ? currentOrg.name : "Select Account"}</span>
                  </div>
                  <ChevronDown size={8} className="text-[#71717A] group-hover:text-white transition-colors" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-[#14142B] border-white/5 text-white p-2 rounded-[1.5rem] shadow-2xl backdrop-blur-xl" align="start">
                <DropdownMenuLabel className="px-3 py-2 text-[9px] font-black text-[#94A3B8] uppercase tracking-widest opacity-70">
                  Active Accounts
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/[0.03] my-1" />
                {organizations.length > 0 ? (
                  <div className="space-y-1">
                    {organizations.map((org) => (
                      <DropdownMenuItem
                        key={org._id}
                        onClick={() => handleSwitchOrg(org._id)}
                        className="flex items-center justify-between cursor-pointer focus:bg-white/[0.05] focus:text-white p-2.5 rounded-xl transition-all group"
                      >
                        <span className={`truncate text-[11px] ${currentOrg && org._id === currentOrg._id ? "font-black text-[#7B5BE4]" : "font-bold text-[#94A3B8] group-hover:text-white"}`}>
                          {org.name}
                        </span>
                        {currentOrg && org._id === currentOrg._id && <Check size={12} className="text-[#7B5BE4] stroke-[3]" />}
                      </DropdownMenuItem>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-[10px] text-[#94A3B8] text-center font-bold">No accounts found</div>
                )}
                <DropdownMenuSeparator className="bg-white/[0.03] my-1" />
                <DropdownMenuItem onClick={() => setIsCreateModalOpen(true)} className="cursor-pointer text-[#7B5BE4] font-black text-[9px] uppercase tracking-widest focus:bg-[#7B5BE4]/10 rounded-xl p-2.5 flex items-center gap-2 group">
                  <div className="w-5 h-5 rounded-lg bg-[#7B5BE4]/10 flex items-center justify-center group-hover:bg-[#7B5BE4]/20 transition-colors">
                    <Plus size={12} strokeWidth={3} />
                  </div>
                  Add New Account
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <nav className="flex-1 px-2.5 space-y-0.5 overflow-y-auto scrollbar-none py-1.5">
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
                  // Close sidebar on mobile after navigation
                  if (window.innerWidth < 1024) {
                    onToggle()
                  }
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all duration-300 group relative overflow-hidden ${
                  isActive 
                    ? "bg-[#7B5BE4] text-white shadow-md shadow-[#7B5BE4]/20" 
                    : "text-[#71717A] hover:text-white hover:bg-white/[0.03]"
                }`}
                title={isLocked ? `Upgrade to unlock ${item.label}` : ""}
              >
                {/* Active indicator bar */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-3 bg-white rounded-r-full shadow-[0_0_8px_white]" />
                )}
                
                <div className="flex items-center gap-2.5">
                  <Icon size={14} strokeWidth={isActive ? 2.5 : 2} className={`${isActive ? "text-white" : "text-[#71717A] group-hover:text-white"} transition-all duration-300`} />
                  <span className={`font-bold text-[10px] tracking-tight ${isActive ? "text-white" : "text-[#71717A] group-hover:text-white"}`}>{item.label}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {item.pro && (
                    <span className={`text-[7px] font-black px-1 py-0.5 rounded bg-[#F39C12]/10 text-[#F39C12] border border-[#F39C12]/10`}>PRO</span>
                  )}
                  {isLocked && <Lock size={9} className="text-[#71717A] group-hover:text-white/30 transition-all" />}
                </div>
              </button>
            )
          })}
        </nav>

        <div className="p-3">
          <div className="bg-[#1A1635] rounded-2xl p-3 border border-white/[0.03] relative overflow-hidden group">
            <div className="relative z-10">
              <h4 className="text-[10px] font-bold text-white tracking-tight">Upgrade to Pro</h4>
              <p className="text-[8px] text-[#71717A] mt-0.5 mb-2.5 leading-relaxed font-medium">Unlock reports, team & more</p>
              <Button 
                onClick={() => navigate("/subscription")}
                size="sm" 
                className="w-full text-[9px] font-bold h-7 rounded-lg bg-gradient-to-r from-[#7B5BE4] to-cyan-500 hover:opacity-90 transition-all active:scale-95 text-white border-none"
              >
                View Plans
              </Button>
            </div>
          </div>
          <p className="text-[8px] text-[#71717A] text-center mt-3 font-medium opacity-50">© 2025 Invoice Pro</p>
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
