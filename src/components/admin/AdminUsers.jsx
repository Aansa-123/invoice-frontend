import { useState, useEffect } from "react"
import { Card } from "../ui/card"
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "../ui/table"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import { UserX, Shield, Users } from "lucide-react"

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      })
      const data = await res.json()
      if (data.success) {
        setUsers(data.data)
      }
    } catch (error) {
      console.error("Failed to fetch users", error)
    } finally {
      setLoading(false)
    }
  }

  const toggleUserStatus = async (id, currentStatus) => {
    alert("User status update logic is currently using mock response. Backend field 'status' needed for full implementation.")
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  )

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-3">
          <Users className="text-primary" size={28} /> User Management
        </h2>
        <p className="text-xs text-[#71717A] font-bold uppercase tracking-wider ml-1">Manage platform users and access levels</p>
      </div>

      <Card className="bg-[#1A1635] border border-white/[0.03] rounded-2xl shadow-2xl overflow-hidden">
        <Table>
          <TableHeader className="bg-white/[0.02]">
            <TableRow className="border-white/[0.03] hover:bg-transparent">
              <TableHead className="text-[10px] font-black text-[#71717A] uppercase tracking-widest py-4">User</TableHead>
              <TableHead className="text-[10px] font-black text-[#71717A] uppercase tracking-widest py-4">Global Role</TableHead>
              <TableHead className="text-[10px] font-black text-[#71717A] uppercase tracking-widest py-4">Current Organization</TableHead>
              <TableHead className="text-[10px] font-black text-[#71717A] uppercase tracking-widest py-4">Joined At</TableHead>
              <TableHead className="text-[10px] font-black text-[#71717A] uppercase tracking-widest py-4 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user._id} className="border-white/[0.03] hover:bg-white/[0.01] transition-colors">
                <TableCell className="py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black text-sm backdrop-blur-md shadow-inner">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-white tracking-tight">{user.name}</span>
                      <span className="text-[10px] text-[#71717A] font-bold tracking-tight">{user.email}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  <Badge className={`gap-1 text-[9px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-md border ${
                    user.role === "Admin" 
                      ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" 
                      : "bg-white/5 text-white/70 border-white/10"
                  }`}>
                    {user.role === "Admin" && <Shield size={10} strokeWidth={3} />}
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell className="py-4">
                  <span className={`text-[10px] font-bold tracking-tight ${user.currentOrganization?.name ? "text-white/80" : "text-[#71717A] italic"}`}>
                    {user.currentOrganization?.name || "None"}
                  </span>
                </TableCell>
                <TableCell className="py-4">
                  <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">
                    {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </TableCell>
                <TableCell className="py-4 text-right">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-[#71717A] hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                    onClick={() => toggleUserStatus(user._id, "active")}
                  >
                    <UserX size={18} />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
