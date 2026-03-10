import { useState, useEffect } from "react"
import { Card } from "../ui/card"
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "../ui/table"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Plus, Edit2, Database, Check, X } from "lucide-react"

export default function AdminPlans() {
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPlan, setEditingPlan] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    price: 0,
    durationDays: 30,
    clientLimit: -1,
    invoiceLimit: -1,
    isActive: true
  })

  useEffect(() => {
    fetchPlans()
  }, [])

  const fetchPlans = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/plans`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      })
      const data = await res.json()
      if (data.success) {
        setPlans(data.data)
      }
    } catch (error) {
      console.error("Failed to fetch plans", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const url = editingPlan 
        ? `${import.meta.env.VITE_API_URL}/api/admin/plans/${editingPlan._id}`
        : `${import.meta.env.VITE_API_URL}/api/admin/plans`
      
      const res = await fetch(url, {
        method: editingPlan ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        alert(`Plan ${editingPlan ? "updated" : "created"} successfully`)
        setIsModalOpen(false)
        fetchPlans()
      }
    } catch (error) {
      console.error("Error saving plan", error)
    }
  }

  const openEdit = (plan) => {
    setEditingPlan(plan)
    setFormData({
      name: plan.name,
      price: plan.price,
      durationDays: plan.durationDays,
      clientLimit: plan.clientLimit,
      invoiceLimit: plan.invoiceLimit,
      isActive: plan.isActive
    })
    setIsModalOpen(true)
  }

  const openCreate = () => {
    setEditingPlan(null)
    setFormData({
      name: "",
      price: 0,
      durationDays: 30,
      clientLimit: -1,
      invoiceLimit: -1,
      isActive: true
    })
    setIsModalOpen(true)
  }

  if (loading) return <div className="p-6 text-center">Loading...</div>

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Database className="text-primary" /> Subscription Plans
        </h2>
        <Button onClick={openCreate} className="gap-2">
          <Plus size={16} /> Create Plan
        </Button>
      </div>

      <Card className="border-0 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Plan Name</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Client Limit</TableHead>
              <TableHead>Invoice Limit</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {plans.map((plan) => (
              <TableRow key={plan._id}>
                <TableCell className="font-bold">{plan.name}</TableCell>
                <TableCell>${plan.price}</TableCell>
                <TableCell>{plan.durationDays} days</TableCell>
                <TableCell>{plan.clientLimit === -1 ? "Unlimited" : plan.clientLimit}</TableCell>
                <TableCell>{plan.invoiceLimit === -1 ? "Unlimited" : plan.invoiceLimit}</TableCell>
                <TableCell>
                  <Badge className={plan.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
                    {plan.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(plan)}>
                    <Edit2 size={14} className="mr-2" /> Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingPlan ? "Edit Plan" : "Create New Plan"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Plan Name</Label>
              <Input 
                id="name" 
                value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price ($)</Label>
                <Input 
                  id="price" 
                  type="number" 
                  value={formData.price} 
                  onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (Days)</Label>
                <Input 
                  id="duration" 
                  type="number" 
                  value={formData.durationDays} 
                  onChange={(e) => setFormData({...formData, durationDays: Number(e.target.value)})}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="clientLimit">Client Limit (-1=inf)</Label>
                <Input 
                  id="clientLimit" 
                  type="number" 
                  value={formData.clientLimit} 
                  onChange={(e) => setFormData({...formData, clientLimit: Number(e.target.value)})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="invoiceLimit">Invoice Limit (-1=inf)</Label>
                <Input 
                  id="invoiceLimit" 
                  type="number" 
                  value={formData.invoiceLimit} 
                  onChange={(e) => setFormData({...formData, invoiceLimit: Number(e.target.value)})}
                  required
                />
              </div>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <input 
                type="checkbox" 
                id="isActive" 
                checked={formData.isActive}
                onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
              />
              <Label htmlFor="isActive">Active Plan</Label>
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button type="submit">Save Plan</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
