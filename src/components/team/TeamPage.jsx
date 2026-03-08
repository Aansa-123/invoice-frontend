
import { useState, useEffect } from "react"
import { Card } from "../ui/card"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { Plus, UserPlus, Trash2, Shield, User, UserX, UserCheck, Edit2 } from "lucide-react"
import InviteMemberModal from "./invite-member-modal"
import EditMemberModal from "./edit-member-modal"

export default function TeamPage() {
  const [team, setTeam] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedMember, setSelectedMember] = useState(null)

  useEffect(() => {
    fetchTeam()
  }, [])

  const fetchTeam = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/team`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const result = await response.json()
        setTeam(result.data)
      }
    } catch (error) {
      console.error("Failed to fetch team:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveMember = async (id) => {
    if (!window.confirm("Are you sure you want to remove this member?")) return

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        setTeam(team.filter(m => m._id !== id))
      } else {
        const errorData = await response.json()
        alert(errorData.error || "Failed to remove member")
      }
    } catch (error) {
      console.error("Failed to remove member:", error)
    }
  }

  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === "Active" ? "Disabled" : "Active"
    if (!window.confirm(`Are you sure you want to ${newStatus === "Active" ? "enable" : "disable"} this member?`)) return

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        setTeam(team.map(m => m._id === id ? { ...m, status: newStatus } : m))
      } else {
        const errorData = await response.json()
        alert(errorData.error || `Failed to ${newStatus.toLowerCase()} member`)
      }
    } catch (error) {
      console.error("Failed to toggle status:", error)
    }
  }

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "Owner": return "bg-purple-600 text-white"
      case "Admin": return "bg-blue-600 text-white"
      case "Accountant": return "bg-green-600 text-white"
      case "Viewer": return "bg-gray-500 text-white"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Team Members</h1>
          <p className="text-muted-foreground mt-1">Manage your team and their access roles</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="bg-primary hover:bg-primary/90 gap-2">
          <UserPlus size={18} />
          Invite Member
        </Button>
      </div>

      <Card className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : team.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">No team members found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border">
                <tr>
                  <th className="text-left py-3 text-muted-foreground font-semibold">Name</th>
                  <th className="text-left py-3 text-muted-foreground font-semibold">Email</th>
                  <th className="text-left py-3 text-muted-foreground font-semibold">Role</th>
                  <th className="text-left py-3 text-muted-foreground font-semibold">Status</th>
                  <th className="text-right py-3 text-muted-foreground font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {team.map((member) => (
                  <tr key={member._id} className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                          {member.role === 'Owner' ? <Shield size={16} /> : <User size={16} />}
                        </div>
                        <span className="font-medium text-foreground">{member.name}</span>
                      </div>
                    </td>
                    <td className="py-4 text-muted-foreground">{member.email}</td>
                    <td className="py-4">
                      <Badge className={getRoleBadgeColor(member.role)}>{member.role}</Badge>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${member.status === 'Active' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span className={`text-foreground ${member.status === 'Disabled' ? 'text-muted-foreground' : ''}`}>
                          {member.status}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedMember(member)
                            setEditModalOpen(true)
                          }}
                          className="p-2 hover:bg-primary/10 text-primary rounded-lg transition-colors"
                          title="Edit member"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(member._id, member.status)}
                          className={`p-2 rounded-lg transition-colors ${
                            member.status === 'Active' 
                              ? 'hover:bg-amber-100 text-amber-600' 
                              : 'hover:bg-green-100 text-green-600'
                          }`}
                          title={member.status === 'Active' ? 'Disable member' : 'Enable member'}
                        >
                          {member.status === 'Active' ? <UserX size={18} /> : <UserCheck size={18} />}
                        </button>
                        <button
                          onClick={() => handleRemoveMember(member._id)}
                          className="p-2 hover:bg-destructive/10 text-destructive rounded-lg transition-colors"
                          title="Remove member"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <InviteMemberModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onMemberAdded={fetchTeam}
      />

      <EditMemberModal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false)
          setSelectedMember(null)
        }}
        member={selectedMember}
        onMemberUpdated={fetchTeam}
      />
    </div>
  )
}
