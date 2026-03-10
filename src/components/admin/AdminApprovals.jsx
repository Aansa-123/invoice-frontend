import { useState, useEffect } from "react"
import { Card } from "../ui/card"
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "../ui/table"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import { ShieldAlert } from "lucide-react"

export default function AdminApprovals() {
  const [pendingOrgs, setPendingOrgs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPendingOrgs()
  }, [])

  const fetchPendingOrgs = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/organizations/pending`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      })
      const data = await res.json()
      if (data.success) {
        setPendingOrgs(data.data)
      }
    } catch (error) {
      console.error("Failed to fetch pending organizations", error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/organizations/${id}/approve`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      })
      if (res.ok) {
        alert("Organization approved")
        fetchPendingOrgs()
      }
    } catch (error) {
      console.error("Failed to approve organization", error)
      alert("Failed to approve organization")
    }
  }

  const handleReject = async (id) => {
    if (!confirm("Are you sure you want to reject this organization?")) return
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/organizations/${id}/reject`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      })
      if (res.ok) {
        alert("Organization rejected")
        fetchPendingOrgs()
      }
    } catch (error) {
      console.error("Failed to reject organization", error)
      alert("Failed to reject organization")
    }
  }

  if (loading) return <div className="p-6 text-center">Loading...</div>

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Organization Approval Requests</h2>
      
      {pendingOrgs.length === 0 ? (
        <Card className="p-12 text-center text-muted-foreground">
          No pending approval requests found.
        </Card>
      ) : (
        <Card className="border-orange-200 shadow-md overflow-hidden bg-orange-50/30">
          <Table>
            <TableHeader className="bg-orange-100/50">
              <TableRow>
                <TableHead>Organization</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingOrgs.map((org) => (
                <TableRow key={org._id} className="border-orange-100">
                  <TableCell className="font-medium">
                    {org.name}
                    <div className="text-xs text-muted-foreground font-normal">{org.email}</div>
                  </TableCell>
                  <TableCell>
                    {org.owner?.name}
                    <div className="text-xs text-muted-foreground font-normal">{org.owner?.email}</div>
                  </TableCell>
                  <TableCell>{new Date(org.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button 
                      size="sm" 
                      variant="default" 
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => handleApprove(org._id)}
                    >
                      Approve
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => handleReject(org._id)}
                    >
                      Reject
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  )
}
