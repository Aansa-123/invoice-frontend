
import { useState, useEffect } from "react"
import { Card } from "../ui/card"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { X, Calendar, DollarSign, List, CreditCard } from "lucide-react"

export default function PaymentModal({ isOpen, onClose, onPaymentRecorded, initialInvoice }) {
  const [formData, setFormData] = useState({
    invoiceId: "",
    amount: "",
    paymentMethod: "Bank Transfer",
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
        // Only show pending and overdue invoices for recording payments
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
    e.preventDefault()
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

      if (response.ok) {
        onPaymentRecorded()
        onClose()
        setFormData({
          invoiceId: "",
          amount: "",
          paymentMethod: "Bank Transfer",
          transactionId: "",
          paymentDate: new Date().toISOString().split('T')[0],
          notes: "",
        })
      }
    } catch (error) {
      console.error("Failed to record payment:", error)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">Record Payment</h2>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <List size={16} /> Invoice
            </label>
            {invoicesLoading ? (
              <div className="mt-2 p-2 text-muted-foreground animate-pulse">Loading invoices...</div>
            ) : (
              <select
                required
                value={formData.invoiceId}
                onChange={handleInvoiceChange}
                className="w-full mt-2 p-2 border border-border rounded-lg bg-background text-foreground"
              >
                <option value="">Select an invoice</option>
                {invoices.map((inv) => (
                  <option key={inv._id} value={inv._id}>
                    {inv.invoiceNumber} - {inv.clientId?.name} (${inv.total?.toLocaleString()})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <DollarSign size={16} /> Amount
            </label>
            <Input
              type="number"
              required
              readOnly
              step="0.01"
              value={formData.amount}
              className="mt-2 bg-muted opacity-80 cursor-not-allowed"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <CreditCard size={16} /> Payment Method
            </label>
            <select
              required
              value={formData.paymentMethod}
              onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
              className="w-full mt-2 p-2 border border-border rounded-lg bg-background text-foreground"
            >
              <option value="Cash">Cash</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Cheque">Cheque</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground">Transaction ID (Optional)</label>
            <Input
              value={formData.transactionId}
              onChange={(e) => setFormData({ ...formData, transactionId: e.target.value })}
              className="mt-2"
              placeholder="TXN-123456"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <Calendar size={16} /> Payment Date
            </label>
            <Input
              type="date"
              required
              readOnly
              value={formData.paymentDate}
              className="mt-2 bg-muted opacity-80 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground">Notes (Optional)</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional payment details..."
              rows={2}
              className="w-full mt-2 p-2 border border-border rounded-lg bg-background text-foreground text-sm"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {loading ? "Recording..." : "Record Payment"}
            </Button>
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
