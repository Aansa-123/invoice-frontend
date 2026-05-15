import { useState, useEffect } from "react"
import { Card } from "../ui/card"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Plus, Search, Edit, Trash2, Eye, FileText, Lock, Users, DollarSign, BarChart3, Download, Filter, Grid, List, MoreVertical } from "lucide-react"
import ClientModal from "./client-modal"
import ViewClientModal from "./ViewClientModal"
import { useNavigate } from "react-router-dom"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "../ui/dropdown-menu"

export default function ClientsPage({ userRole }) {
  const navigate = useNavigate()
  const [clients, setClients] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState(null)
  const [editingClient, setEditingClient] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [upgradeMessage, setUpgradeMessage] = useState("")
  const [viewType, setViewType] = useState("table")

  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/clients`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setClients(data.data)
      }
    } catch (error) {
      console.error("Failed to fetch clients:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (clientId) => {
    if (!window.confirm("Are you sure you want to delete this client?")) return

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/clients/${clientId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        setClients(clients.filter((c) => c._id !== clientId))
      }
    } catch (error) {
      console.error("Failed to delete client:", error)
    }
  }

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getInitials = (name) => {
    if (!name) return "N"
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 1)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
      case "Overdue":
        return "bg-rose-500/10 text-rose-500 border-rose-500/20"
      case "Inactive":
        return "bg-white/5 text-white/40 border-white/10"
      default:
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
    }
  }

  return (
    <div className="space-y-4 p-4 lg:p-6 bg-transparent min-h-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-0.5">
          <h1 className="text-lg font-black text-white tracking-tight">Clients</h1>
          <p className="text-[9px] text-[#94A3B8] font-medium uppercase tracking-wider">Manage your client relationships and billing history</p>
        </div>
        
        <div className="flex items-center gap-2.5">
          {userRole !== "Viewer" && (
            <Button 
              onClick={() => {
                setEditingClient(null)
                setIsModalOpen(true)
              }} 
              className="h-9 px-5 rounded-full bg-gradient-to-r from-[#A855F7] to-[#06B6D4] hover:opacity-90 text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-[#A855F7]/20 border-none transition-all active:scale-95 flex items-center gap-2"
            >
              <Plus size={14} />
              Add Client
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card className="p-3 bg-[#14142B] border border-white/[0.03] rounded-2xl relative overflow-hidden group">
          <div className="flex items-center gap-3 relative z-10">
            <div className="p-2 rounded-xl bg-[#A855F7]/10 text-[#A855F7] border border-[#A855F7]/10">
              <Users size={16} strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-[8px] font-black text-[#94A3B8] uppercase tracking-widest">Total Clients</p>
              <h3 className="text-base font-black text-white leading-none mt-0.5">{clients.length}</h3>
            </div>
          </div>
        </Card>
        <Card className="p-3 bg-[#14142B] border border-white/[0.03] rounded-2xl relative overflow-hidden group">
          <div className="flex items-center gap-3 relative z-10">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/10">
              <DollarSign size={16} strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-[8px] font-black text-[#94A3B8] uppercase tracking-widest">Lifetime Revenue</p>
              <h3 className="text-base font-black text-white leading-none mt-0.5">
                ${clients.reduce((sum, client) => sum + (client.totalRevenue || 0), 0).toLocaleString()}
              </h3>
            </div>
          </div>
        </Card>
        <Card className="p-3 bg-[#14142B] border border-white/[0.03] rounded-2xl relative overflow-hidden group">
          <div className="flex items-center gap-3 relative z-10">
            <div className="p-2 rounded-xl bg-[#06B6D4]/10 text-[#06B6D4] border border-[#06B6D4]/10">
              <BarChart3 size={16} strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-[8px] font-black text-[#94A3B8] uppercase tracking-widest">Total Invoices</p>
              <h3 className="text-base font-black text-white leading-none mt-0.5">
                {clients.reduce((sum, client) => sum + (client.totalInvoices || 0), 0)}
              </h3>
            </div>
          </div>
        </Card>
      </div>

      {/* Search & Filters */}
      <Card className="p-3 bg-[#14142B] border border-white/[0.03] rounded-2xl shadow-xl overflow-visible">
        <div className="flex flex-col md:flex-row gap-3 items-center">
          <div className="flex-1 relative w-full">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
            <Input
              placeholder="Search by name or email..."
              className="pl-9 bg-[#0B0B1E]/50 border-white/[0.05] focus-visible:ring-1 focus-visible:ring-[#A855F7]/30 h-8 rounded-xl w-full text-[9px] font-bold placeholder:text-[#94A3B8] text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

       
        </div>
      </Card>

      {/* Content Table */}
      <Card className="bg-[#14142B] border border-white/[0.03] rounded-2xl shadow-xl overflow-hidden group">
        <div className="overflow-x-auto relative scrollbar-thin scrollbar-thumb-white/5">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-7 w-7 border-t-2 border-b-2 border-[#A855F7]"></div>
            </div>
          ) : filteredClients.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-[#94A3B8] font-bold text-xs">No clients found</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-[#0B0B1E] border-b border-white/5">
                <tr>
                  <th className="px-5 py-3 text-[8px] font-black text-[#94A3B8] uppercase tracking-widest">Client</th>
                  <th className="px-5 py-3 text-[8px] font-black text-[#94A3B8] uppercase tracking-widest">Contact</th>
                  <th className="px-5 py-3 text-[8px] font-black text-[#94A3B8] uppercase tracking-widest text-center">Invoices</th>
                  <th className="px-5 py-3 text-[8px] font-black text-[#94A3B8] uppercase tracking-widest text-center">Revenue</th>
                  <th className="px-5 py-3 text-[8px] font-black text-[#94A3B8] uppercase tracking-widest text-center">Status</th>
                  <th className="px-5 py-3 text-[8px] font-black text-[#94A3B8] uppercase tracking-widest text-right"></th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/[0.03]">
                {filteredClients.map((client) => (
                  <tr key={client._id} className="hover:bg-white/[0.02] transition-all group/item">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#A855F7] to-[#06B6D4] flex items-center justify-center border border-white/10 text-[9px] font-black text-white shadow-lg shadow-[#A855F7]/10">
                          {getInitials(client.name)}
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-white uppercase">{client.name}</p>
                          <p className="text-[8px] text-[#94A3B8] mt-0.5">{client.address || "Location Unknown"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <p className="text-[9px] font-medium text-white/70">{client.email}</p>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className="text-[10px] font-black text-white/80">{client.totalInvoices || 0}</span>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className="text-[10px] font-black text-white">${(client.totalRevenue || 0).toLocaleString()}</span>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded-lg text-[7px] font-black border ${getStatusColor(client.status || "Active")} uppercase tracking-widest`}>
                        {client.status || "Active"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-1 rounded-lg text-[#94A3B8] hover:text-white hover:bg-white/5 transition-all">
                            <MoreVertical size={13} />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-[#14142B] border-white/5 text-white p-1.5 rounded-xl shadow-2xl" align="end">
                          <DropdownMenuItem onClick={() => { setSelectedClient(client); setIsViewModalOpen(true); }} className="flex items-center gap-2 p-1.5 rounded-lg focus:bg-white/5 cursor-pointer text-[9px] font-bold">
                            <Eye size={13} className="text-[#06B6D4]" /> View Details
                          </DropdownMenuItem>
                          {userRole !== "Viewer" && (
                            <>
                              <DropdownMenuItem onClick={() => { setEditingClient(client); setIsModalOpen(true); }} className="flex items-center gap-2 p-1.5 rounded-lg focus:bg-white/5 cursor-pointer text-[9px] font-bold">
                                <Edit size={13} className="text-amber-400" /> Edit Client
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => navigate("/invoices", { state: { clientName: client.name } })} className="flex items-center gap-2 p-1.5 rounded-lg focus:bg-white/5 cursor-pointer text-[9px] font-bold">
                                <Plus size={13} className="text-indigo-400" /> Create Invoice
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="bg-white/5 my-1" />
                              {(userRole === "Owner" || userRole === "Admin") && (
                                <DropdownMenuItem onClick={() => handleDelete(client._id)} className="flex items-center gap-2 p-1.5 rounded-lg focus:bg-rose-500/10 text-rose-500 cursor-pointer text-[9px] font-bold">
                                  <Trash2 size={13} /> Delete Client
                                </DropdownMenuItem>
                              )}
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      <ClientModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingClient(null)
        }}
        onClientSaved={fetchClients}
        editingClient={editingClient}
        setShowUpgradeModal={setShowUpgradeModal}
        setUpgradeMessage={setUpgradeMessage}
      />

      <ViewClientModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        client={selectedClient}
      />

      {/* Upgrade Required Modal */}
      <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
        <DialogContent className="max-w-md bg-[#0B0B1E] border-white/10 rounded-[2.5rem] p-10">
          <DialogHeader>
            <div className="mx-auto w-20 h-20 bg-[#A855F7]/10 rounded-full flex items-center justify-center mb-6 border border-[#A855F7]/20 shadow-[0_0_30px_rgba(168,85,247,0.1)]">
              <Lock className="w-8 h-8 text-[#A855F7]" />
            </div>
            <DialogTitle className="text-center text-2xl font-black text-white tracking-tight">Upgrade Required</DialogTitle>
          </DialogHeader>
          <div className="text-center py-6">
            <p className="text-white font-medium text-lg leading-relaxed">
              {upgradeMessage || "Daily limit reached for your current plan."}
            </p>
            <p className="text-[#94A3B8] mt-3 text-sm font-medium">
              Upgrade your plan to unlock unlimited clients and invoices.
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
              Upgrade Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
