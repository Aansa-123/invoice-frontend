import { useState, useEffect } from "react"
import { Card } from "../ui/card"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { X, Plus, Trash2 } from "lucide-react"

export default function InvoiceModal({ isOpen, onClose, onInvoiceCreated }) {
  const [formData, setFormData] = useState({
    clientId: "",
    items: [{ name: "", quantity: 1, price: 0 }],
    tax: 0,
    discount: 0,
    dueDate: "",
    notes: "",
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
    }
  }, [isOpen])

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
      setClientsLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Frontend validation
    if (!formData.clientId || formData.clientId.trim() === "") {
      alert("Please select a client")
      return
    }

    if (!formData.dueDate || formData.dueDate.trim() === "") {
      alert("Please select a due date")
      return
    }

    const validItems = getValidItems()
    if (validItems.length === 0) {
      alert("Please add at least one item with a name, quantity, and price")
      return
    }

    // Validate items
    for (let i = 0; i < validItems.length; i++) {
      const item = validItems[i]
      if (!item.name || item.name.trim() === "") {
        alert(`Please enter a name for item ${i + 1}`)
        return
      }
      if (!item.quantity || item.quantity <= 0) {
        alert(`Please enter a valid quantity for item ${i + 1}`)
        return
      }
      if (item.price < 0) {
        alert(`Please enter a valid price for item ${i + 1}`)
        return
      }
    }

    setLoading(true)

    try {
      const token = localStorage.getItem("token")
      const submitData = {
        ...formData,
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
          tax: 0,
          discount: 0,
          dueDate: "",
          notes: "",
        })
      } else {
        // Show error message to user
        alert(`Error: ${data.error || 'Failed to create invoice'}`)
        console.error("Invoice creation failed:", data.error)
      }
    } catch (error) {
      console.error("Failed to create invoice:", error)
      alert("Network error: Failed to create invoice")
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  const calculateTotal = () => {
    const subtotal = formData.items.reduce((sum, item) => sum + item.quantity * item.price, 0)
    return subtotal + formData.tax - formData.discount
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-screen overflow-y-auto">
        <div className="sticky top-0 bg-card p-6 border-b border-border flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">Create Invoice</h2>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Client Selection */}
          <div>
            <label className="text-sm font-medium text-foreground">Client</label>
            {clientsLoading ? (
              <div className="mt-2 p-2 text-muted-foreground">Loading clients...</div>
            ) : (
              <select
                required
                value={formData.clientId}
                onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                className="w-full mt-2 p-2 border border-border rounded-lg bg-background text-foreground"
              >
                <option value="">Select a client</option>
                {clients.map((client) => (
                  <option key={client._id} value={client._id}>
                    {client.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Items */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-foreground">Items</label>
              <button
                type="button"
                onClick={() =>
                  setFormData({
                    ...formData,
                    items: [...formData.items, { name: "", quantity: 1, price: 0 }],
                  })
                }
                className="text-primary hover:underline flex items-center gap-1 text-sm"
              >
                <Plus size={16} />
                Add Item
              </button>
            </div>

            <div className="mb-2 flex gap-3 text-xs font-semibold text-muted-foreground">
              <div className="flex-1">Item name</div>
              <div className="w-20">Qty</div>
              <div className="w-28">Price</div>
              <div className="w-10"></div>
            </div>

            <div className="space-y-3">
              {formData.items.map((item, idx) => (
                <div key={idx} className="flex gap-3">
                  <input
                    type="text"
                    placeholder="Item name"
                    value={item.name}
                    onChange={(e) => {
                      const newItems = [...formData.items]
                      newItems[idx].name = e.target.value
                      setFormData({ ...formData, items: newItems })
                    }}
                    className="flex-1 p-2 border border-border rounded-lg bg-background text-foreground"
                  />
                  <input
                    type="number"
                    placeholder="Qty"
                    value={item.quantity === 0 ? "" : item.quantity}
                    onChange={(e) => {
                      const newItems = [...formData.items]
                      newItems[idx].quantity = e.target.value === "" ? 0 : Number.parseInt(e.target.value)
                      setFormData({ ...formData, items: newItems })
                    }}
                    className="w-20 p-2 border border-border rounded-lg bg-background text-foreground"
                  />
                  <input
                    type="number"
                    placeholder="Price"
                    value={item.price === 0 ? "" : item.price}
                    onChange={(e) => {
                      const newItems = [...formData.items]
                      newItems[idx].price = e.target.value === "" ? 0 : Number.parseFloat(e.target.value)
                      setFormData({ ...formData, items: newItems })
                    }}
                    className="w-28 p-2 border border-border rounded-lg bg-background text-foreground"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const newItems = formData.items.filter((_, i) => i !== idx)
                      setFormData({ ...formData, items: newItems })
                    }}
                    className="p-2 hover:bg-destructive/10 text-destructive rounded-lg"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Tax & Discount */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground">Tax (%)</label>
              <Input
                type="number"
                value={formData.tax === 0 ? "" : formData.tax}
                onChange={(e) => setFormData({ ...formData, tax: e.target.value === "" ? 0 : Number.parseFloat(e.target.value) })}
                placeholder="0"
                className="mt-2"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Discount ($)</label>
              <Input
                type="number"
                value={formData.discount === 0 ? "" : formData.discount}
                onChange={(e) => setFormData({ ...formData, discount: e.target.value === "" ? 0 : Number.parseFloat(e.target.value) })}
                placeholder="0"
                className="mt-2"
              />
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label className="text-sm font-medium text-foreground">Due Date</label>
            <Input
              type="date"
              required
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className="mt-2"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="text-sm font-medium text-foreground">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes..."
              rows={3}
              className="w-full mt-2 p-2 border border-border rounded-lg bg-background text-foreground"
            />
          </div>

          {/* Total */}
          <Card className="bg-muted p-4">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold text-foreground">Total:</span>
              <span className="text-2xl font-bold text-primary">${calculateTotal().toFixed(2)}</span>
            </div>
          </Card>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {loading ? "Creating..." : "Create Invoice"}
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
