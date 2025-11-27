import { useState, useEffect } from "react"
import { Card } from "../ui/card"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Plus, Search, Edit, Trash2 } from "lucide-react"
import ClientModal from "./client-modal"

export default function ClientsPage() {
  const [clients, setClients] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingClient, setEditingClient] = useState(null)
  const [loading, setLoading] = useState(true)

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

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Clients</h1>
          <p className="text-muted-foreground mt-1">Manage your client information</p>
        </div>
        <Button
          onClick={() => {
            setEditingClient(null)
            setIsModalOpen(true)
          }}
          className="bg-primary hover:bg-primary/90 gap-2"
        >
          <Plus size={18} />
          Add Client
        </Button>
      </div>

      {/* Search */}
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            placeholder="Search clients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      {/* Clients List */}
      <Card className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No clients found</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredClients.map((client) => (
              <div key={client._id} className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{client.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{client.email}</p>
                    <p className="text-sm text-muted-foreground">{client.phone}</p>
                    <p className="text-sm text-muted-foreground mt-2">{client.address}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingClient(client)
                        setIsModalOpen(true)
                      }}
                      className="p-2 hover:bg-primary/10 text-primary rounded-lg"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(client._id)}
                      className="p-2 hover:bg-destructive/10 text-destructive rounded-lg"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <ClientModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingClient(null)
        }}
        onClientSaved={fetchClients}
        editingClient={editingClient}
      />
    </div>
  )
}
