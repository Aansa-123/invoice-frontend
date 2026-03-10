import { useState, useEffect } from "react"
import { Card } from "../ui/card"
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "../ui/table"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { MoreHorizontal, ShieldCheck, ShieldAlert, Calendar, CreditCard } from "lucide-react"
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

  const handleApprove = async (id) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/organizations/${id}/approve`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      })
      if (res.ok) {
        alert("Organization approved")
        fetchOrganizations()
      }
    } catch (error) {
      console.error("Failed to approve organization", error)
      alert("Failed to approve organization")
    }
  }

  const handleReject = async (id) => {
    if (!confirm("Are you sure you want to reject this organization?")) return
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/organizations/${id}/reject`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      })
      if (res.ok) {
        alert("Organization rejected")
        fetchOrganizations()
      }
    } catch (error) {
      console.error("Failed to reject organization", error)
      alert("Failed to reject organization")
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
        alert("Subscription extended successfully")
        setIsExtendModalOpen(false)
        fetchOrganizations()
      }
    } catch (error) {
      console.error("Failed to extend subscription", error)
      alert("Failed to extend subscription")
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
        alert("Plan changed successfully")
        setIsPlanModalOpen(false)
        fetchOrganizations()
      }
    } catch (error) {
      console.error("Failed to change plan", error)
      alert("Failed to change plan")
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
      alert("Failed to update status")
    }
  }

  const activeOrgs = organizations.filter(org => org.status !== "pending")

  if (loading) return <div className="p-6 text-center">Loading...</div>

  return (
    <div className="p-6 space-y-8 pb-20">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground">Organization Management</h2>
      </div>

      {/* All Organizations Section */}
      <div className="space-y-4">
        <Card className="border-0 shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Organization</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Expiry</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeOrgs.map((org) => (
                <TableRow key={org._id}>
                  <TableCell className="font-medium">
                    {org.name}
                    <div className="text-xs text-muted-foreground font-normal">{org.email}</div>
                    {org.status === "rejected" && <Badge variant="destructive" className="mt-1 text-[8px]">REJECTED</Badge>}
                  </TableCell>
                  <TableCell>
                    {org.owner?.name}
                    <div className="text-xs text-muted-foreground font-normal">{org.owner?.email}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">{org.subscription?.plan || "Free"}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={org.subscription?.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
                      {org.subscription?.status || "active"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {org.subscription?.end ? new Date(org.subscription.end).toLocaleDateString() : "Unlimited"}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon"><MoreHorizontal size={16} /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => { setSelectedOrg(org); setIsPlanModalOpen(true); }}>
                          <CreditCard className="mr-2 h-4 w-4" /> Change Plan
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => { setSelectedOrg(org); setIsExtendModalOpen(true); }}>
                          <Calendar className="mr-2 h-4 w-4" /> Extend Subscription
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toggleStatus(org)} className={org.subscription?.status === "active" ? "text-destructive" : "text-green-600"}>
                          {org.subscription?.status === "active" ? <ShieldAlert className="mr-2 h-4 w-4" /> : <ShieldCheck className="mr-2 h-4 w-4" />}
                          {org.subscription?.status === "active" ? "Disable" : "Enable"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>

      {/* Extend Modal */}
      <Dialog open={isExtendModalOpen} onOpenChange={setIsExtendModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Extend Subscription</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="days">Extra Days</Label>
              <Input 
                id="days" 
                type="number" 
                value={extendData.days} 
                onChange={(e) => setExtendData({...extendData, days: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reason">Reason</Label>
              <Input 
                id="reason" 
                value={extendData.reason} 
                onChange={(e) => setExtendData({...extendData, reason: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsExtendModalOpen(false)}>Cancel</Button>
            <Button onClick={handleExtend}>Extend</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Plan Modal */}
      <Dialog open={isPlanModalOpen} onOpenChange={setIsPlanModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Plan</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Select Plan</Label>
              <select 
                className="w-full h-10 px-3 border rounded-md"
                value={newPlan}
                onChange={(e) => setNewPlan(e.target.value)}
              >
                <option value="Free">Free</option>
                <option value="Monthly">Monthly</option>
                <option value="Yearly">Yearly</option>
                <option value="Lifetime">Lifetime</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPlanModalOpen(false)}>Cancel</Button>
            <Button onClick={handleChangePlan}>Change Plan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
