import { useState, useEffect } from "react"
import { Card } from "../ui/card"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { X, Plus, Trash2 } from "lucide-react"

export default function EditInvoiceModal({ isOpen, onClose, invoice, onInvoiceUpdated }) {
  const [formData, setFormData] = useState({
    items: [],
    tax: 0,
    discount: 0,
    dueDate: "",
    notes: "",
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen && invoice) {
      setFormData({
        items: invoice.items || [],
        tax: invoice.tax || 0,
        discount: invoice.discount || 0,
        dueDate: invoice.dueDate?.split("T")[0] || "",
        notes: invoice.notes || "",
      })
    }
  }, [isOpen, invoice])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/invoices/${invoice._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        onInvoiceUpdated()
        onClose()
      }
    } catch (error) {
      console.error("Failed to update invoice:", error)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen || !invoice) return null

  const calculateTotal = () => {
    const subtotal = formData.items.reduce((sum, item) => sum + item.quantity * item.price, 0)
    return subtotal + formData.tax - formData.discount
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-screen overflow-y-auto">
        <div className="sticky top-0 bg-card p-6 border-b border-border flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">Edit Invoice</h2>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm text-foreground">
              <strong>Invoice Number:</strong> {invoice.invoiceNumber}
            </p>
            <p className="text-sm text-muted-foreground">
              <strong>Client:</strong> {invoice.clientId?.name}
            </p>
          </div>

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
                    value={item.quantity}
                    onChange={(e) => {
                      const newItems = [...formData.items]
                      newItems[idx].quantity = Number.parseInt(e.target.value) || 0
                      setFormData({ ...formData, items: newItems })
                    }}
                    className="w-20 p-2 border border-border rounded-lg bg-background text-foreground"
                  />
                  <input
                    type="number"
                    placeholder="Price"
                    value={item.price}
                    onChange={(e) => {
                      const newItems = [...formData.items]
                      newItems[idx].price = Number.parseFloat(e.target.value) || 0
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground">Tax ($)</label>
              <Input
                type="number"
                value={formData.tax}
                onChange={(e) => setFormData({ ...formData, tax: Number.parseFloat(e.target.value) || 0 })}
                className="mt-2"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Discount ($)</label>
              <Input
                type="number"
                value={formData.discount}
                onChange={(e) => setFormData({ ...formData, discount: Number.parseFloat(e.target.value) || 0 })}
                className="mt-2"
              />
            </div>
          </div>

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

          <Card className="bg-muted p-4">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold text-foreground">Total:</span>
              <span className="text-2xl font-bold text-primary">${calculateTotal().toFixed(2)}</span>
            </div>
          </Card>

          <div className="flex gap-3">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {loading ? "Updating..." : "Update Invoice"}
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
