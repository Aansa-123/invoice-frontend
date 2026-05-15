import { useState, useEffect } from "react"
import { Card } from "../ui/card"
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "../ui/table"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Plus, Edit2, Database, Check, X, Sparkles } from "lucide-react"

export default function AdminPlans() {
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPlan, setEditingPlan] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    price: 0,
    type: "Monthly",
    clientLimit: -1,
    invoiceLimit: -1,
    isRecommended: false,
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
      type: plan.type || "Monthly",
      clientLimit: plan.clientLimit,
      invoiceLimit: plan.invoiceLimit,
      isRecommended: plan.isRecommended || false,
      isActive: plan.isActive
    })
    setIsModalOpen(true)
  }

  const openCreate = () => {
    setEditingPlan(null)
    setFormData({
      name: "",
      price: 0,
      type: "Monthly",
      clientLimit: -1,
      invoiceLimit: -1,
      isRecommended: false,
      isActive: true
    })
    setIsModalOpen(true)
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  )

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-3">
            <Database className="text-primary" size={28} /> Subscription Plans
          </h2>
          <p className="text-[10px] text-[#71717A] font-bold uppercase tracking-widest mt-1">Configure and manage service tiers</p>
        </div>
        <Button onClick={openCreate} className="gap-2 bg-primary hover:bg-primary/90 text-white border-0 rounded-xl px-6">
          <Plus size={18} /> Create Plan
        </Button>
      </div>

      <Card className="bg-[#1A1635] border border-white/[0.03] rounded-2xl shadow-2xl overflow-hidden">
        <Table>
          <TableHeader className="bg-white/[0.02]">
            <TableRow className="border-white/[0.03] hover:bg-transparent">
              <TableHead className="text-[10px] font-black text-[#71717A] uppercase tracking-widest py-4">Plan Name</TableHead>
              <TableHead className="text-[10px] font-black text-[#71717A] uppercase tracking-widest py-4">Price</TableHead>
              <TableHead className="text-[10px] font-black text-[#71717A] uppercase tracking-widest py-4">Type</TableHead>
              <TableHead className="text-[10px] font-black text-[#71717A] uppercase tracking-widest py-4 text-center">Recommended</TableHead>
              <TableHead className="text-[10px] font-black text-[#71717A] uppercase tracking-widest py-4">Clients</TableHead>
              <TableHead className="text-[10px] font-black text-[#71717A] uppercase tracking-widest py-4">Invoices</TableHead>
              <TableHead className="text-[10px] font-black text-[#71717A] uppercase tracking-widest py-4">Status</TableHead>
              <TableHead className="text-[10px] font-black text-[#71717A] uppercase tracking-widest py-4 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {plans.map((plan) => (
              <TableRow key={plan._id} className="border-white/[0.03] hover:bg-white/[0.01] transition-colors">
                <TableCell className="py-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-white tracking-tight">{plan.name}</span>
                    {plan.isRecommended && <Sparkles size={12} className="text-amber-400" />}
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  <span className="text-xs font-bold text-white/90">${plan.price}</span>
                </TableCell>
                <TableCell className="py-4">
                  <Badge className="bg-white/5 text-white/70 border-white/10 text-[9px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-md border">
                    {plan.type || "Monthly"}
                  </Badge>
                </TableCell>
                <TableCell className="py-4 text-center">
                  <div className="flex justify-center">
                    {plan.isRecommended ? (
                      <div className="p-1 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/10">
                        <Check size={12} strokeWidth={3} />
                      </div>
                    ) : (
                      <div className="p-1 rounded-full bg-white/5 text-[#71717A] border border-white/5">
                        <X size={12} strokeWidth={3} />
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">
                    {plan.clientLimit === -1 ? "Unlimited" : plan.clientLimit}
                  </span>
                </TableCell>
                <TableCell className="py-4">
                  <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">
                    {plan.invoiceLimit === -1 ? "Unlimited" : plan.invoiceLimit}
                  </span>
                </TableCell>
                <TableCell className="py-4">
                  <Badge className={`text-[9px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-md border ${
                    plan.isActive 
                      ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" 
                      : "bg-rose-500/10 text-rose-500 border-rose-500/20"
                  }`}>
                    {plan.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell className="py-4 text-right">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => openEdit(plan)}
                    className="text-[#71717A] hover:text-white hover:bg-white/5 rounded-xl px-3"
                  >
                    <Edit2 size={14} className="mr-2" /> Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-[#1A1635] border border-white/[0.08] text-white rounded-3xl max-w-md backdrop-blur-xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-black tracking-tight">
              {editingPlan ? "Edit Plan" : "Create New Plan"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-5 py-4">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-[10px] font-black text-[#71717A] uppercase tracking-widest ml-1">Plan Name</Label>
              <Input 
                id="name" 
                value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
                className="bg-white/[0.03] border-white/[0.08] focus:border-primary/50 text-white rounded-xl"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="price" className="text-[10px] font-black text-[#71717A] uppercase tracking-widest ml-1">Price ($)</Label>
                <Input 
                  id="price" 
                  type="number" 
                  value={formData.price} 
                  onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                  required
                  className="bg-white/[0.03] border-white/[0.08] focus:border-primary/50 text-white rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="type" className="text-[10px] font-black text-[#71717A] uppercase tracking-widest ml-1">Plan Type</Label>
                <select
                  id="type"
                  className="flex h-10 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  required
                >
                  <option value="Free" className="bg-[#1A1635]">Free</option>
                  <option value="Monthly" className="bg-[#1A1635]">Monthly</option>
                  <option value="Yearly" className="bg-[#1A1635]">Yearly</option>
                  <option value="Lifetime" className="bg-[#1A1635]">Lifetime</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="clientLimit" className="text-[10px] font-black text-[#71717A] uppercase tracking-widest ml-1">Client Limit (-1=inf)</Label>
                <Input 
                  id="clientLimit" 
                  type="number" 
                  value={formData.clientLimit} 
                  onChange={(e) => setFormData({...formData, clientLimit: Number(e.target.value)})}
                  required
                  className="bg-white/[0.03] border-white/[0.08] focus:border-primary/50 text-white rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="invoiceLimit" className="text-[10px] font-black text-[#71717A] uppercase tracking-widest ml-1">Invoice Limit (-1=inf)</Label>
                <Input 
                  id="invoiceLimit" 
                  type="number" 
                  value={formData.invoiceLimit} 
                  onChange={(e) => setFormData({...formData, invoiceLimit: Number(e.target.value)})}
                  required
                  className="bg-white/[0.03] border-white/[0.08] focus:border-primary/50 text-white rounded-xl"
                />
              </div>
            </div>
            <div className="flex items-center gap-6 pt-2 ml-1">
              <div className="flex items-center gap-3 group cursor-pointer">
                <div className="relative flex items-center">
                  <input 
                    type="checkbox" 
                    id="isRecommended" 
                    checked={formData.isRecommended}
                    onChange={(e) => setFormData({...formData, isRecommended: e.target.checked})}
                    className="peer h-4 w-4 opacity-0 absolute cursor-pointer"
                  />
                  <div className="h-4 w-4 border border-white/20 rounded-md peer-checked:bg-primary peer-checked:border-primary transition-all" />
                  <Check className="absolute h-3 w-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity left-0.5" strokeWidth={4} />
                </div>
                <Label htmlFor="isRecommended" className="text-[11px] font-bold text-white/70 cursor-pointer group-hover:text-white transition-colors">Recommended</Label>
              </div>
              <div className="flex items-center gap-3 group cursor-pointer">
                <div className="relative flex items-center">
                  <input 
                    type="checkbox" 
                    id="isActive" 
                    checked={formData.isActive}
                    onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                    className="peer h-4 w-4 opacity-0 absolute cursor-pointer"
                  />
                  <div className="h-4 w-4 border border-white/20 rounded-md peer-checked:bg-emerald-500 peer-checked:border-emerald-500 transition-all" />
                  <Check className="absolute h-3 w-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity left-0.5" strokeWidth={4} />
                </div>
                <Label htmlFor="isActive" className="text-[11px] font-bold text-white/70 cursor-pointer group-hover:text-white transition-colors">Active Plan</Label>
              </div>
            </div>
            <DialogFooter className="pt-6 gap-3">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="bg-transparent border-white/10 text-white/60 hover:text-white hover:bg-white/5 rounded-xl border-0">
                Cancel
              </Button>
              <Button type="submit" className="bg-primary hover:bg-primary/90 text-white rounded-xl px-8 border-0 shadow-lg shadow-primary/20">
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
