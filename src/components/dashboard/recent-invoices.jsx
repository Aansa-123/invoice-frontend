

import { useEffect, useState } from "react"
import { Card } from "../ui/card"
import { Badge } from "../ui/badge"
import { MoreVertical, Edit2, Trash2, CheckCircle, Eye } from "lucide-react"
import StatusModal from "../invoices/status-modal"
import EditInvoiceModal from "../invoices/edit-invoice-modal"
import InvoicePreviewModal from "../invoices/invoice-preview-modal"

export default function RecentInvoices() {
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusModalOpen, setStatusModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [previewModalOpen, setPreviewModalOpen] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState(null)
  const [openMenuId, setOpenMenuId] = useState(null)

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
        setOpenMenuId(null)
      }
    } catch (error) {
      console.error("Failed to delete invoice:", error)
    }
  }

  const handleStatusClick = (invoice) => {
    setSelectedInvoice(invoice)
    setStatusModalOpen(true)
    setOpenMenuId(null)
  }

  const handleEditClick = (invoice) => {
    setSelectedInvoice(invoice)
    setEditModalOpen(true)
    setOpenMenuId(null)
  }

  const handlePreviewClick = (invoice) => {
    setSelectedInvoice(invoice)
    setPreviewModalOpen(true)
    setOpenMenuId(null)
  }

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-foreground mb-4">Recent Invoices</h2>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : invoices.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">No invoices yet</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border">
              <tr>
                <th className="text-left py-2 text-muted-foreground font-bold">Invoice ID</th>
                <th className="text-left py-2 text-muted-foreground font-bold">Amount</th>
                <th className="text-left py-2 text-muted-foreground font-bold">Status</th>
                <th className="text-left py-2 text-muted-foreground font-bold">Date</th>
                <th className="text-right py-2 text-muted-foreground font-bold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice._id} className="border-b border-border hover:bg-accent/20">
                  <td className="py-3 text-foreground font-medium">{invoice.invoiceNumber}</td>
                  <td className="py-3 text-foreground">${invoice.total?.toLocaleString()}</td>
                  <td className="py-3">
                    <Badge className={getStatusColor(invoice.status)}>{invoice.status}</Badge>
                  </td>
                  <td className="py-3 text-muted-foreground">{new Date(invoice.invoiceDate).toLocaleDateString()}</td>
                  <td className="py-3 text-right relative">
                    <button
                      onClick={() => setOpenMenuId(openMenuId === invoice._id ? null : invoice._id)}
                      className="p-1 hover:bg-muted rounded inline-flex"
                    >
                      <MoreVertical size={16} />
                    </button>
                    {openMenuId === invoice._id && (
                      <div className="absolute right-0 top-full mt-1 bg-card border border-border rounded-lg shadow-lg z-10 min-w-max">
                        <button
                          onClick={() => handlePreviewClick(invoice)}
                          className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted flex items-center gap-2 border-b border-border"
                        >
                          <Eye size={16} />
                          Preview
                        </button>
                        <button
                          onClick={() => handleStatusClick(invoice)}
                          className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted flex items-center gap-2 border-b border-border"
                        >
                          <CheckCircle size={16} />
                          Update Status
                        </button>
                        <button
                          onClick={() => handleEditClick(invoice)}
                          className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted flex items-center gap-2 border-b border-border"
                        >
                          <Edit2 size={16} />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteInvoice(invoice._id)}
                          className="w-full text-left px-4 py-2 text-sm text-destructive hover:bg-destructive/10 flex items-center gap-2"
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <StatusModal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        invoice={selectedInvoice}
        onStatusUpdated={fetchRecentInvoices}
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
