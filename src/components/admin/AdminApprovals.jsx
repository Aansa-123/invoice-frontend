import { useState, useEffect } from "react"
import { Card } from "../ui/card"
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "../ui/table"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import { ShieldCheck, User, Building2, AlertCircle, XCircle, CheckCircle2 } from "lucide-react"

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
        fetchPendingOrgs()
      }
    } catch (error) {
      console.error("Failed to approve organization", error)
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
        fetchPendingOrgs()
      }
    } catch (error) {
      console.error("Failed to reject organization", error)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  )

  return (
    <div className="p-6 space-y-8 pb-20 animate-in fade-in duration-500">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-3">
          <ShieldCheck className="text-primary" size={22} /> Approval Requests
        </h2>
        <p className="text-xs text-[#71717A] font-bold uppercase tracking-wider ml-1">Review and authorize new organizations</p>
      </div>
      
      {pendingOrgs.length === 0 ? (
        <Card className="p-20 bg-[#1A1635] border border-dashed border-white/[0.08] rounded-3xl text-center">
          <div className="inline-flex p-5 rounded-3xl bg-white/[0.02] text-[#71717A] border border-white/[0.05] mb-6 backdrop-blur-md">
            <CheckCircle2 size={40} strokeWidth={1.5} />
          </div>
          <h3 className="text-lg font-black text-white tracking-tight">Queue is Clear</h3>
          <p className="text-[#71717A] font-medium tracking-tight mt-2 italic text-xs">
            All pending organization requests have been processed.
          </p>
        </Card>
      ) : (
        <Card className="bg-[#1A1635] border border-white/[0.03] rounded-2xl shadow-2xl overflow-hidden relative">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500/50 via-primary/50 to-emerald-500/50 opacity-20" />
          <Table>
            <TableHeader className="bg-white/[0.02]">
              <TableRow className="border-white/[0.03] hover:bg-transparent">
                <TableHead className="text-[10px] font-black text-[#71717A] uppercase tracking-widest py-4">Organization</TableHead>
                <TableHead className="text-[10px] font-black text-[#71717A] uppercase tracking-widest py-4">Owner Info</TableHead>
                <TableHead className="text-[10px] font-black text-[#71717A] uppercase tracking-widest py-4">Submission Date</TableHead>
                <TableHead className="text-[10px] font-black text-[#71717A] uppercase tracking-widest py-4 text-right px-6">Review Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingOrgs.map((org) => (
                <TableRow key={org._id} className="border-white/[0.03] hover:bg-white/[0.01] transition-colors">
                  <TableCell className="py-5">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 backdrop-blur-md shadow-lg shadow-amber-500/5">
                        <Building2 size={20} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-white tracking-tight">{org.name}</span>
                        <span className="text-[10px] text-[#71717A] font-bold tracking-tight">{org.email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-5">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[#71717A]">
                        <User size={16} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-white/90 tracking-tight">{org.owner?.name}</span>
                        <span className="text-[8px] text-[#71717A] font-bold tracking-tight">{org.owner?.email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-5">
                    <div className="flex items-center gap-2">
                      <AlertCircle size={12} className="text-amber-500/60" />
                      <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">
                        {new Date(org.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-5 text-right px-6">
                    <div className="flex items-center justify-end gap-3">
                      <Button 
                        size="sm" 
                        className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl px-5 h-9 border-0 shadow-lg shadow-emerald-500/20 transition-all font-bold uppercase tracking-widest text-[9px] gap-2"
                        onClick={() => handleApprove(org._id)}
                      >
                        <ShieldCheck size={14} strokeWidth={2.5} /> Authorize
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        className="text-[#71717A] hover:text-rose-500 hover:bg-rose-500/10 rounded-xl h-9 px-4 transition-all font-bold uppercase tracking-widest text-[9px] gap-2"
                        onClick={() => handleReject(org._id)}
                      >
                        <XCircle size={14} /> Reject
                      </Button>
                    </div>
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
