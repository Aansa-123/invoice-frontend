import { useState } from "react"
import { Card } from "../ui/card"
import { Button } from "../ui/button"
import { X } from "lucide-react"

export default function StatusModal({ isOpen, onClose, invoice, onStatusUpdated }) {
  const [selectedStatus, setSelectedStatus] = useState(invoice?.status || "Pending")
  const [loading, setLoading] = useState(false)

  const statuses = ["Paid", "Pending", "Overdue"]

  const handleUpdateStatus = async () => {
    setLoading(true)

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/invoices/${invoice._id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: selectedStatus }),
      })

      if (response.ok) {
        onStatusUpdated()
        onClose()
      }
    } catch (error) {
      console.error("Failed to update status:", error)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen || !invoice) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">Update Invoice Status</h2>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-2">Invoice: {invoice.invoiceNumber}</p>
            <p className="text-sm text-foreground font-medium mb-4">Current Status: {invoice.status}</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground block">Select New Status</label>
            <div className="space-y-2">
              {statuses.map((status) => (
                <label key={status} className="flex items-center p-3 border border-border rounded-lg cursor-pointer hover:bg-muted">
                  <input
                    type="radio"
                    name="status"
                    value={status}
                    checked={selectedStatus === status}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="mr-3"
                  />
                  <span className="text-foreground">{status}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleUpdateStatus}
              disabled={loading || selectedStatus === invoice.status}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {loading ? "Updating..." : "Update Status"}
            </Button>
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              Cancel
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
