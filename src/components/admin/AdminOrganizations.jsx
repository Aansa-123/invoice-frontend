import { useState, useEffect } from "react"
import { Card } from "../ui/card"
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "../ui/table"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { MoreHorizontal, ShieldCheck, ShieldAlert, Calendar, CreditCard, Building2, User } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu"

export default function AdminOrganizations() {
  const [organizations, setOrganizations] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedOrg, setSelectedOrg] = useState(null)
  const [isExtendModalOpen, setIsExtendModalOpen] = useState(false)
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false)
  
  const [extendData, setExtendData] = useState({ days: 3, reason: "Grace period" })
  const [newPlan, setNewPlan] = useState("Monthly")

  useEffect(() => {
    fetchOrganizations()
  }, [])

  const fetchOrganizations = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/organizations`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      })
      const data = await res.json()
      if (data.success) {
        setOrganizations(data.data)
      }
    } catch (error) {
      console.error("Failed to fetch organizations", error)
    } finally {
      setLoading(false)
    }
  }

  const handleExtend = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/organizations/${selectedOrg._id}/extend`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(extendData)
      })
      if (res.ok) {
        setIsExtendModalOpen(false)
        fetchOrganizations()
      }
    } catch (error) {
      console.error("Failed to extend subscription", error)
    }
  }

  const handleChangePlan = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/organizations/${selectedOrg._id}/change-plan`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ planName: newPlan })
      })
      if (res.ok) {
        setIsPlanModalOpen(false)
        fetchOrganizations()
      }
    } catch (error) {
      console.error("Failed to change plan", error)
    }
  }

  const toggleStatus = async (org) => {
    const newStatus = org.subscription?.status === "disabled" ? "active" : "disabled"
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/organizations/${org._id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ status: newStatus })
      })
      if (res.ok) {
        fetchOrganizations()
      }
    } catch (error) {
      console.error("Failed to update status", error)
    }
  }

  const activeOrgs = organizations.filter(org => org.status !== "pending")

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  )

  return (
    <div className="p-6 space-y-8 pb-20 animate-in fade-in duration-500">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-3">
          <Building2 className="text-primary" size={28} /> Organization Management
        </h2>
        <p className="text-xs text-[#71717A] font-bold uppercase tracking-wider ml-1">Monitor and control organization entities</p>
      </div>

      <Card className="bg-[#1A1635] border border-white/[0.03] rounded-2xl shadow-2xl overflow-hidden">
        <Table>
          <TableHeader className="bg-white/[0.02]">
            <TableRow className="border-white/[0.03] hover:bg-transparent">
              <TableHead className="text-[10px] font-black text-[#71717A] uppercase tracking-widest py-4">Organization</TableHead>
              <TableHead className="text-[10px] font-black text-[#71717A] uppercase tracking-widest py-4">Owner</TableHead>
              <TableHead className="text-[10px] font-black text-[#71717A] uppercase tracking-widest py-4">Plan</TableHead>
              <TableHead className="text-[10px] font-black text-[#71717A] uppercase tracking-widest py-4">Status</TableHead>
              <TableHead className="text-[10px] font-black text-[#71717A] uppercase tracking-widest py-4">Expiry</TableHead>
              <TableHead className="text-[10px] font-black text-[#71717A] uppercase tracking-widest py-4 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activeOrgs.map((org) => (
              <TableRow key={org._id} className="border-white/[0.03] hover:bg-white/[0.01] transition-colors">
                <TableCell className="py-4">
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-white tracking-tight">{org.name}</span>
                    <span className="text-[10px] text-[#71717A] font-bold tracking-tight">{org.email}</span>
                    {org.status === "rejected" && <Badge className="mt-1 bg-rose-500/10 text-rose-500 border-rose-500/10 text-[7px] font-black tracking-widest border px-1">REJECTED</Badge>}
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                      <User size={14} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-white/90 tracking-tight">{org.owner?.name}</span>
                      <span className="text-[9px] text-[#71717A] font-bold tracking-tight">{org.owner?.email}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  <Badge className="bg-primary/10 text-primary border-primary/20 text-[9px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-md border">
                    {org.subscription?.plan || "Free"}
                  </Badge>
                </TableCell>
                <TableCell className="py-4">
                  <Badge className={`text-[9px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-md border ${
                    org.subscription?.status === "active" 
                      ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" 
                      : "bg-rose-500/10 text-rose-500 border-rose-500/20"
                  }`}>
                    {org.subscription?.status || "active"}
                  </Badge>
                </TableCell>
                <TableCell className="py-4">
                  <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">
                    {org.subscription?.end ? new Date(org.subscription.end).toLocaleDateString() : "Unlimited"}
                  </span>
                </TableCell>
                <TableCell className="py-4 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-[#71717A] hover:text-white hover:bg-white/5 rounded-xl">
                        <MoreHorizontal size={18} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-[#1A1635] border-white/[0.08] text-white">
                      <DropdownMenuItem onClick={() => { setSelectedOrg(org); setIsPlanModalOpen(true); }} className="hover:bg-white/5 focus:bg-white/5 cursor-pointer">
                        <CreditCard className="mr-2 h-4 w-4 text-primary" /> <span className="text-xs font-bold uppercase tracking-wider">Change Plan</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => { setSelectedOrg(org); setIsExtendModalOpen(true); }} className="hover:bg-white/5 focus:bg-white/5 cursor-pointer">
                        <Calendar className="mr-2 h-4 w-4 text-amber-500" /> <span className="text-xs font-bold uppercase tracking-wider">Extend Subscription</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toggleStatus(org)} className={`hover:bg-white/5 focus:bg-white/5 cursor-pointer ${org.subscription?.status === "active" ? "text-rose-500" : "text-emerald-500"}`}>
                        {org.subscription?.status === "active" ? <ShieldAlert className="mr-2 h-4 w-4" /> : <ShieldCheck className="mr-2 h-4 w-4" />}
                        <span className="text-xs font-bold uppercase tracking-wider">{org.subscription?.status === "active" ? "Disable" : "Enable"}</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Extend Modal */}
      <Dialog open={isExtendModalOpen} onOpenChange={setIsExtendModalOpen}>
        <DialogContent className="bg-[#1A1635] border border-white/[0.08] text-white rounded-3xl max-w-sm backdrop-blur-xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-black tracking-tight flex items-center gap-2">
              <Calendar className="text-amber-500" size={20} /> Extend Subscription
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-4">
            <div className="space-y-1.5">
              <Label htmlFor="days" className="text-[10px] font-black text-[#71717A] uppercase tracking-widest ml-1">Extra Days</Label>
              <Input 
                id="days" 
                type="number" 
                value={extendData.days} 
                onChange={(e) => setExtendData({...extendData, days: e.target.value})}
                className="bg-white/[0.03] border-white/[0.08] focus:border-primary/50 text-white rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="reason" className="text-[10px] font-black text-[#71717A] uppercase tracking-widest ml-1">Reason</Label>
              <Input 
                id="reason" 
                value={extendData.reason} 
                onChange={(e) => setExtendData({...extendData, reason: e.target.value})}
                className="bg-white/[0.03] border-white/[0.08] focus:border-primary/50 text-white rounded-xl"
              />
            </div>
          </div>
          <DialogFooter className="pt-2 gap-3">
            <Button variant="outline" onClick={() => setIsExtendModalOpen(false)} className="bg-transparent border-white/10 text-white/60 hover:text-white hover:bg-white/5 rounded-xl border-0">
              Cancel
            </Button>
            <Button onClick={handleExtend} className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl px-8 border-0 shadow-lg shadow-amber-500/20">
              Extend Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Plan Modal */}
      <Dialog open={isPlanModalOpen} onOpenChange={setIsPlanModalOpen}>
        <DialogContent className="bg-[#1A1635] border border-white/[0.08] text-white rounded-3xl max-w-sm backdrop-blur-xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-black tracking-tight flex items-center gap-2">
              <CreditCard className="text-primary" size={20} /> Change Plan
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-4">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black text-[#71717A] uppercase tracking-widest ml-1">Select New Tier</Label>
              <select 
                className="flex h-10 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 transition-all"
                value={newPlan}
                onChange={(e) => setNewPlan(e.target.value)}
              >
                <option value="Free" className="bg-[#1A1635]">Free</option>
                <option value="Monthly" className="bg-[#1A1635]">Monthly</option>
                <option value="Yearly" className="bg-[#1A1635]">Yearly</option>
                <option value="Lifetime" className="bg-[#1A1635]">Lifetime</option>
              </select>
            </div>
          </div>
          <DialogFooter className="pt-2 gap-3">
            <Button variant="outline" onClick={() => setIsPlanModalOpen(false)} className="bg-transparent border-white/10 text-white/60 hover:text-white hover:bg-white/5 rounded-xl border-0">
              Cancel
            </Button>
            <Button onClick={handleChangePlan} className="bg-primary hover:bg-primary/90 text-white rounded-xl px-8 border-0 shadow-lg shadow-primary/20">
              Confirm Change
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
