

import { useEffect, useState } from "react"
import { Card } from "../ui/card"
import { Badge } from "../ui/badge"
import { MoreVertical, Edit2, Trash2, Eye, Send, CreditCard, Download } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import EditInvoiceModal from "../invoices/edit-invoice-modal"
import InvoicePreviewModal from "../invoices/invoice-preview-modal"
import PaymentModal from "../payments/payment-modal"

export default function RecentInvoices() {
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [paymentModalOpen, setPaymentModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [previewModalOpen, setPreviewModalOpen] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState(null)

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
        return "bg-green-700 text-white dark:bg-green-900 dark:text-white hover:bg-green-700 hover:dark:bg-green-900"
      case "Pending":
        return "bg-yellow-500 text-white dark:bg-yellow-900 dark:text-white hover:bg-yellow-500 hover:dark:bg-yellow-900"
      case "Overdue":
        return "bg-red-600 text-white dark:bg-red-900 dark:text-white hover:bg-red-600 hover:dark:bg-red-900"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100"
    }
  }

  const handleDeleteInvoice = async (invoiceId) => {
    if (!window.confirm("Are you sure you want to delete this invoice?")) return

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/invoices/${invoiceId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        setInvoices(invoices.filter((inv) => inv._id !== invoiceId))
      }
    } catch (error) {
      console.error("Failed to delete invoice:", error)
    }
  }

  const handleRecordPaymentClick = (invoice) => {
    setSelectedInvoice(invoice)
    setPaymentModalOpen(true)
  }

  const handleSendClick = async (invoice) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/invoices/${invoice._id}/send`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        fetchRecentInvoices()
      } else {
        const data = await response.json()
        alert(data.error || "Failed to send invoice")
      }
    } catch (error) {
      console.error("Failed to send invoice:", error)
    }
  }

  const handleEditClick = (invoice) => {
    setSelectedInvoice(invoice)
    setEditModalOpen(true)
  }

  const handlePreviewClick = (invoice) => {
    setSelectedInvoice(invoice)
    setPreviewModalOpen(true)
  }

  const handleDownloadPDF = async (invoiceId) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/invoices/${invoiceId}/pdf`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.download = `invoice-${invoiceId}.pdf`
        link.click()
      }
    } catch (error) {
      console.error("Failed to download PDF:", error)
    }
  }

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-foreground">Recent Invoices</h2>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : invoices.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">No invoices yet</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-card z-20 border-b border-border">
              <tr>
                <th className="text-left py-3 px-2 text-muted-foreground font-semibold">Invoice Number</th>
                <th className="text-left py-3 px-2 text-muted-foreground font-semibold">Client</th>
                <th className="text-left py-3 px-2 text-muted-foreground font-semibold">Amount</th>
                <th className="text-left py-3 px-2 text-muted-foreground font-semibold">Status</th>
                <th className="text-left py-3 px-2 text-muted-foreground font-semibold">Date</th>
                <th className="text-right py-3 px-2 text-muted-foreground font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr 
                  key={invoice._id} 
                  className="border-b border-border hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => handlePreviewClick(invoice)}
                >
                  <td className="py-3 px-2 text-foreground font-medium">{invoice.invoiceNumber}</td>
                  <td className="py-3 px-2 text-foreground">{invoice.clientId?.name || "N/A"}</td>
                  <td className="py-3 px-2 text-foreground font-semibold">${invoice.total?.toLocaleString()}</td>
                  <td className="py-3 px-2">
                    <Badge className={getStatusColor(invoice.status)}>{invoice.status}</Badge>
                  </td>
                  <td className="py-3 px-2 text-muted-foreground">{new Date(invoice.invoiceDate || invoice.createdAt).toLocaleDateString()}</td>
                  <td className="py-3 px-2 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDownloadPDF(invoice._id)
                        }}
                        title="Download PDF"
                        className="p-1 hover:bg-muted rounded text-primary transition-colors"
                      >
                        <Download size={16} />
                      </button>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            onClick={(e) => e.stopPropagation()}
                            className="p-1 hover:bg-muted rounded inline-flex transition-colors"
                          >
                            <MoreVertical size={16} />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => handlePreviewClick(invoice)}>
                            <Eye size={16} className="mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditClick(invoice)}>
                            <Edit2 size={16} className="mr-2" />
                            Edit Invoice
                          </DropdownMenuItem>
                          
                          {invoice.status !== "Paid" && (
                            <DropdownMenuItem onClick={() => handleRecordPaymentClick(invoice)}>
                              <CreditCard size={16} className="mr-2" />
                              Record Payment
                            </DropdownMenuItem>
                          )}

                          <DropdownMenuSeparator />
                          
                          <DropdownMenuItem 
                            className="text-destructive focus:text-destructive"
                            onClick={() => handleDeleteInvoice(invoice._id)}
                          >
                            <Trash2 size={16} className="mr-2" />
                            Delete Invoice
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <PaymentModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        initialInvoice={selectedInvoice}
        onPaymentRecorded={fetchRecentInvoices}
      />

      <EditInvoiceModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        invoice={selectedInvoice}
        onInvoiceUpdated={fetchRecentInvoices}
      />

      <InvoicePreviewModal
        isOpen={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        invoice={selectedInvoice}
      />
    </Card>
  )
}
