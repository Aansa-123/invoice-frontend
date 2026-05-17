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
  const [currency, setCurrency] = useState("USD")

  useEffect(() => {
    fetchInvoices()
    fetchSettings()

    if (location.state?.clientName) {
      setInitialClientName(location.state.clientName)
      setIsModalOpen(true)
      navigate(location.pathname, { replace: true, state: {} })
    }
  }, [])

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/company`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        if (data.data?.currency) {
          setCurrency(data.data.currency)
        }
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error)
    }
  }

  const getCurrencySymbol = (code) => {
    const symbols = { USD: "$", EUR: "€", GBP: "£", PKR: "Rs", INR: "₹" }
    return symbols[code] || "$"
  }

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
      if (statusFilter === "Draft") {
        filtered = filtered.filter((inv) => inv.isDraft === true)
      } else {
        filtered = filtered.filter((inv) => inv.status === statusFilter && !inv.isDraft)
      }
    } else {
      // By default show non-drafts in "All", or maybe show everything?
      // User said "when items are added to list show in invoice page where all invoice/item list show"
      // So All should probably include Drafts too, but let's keep them distinct if filtered.
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
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
      case "Pending":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20"
      case "Overdue":
        return "bg-rose-500/10 text-rose-500 border-rose-500/20"
      default:
        return "bg-muted text-muted-foreground border-border"
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
          <Clock className="text-orange-600 dark:text-orange-400" size={32} />
        </div>
        <h2 className="text-lg font-bold mb-2">Pending Approval</h2>
        <p className="text-base font-medium text-foreground mb-1">
          {pendingOrg.name}
        </p>
        <p className="text-sm text-muted-foreground max-w-md mb-8">
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
    <div className="space-y-4 p-4 lg:p-6 bg-transparent min-h-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-0.5">
          <h1 className="text-lg font-black text-white tracking-tight">Invoices</h1>
          <p className="text-[9px] text-[#94A3B8] font-medium uppercase tracking-wider">Manage and track all your invoices</p>
        </div>
      </div>

      {/* Upgrade Required Modal */}
      <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
        <DialogContent className="max-w-md bg-[#0B0B1E] border-white/10 rounded-[2.5rem] p-10">
          <DialogHeader>
            <div className="w-20 h-20 bg-[#A855F7]/10 rounded-full flex items-center justify-center mb-6 border border-[#A855F7]/20 shadow-[0_0_30px_rgba(168,85,247,0.1)]">
              <Lock className="w-6 h-6 text-[#A855F7]" />
            </div>
            <DialogTitle className="text-center text-lg font-black text-white tracking-tight">Upgrade Required</DialogTitle>
          </DialogHeader>
          <div className="text-center py-6">
            <p className="text-white font-medium text-base leading-relaxed">
              {upgradeMessage || "You've reached the limit for your current plan."}
            </p>
            <p className="text-[#94A3B8] mt-3 text-xs font-medium">
              Upgrade your plan to create more invoices and unlock advanced features.
            </p>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-4 sm:justify-center">
            <Button 
              variant="outline" 
              onClick={() => setShowUpgradeModal(false)}
              className="w-full sm:w-auto h-12 rounded-2xl border-white/5 hover:bg-white/5 text-[#94A3B8] font-black text-xs uppercase tracking-widest"
            >
              Cancel
            </Button>
            <Button 
              onClick={() => navigate("/subscription")}
              className="w-full sm:w-auto h-12 rounded-2xl bg-gradient-to-r from-[#A855F7] to-[#06B6D4] hover:opacity-90 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-[#A855F7]/20 transition-all active:scale-95"
            >
              View Plans
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Search & Filters Combined Card */}
      <Card className="p-4 bg-[#14142B] border border-white/[0.03] rounded-2xl shadow-xl overflow-visible">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1 relative w-full">
            <Search
              size={14}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]"
            />
            <Input
              placeholder="Search invoices..."
              className="pl-10 bg-[#0B0B1E]/50 border-white/[0.05] focus-visible:ring-1 focus-visible:ring-[#A855F7]/30 h-10 rounded-xl w-full text-[11px] font-bold placeholder:text-[#94A3B8] text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-1.5 bg-[#0B0B1E] p-1 rounded-xl border border-white/[0.05]">
            {["All", "Pending", "Paid", "Overdue", "Draft"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                  statusFilter === status
                    ? "bg-gradient-to-r from-[#A855F7] to-[#06B6D4] text-white shadow-lg shadow-[#A855F7]/20"
                    : "text-[#94A3B8] hover:text-white"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Table Content */}
      <Card className="bg-[#14142B] border border-white/[0.03] rounded-2xl shadow-xl overflow-hidden group">
        <div className="overflow-x-auto relative scrollbar-thin scrollbar-thumb-white/5">
          <table className="w-full text-left">
            <thead className="bg-[#0B0B1E] border-b border-white/5">
              <tr>
                <th className="px-6 py-4 text-[9px] font-black text-[#94A3B8] uppercase tracking-widest">Invoice</th>
                <th className="px-6 py-4 text-[9px] font-black text-[#94A3B8] uppercase tracking-widest">Client</th>
                <th className="px-6 py-4 text-[9px] font-black text-[#94A3B8] uppercase tracking-widest">Amount</th>
                <th className="px-6 py-4 text-[9px] font-black text-[#94A3B8] uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[9px] font-black text-[#94A3B8] uppercase tracking-widest">Date</th>
                <th className="px-6 py-4 text-[9px] font-black text-[#94A3B8] uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/[0.03]">
              {filteredInvoices.map((invoice) => (
                <tr
                  key={invoice._id}
                  className="hover:bg-white/[0.02] transition-all group/item"
                >
                  <td
                    onClick={() => !invoice.isDraft && handlePreviewClick(invoice)}
                    className={`px-6 py-4 ${invoice.isDraft ? "" : "cursor-pointer"}`}
                  >
                    <span className="text-[11px] font-bold text-white group-hover/item:text-[#A855F7] transition-colors uppercase">
                      {invoice.isDraft ? "—" : invoice.invoiceNumber}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <span className="text-[11px] font-bold text-white/80">
                      {invoice.clientId?.name || "Unknown"}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <span className="text-[12px] font-black text-white tracking-tight">
                      {invoice.isDraft ? "—" : `${getCurrencySymbol(currency)}${invoice.total?.toLocaleString()}`}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    {invoice.isDraft ? (
                      <span className="text-[10px] text-gray-600 font-bold tracking-widest uppercase">Order</span>
                    ) : (
                      <span className={`px-2.5 py-0.5 rounded-lg text-[8px] font-black border ${getStatusColor(invoice.status)} uppercase tracking-widest`}>
                        {invoice.status}
                      </span>
                    )}
                  </td>

                  <td className="px-6 py-4">
                    <span className="text-[10px] font-bold text-[#94A3B8]">
                      {invoice.isDraft ? "—" : new Date(
                        invoice.invoiceDate || invoice.createdAt
                      ).toLocaleDateString()}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-3 items-center">
                      {invoice.isDraft ? (
                        <Button 
                          onClick={() => handleEditClick(invoice)}
                          className="h-7 px-4 rounded-lg bg-gradient-to-r from-[#A855F7] to-[#06B6D4] hover:opacity-90 text-white font-black text-[9px] uppercase tracking-widest border-none transition-all active:scale-95 shadow-lg shadow-[#A855F7]/20"
                        >
                          Generate Invoice
                        </Button>
                      ) : (
                        <>
                          <button 
                            onClick={() => handleDownloadPDF(invoice._id)}
                            className="p-1.5 rounded-lg text-[#94A3B8] hover:text-white hover:bg-white/5 transition-all"
                            title="Download PDF"
                          >
                            <Download size={14} />
                          </button>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="p-1.5 rounded-lg text-[#94A3B8] hover:text-white hover:bg-white/5 transition-all">
                                <MoreVertical size={14} />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="bg-[#14142B] border-white/5 text-white p-2 rounded-xl shadow-2xl" align="end">
                              <DropdownMenuItem onClick={() => handlePreviewClick(invoice)} className="flex items-center gap-2.5 p-2 rounded-lg focus:bg-white/5 cursor-pointer text-[10px] font-bold">
                                <Eye size={14} className="text-[#06B6D4]" /> View Details
                              </DropdownMenuItem>
                              
                              {userRole !== "Viewer" && (
                                <>
                                  <DropdownMenuItem onClick={() => handleEditClick(invoice)} className="flex items-center gap-2.5 p-2 rounded-lg focus:bg-white/5 cursor-pointer text-[10px] font-bold">
                                    <Edit2 size={14} className="text-amber-400" /> Edit Invoice
                                  </DropdownMenuItem>
                                  
                                  {invoice.status !== "Paid" && invoice.status !== "Overdue" && !invoice.isDraft && (
                                    <DropdownMenuItem onClick={() => handleRecordPaymentClick(invoice)} className="flex items-center gap-2.5 p-2 rounded-lg focus:bg-white/5 cursor-pointer text-[10px] font-bold">
                                      <CreditCard size={14} className="text-emerald-400" /> Record Payment
                                    </DropdownMenuItem>
                                  )}
                                  
                                  <DropdownMenuSeparator className="bg-white/5 my-1" />
                                  
                                  <DropdownMenuItem 
                                    onClick={() => handleDeleteInvoice(invoice._id)} 
                                    className="flex items-center gap-2.5 p-2 rounded-lg focus:bg-rose-500/10 text-rose-500 cursor-pointer text-[10px] font-bold"
                                  >
                                    <Trash2 size={14} /> Delete Invoice
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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