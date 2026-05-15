
import { useState, useEffect } from "react"
import { Card } from "../ui/card"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { X, Mail, User, Shield, Lock, Check, Edit2 } from "lucide-react"

export default function EditMemberModal({ isOpen, onClose, member, onMemberUpdated }) {
  const [formData, setFormData] = useState({
    name: "",
    role: "Viewer",
    password: ""
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen && member) {
      setFormData({
        name: member.name || "",
        role: member.role || "Viewer",
        password: "" // Don't show password, only set if changing
      })
    }
  }, [isOpen, member])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const token = localStorage.getItem("token")
      const updateData = { ...formData }
      if (!updateData.password) delete updateData.password // Only send if changed

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/${member._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      })

      if (response.ok) {
        onMemberUpdated()
        onClose()
      } else {
        const result = await response.json()
        alert(result.error || "Failed to update member")
      }
    } catch (error) {
      console.error("Failed to update member:", error)
      alert("Network error: Failed to update member")
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen || !member) return null

  return (
    <div className="fixed inset-0 bg-[#050510]/80 z-50 flex items-center justify-center p-4 backdrop-blur-md">
      <Card className="w-full max-w-md bg-[#0B0B1E] border border-white/[0.08] shadow-2xl rounded-[2rem] overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="p-6 px-8 flex items-center justify-between border-b border-white/[0.05]">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Edit2 className="text-white" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight">Edit Team Member</h2>
              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Update member profile and permissions</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <div className="space-y-4">
            {/* Email Field (Disabled) */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Email Address (Read Only)</label>
              <div className="relative opacity-60">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <Input
                  disabled
                  value={member.email}
                  className="h-12 pl-11 bg-white/[0.01] border-white/[0.05] rounded-2xl text-sm font-bold text-gray-400 cursor-not-allowed border-dashed"
                />
              </div>
            </div>

            {/* Name Field */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Full Name <span className="text-red-500">*</span></label>
              <div className="relative group">
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                <Input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="h-12 pl-11 bg-white/[0.03] border-white/[0.05] rounded-2xl text-sm font-bold text-white placeholder:text-gray-600 focus-visible:ring-purple-500/20 transition-all"
                  placeholder="John Doe"
                />
              </div>
            </div>

            {/* Role Selection */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Access Role <span className="text-red-500">*</span></label>
              <div className="relative group">
                <Shield size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                <select
                  required
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full h-12 pl-11 pr-4 bg-white/[0.03] border border-white/[0.05] rounded-2xl text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all appearance-none cursor-pointer"
                >
                  <option value="Admin" className="bg-[#0B0B1E]">Admin - Full Access</option>
                  <option value="Accountant" className="bg-[#0B0B1E]">Accountant - Billing Only</option>
                  <option value="Viewer" className="bg-[#0B0B1E]">Viewer - Read Only</option>
                </select>
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">New Password (Optional)</label>
              <div className="relative group">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="h-12 pl-11 bg-white/[0.03] border-white/[0.05] rounded-2xl text-sm font-bold text-white placeholder:text-gray-600 focus-visible:ring-purple-500/20 transition-all"
                  placeholder="Leave blank to keep current"
                />
              </div>
              <p className="text-[9px] text-[#71717A] font-bold italic ml-1">
                Only fill this if you want to reset the user's password.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-12 rounded-2xl bg-white/5 text-white hover:bg-white/10 transition-all text-xs font-black uppercase tracking-widest border border-white/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-[2] h-12 rounded-2xl bg-gradient-to-r from-purple-500 to-blue-500 hover:opacity-90 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-purple-500/20 border-none transition-all active:scale-95 flex items-center justify-center gap-2 group"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white" />
              ) : (
                <>
                  <Check size={16} className="group-hover:scale-110 transition-transform" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </Card>
    </div>
  )
}
