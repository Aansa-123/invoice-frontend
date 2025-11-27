import { useState, useEffect } from "react"
import { Card } from "../ui/card"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Badge } from "../ui/badge"
import { Plus, Search, Download, MoreVertical, Edit2, Trash2, CheckCircle, Eye } from "lucide-react"
import InvoiceModal from "./invoice-modal"
import StatusModal from "./status-modal"
import EditInvoiceModal from "./edit-invoice-modal"
import InvoicePreviewModal from "./invoice-preview-modal"

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState([])
  const [filteredInvoices, setFilteredInvoices] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [statusModalOpen, setStatusModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [previewModalOpen, setPreviewModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [selectedInvoice, setSelectedInvoice] = useState(null)
  const [openMenuId, setOpenMenuId] = useState(null)

  useEffect(() => {
    fetchInvoices()
  }, [])

  useEffect(() => {
    filterInvoices()
  }, [invoices, searchTerm, statusFilter])

  const fetchInvoices = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/invoices`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setInvoices(data.data)
      }
    } catch (error) {
      console.error("Failed to fetch invoices:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterInvoices = () => {
    let filtered = invoices

    if (statusFilter !== "All") {
      filtered = filtered.filter((inv) => inv.status === statusFilter)
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (inv) =>
          inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          inv.clientId?.name?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    setFilteredInvoices(filtered)
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
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Invoices</h1>
          <p className="text-muted-foreground mt-1">Manage and track all your invoices</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="bg-primary hover:bg-primary/90 gap-2">
          <Plus size={18} />
          Create Invoice
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              placeholder="Search invoices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex gap-2">
            {["All", "Paid", "Pending", "Overdue"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === status
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground hover:bg-muted/80"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Invoices Table */}
      <Card className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No invoices found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border">
                <tr>
                  <th className="text-left py-3 text-muted-foreground font-semibold">Invoice</th>
                  <th className="text-left py-3 text-muted-foreground font-semibold">Client</th>
                  <th className="text-left py-3 text-muted-foreground font-semibold">Amount</th>
                  <th className="text-left py-3 text-muted-foreground font-semibold">Status</th>
                  <th className="text-left py-3 text-muted-foreground font-semibold">Due Date</th>
                  <th className="text-right py-3 text-muted-foreground font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice._id} className="border-b border-border hover:bg-muted/50">
                    <td className="py-3 text-foreground font-medium">{invoice.invoiceNumber}</td>
                    <td className="py-3 text-foreground">{invoice.clientId?.name || "N/A"}</td>
                    <td className="py-3 text-foreground font-semibold">${invoice.total?.toLocaleString()}</td>
                    <td className="py-3">
                      <Badge className={getStatusColor(invoice.status)}>{invoice.status}</Badge>
                    </td>
                    <td className="py-3 text-muted-foreground">{new Date(invoice.dueDate).toLocaleDateString()}</td>
                    <td className="py-3 text-right relative">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleDownloadPDF(invoice._id)}
                          className="inline-flex items-center gap-1 text-primary hover:underline"
                        >
                          <Download size={16} />
                        </button>
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
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <InvoiceModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onInvoiceCreated={fetchInvoices} />

      <StatusModal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        invoice={selectedInvoice}
        onStatusUpdated={fetchInvoices}
      />

      <EditInvoiceModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        invoice={selectedInvoice}
        onInvoiceUpdated={fetchInvoices}
      />

      <InvoicePreviewModal
        isOpen={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        invoice={selectedInvoice}
      />
    </div>
  )
}
