
import { useState, useEffect } from "react"
import { Card } from "../ui/card"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { X, Calendar, DollarSign, List, CreditCard, Banknote, Landmark, Wallet, Hash, Check, FileCheck, MoreHorizontal } from "lucide-react"
import { toast } from "sonner"

export default function PaymentModal({ isOpen, onClose, onPaymentRecorded, initialInvoice }) {
  const [formData, setFormData] = useState({
    invoiceId: "",
    amount: "",
    paymentMethod: "Credit Card",
    transactionId: "",
    paymentDate: new Date().toISOString().split('T')[0],
    notes: "",
  })
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(false)
  const [invoicesLoading, setInvoicesLoading] = useState(true)

  useEffect(() => {
    if (isOpen) {
      if (initialInvoice) {
        setFormData(prev => ({
          ...prev,
          invoiceId: initialInvoice._id,
          amount: initialInvoice.total,
        }))
      }
      fetchInvoices()
    }
  }, [isOpen, initialInvoice])

  const fetchInvoices = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/invoices`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        const pendingInvoices = data.data.filter(inv => inv.status !== "Paid")
        setInvoices(pendingInvoices)
      }
    } catch (error) {
      console.error("Failed to fetch invoices:", error)
    } finally {
      setInvoicesLoading(false)
    }
  }

  const handleInvoiceChange = (e) => {
    const invId = e.target.value
    const selectedInv = invoices.find(inv => inv._id === invId)
    
    setFormData({
      ...formData,
      invoiceId: invId,
      amount: selectedInv ? selectedInv.total : ""
    })
  }

  const handleSubmit = async (e) => {
    if (e) e.preventDefault()
    if (!formData.invoiceId || !formData.amount) return
    
    setLoading(true)

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/payments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("Payment recorded successfully")
        onPaymentRecorded()
        onClose()
        setFormData({
          invoiceId: "",
          amount: "",
          paymentMethod: "Credit Card",
          transactionId: "",
          paymentDate: new Date().toISOString().split('T')[0],
          notes: "",
        })
      } else {
        toast.error(data.error || "Failed to record payment")
      }
    } catch (error) {
      console.error("Failed to record payment:", error)
      toast.error("An error occurred while recording payment")
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  const paymentMethods = [
    { id: "Bank Transfer", label: "Bank Transfer", icon: Landmark },
    { id: "Credit Card", label: "Credit Card", icon: CreditCard },
    { id: "Cash", label: "Cash", icon: Banknote },
    { id: "Wallet", label: "Wallet", icon: Wallet },
    { id: "Cheque", label: "Cheque", icon: FileCheck },
    { id: "Other", label: "Other", icon: MoreHorizontal },
  ]

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <Card className="w-full max-w-sm bg-[#0B0B1E] border-white/5 rounded-[2rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="p-5 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#A855F7] to-[#06B6D4] flex items-center justify-center text-white shadow-lg shadow-[#A855F7]/20">
              <CreditCard size={18} />
            </div>
            <div>
              <h2 className="text-base font-black text-white tracking-tight">Record Payment</h2>
              <p className="text-[8px] text-[#94A3B8] font-medium uppercase tracking-wider mt-0.5">Log a payment received against an invoice</p>
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/5 text-[#94A3B8] hover:bg-white/10 hover:text-white transition-all">
            <X size={14} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 pt-3 space-y-4">
          {/* Amount Received Box */}
          <div className="p-4 bg-[#14142B] border border-white/[0.05] rounded-2xl relative overflow-hidden group transition-all hover:border-[#A855F7]/30">
            <div className="relative z-10">
              <label className="text-[8px] font-black text-[#94A3B8] uppercase tracking-widest mb-1 block">Amount Received</label>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black text-[#94A3B8] group-hover:text-white transition-colors">$</span>
                <input
                  type="number"
                  required
                  step="0.01"
                  readOnly
                  value={formData.amount}
                  className="bg-transparent border-none focus:ring-0 text-2xl font-black text-white w-full placeholder:text-white/20 p-0"
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className="absolute right-0 top-0 w-24 h-full bg-gradient-to-l from-[#A855F7]/5 to-transparent" />
          </div>

          <div className="space-y-3">
            {/* Invoice Select */}
            <div className="space-y-1">
              <label className="text-[8px] font-black text-[#94A3B8] uppercase tracking-widest ml-1 flex items-center">
                Invoice <span className="text-rose-500 ml-1">*</span>
              </label>
              <div className="relative">
                <FileText size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                <select
                  required
                  value={formData.invoiceId}
                  onChange={handleInvoiceChange}
                  className="w-full pl-9 pr-3 bg-[#14142B] border border-white/[0.05] h-8 rounded-xl text-[9px] font-bold text-white appearance-none focus:outline-none focus:ring-1 focus:ring-[#A855F7]/30"
                >
                  <option value="">Select an invoice...</option>
                  {invoices.map((inv) => (
                    <option key={inv._id} value={inv._id}>
                      {inv.invoiceNumber} - {inv.clientId?.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Payment Methods Grid */}
            <div className="space-y-1">
              <label className="text-[8px] font-black text-[#94A3B8] uppercase tracking-widest ml-1">Payment Method</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {paymentMethods.map((method) => (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, paymentMethod: method.id })}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all gap-1.5 group ${
                      formData.paymentMethod === method.id 
                        ? "bg-[#A855F7] border-[#A855F7] text-white shadow-lg shadow-[#A855F7]/20" 
                        : "bg-[#14142B] border-white/[0.03] text-[#94A3B8] hover:border-white/10 hover:bg-white/5"
                    }`}
                  >
                    <method.icon size={14} className={`transition-transform duration-300 group-hover:scale-110 ${formData.paymentMethod === method.id ? "text-white" : "text-[#94A3B8]"}`} />
                    <span className={`text-[7px] font-black uppercase tracking-widest ${formData.paymentMethod === method.id ? "text-white" : "text-[#94A3B8]"}`}>
                      {method.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Transaction ID */}
              <div className="space-y-1">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[8px] font-black text-[#94A3B8] uppercase tracking-widest">Transaction ID</label>
                  <span className="text-[7px] text-[#94A3B8]/50 uppercase italic tracking-widest">optional</span>
                </div>
                <div className="relative">
                  <Hash size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                  <Input
                    value={formData.transactionId}
                    onChange={(e) => setFormData({ ...formData, transactionId: e.target.value })}
                    className="pl-9 bg-[#14142B] border-white/[0.05] h-8 rounded-xl text-[9px] font-bold text-white placeholder:text-[#94A3B8]/30"
                    placeholder="TXN-123456"
                  />
                </div>
              </div>

              {/* Payment Date */}
              <div className="space-y-1">
                <label className="text-[8px] font-black text-[#94A3B8] uppercase tracking-widest ml-1">Payment Date</label>
                <div className="relative">
                  <Calendar size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                  <Input
                    type="date"
                    required
                    readOnly
                    value={formData.paymentDate}
                    className="pl-9 bg-[#14142B] border-white/[0.05] h-8 rounded-xl text-[9px] font-bold text-white/50 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1">
              <div className="flex justify-between items-center px-1">
                <label className="text-[8px] font-black text-[#94A3B8] uppercase tracking-widest">Notes</label>
                <span className="text-[7px] text-[#94A3B8]/50 uppercase italic tracking-widest">optional</span>
              </div>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional payment details..."
                rows={2}
                className="w-full p-3 bg-[#14142B] border border-white/[0.05] rounded-xl text-[9px] font-bold text-white placeholder:text-[#94A3B8]/30 focus:outline-none focus:ring-1 focus:ring-[#A855F7]/30 min-h-[60px] resize-none"
              />
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="h-8 px-4 rounded-xl bg-white/5 text-white hover:bg-white/10 transition-all text-[9px] font-black uppercase tracking-widest"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="h-8 px-5 rounded-xl bg-gradient-to-r from-[#A855F7] to-[#06B6D4] hover:opacity-90 text-white font-black text-[9px] uppercase tracking-widest shadow-xl shadow-[#A855F7]/20 border-none transition-all active:scale-95 group"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-3 w-3 border-2 border-white/30 border-t-white mr-1.5" />
              ) : (
                <Check size={14} className="mr-1.5 group-hover:scale-110 transition-transform" />
              )}
              {loading ? "Recording..." : "Record Payment"}
            </button>
          </div>
        </form>
      </Card>
    </div>
  )
}

const FileText = ({ size, className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2.5" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
    <line x1="10" y1="9" x2="8" y2="9"/>
  </svg>
)
