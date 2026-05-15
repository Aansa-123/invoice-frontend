import { useState, useEffect } from "react"
import { Card } from "../ui/card"
import { Clock, User, FileText, UserPlus, Trash2, CreditCard, Box } from "lucide-react"

export default function HistoryPage() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLogs()
  }, [])

  const fetchLogs = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/history`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const result = await response.json()
        setLogs(result.data)
      }
    } catch (error) {
      console.error("Failed to fetch logs:", error)
    } finally {
      setLoading(false)
    }
  }

  const getLogIcon = (action, module) => {
    const actionLower = action.toLowerCase()
    if (actionLower.includes("create") || actionLower.includes("added")) {
      if (module === "Clients") return <UserPlus size={14} />
      return <FileText size={14} />
    }
    if (actionLower.includes("payment") || actionLower.includes("receive")) return <CreditCard size={14} />
    if (actionLower.includes("delete") || actionLower.includes("remove")) return <Trash2 size={14} />
    return <Box size={14} />
  }

  const getLogColor = (action, module) => {
    const actionLower = action.toLowerCase()
    if (actionLower.includes("delete") || actionLower.includes("remove")) return "bg-rose-500 shadow-rose-500/20"
    if (actionLower.includes("payment") || actionLower.includes("receive")) return "bg-emerald-500 shadow-emerald-500/20"
    if (module === "Clients") return "bg-cyan-500 shadow-cyan-500/20"
    return "bg-[#A855F7] shadow-[#A855F7]/20"
  }

  const formatTimeAgo = (date) => {
    const now = new Date()
    const diff = now - new Date(date)
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return days === 1 ? "Yesterday" : `${days} days ago`
    if (hours > 0) return `${hours}h ago`
    if (minutes > 0) return `${minutes}m ago`
    return "Just now"
  }

  return (
    <div className="space-y-4 p-4 lg:p-6 bg-transparent min-h-full">
      {/* Header */}
      <div className="space-y-0.5">
        <h1 className="text-lg font-black text-white tracking-tight">Activity History</h1>
        <p className="text-[9px] text-[#94A3B8] font-medium uppercase tracking-wider">Recent actions across your workspace</p>
      </div>

      <Card className="bg-[#14142B] border border-white/[0.03] rounded-[2rem] p-6 lg:p-10 shadow-xl overflow-hidden relative">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-7 w-7 border-t-2 border-b-2 border-[#A855F7]"></div>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-20 text-[#94A3B8] font-bold text-xs">No activities recorded yet</div>
        ) : (
          <div className="relative space-y-6">
            {/* Timeline Line */}
            <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-white/[0.05]" />

            {logs.map((log, index) => (
              <div key={log._id} className="relative flex items-start gap-5 group">
                {/* Timeline Dot & Icon */}
                <div className="relative z-10">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white border-4 border-[#14142B] transition-transform group-hover:scale-110 duration-300 ${getLogColor(log.action, log.module)} shadow-lg`}>
                    {getLogIcon(log.action, log.module)}
                  </div>
                  {/* Small colored indicator dot on the line */}
                  <div className={`absolute -left-[18px] top-1/2 -translate-y-1/2 w-2 h-2 rounded-full border-2 border-[#14142B] ${getLogColor(log.action, log.module).split(' ')[0]}`} />
                </div>

                <div className="flex flex-col pt-1">
                  <h3 className="text-xs font-bold text-white group-hover:text-[#A855F7] transition-colors duration-300">
                    {log.action}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center gap-1 text-[9px] text-[#94A3B8] font-medium">
                      <Clock size={10} />
                      <span>{formatTimeAgo(log.createdAt)}</span>
                    </div>
                    <span className="text-[#94A3B8] text-[9px]">•</span>
                    <div className="flex items-center gap-1 text-[9px] text-[#94A3B8] font-medium">
                      <span className="lowercase">by</span>
                      <span className="font-bold text-white/60">{log.userId?.name || "System"}</span>
                    </div>
                  </div>
                  {log.details && (
                    <p className="text-[9px] text-[#94A3B8]/60 mt-1.5 italic max-w-md">
                      {log.details}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
