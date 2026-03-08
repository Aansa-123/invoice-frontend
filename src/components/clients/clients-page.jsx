import { useState, useEffect } from "react"
import { Card } from "../ui/card"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Plus, Search, Edit, Trash2, Eye, FileText } from "lucide-react"
import ClientModal from "./client-modal"
import ViewClientModal from "./ViewClientModal"
import { useNavigate } from "react-router-dom"

export default function ClientsPage({ userRole }) {
  const navigate = useNavigate()
  const [clients, setClients] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState(null)
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
        {userRole !== "Viewer" && (
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
        )}
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

      {/* Clients Table */}
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
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border text-muted-foreground font-semibold">
                <tr>
                  <th className="text-left py-3 px-4">Name</th>
                  <th className="text-left py-3 px-4">Email</th>
                  <th className="text-left py-3 px-4">Phone</th>
                  <th className="text-left py-3 px-4">Total Invoices</th>
                  <th className="text-right py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.map((client) => (
                  <tr key={client._id} className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-4 text-foreground font-medium">{client.name}</td>
                    <td className="py-3 px-4 text-muted-foreground">{client.email}</td>
                    <td className="py-3 px-4 text-muted-foreground">{client.phone}</td>
                    <td className="py-3 px-4 text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <FileText size={14} />
                        {client.totalInvoices || 0}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-2">
                        {userRole !== "Viewer" && (
                          <button
                            title="Create Invoice"
                            onClick={() => navigate("/invoices", { state: { clientName: client.name } })}
                            className="p-1.5 hover:bg-primary/10 text-primary rounded-md"
                          >
                            <Plus size={18} />
                          </button>
                        )}
                        <button
                          title="View Details"
                          onClick={() => {
                            setSelectedClient(client)
                            setIsViewModalOpen(true)
                          }}
                          className="p-1.5 hover:bg-muted text-foreground rounded-md"
                        >
                          <Eye size={18} />
                        </button>
                        {userRole !== "Viewer" && (
                          <button
                            title="Edit Client"
                            onClick={() => {
                              setEditingClient(client)
                              setIsModalOpen(true)
                            }}
                            className="p-1.5 hover:bg-muted text-foreground rounded-md"
                          >
                            <Edit size={18} />
                          </button>
                        )}
                        {(userRole === "Owner" || userRole === "Admin") && (
                          <button
                            title="Delete Client"
                            onClick={() => handleDelete(client._id)}
                            className="p-1.5 hover:bg-destructive/10 text-destructive rounded-md"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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

      <ViewClientModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        client={selectedClient}
      />
    </div>
  )
}
