import { useState, useEffect } from "react"
import { Card } from "../ui/card"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { X } from "lucide-react"

export default function ClientModal({ isOpen, onClose, onClientSaved, editingClient }) {
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
      }
    } catch (error) {
      console.error("Failed to save client:", error)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">{editingClient ? "Edit Client" : "Add Client"}</h2>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground">Name</label>
            <Input
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-2"
              placeholder="Client name"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground">Email</label>
            <Input
              required
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="mt-2"
              placeholder="client@example.com"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground">Phone</label>
            <Input
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="mt-2"
              placeholder="Phone number"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground">Address</label>
            <Input
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="mt-2"
              placeholder="Address"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {loading ? "Saving..." : "Save Client"}
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
