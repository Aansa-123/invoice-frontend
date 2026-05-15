import { useState, useEffect } from "react"
import { Card } from "../ui/card"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { X, User, Mail, Phone, MapPin, Check, Plus, Edit3, Briefcase } from "lucide-react"

export default function ClientModal({ isOpen, onClose, onClientSaved, editingClient, setShowUpgradeModal, setUpgradeMessage }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (editingClient) {
      setFormData(editingClient)
    } else {
      setFormData({
        name: "",
        email: "",
        phone: "",
        address: "",
      })
    }
  }, [editingClient, isOpen])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const token = localStorage.getItem("token")
      const url = editingClient
        ? `${import.meta.env.VITE_API_URL}/api/clients/${editingClient._id}`
        : `${import.meta.env.VITE_API_URL}/api/clients`
      const method = editingClient ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        onClientSaved()
        onClose()
      } else if (response.status === 403) {
        const data = await response.json()
        setUpgradeMessage(data.error)
        onClose()
        setShowUpgradeModal(true)
      } else {
        const data = await response.json()
        alert(data.error || "Failed to save client")
      }
    } catch (error) {
      console.error("Failed to save client:", error)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-[#050510]/80 z-50 flex items-center justify-center p-4 backdrop-blur-md">
      <Card className="w-full max-w-md bg-[#0B0B1E] border border-white/[0.08] shadow-2xl rounded-[2rem] overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="p-6 px-8 flex items-center justify-between border-b border-white/[0.05]">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
              {editingClient ? <Edit3 className="text-white" size={20} /> : <Plus className="text-white" size={20} />}
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight">{editingClient ? "Edit Client" : "Add New Client"}</h2>
              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">{editingClient ? "Update client details" : "Register a new business contact"}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <div className="space-y-4">
            {/* Name Field */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Client Name <span className="text-red-500">*</span></label>
              <div className="relative group">
                <Briefcase size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                <Input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="h-12 pl-11 bg-white/[0.03] border-white/[0.05] rounded-2xl text-sm font-bold text-white placeholder:text-gray-600 focus-visible:ring-purple-500/20 transition-all"
                  placeholder="Acme Corp or John Doe"
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Email Address <span className="text-red-500">*</span></label>
              <div className="relative group">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                <Input
                  required
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="h-12 pl-11 bg-white/[0.03] border-white/[0.05] rounded-2xl text-sm font-bold text-white placeholder:text-gray-600 focus-visible:ring-purple-500/20 transition-all"
                  placeholder="client@company.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Phone Field */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Phone Number</label>
                <div className="relative group">
                  <Phone size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="h-11 pl-10 bg-white/[0.03] border-white/[0.05] rounded-2xl text-xs font-bold text-white placeholder:text-gray-600 focus-visible:ring-purple-500/20 transition-all"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>

              {/* Status/Other Field (Optional UI enhancement) */}
              <div className="space-y-1.5 opacity-50">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Client ID</label>
                <div className="h-11 flex items-center px-4 bg-white/[0.01] border border-dashed border-white/[0.1] rounded-2xl text-[10px] font-mono text-gray-400 italic">
                  {editingClient ? editingClient._id.slice(-8).toUpperCase() : "AUTO-GENERATED"}
                </div>
              </div>
            </div>

            {/* Address Field */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Physical Address</label>
              <div className="relative group">
                <MapPin size={16} className="absolute left-4 top-3 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full min-h-[80px] pl-11 pr-4 py-3 bg-white/[0.03] border border-white/[0.05] rounded-2xl text-sm font-bold text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all resize-none"
                  placeholder="123 Business St, City, Country"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-12 rounded-2xl bg-white/5 text-white hover:bg-white/10 transition-all text-xs font-black uppercase tracking-widest border border-white/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-[2] h-12 rounded-2xl bg-gradient-to-r from-purple-500 to-blue-500 hover:opacity-90 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-purple-500/20 border-none transition-all active:scale-95 flex items-center justify-center gap-2 group"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white" />
              ) : (
                <>
                  <Check size={16} className="group-hover:scale-110 transition-transform" />
                  {editingClient ? "Update Client" : "Create Client"}
                </>
              )}
            </button>
          </div>
        </form>
      </Card>
    </div>
  )
}
