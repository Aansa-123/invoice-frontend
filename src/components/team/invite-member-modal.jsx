
import { useState } from "react"
import { Card } from "../ui/card"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { X, Mail, User, Shield, Lock, Check, UserPlus, RefreshCcw } from "lucide-react"

export default function InviteMemberModal({ isOpen, onClose, onMemberAdded }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "Viewer",
    password: Math.random().toString(36).slice(-8) // Generate a random initial password
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/invite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        onMemberAdded()
        onClose()
        setFormData({
          name: "",
          email: "",
          role: "Viewer",
          password: Math.random().toString(36).slice(-8)
        })
      } else {
        const result = await response.json()
        alert(result.error || "Failed to invite member")
      }
    } catch (error) {
      console.error("Failed to invite member:", error)
      alert("Network error: Failed to invite member")
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-[#050510]/80 z-50 flex items-center justify-center p-4 backdrop-blur-md">
      <Card className="w-full max-w-md bg-[#0B0B1E] border border-white/[0.08] shadow-2xl rounded-[2rem] overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="p-6 px-8 flex items-center justify-between border-b border-white/[0.05]">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#A855F7] to-[#06B6D4] flex items-center justify-center shadow-lg shadow-[#A855F7]/20">
              <UserPlus className="text-white" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight">Invite Team Member</h2>
              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Collaborate with your colleagues</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <div className="space-y-4">
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

            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Email Address <span className="text-red-500">*</span></label>
              <div className="relative group">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                <Input
                  required
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="h-12 pl-11 bg-white/[0.03] border-white/[0.05] rounded-2xl text-sm font-bold text-white placeholder:text-gray-600 focus-visible:ring-purple-500/20 transition-all"
                  placeholder="john@example.com"
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
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Initial Password <span className="text-red-500">*</span></label>
              <div className="flex gap-2">
                <div className="relative group flex-1">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                  <Input
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="h-11 pl-11 bg-white/[0.03] border-white/[0.05] rounded-2xl text-xs font-bold text-white placeholder:text-gray-600 focus-visible:ring-purple-500/20 transition-all"
                    placeholder="Password"
                  />
                </div>
                <button 
                  type="button" 
                  onClick={() => setFormData({...formData, password: Math.random().toString(36).slice(-8)})}
                  className="h-11 px-4 rounded-2xl bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all border border-white/5"
                  title="Generate new password"
                >
                  <RefreshCcw size={14} />
                </button>
              </div>
              <p className="text-[9px] text-[#71717A] font-bold italic ml-1">
                Provide this temporary password to your team member.
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
              className="flex-[2] h-12 rounded-2xl bg-gradient-to-r from-[#A855F7] to-[#06B6D4] hover:opacity-90 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-[#A855F7]/20 border-none transition-all active:scale-95 flex items-center justify-center gap-2 group"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white" />
              ) : (
                <>
                  <Check size={16} className="group-hover:scale-110 transition-transform" />
                  Send Invite
                </>
              )}
            </button>
          </div>
        </form>
      </Card>
    </div>
  )
}
