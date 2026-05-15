
import { useEffect, useState } from "react"
import { Card } from "../ui/card"
import { Badge } from "../ui/badge"
import { MoreVertical, Edit2, Trash2, Eye, Send, CreditCard, Download } from "lucide-react"
import { Link } from "react-router-dom"
export default function RecentInvoices() {
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRecentInvoices()
  }, [])

  const fetchRecentInvoices = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/invoices`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setInvoices(data.data.slice(0, 5))
      }
    } catch (error) {
      console.error("Failed to fetch invoices:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "Paid":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
      case "Pending":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20"
      case "Overdue":
        return "bg-rose-500/10 text-rose-500 border-rose-500/20"
      default:
        return "bg-muted text-muted-foreground border-border"
    }
  }

  const getInitials = (name) => {
    if (!name) return "N"
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 1)
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A"
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <Card className="p-3 bg-[#1A1635] border border-white/[0.03] rounded-2xl shadow-xl relative overflow-hidden group">
      <div className="flex justify-between items-center mb-3 relative z-10">
      <div>
        <h2 className="text-xs font-black text-white tracking-tight">Recent Invoices</h2>
        <p className="text-[7px] text-[#71717A] font-bold mt-0.5">Latest activity in your workspace</p>
      </div>
      <Link
        to="/invoices"
        className="text-[8px] font-bold text-[#7B5BE4] hover:text-white transition-colors"
      >
        View all
      </Link>
      </div>

      <div className="relative z-10">
      <div className="grid grid-cols-5 px-2 py-1 text-[8px] font-bold text-[#71717A] uppercase tracking-wider border-b border-white/5 mb-1.5">
        <span>Client</span>
        <span>Invoice</span>
        <span>Date</span>
        <span>Amount</span>
        <span>Status</span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-6">
        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-[#7B5BE4]"></div>
        </div>
      ) : (
        <div className="space-y-0.5">
        {invoices.map((invoice) => (
          <div 
          key={invoice._id} 
          className="grid grid-cols-5 items-center p-1.5 rounded-xl hover:bg-white/[0.02] transition-all cursor-pointer group/item"
          >
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[#2D2D44] flex items-center justify-center border border-white/5 text-[7px] font-black text-white/40 group-hover/item:text-[#7B5BE4] transition-colors">
            {getInitials(invoice.clientId?.name)}
            </div>
            <span className="text-[9px] font-bold text-white/90 truncate pr-2">
            {invoice.clientId?.name || "Unknown"}
            </span>
          </div>
          <span className="text-[7px] font-bold text-[#71717A] uppercase">{invoice.invoiceNumber}</span>
          <span className="text-[7px] font-bold text-[#71717A]">{formatDate(invoice.invoiceDate || invoice.createdAt)}</span>
          <span className="text-[9px] font-black text-white tracking-tight">${invoice.total?.toLocaleString()}</span>
          <div>
            <span className={`px-1 py-0.5 rounded-lg text-[7px] font-bold border ${getStatusColor(invoice.status)} uppercase`}>
            {invoice.status}
            </span>
          </div>
          </div>
        ))}
        </div>
      )}
      </div>
    </Card>
    )
}
