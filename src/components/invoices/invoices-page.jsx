import { useState, useEffect } from "react"
import { Card } from "../ui/card"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Badge } from "../ui/badge"
import { Plus, Search, Download, MoreVertical, Edit2, Trash2, Eye, CreditCard, Lock, Clock, RefreshCw } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog"
import InvoiceModal from "./invoice-modal"
import EditInvoiceModal from "./edit-invoice-modal"
import InvoicePreviewModal from "./invoice-preview-modal"
import PaymentModal from "../payments/payment-modal"
import { useLocation, useNavigate } from "react-router-dom"
import { toast } from "sonner"

export default function InvoicesPage({ userRole }) {

  const location = useLocation()
  const navigate = useNavigate()

  const [invoices, setInvoices] = useState([])
  const [filteredInvoices, setFilteredInvoices] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [initialClientName, setInitialClientName] = useState("")
  const [paymentModalOpen, setPaymentModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [previewModalOpen, setPreviewModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [selectedInvoice, setSelectedInvoice] = useState(null)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [upgradeMessage, setUpgradeMessage] = useState("")
  const [pendingOrg, setPendingOrg] = useState(null)

  useEffect(() => {
    fetchInvoices()

    if (location.state?.clientName) {
      setInitialClientName(location.state.clientName)
      setIsModalOpen(true)
      navigate(location.pathname, { replace: true, state: {} })
    }
  }, [])

  useEffect(() => {
    filterInvoices()
  }, [invoices, searchTerm, statusFilter])

  const fetchInvoices = async () => {
    try {
      const token = localStorage.getItem("token")

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/invoices`,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (response.status === 403) {
        const data = await response.json()
        if (data.error === "Organization pending approval") {
          setPendingOrg({ name: data.orgName })
          setLoading(false)
          return
        }
      }

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
          inv.clientId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredInvoices(filtered)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "Paid":
        return "bg-green-600 text-white"
      case "Pending":
        return "bg-yellow-500 text-white"
      case "Overdue":
        return "bg-red-600 text-white"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleDeleteInvoice = async (invoiceId) => {

    if (!window.confirm("Delete this invoice?")) return

    try {
      const token = localStorage.getItem("token")

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/invoices/${invoiceId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      if (response.ok) {
        setInvoices(invoices.filter((inv) => inv._id !== invoiceId))
      }

    } catch (error) {
      console.error("Delete failed:", error)
    }
  }

  const handleDownloadPDF = async (invoiceId) => {

    try {
      const token = localStorage.getItem("token")

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/invoices/${invoiceId}/pdf`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      if (response.ok) {

        const blob = await response.blob()

        const url = window.URL.createObjectURL(blob)

        const link = document.createElement("a")

        link.href = url
        link.download = `invoice-${invoiceId}.pdf`

        link.click()
      }

    } catch (error) {
      console.error("PDF download failed:", error)
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

  const handleRecordPaymentClick = (invoice) => {
    setSelectedInvoice(invoice)
    setPaymentModalOpen(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (pendingOrg) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)] p-6 text-center">
        <div className="w-20 h-20 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mb-6">
          <Clock className="text-orange-600 dark:text-orange-400" size={40} />
        </div>
        <h2 className="text-2xl font-bold mb-2">Pending Approval</h2>
        <p className="text-lg font-medium text-foreground mb-1">
          {pendingOrg.name}
        </p>
        <p className="text-muted-foreground max-w-md mb-8">
          This organization is currently waiting for administrator approval. 
          You will be notified once it has been approved. 
          Until then, you can switch to an existing organization or wait.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button 
            onClick={() => window.location.reload()}
            variant="outline"
            className="gap-2"
          >
            <RefreshCw size={18} />
            Check Status
          </Button>
          <Button 
            onClick={() => {
              toast.info("Use the sidebar to switch organizations")
            }}
            className="bg-primary hover:bg-primary/90 font-bold"
          >
            Switch Organization
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">

      {/* Header */}

      <div className="flex justify-between items-center">

        <div>
          <h1 className="text-3xl font-bold">Invoices</h1>
          <p className="text-muted-foreground">Manage and track all your invoices</p>
        </div>

        {userRole !== "Viewer" && (
          <Button onClick={() => setIsModalOpen(true)} className="gap-2">
            <Plus size={18} />
            Create Invoice
          </Button>
        )}

      </div>

      {/* Upgrade Required Modal */}
      <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-4">
              <Lock className="w-6 h-6 text-amber-600" />
            </div>
            <DialogTitle className="text-center text-xl font-bold">Upgrade Required</DialogTitle>
          </DialogHeader>
          <div className="text-center py-4">
            <p className="text-gray-600 font-medium">
              {upgradeMessage || "You've reached the limit for your current plan."}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Upgrade your plan to create more invoices and unlock advanced features.
            </p>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-center">
            <Button 
              variant="outline" 
              onClick={() => setShowUpgradeModal(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button 
              onClick={() => navigate("/subscription")}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white"
            >
              View Plans
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Filters */}

      <Card className="p-6 overflow-visible">

        <div className="flex gap-4">

          <div className="flex-1 relative">

            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />

            <Input
              placeholder="Search invoices..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

          </div>

          <div className="flex gap-2">

            {["All", "Pending", "Paid", "Overdue"].map((status) => (

              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm ${
                  statusFilter === status
                    ? "bg-primary text-white"
                    : "bg-muted"
                }`}
              >
                {status}
              </button>

            ))}

          </div>

        </div>

      </Card>

      {/* Table */}

      <Card className="p-6">

        {loading ? (

          <div className="py-10 text-center">Loading...</div>

        ) : (

         <div className="overflow-x-auto overflow-y-visible relative">

            <table className="w-full text-sm">

              <thead className="border-b">

                <tr>
                  <th className="text-left py-3">Invoice</th>
                  <th className="text-left py-3">Client</th>
                  <th className="text-left py-3">Amount</th>
                  <th className="text-left py-3">Status</th>
                  <th className="text-left py-3">Date</th>
                  <th className="text-right py-3">Actions</th>
                </tr>

              </thead>

              <tbody>

                {filteredInvoices.map((invoice) => (

                  <tr
                    key={invoice._id}
                    className="border-b hover:bg-muted/50 transition"
                  >

                    <td
                      onClick={() => handlePreviewClick(invoice)}
                      className="cursor-pointer font-medium py-3"
                    >
                      {invoice.invoiceNumber}
                    </td>

                    <td>{invoice.clientId?.name}</td>

                    <td className="font-semibold">
                      ${invoice.total?.toLocaleString()}
                    </td>

                    <td>
                      <Badge className={getStatusColor(invoice.status)}>
                        {invoice.status}
                      </Badge>
                    </td>

                    <td>
                      {new Date(
                        invoice.invoiceDate || invoice.createdAt
                      ).toLocaleDateString()}
                    </td>

                    {/* ACTIONS */}

                    <td className="text-right">

                      <div className="flex justify-end gap-2">

                        {/* DOWNLOAD */}

                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDownloadPDF(invoice._id)
                          }}
                          className="p-1 hover:bg-muted rounded text-primary transition-colors"
                          title="Download PDF"
                        >
                          <Download size={16} />
                        </button>

                        {/* RADIX DROPDOWN */}
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

                            {userRole !== "Viewer" && invoice.status !== "Paid" && (
                              <DropdownMenuItem onClick={() => handleEditClick(invoice)}>
                                <Edit2 size={16} className="mr-2" />
                                Edit Invoice
                              </DropdownMenuItem>
                            )}
                            
                            {(userRole === "Owner" || userRole === "Admin") && invoice.status !== "Paid" && (
                              <DropdownMenuItem onClick={() => handleRecordPaymentClick(invoice)}>
                                <CreditCard size={16} className="mr-2" />
                                Record Payment
                              </DropdownMenuItem>
                            )}

                            {(userRole === "Owner" || userRole === "Admin") && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  variant="destructive"
                                  onClick={() => handleDeleteInvoice(invoice._id)}
                                >
                                  <Trash2 size={16} className="mr-2" />
                                  Delete Invoice
                                </DropdownMenuItem>
                              </>
                            )}
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

      </Card>

      <InvoiceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onInvoiceCreated={fetchInvoices}
        initialClientName={initialClientName}
        setShowUpgradeModal={setShowUpgradeModal}
        setUpgradeMessage={setUpgradeMessage}
      />

      <PaymentModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        initialInvoice={selectedInvoice}
        onPaymentRecorded={fetchInvoices}
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