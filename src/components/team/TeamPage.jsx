
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Card } from "../ui/card"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { Plus, UserPlus, Trash2, Shield, User, UserX, UserCheck, Edit2, Lock } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog"
import InviteMemberModal from "./invite-member-modal"
import EditMemberModal from "./edit-member-modal"

export default function TeamPage({ userPlan = "Free" }) {
  const navigate = useNavigate()
  const [team, setTeam] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedMember, setSelectedMember] = useState(null)
  const [showUpgradeModal, setShowUpgradeModal] = useState(userPlan === "Free")

  useEffect(() => {
    if (userPlan !== "Free") {
      fetchTeam()
    } else {
      setLoading(false)
      setShowUpgradeModal(true)
    }
  }, [userPlan])

  const fetchTeam = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/team`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const result = await response.json()
        setTeam(result.data)
      } else {
        const result = await response.json()
        if (result.upgradeRequired) {
          setShowUpgradeModal(true)
        }
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
    <div className="space-y-4 p-4 lg:p-6 bg-transparent min-h-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-0.5">
          <h1 className="text-lg font-black text-white tracking-tight">Team Members</h1>
          <p className="text-[9px] text-[#94A3B8] font-medium uppercase tracking-wider">Manage your team and their access roles</p>
        </div>
        {(userPlan !== "Free") && (
          <Button 
            onClick={() => setIsModalOpen(true)} 
            className="h-9 px-5 rounded-full bg-gradient-to-r from-[#A855F7] to-[#06B6D4] hover:opacity-90 text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-[#A855F7]/20 border-none transition-all active:scale-95 flex items-center gap-2"
          >
            <UserPlus size={14} />
            Invite Member
          </Button>
        )}
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
            <table className="w-full text-xs">
              <thead className="border-b border-border">
                <tr>
                  <th className="text-left py-3 text-muted-foreground font-semibold text-[9px] uppercase tracking-widest">Name</th>
                  <th className="text-left py-3 text-muted-foreground font-semibold text-[9px] uppercase tracking-widest">Email</th>
                  <th className="text-left py-3 text-muted-foreground font-semibold text-[9px] uppercase tracking-widest">Role</th>
                  <th className="text-left py-3 text-muted-foreground font-semibold text-[9px] uppercase tracking-widest">Status</th>
                  <th className="text-right py-3 text-muted-foreground font-semibold text-[9px] uppercase tracking-widest">Actions</th>
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

      <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mb-4 mx-auto">
              <Lock className="text-amber-600 dark:text-amber-400" size={24} />
            </div>
            <DialogTitle className="text-center text-xl font-bold">Upgrade Required</DialogTitle>
          </DialogHeader>
          <div className="text-center py-4 space-y-3">
            <p className="text-muted-foreground">
              Team management is not available in the Free Plan.
            </p>
            <p className="text-sm font-medium">
              Upgrade your plan to invite team members and collaborate.
            </p>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button 
              variant="outline" 
              onClick={() => {
                setShowUpgradeModal(false)
                navigate("/dashboard")
              }}
              className="w-full"
            >
              Cancel
            </Button>
            <Button 
              onClick={() => navigate("/subscription")}
              className="w-full bg-primary hover:bg-primary/90 font-bold"
            >
              Upgrade Plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
