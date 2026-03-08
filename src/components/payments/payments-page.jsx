
import { useState, useEffect } from "react"
import { Card } from "../ui/card"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Badge } from "../ui/badge"
import { Plus, Search, Filter, CreditCard, Calendar } from "lucide-react"
import PaymentModal from "./payment-modal"

export default function PaymentsPage({ userRole }) {
  const [payments, setPayments] = useState([])
  const [filteredPayments, setFilteredPayments] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [methodFilter, setMethodFilter] = useState("All")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPayments()
  }, [])

  useEffect(() => {
    filterPayments()
  }, [payments, searchTerm, methodFilter])

  const fetchPayments = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/payments`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setPayments(data.data)
      }
    } catch (error) {
      console.error("Failed to fetch payments:", error)
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
          p.transactionId?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredPayments(filtered)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return "bg-green-700 text-white hover:bg-green-700"
      case "Pending":
        return "bg-yellow-500 text-white hover:bg-yellow-500"
      case "Failed":
        return "bg-red-600 text-white hover:bg-red-600"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Payments</h1>
          <p className="text-muted-foreground mt-1">Track and manage all your incoming payments</p>
        </div>
        {(userRole === "Owner" || userRole === "Admin") && (
          <Button onClick={() => setIsModalOpen(true)} className="bg-primary hover:bg-primary/90 gap-2">
            <Plus size={18} />
            Record Payment
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              placeholder="Search by invoice, client or transaction ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex gap-2">
            {["All", "Cash", "Bank Transfer", "Credit Card"].map((method) => (
              <button
                key={method}
                onClick={() => setMethodFilter(method)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  methodFilter === method
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground hover:bg-muted/80"
                }`}
              >
                {method}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Payments Table */}
      <Card className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No payments found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border">
                <tr>
                  <th className="text-left py-3 text-muted-foreground font-semibold">Payment ID</th>
                  <th className="text-left py-3 text-muted-foreground font-semibold">Invoice</th>
                  <th className="text-left py-3 text-muted-foreground font-semibold">Client</th>
                  <th className="text-left py-3 text-muted-foreground font-semibold">Amount</th>
                  <th className="text-left py-3 text-muted-foreground font-semibold">Method</th>
                  <th className="text-left py-3 text-muted-foreground font-semibold">Date</th>
                  <th className="text-left py-3 text-muted-foreground font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment) => (
                  <tr key={payment._id} className="border-b border-border hover:bg-muted/50">
                    <td className="py-3 text-muted-foreground font-mono text-xs">
                      {payment._id.substring(0, 8).toUpperCase()}
                    </td>
                    <td className="py-3 text-foreground font-medium">
                      {payment.invoiceId?.invoiceNumber || "N/A"}
                    </td>
                    <td className="py-3 text-foreground">{payment.clientId?.name || "N/A"}</td>
                    <td className="py-3 text-foreground font-semibold">
                      ${payment.amount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <CreditCard size={14} />
                        {payment.paymentMethod}
                      </div>
                    </td>
                    <td className="py-3 text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        {new Date(payment.paymentDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-3">
                      <Badge className={getStatusColor(payment.status)}>{payment.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <PaymentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onPaymentRecorded={fetchPayments}
      />
    </div>
  )
}
