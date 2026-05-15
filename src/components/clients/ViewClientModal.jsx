
import { Card } from "../ui/card"
import { Button } from "../ui/button"
import { X, Mail, Phone, MapPin, FileText, Plus, User, Eye, Briefcase, Activity } from "lucide-react"
import { useNavigate } from "react-router-dom"

export default function ViewClientModal({ isOpen, onClose, client }) {
  const navigate = useNavigate()

  if (!isOpen || !client) return null

  return (
    <div className="fixed inset-0 bg-[#050510]/80 z-50 flex items-center justify-center p-4 backdrop-blur-md">
      <Card className="w-full max-w-2xl bg-[#0B0B1E] border border-white/[0.08] shadow-2xl rounded-[2.5rem] overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="p-6 px-8 flex items-center justify-between border-b border-white/[0.05]">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Eye className="text-white" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight">Client Intelligence</h2>
              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Detailed business profile & activity</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="p-8 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Profile Info Section */}
            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-white/[0.02] border border-white/[0.03] rounded-2xl group hover:border-white/[0.1] transition-all">
                  <div className="w-10 h-10 rounded-xl bg-[#7B5BE4]/10 flex items-center justify-center shrink-0 border border-[#7B5BE4]/10">
                    <Briefcase className="text-[#7B5BE4]" size={18} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black text-[#94A3B8] uppercase tracking-widest">Business Name</span>
                    <span className="text-base font-black text-white">{client.name}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-white/[0.02] border border-white/[0.03] rounded-2xl group hover:border-white/[0.1] transition-all">
                  <div className="w-10 h-10 rounded-xl bg-[#00C4B4]/10 flex items-center justify-center shrink-0 border border-[#00C4B4]/10">
                    <Mail className="text-[#00C4B4]" size={18} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black text-[#94A3B8] uppercase tracking-widest">Contact Email</span>
                    <span className="text-sm font-bold text-white">{client.email}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-white/[0.02] border border-white/[0.03] rounded-2xl group hover:border-white/[0.1] transition-all">
                  <div className="w-10 h-10 rounded-xl bg-[#F39C12]/10 flex items-center justify-center shrink-0 border border-[#F39C12]/10">
                    <Phone className="text-[#F39C12]" size={18} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black text-[#94A3B8] uppercase tracking-widest">Phone Number</span>
                    <span className="text-sm font-bold text-white">{client.phone || "Not specified"}</span>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-white/[0.02] border border-white/[0.03] rounded-2xl group hover:border-white/[0.1] transition-all">
                  <div className="w-10 h-10 rounded-xl bg-[#EF4444]/10 flex items-center justify-center shrink-0 border border-[#EF4444]/10">
                    <MapPin className="text-[#EF4444]" size={18} />
                  </div>
                  <div className="flex flex-col flex-1">
                    <span className="text-[8px] font-black text-[#94A3B8] uppercase tracking-widest">Registered Office</span>
                    <span className="text-sm font-bold text-white leading-relaxed">{client.address || "Location unknown"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Stats Section */}
            <div className="lg:col-span-5 space-y-4">
              <div className="p-6 bg-[#14142B] border border-white/[0.05] rounded-3xl relative overflow-hidden group transition-all hover:border-[#A855F7]/30 shadow-inner flex flex-col items-center justify-center text-center space-y-4 min-h-[220px]">
                <div className="relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#A855F7] to-[#06B6D4] flex items-center justify-center text-white shadow-2xl shadow-[#A855F7]/40 mb-4 mx-auto rotate-3 group-hover:rotate-0 transition-transform duration-500">
                    <FileText size={32} strokeWidth={2.5} />
                  </div>
                  <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest">Lifetime Invoices</p>
                  <p className="text-6xl font-black text-white tracking-tighter mt-1">{client.totalInvoices || 0}</p>
                </div>
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#A855F7]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>

              <button 
                onClick={() => navigate("/invoices", { state: { clientName: client.name } })}
                className="w-full h-14 rounded-2xl bg-gradient-to-r from-purple-500 to-blue-500 hover:opacity-90 text-white font-black text-sm uppercase tracking-widest shadow-xl shadow-purple-500/20 border-none transition-all active:scale-95 flex items-center justify-center gap-3 group"
              >
                <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                Draft Invoice
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/[0.05] flex justify-end">
          <button 
            onClick={onClose} 
            className="px-8 h-11 rounded-xl bg-white/5 text-gray-400 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest border border-white/5"
          >
            Close Profile
          </button>
        </div>
      </Card>
    </div>
  )
}
