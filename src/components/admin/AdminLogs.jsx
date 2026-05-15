import { useState, useEffect } from "react"
import { Card } from "../ui/card"
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "../ui/table"
import { Badge } from "../ui/badge"
import { Input } from "../ui/input"
import { Search, Activity, Terminal, Clock } from "lucide-react"

export default function AdminLogs() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchLogs()
  }, [])

  const fetchLogs = async () => {
    try {
      // Mocking logs for now as backend might not have this endpoint yet
      const mockLogs = [
        { id: 1, action: "USER_LOGIN", details: "User john@example.com logged in", timestamp: new Date(), level: "INFO" },
        { id: 2, action: "ORG_CREATED", details: "Organization 'Tech Solutions' created", timestamp: new Date(Date.now() - 3600000), level: "INFO" },
        { id: 3, action: "PAYMENT_FAILED", details: "Transaction TX-123 failed for Org ID: 567", timestamp: new Date(Date.now() - 7200000), level: "ERROR" },
        { id: 4, action: "PLAN_UPGRADED", details: "Org 'Acme' upgraded to Pro Monthly", timestamp: new Date(Date.now() - 86400000), level: "SUCCESS" },
        { id: 5, action: "SECURITY_ALERT", details: "Multiple failed login attempts from IP 192.168.1.1", timestamp: new Date(Date.now() - 95400000), level: "WARN" },
      ]
      setLogs(mockLogs)
    } catch (error) {
      console.error("Failed to fetch logs", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredLogs = logs.filter(log => 
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.details.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  )

  return (
    <div className="p-6 space-y-8 pb-20 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-3">
            <Activity className="text-primary" size={22} /> System Logs
          </h2>
          <p className="text-xs text-[#71717A] font-bold uppercase tracking-wider ml-1">Real-time platform activity monitor</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#71717A]" size={16} />
          <Input 
            className="pl-10 bg-[#1A1635] border-white/[0.08] focus:border-primary/50 text-white rounded-xl h-11" 
            placeholder="Search action or details..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card className="bg-[#1A1635] border border-white/[0.03] rounded-2xl shadow-2xl overflow-hidden">
        <Table>
          <TableHeader className="bg-white/[0.02]">
            <TableRow className="border-white/[0.03] hover:bg-transparent">
              <TableHead className="text-[10px] font-black text-[#71717A] uppercase tracking-widest py-4">Timestamp</TableHead>
              <TableHead className="text-[10px] font-black text-[#71717A] uppercase tracking-widest py-4">Severity</TableHead>
              <TableHead className="text-[10px] font-black text-[#71717A] uppercase tracking-widest py-4">Action Event</TableHead>
              <TableHead className="text-[10px] font-black text-[#71717A] uppercase tracking-widest py-4">Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLogs.map((log) => (
              <TableRow key={log.id} className="border-white/[0.03] hover:bg-white/[0.01] transition-colors group">
                <TableCell className="py-4">
                  <div className="flex items-center gap-2 text-[#71717A] group-hover:text-white/60 transition-colors">
                    <Clock size={12} />
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      {new Date(log.timestamp).toLocaleString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        hour: '2-digit', 
                        minute: '2-digit',
                        second: '2-digit'
                      })}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  <Badge className={`text-[9px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-md border ${
                    log.level === "ERROR" ? "bg-rose-500/10 text-rose-500 border-rose-500/20" :
                    log.level === "SUCCESS" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                    log.level === "WARN" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                    "bg-blue-500/10 text-blue-500 border-blue-500/20"
                  }`}>
                    {log.level}
                  </Badge>
                </TableCell>
                <TableCell className="py-4">
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded bg-white/5 border border-white/5">
                      <Terminal size={10} className="text-[#71717A]" />
                    </div>
                    <span className="text-[10px] font-black text-white tracking-tight uppercase tracking-widest">{log.action}</span>
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  <span className="text-xs font-medium text-white/70 group-hover:text-white transition-colors">{log.details}</span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
      
      <div className="flex items-center justify-center pt-4">
        <p className="text-[10px] text-[#71717A] font-bold uppercase tracking-[0.2em]">End of logs stream</p>
      </div>
    </div>
  )
}
