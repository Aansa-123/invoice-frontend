import { useState, useEffect } from "react"
import { Card } from "../ui/card"
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "../ui/table"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import { ExternalLink, Banknote, Building2 } from "lucide-react"

export default function AdminPayments() {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPayments()
  }, [])

  const fetchPayments = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/payments`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      })
      const data = await res.json()
      if (data.success) {
        setPayments(data.data)
      }
    } catch (error) {
      console.error("Failed to fetch payments", error)
    } finally {
      setLoading(false)
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
          <Banknote className="text-primary" size={28} /> Payment Records
        </h2>
        <p className="text-xs text-[#71717A] font-bold uppercase tracking-wider ml-1">Historical revenue and transaction logs</p>
      </div>

      <Card className="bg-[#1A1635] border border-white/[0.03] rounded-2xl shadow-2xl overflow-hidden">
        <Table>
          <TableHeader className="bg-white/[0.02]">
            <TableRow className="border-white/[0.03] hover:bg-transparent">
              <TableHead className="text-[10px] font-black text-[#71717A] uppercase tracking-widest py-4">Organization</TableHead>
              <TableHead className="text-[10px] font-black text-[#71717A] uppercase tracking-widest py-4">Plan</TableHead>
              <TableHead className="text-[10px] font-black text-[#71717A] uppercase tracking-widest py-4">Amount</TableHead>
              <TableHead className="text-[10px] font-black text-[#71717A] uppercase tracking-widest py-4">Method & TX</TableHead>
              <TableHead className="text-[10px] font-black text-[#71717A] uppercase tracking-widest py-4">Date</TableHead>
              <TableHead className="text-[10px] font-black text-[#71717A] uppercase tracking-widest py-4">Status</TableHead>
              <TableHead className="text-[10px] font-black text-[#71717A] uppercase tracking-widest py-4 text-right">Receipt</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((payment) => (
              <TableRow key={payment._id} className="border-white/[0.03] hover:bg-white/[0.01] transition-colors">
                <TableCell className="py-4">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                      <Building2 size={14} />
                    </div>
                    <span className="text-xs font-black text-white tracking-tight">
                      {payment.organization?.name || "Deleted Organization"}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  <Badge className="bg-white/5 text-white/70 border-white/10 text-[9px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-md border">
                    {payment.plan?.name || "Custom"}
                  </Badge>
                </TableCell>
                <TableCell className="py-4">
                  <span className="text-xs font-black text-white tracking-tight">
                    ${payment.amount.toLocaleString()}
                  </span>
                </TableCell>
                <TableCell className="py-4">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-white/80 tracking-tight">{payment.paymentMethod}</span>
                    <span className="text-[9px] text-[#71717A] font-medium font-mono">{payment.transactionId}</span>
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">
                    {new Date(payment.paymentDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </TableCell>
                <TableCell className="py-4">
                  <Badge className={`text-[9px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-md border ${
                    payment.status === "success" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : 
                    payment.status === "pending" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                    "bg-rose-500/10 text-rose-500 border-rose-500/20"
                  }`}>
                    {payment.status}
                  </Badge>
                </TableCell>
                <TableCell className="py-4 text-right">
                  {payment.screenshot ? (
                    <Button variant="ghost" size="sm" asChild className="text-[#71717A] hover:text-primary hover:bg-primary/10 rounded-xl transition-all h-8">
                      <a href={payment.screenshot} target="_blank" rel="noopener noreferrer" className="gap-1 px-3">
                        <span className="text-[10px] font-bold uppercase tracking-wider">View</span> <ExternalLink size={12} />
                      </a>
                    </Button>
                  ) : (
                    <span className="text-[10px] font-black text-white/20 uppercase tracking-widest mr-4">N/A</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
