
import { Card } from "../ui/card"
import { Button } from "../ui/button"
import { X, Mail, Phone, MapPin, FileText, Plus, User, Eye, Briefcase, Activity } from "lucide-react"
import { useNavigate } from "react-router-dom"

export default function ViewClientModal({ isOpen, onClose, client }) {
  const navigate = useNavigate()

  if (!isOpen || !client) return null

  return (
    <div className="fixed inset-0 bg-[#050510]/80 z-50 flex items-center justify-center p-4 backdrop-blur-md">
      <Card className="w-full max-w-md bg-[#0B0B1E] border border-white/[0.08] shadow-2xl rounded-[1.5rem] overflow-hidden flex flex-col scale-[0.8] origin-center animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="p-4 px-5 flex items-center justify-between border-b border-white/[0.05]">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Eye className="text-white" size={16} />
            </div>
            <div>
              <h2 className="text-base font-black text-white tracking-tight">Client Intelligence</h2>
              <p className="text-[8px] text-gray-400 font-medium uppercase tracking-wider">Business profile & activity</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/5 rounded-full transition-colors text-gray-400 hover:text-white">
            <X size={16} />
          </button>
        </div>

        <div className="p-5 space-y-5">
          <div className="grid grid-cols-1 gap-4">
            {/* Profile Info Section */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-3 p-3 bg-white/[0.02] border border-white/[0.03] rounded-xl group hover:border-white/[0.1] transition-all">
                  <div className="w-8 h-8 rounded-lg bg-[#7B5BE4]/10 flex items-center justify-center shrink-0 border border-[#7B5BE4]/10">
                    <Briefcase className="text-[#7B5BE4]" size={14} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[7px] font-black text-[#94A3B8] uppercase tracking-widest">Business</span>
                    <span className="text-[11px] font-black text-white truncate max-w-[100px]">{client.name}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-white/[0.02] border border-white/[0.03] rounded-xl group hover:border-white/[0.1] transition-all">
                  <div className="w-8 h-8 rounded-lg bg-[#00C4B4]/10 flex items-center justify-center shrink-0 border border-[#00C4B4]/10">
                    <Mail className="text-[#00C4B4]" size={14} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[7px] font-black text-[#94A3B8] uppercase tracking-widest">Email</span>
                    <span className="text-[10px] font-bold text-white truncate max-w-[100px]">{client.email}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-white/[0.02] border border-white/[0.03] rounded-xl group hover:border-white/[0.1] transition-all">
                  <div className="w-8 h-8 rounded-lg bg-[#F39C12]/10 flex items-center justify-center shrink-0 border border-[#F39C12]/10">
                    <Phone className="text-[#F39C12]" size={14} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[7px] font-black text-[#94A3B8] uppercase tracking-widest">Phone</span>
                    <span className="text-[10px] font-bold text-white">{client.phone || "N/A"}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-white/[0.02] border border-white/[0.03] rounded-xl group hover:border-white/[0.1] transition-all">
                  <div className="w-8 h-8 rounded-lg bg-[#EF4444]/10 flex items-center justify-center shrink-0 border border-[#EF4444]/10">
                    <MapPin className="text-[#EF4444]" size={14} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[7px] font-black text-[#94A3B8] uppercase tracking-widest">Office</span>
                    <span className="text-[10px] font-bold text-white truncate max-w-[100px]">{client.address || "Unknown"}</span>
                  </div>
                </div>
              </div>

              {/* Performance Stats Section */}
              <div className="p-4 bg-[#14142B] border border-white/[0.05] rounded-2xl relative overflow-hidden group transition-all hover:border-[#A855F7]/30 shadow-inner flex items-center justify-between">
                <div className="flex items-center gap-4 relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#A855F7] to-[#06B6D4] flex items-center justify-center text-white shadow-xl shadow-[#A855F7]/20">
                    <FileText size={20} strokeWidth={2.5} />
                  </div>
                  <div>
                    <p className="text-[8px] font-black text-[#94A3B8] uppercase tracking-widest">Lifetime Invoices</p>
                    <p className="text-3xl font-black text-white tracking-tighter">{client.totalInvoices || 0}</p>
                  </div>
                </div>
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#A855F7]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/[0.05] flex justify-end">
          <button 
            onClick={onClose} 
            className="px-6 h-9 rounded-lg bg-white/5 text-gray-400 hover:text-white transition-all text-[9px] font-black uppercase tracking-widest border border-white/5"
          >
            Close Profile
          </button>
        </div>
      </Card>
    </div>
  )
}
