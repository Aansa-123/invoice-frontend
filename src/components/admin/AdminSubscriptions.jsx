import { useState, useEffect } from "react"
import { Card } from "../ui/card"
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "../ui/table"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Calendar, CreditCard, Clock, AlertTriangle, ShieldOff } from "lucide-react"

export default function AdminSubscriptions() {
  const [organizations, setOrganizations] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedOrg, setSelectedOrg] = useState(null)
  const [isExtendModalOpen, setIsExtendModalOpen] = useState(false)
  const [extendData, setExtendData] = useState({ days: 30, reason: "Manual extension" })

  useEffect(() => {
    fetchSubscriptions()
  }, [])

  const fetchSubscriptions = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/organizations`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      })
      const data = await res.json()
      if (data.success) {
        setOrganizations(data.data.filter(org => org.subscription?.plan !== "Free"))
      }
    } catch (error) {
      console.error("Failed to fetch subscriptions", error)
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
        fetchSubscriptions()
      }
    } catch (error) {
      console.error("Failed to extend subscription", error)
    }
  }

  const handleDisable = async (id) => {
    if (!window.confirm("Are you sure you want to disable this subscription and revert this organization to the Free plan?")) {
      return
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/organizations/${id}/disable-subscription`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      })

      if (res.ok) {
        fetchSubscriptions()
      } else {
        const data = await res.json()
        alert(data.error || "Action failed")
      }
    } catch (error) {
      console.error("Failed to disable subscription", error)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  )

  return (
    <div className="p-6 space-y-8 pb-20 animate-in fade-in duration-500">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-3">
          <CreditCard className="text-primary" size={28} /> Active Paid Subscriptions
        </h2>
        <p className="text-xs text-[#71717A] font-bold uppercase tracking-wider ml-1">Monitor high-tier active accounts</p>
      </div>

      <Card className="bg-[#1A1635] border border-white/[0.03] rounded-2xl shadow-2xl overflow-hidden">
        <Table>
          <TableHeader className="bg-white/[0.02]">
            <TableRow className="border-white/[0.03] hover:bg-transparent">
              <TableHead className="text-[10px] font-black text-[#71717A] uppercase tracking-widest py-4">Organization</TableHead>
              <TableHead className="text-[10px] font-black text-[#71717A] uppercase tracking-widest py-4">Plan</TableHead>
              <TableHead className="text-[10px] font-black text-[#71717A] uppercase tracking-widest py-4">Status</TableHead>
              <TableHead className="text-[10px] font-black text-[#71717A] uppercase tracking-widest py-4">Expiry Date</TableHead>
              <TableHead className="text-[10px] font-black text-[#71717A] uppercase tracking-widest py-4">Grace Days</TableHead>
              <TableHead className="text-[10px] font-black text-[#71717A] uppercase tracking-widest py-4 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {organizations.map((org) => {
              const isExpired = org.subscription?.end && new Date(org.subscription.end) < new Date()
              return (
                <TableRow key={org._id} className="border-white/[0.03] hover:bg-white/[0.01] transition-colors">
                  <TableCell className="py-4">
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-white tracking-tight">{org.name}</span>
                      <span className="text-[10px] text-[#71717A] font-bold tracking-tight">{org.owner?.email}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <Badge className="bg-primary/10 text-primary border-primary/20 text-[9px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-md border">
                      {org.subscription?.plan}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-4">
                    <Badge className={`text-[9px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-md border ${
                      org.subscription?.status === "active" 
                        ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" 
                        : "bg-rose-500/10 text-rose-500 border-rose-500/20"
                    }`}>
                      {org.subscription?.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-black uppercase tracking-widest ${isExpired ? "text-rose-500" : "text-white/60"}`}>
                        {org.subscription?.end ? new Date(org.subscription.end).toLocaleDateString() : "No end date"}
                      </span>
                      {isExpired && <AlertTriangle size={14} className="text-rose-500 animate-pulse" />}
                    </div>
                  </TableCell>
                  <TableCell className="py-4 text-center">
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">{org.subscription?.graceDays || 0}</span>
                  </TableCell>
                  <TableCell className="py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => { setSelectedOrg(org); setIsExtendModalOpen(true); }} className="text-[#71717A] hover:text-white hover:bg-white/5 rounded-xl">
                        <Clock size={14} className="mr-2 text-amber-500" /> <span className="text-[10px] font-bold uppercase tracking-wider">Extend</span>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDisable(org._id)}
                        className="text-[#71717A] hover:text-rose-500 hover:bg-rose-500/10 rounded-xl"
                      >
                        <ShieldOff size={14} className="mr-2" /> <span className="text-[10px] font-bold uppercase tracking-wider">Disable</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={isExtendModalOpen} onOpenChange={setIsExtendModalOpen}>
        <DialogContent className="bg-[#1A1635] border border-white/[0.08] text-white rounded-3xl max-w-sm backdrop-blur-xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-black tracking-tight flex items-center gap-2">
              <Calendar className="text-amber-500" size={20} /> Extend Subscription
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-4">
             <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                <p className="text-[10px] font-black text-[#71717A] uppercase tracking-widest mb-1">Organization</p>
                <p className="text-xs font-black text-white">{selectedOrg?.name}</p>
             </div>
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
            <Button onClick={handleExtend} className="bg-primary hover:bg-primary/90 text-white rounded-xl px-8 border-0 shadow-lg shadow-primary/20">
              Extend Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
