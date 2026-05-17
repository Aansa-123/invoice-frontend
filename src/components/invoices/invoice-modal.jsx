import { useState, useEffect } from "react"
import { Card } from "../ui/card"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { X, Plus, Trash2, FileText, Calendar, Percent, Tag, ReceiptText } from "lucide-react"

export default function InvoiceModal({ 
  isOpen, 
  onClose, 
  onInvoiceCreated, 
  initialClientName,
  setShowUpgradeModal,
  setUpgradeMessage 
}) {
  const [formData, setFormData] = useState({
    clientId: "",
    items: [{ name: "", quantity: 1, price: 0 }],
    taxPercentage: 0,
    discount: 0,
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: "",
    notes: "",
    currency: "USD"
  })

  // Filter out empty items for validation
  const getValidItems = () => {
    return formData.items.filter(item =>
      item.name.trim() !== "" ||
      item.quantity > 0 ||
      item.price > 0
    )
  }
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(false)
  const [clientsLoading, setClientsLoading] = useState(true)

  useEffect(() => {
    if (isOpen) {
      fetchClients()
      fetchSettings()
    }
  }, [isOpen])

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/company`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        if (data.data) {
          setFormData(prev => ({
            ...prev,
            taxPercentage: data.data.taxPercentage || 0,
            notes: data.data.defaultNotes || "",
            currency: data.data.currency || "USD"
          }))
        }
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error)
    }
  }

  const fetchClients = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/clients`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setClients(data.data)
        
        // Pre-select client if initialClientName is provided
        if (initialClientName) {
          const client = data.data.find(c => c.name === initialClientName)
          if (client) {
            setFormData(prev => ({ ...prev, clientId: client._id }))
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch clients:", error)
    } finally {
      setClientsLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    if (e) e.preventDefault()

    // Frontend validation
    if (!formData.clientId || formData.clientId.trim() === "") {
      alert("Please select a client")
      return
    }

    if (!formData.dueDate || formData.dueDate.trim() === "") {
      alert("Please select a due date")
      return
    }

    const invDate = new Date(formData.invoiceDate)
    const dueDate = new Date(formData.dueDate)
    invDate.setHours(0, 0, 0, 0)
    dueDate.setHours(0, 0, 0, 0)

    if (dueDate < invDate) {
      alert("Due date must be the same or later than the invoice date")
      return
    }

    const validItems = getValidItems()
    if (validItems.length === 0) {
      alert("Please add at least one item")
      return
    }

    setLoading(true)
    try {
      const token = localStorage.getItem("token")
      const subtotal = calculateSubtotal()
      const taxAmount = (subtotal * formData.taxPercentage) / 100
      
      const submitData = {
        ...formData,
        tax: taxAmount,
        status: "Pending",
        items: validItems,
      }
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/invoices`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(submitData),
      })

      const data = await response.json()
      if (response.ok) {
        onInvoiceCreated()
        onClose()
        setFormData({
          clientId: "",
          items: [{ name: "", quantity: 1, price: 0 }],
          taxPercentage: 0,
          discount: 0,
          invoiceDate: new Date().toISOString().split('T')[0],
          dueDate: "",
          notes: "",
        })
      } else if (response.status === 403) {
        onClose()
        if (setUpgradeMessage) setUpgradeMessage(data.error || "You've reached your daily invoice limit.")
        if (setShowUpgradeModal) setShowUpgradeModal(true)
      } else {
        alert(`Error: ${data.error || 'Failed to create invoice'}`)
      }
    } catch (error) {
      console.error("Failed to create invoice:", error)
      alert("Network error: Failed to create invoice")
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  const calculateSubtotal = () => formData.items.reduce((sum, item) => sum + item.quantity * item.price, 0)
  const calculateTax = () => (calculateSubtotal() * formData.taxPercentage) / 100
  const calculateTotal = () => calculateSubtotal() + calculateTax() - formData.discount

  const getCurrencySymbol = (code) => {
    const symbols = { USD: "$", EUR: "€", GBP: "£", PKR: "Rs", INR: "₹" }
    return symbols[code] || "$"
  }

  return (
    <div className="fixed inset-0 bg-[#050510]/80 z-50 flex items-center justify-center p-4 backdrop-blur-md">
      <Card className="w-full max-w-2xl bg-[#0B0B1E] border border-white/[0.08] shadow-2xl rounded-[2rem] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 px-8 flex items-center justify-between border-b border-white/[0.05]">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <FileText className="text-white" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight">Create New Invoice</h2>
              <p className="text-[10px] text-gray-400 font-medium">Build a professional invoice in seconds</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="p-5 space-y-5 max-h-[60vh] overflow-y-auto scrollbar-none">
          {/* Client & Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Client <span className="text-red-500">*</span></label>
              <div className="relative group">
                <ReceiptText size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                <select
                  required
                  value={formData.clientId}
                  onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                  className="w-full h-12 pl-11 pr-4 bg-white/[0.03] border border-white/[0.05] rounded-2xl text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all appearance-none"
                >
                  <option value="" className="bg-[#0B0B1E]">Select a client...</option>
                  {clients.map((client) => (
                    <option key={client._id} value={client._id} className="bg-[#0B0B1E]">
                      {client.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {/* Informational UI only as requested, no input for invoice number */}
           
          </div>

          {/* Line Items */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Line Items</h3>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, items: [...formData.items, { name: "", quantity: 1, price: 0 }] })}
                className="text-[10px] font-black text-purple-400 uppercase tracking-widest flex items-center gap-1.5 hover:text-purple-300 transition-colors"
              >
                <Plus size={14} /> Add item
              </button>
            </div>

            <div className="space-y-2">
              {formData.items.map((item, idx) => (
                <div key={idx} className="flex flex-wrap md:flex-nowrap gap-3 items-end bg-white/[0.02] p-2.5 rounded-2xl border border-white/[0.03] group hover:border-white/[0.1] transition-all">
                  <div className="flex-1 min-w-[200px] space-y-1.5">
                    <label className="text-[9px] font-black text-gray-600 uppercase tracking-wider ml-1">Description</label>
                    <input
                      type="text"
                      placeholder="Item or service"
                      value={item.name}
                      onChange={(e) => {
                        const newItems = [...formData.items]
                        newItems[idx].name = e.target.value
                        setFormData({ ...formData, items: newItems })
                      }}
                      className="w-full h-10 px-4 bg-[#050510] border border-white/[0.05] rounded-xl text-xs font-bold text-white placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-purple-500/30 transition-all"
                    />
                  </div>
                  <div className="w-20 space-y-1.5">
                    <label className="text-[9px] font-black text-gray-600 uppercase tracking-wider ml-1 text-center block">Qty</label>
                    <input
                      type="number"
                      value={item.quantity === 0 ? "" : item.quantity}
                      onChange={(e) => {
                        const newItems = [...formData.items]
                        newItems[idx].quantity = e.target.value === "" ? 0 : Number.parseInt(e.target.value)
                        setFormData({ ...formData, items: newItems })
                      }}
                      className="w-full h-10 bg-[#050510] border border-white/[0.05] rounded-xl text-xs font-black text-white text-center focus:outline-none focus:ring-1 focus:ring-purple-500/30 transition-all"
                    />
                  </div>
                  <div className="w-28 space-y-1.5">
                    <label className="text-[9px] font-black text-gray-600 uppercase tracking-wider ml-1 text-right block">Price</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={item.price === 0 ? "" : item.price}
                      onChange={(e) => {
                        const newItems = [...formData.items]
                        newItems[idx].price = e.target.value === "" ? 0 : Number.parseFloat(e.target.value)
                        setFormData({ ...formData, items: newItems })
                      }}
                      className="w-full h-10 px-4 bg-[#050510] border border-white/[0.05] rounded-xl text-xs font-black text-white text-right focus:outline-none focus:ring-1 focus:ring-purple-500/30 transition-all"
                    />
                  </div>
                  <div className="w-28 space-y-1.5">
                    <label className="text-[9px] font-black text-gray-600 uppercase tracking-wider text-right block pr-1">Total</label>
                    <div className="h-10 flex items-center justify-end px-1 text-sm font-black text-white">
                      {getCurrencySymbol(formData.currency)}{(item.quantity * item.price).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const newItems = formData.items.filter((_, i) => i !== idx)
                      setFormData({ ...formData, items: newItems })
                    }}
                    className="h-10 w-10 flex items-center justify-center text-gray-600 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Settings Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Tax %</label>
              <div className="relative">
                <Percent size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" />
                <input
                  type="number"
                  value={formData.taxPercentage === 0 ? "" : formData.taxPercentage}
                  onChange={(e) => setFormData({ ...formData, taxPercentage: e.target.value === "" ? 0 : Number.parseFloat(e.target.value) })}
                  className="w-full h-11 pl-10 pr-4 bg-white/[0.03] border border-white/[0.05] rounded-2xl text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-purple-500/30 transition-all"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Discount {getCurrencySymbol(formData.currency)}</label>
              <div className="relative">
                <Tag size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" />
                <input
                  type="number"
                  value={formData.discount === 0 ? "" : formData.discount}
                  onChange={(e) => setFormData({ ...formData, discount: e.target.value === "" ? 0 : Number.parseFloat(e.target.value) })}
                  className="w-full h-11 pl-10 pr-4 bg-white/[0.03] border border-white/[0.05] rounded-2xl text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-purple-500/30 transition-all"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Issue Date</label>
              <div className="relative">
                <Calendar size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" />
                <input
                  type="date"
                  value={formData.invoiceDate}
                  readOnly
                  className="w-full h-11 pl-10 pr-4 bg-white/[0.01] border border-white/[0.05] rounded-2xl text-xs font-bold text-gray-500 cursor-not-allowed"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Due Date</label>
              <div className="relative">
                <Calendar size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" />
                <input
                  type="date"
                  required
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  onClick={(e) => e.target.showPicker?.()}
                  className="w-full h-11 pl-10 pr-4 bg-white/[0.03] border border-white/[0.05] rounded-2xl text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-purple-500/30 transition-all cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Payment terms, thank-you note..."
              rows={3}
              className="w-full p-4 bg-white/[0.02] border border-white/[0.05] rounded-[1.5rem] text-xs font-medium text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500/10 transition-all resize-none"
            />
          </div>

          {/* Summary */}
          <div className="bg-white/[0.01] border border-white/[0.05] rounded-[2rem] p-6 space-y-3">
            <div className="flex justify-between items-center text-xs font-medium text-gray-500 px-2">
              <span>Subtotal</span>
              <span className="font-bold text-white">{getCurrencySymbol(formData.currency)}{calculateSubtotal().toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between items-center text-xs font-medium text-gray-500 px-2">
              <span>Tax ({formData.taxPercentage}%)</span>
              <span className="font-bold text-white">{getCurrencySymbol(formData.currency)}{calculateTax().toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between items-center text-xs font-medium text-gray-500 px-2">
              <span>Discount</span>
              <span className="font-bold text-red-400">-{getCurrencySymbol(formData.currency)}{formData.discount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="pt-4 mt-2 border-t border-white/[0.05] flex items-center justify-between px-2">
              <span className="text-xs font-black uppercase tracking-widest text-white">Total</span>
              <div className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                {getCurrencySymbol(formData.currency)}{calculateTotal().toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 px-8 border-t border-white/[0.05] flex items-center justify-between bg-white/[0.01]">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Total due</span>
            <span className="text-lg font-black text-purple-400">
              {getCurrencySymbol(formData.currency)}{calculateTotal().toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 h-9 rounded-xl font-black text-[9px] uppercase tracking-widest text-white/70 hover:text-white hover:bg-white/5 border border-white/[0.05] transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-8 h-9 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 text-white font-black text-[9px] uppercase tracking-widest shadow-xl shadow-purple-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale"
            >
              {loading ? "Processing..." : "Create Invoice"}
            </button>
          </div>
        </div>
      </Card>
    </div>
  )
}
