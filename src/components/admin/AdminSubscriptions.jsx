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
        // Filter for organizations with paid plans (not Free)
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
        alert("Subscription extended successfully")
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
        alert("Subscription disabled and organization reverted to Free")
        fetchSubscriptions()
      } else {
        const data = await res.json()
        alert(data.error || "Action failed")
      }
    } catch (error) {
      console.error("Failed to disable subscription", error)
    }
  }

  if (loading) return <div className="p-6 text-center">Loading...</div>

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
        <CreditCard className="text-primary" /> Active Paid Subscriptions
      </h2>

      <Card className="border-0 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Organization</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Expiry Date</TableHead>
              <TableHead>Grace Days</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {organizations.map((org) => {
              const isExpired = org.subscription?.end && new Date(org.subscription.end) < new Date()
              return (
                <TableRow key={org._id}>
                  <TableCell className="font-medium">
                    {org.name}
                    <div className="text-xs text-muted-foreground">{org.owner?.email}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{org.subscription?.plan}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={org.subscription?.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
                      {org.subscription?.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {org.subscription?.end ? new Date(org.subscription.end).toLocaleDateString() : "No end date"}
                      {isExpired && <AlertTriangle size={14} className="text-orange-500" title="Expired" />}
                    </div>
                  </TableCell>
                  <TableCell>{org.subscription?.graceDays || 0}</TableCell>
                  <TableCell className="text-right flex items-center justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => { setSelectedOrg(org); setIsExtendModalOpen(true); }}>
                      <Clock size={14} className="mr-2" /> Extend
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleDisable(org._id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <ShieldOff size={14} className="mr-2" /> Disable
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={isExtendModalOpen} onOpenChange={setIsExtendModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Extend Subscription</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
             <p className="text-sm text-muted-foreground">
               Extending subscription for <strong>{selectedOrg?.name}</strong>
             </p>
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
            <Button onClick={handleExtend}>Extend Subscription</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
