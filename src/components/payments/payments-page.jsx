import { useState, useEffect } from "react"
import { Card } from "../ui/card"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Plus, Search, Filter, CreditCard, Banknote, Landmark, MoreVertical } from "lucide-react"
import PaymentModal from "./payment-modal"
import { useOutletContext } from "react-router-dom"

export default function PaymentsPage({ userRole }) {
  const { orgId } = useOutletContext()
  const [payments, setPayments] = useState([])
  const [invoices, setInvoices] = useState([])
  const [filteredPayments, setFilteredPayments] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [methodFilter, setMethodFilter] = useState("All")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    filterPayments()
  }, [payments, searchTerm, methodFilter])

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token")
      const [paymentsRes, invoicesRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/api/payments`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${import.meta.env.VITE_API_URL}/api/invoices`, {
          headers: { Authorization: `Bearer ${token}` },
        })
      ])

      if (paymentsRes.ok && invoicesRes.ok) {
        const paymentsData = await paymentsRes.json()
        const invoicesData = await invoicesRes.json()
        setPayments(paymentsData.data)
        setInvoices(invoicesData.data)
      }
    } catch (error) {
      console.error("Failed to fetch data:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterPayments = () => {
    let filtered = payments

    if (methodFilter !== "All") {
      filtered = filtered.filter((p) => p.paymentMethod === methodFilter)
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (p) =>
          p.invoiceId?.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.clientId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (p.transactionId && p.transactionId.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    setFilteredPayments(filtered)
  }

  const getMethodIcon = (method) => {
    switch (method) {
      case "Cash":
        return <Banknote size={14} className="text-purple-400" />
      case "Bank Transfer":
        return <Landmark size={14} className="text-blue-400" />
      case "Credit Card":
        return <CreditCard size={14} className="text-indigo-400" />
      default:
        return <Landmark size={14} className="text-gray-400" />
    }
  }

  const calculateStats = () => {
    const now = new Date()
    const thisMonth = now.getMonth()
    const thisYear = now.getFullYear()
    
    // Total Collected This Month
    const totalCollected = payments
      .filter(p => {
        const d = new Date(p.paymentDate)
        return d.getMonth() === thisMonth && d.getFullYear() === thisYear
      })
      .reduce((sum, p) => sum + (p.amount || 0), 0)

    // Collected This Week
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay())
    startOfWeek.setHours(0, 0, 0, 0)
    
    const thisWeek = payments
      .filter(p => new Date(p.paymentDate) >= startOfWeek)
      .reduce((sum, p) => sum + (p.amount || 0), 0)

    // Growth Calculation (+18% vs last week - placeholder logic for now)
    const lastWeekStart = new Date(startOfWeek)
    lastWeekStart.setDate(startOfWeek.getDate() - 7)
    const lastWeekAmount = payments
      .filter(p => {
        const d = new Date(p.paymentDate)
        return d >= lastWeekStart && d < startOfWeek
      })
      .reduce((sum, p) => sum + (p.amount || 0), 0)
    
    const growth = lastWeekAmount > 0 
      ? Math.round(((thisWeek - lastWeekAmount) / lastWeekAmount) * 100)
      : 0

    // Pending Receipts (Invoices not Paid)
    const pendingInvoices = invoices.filter(inv => inv.status !== "Paid")
    const pendingAmount = pendingInvoices.reduce((sum, inv) => {
      // Amount pending is total invoice amount minus any recorded payments
      const invoicePayments = payments
        .filter(p => p.invoiceId?._id === inv._id || p.invoiceId === inv._id)
        .reduce((s, p) => s + (p.amount || 0), 0)
      return sum + (inv.total - invoicePayments)
    }, 0)

    return {
      totalCollected,
      thisWeek,
      growth,
      pendingAmount,
      pendingCount: pendingInvoices.length
    }
  }

  const stats = calculateStats()

  return (
    <div className="space-y-4 p-4 lg:p-6 bg-transparent min-h-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-0.5">
          <h1 className="text-lg font-black text-white tracking-tight">Payments</h1>
          <p className="text-[9px] text-[#94A3B8] font-medium uppercase tracking-wider">Track and manage all your incoming payments</p>
        </div>
        
        {(userRole === "Owner" || userRole === "Admin") && (
          <Button 
            onClick={() => setIsModalOpen(true)} 
            className="h-9 px-5 rounded-full bg-gradient-to-r from-[#A855F7] to-[#06B6D4] hover:opacity-90 text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-[#A855F7]/20 border-none transition-all active:scale-95 flex items-center gap-2"
          >
            <Plus size={14} />
            Record Payment
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card className="p-3 bg-[#14142B] border border-white/[0.03] rounded-2xl relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-[8px] font-black text-[#94A3B8] uppercase tracking-widest">Total Collected</p>
            <h3 className="text-base font-black text-white leading-none mt-1">${stats.totalCollected.toLocaleString()}</h3>
            <p className="text-[7px] font-bold text-[#94A3B8] mt-1.5 uppercase">This month</p>
          </div>
          <div className="absolute right-0 top-0 w-24 h-full bg-gradient-to-l from-blue-500/5 to-transparent" />
        </Card>
        <Card className="p-3 bg-[#14142B] border border-white/[0.03] rounded-2xl relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-[8px] font-black text-[#94A3B8] uppercase tracking-widest">This Week</p>
            <h3 className="text-base font-black text-white leading-none mt-1">${stats.thisWeek.toLocaleString()}</h3>
            <p className={`text-[7px] font-bold ${stats.growth >= 0 ? 'text-emerald-500' : 'text-rose-500'} mt-1.5 uppercase`}>
              {stats.growth >= 0 ? '+' : ''}{stats.growth}% vs last week
            </p>
          </div>
          <div className="absolute right-0 top-0 w-24 h-full bg-gradient-to-l from-emerald-500/5 to-transparent" />
        </Card>
        <Card className="p-3 bg-[#14142B] border border-white/[0.03] rounded-2xl relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-[8px] font-black text-[#94A3B8] uppercase tracking-widest">Pending Receipts</p>
            <h3 className="text-base font-black text-white leading-none mt-1">${stats.pendingAmount.toLocaleString()}</h3>
            <p className="text-[7px] font-bold text-[#94A3B8] mt-1.5 uppercase">{stats.pendingCount} invoices</p>
          </div>
          <div className="absolute right-0 top-0 w-24 h-full bg-gradient-to-l from-amber-500/5 to-transparent" />
        </Card>
      </div>

      {/* Search & Filters */}
      <Card className="p-3 bg-[#14142B] border border-white/[0.03] rounded-2xl shadow-xl overflow-visible">
        <div className="flex flex-col md:flex-row gap-3 items-center">
          <div className="flex-1 relative w-full">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
            <Input
              placeholder="Search by invoice, client or transaction ID..."
              className="pl-9 bg-[#0B0B1E]/50 border-white/[0.05] focus-visible:ring-1 focus-visible:ring-[#A855F7]/30 h-8 rounded-xl w-full text-[10px] font-bold placeholder:text-[#94A3B8] text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center bg-[#0B0B1E] p-1 rounded-xl border border-white/[0.05]">
            {["All", "Cash", "Bank Transfer", "Credit Card"].map((method) => (
              <button
                key={method}
                onClick={() => setMethodFilter(method)}
                className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                  methodFilter === method 
                    ? "bg-[#14142B] text-white shadow-lg shadow-cyan-500/10 border border-white/5" 
                    : "text-[#94A3B8] hover:text-white"
                }`}
              >
                {method}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Payments Table */}
      <Card className="bg-[#14142B] border border-white/[0.03] rounded-2xl shadow-xl overflow-hidden group">
        <div className="overflow-x-auto relative scrollbar-thin scrollbar-thumb-white/5">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-7 w-7 border-t-2 border-b-2 border-[#A855F7]"></div>
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-[#94A3B8] font-bold text-xs">No payments found</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-[#0B0B1E] border-b border-white/5">
                <tr>
                  <th className="px-5 py-3 text-[8px] font-black text-[#94A3B8] uppercase tracking-widest">Transaction</th>
                  <th className="px-5 py-3 text-[8px] font-black text-[#94A3B8] uppercase tracking-widest">Invoice</th>
                  <th className="px-5 py-3 text-[8px] font-black text-[#94A3B8] uppercase tracking-widest">Client</th>
                  <th className="px-5 py-3 text-[8px] font-black text-[#94A3B8] uppercase tracking-widest">Method</th>
                  <th className="px-5 py-3 text-[8px] font-black text-[#94A3B8] uppercase tracking-widest">Amount</th>
                  <th className="px-5 py-3 text-[8px] font-black text-[#94A3B8] uppercase tracking-widest">Date</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/[0.03]">
                {filteredPayments.map((payment) => (
                  <tr key={payment._id} className="hover:bg-white/[0.02] transition-all group/item">
                    <td className="px-5 py-3">
                      <p className="text-[10px] font-bold text-white uppercase">{payment.transactionId || `TXN-${payment._id.substring(0, 4).toUpperCase()}`}</p>
                    </td>
                    <td className="px-5 py-3">
                      <p className="text-[9px] font-medium text-[#94A3B8] uppercase">{payment.invoiceId?.invoiceNumber || "N/A"}</p>
                    </td>
                    <td className="px-5 py-3">
                      <p className="text-[10px] font-bold text-white">{payment.clientId?.name || "N/A"}</p>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="p-1 rounded-lg bg-white/5">
                          {getMethodIcon(payment.paymentMethod)}
                        </div>
                        <span className="text-[9px] font-medium text-white/70">{payment.paymentMethod}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-[10px] font-black text-emerald-500 tracking-tight">+${payment.amount?.toLocaleString()}</span>
                    </td>
                    <td className="px-5 py-3">
                      <p className="text-[9px] font-medium text-[#94A3B8]">{new Date(payment.paymentDate).toLocaleDateString()}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      <PaymentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onPaymentRecorded={fetchData}
      />
    </div>
  )
}
