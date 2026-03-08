
import { useState, useEffect } from "react"
import { Card } from "../ui/card"
import { Badge } from "../ui/badge"
import { Clock, User, Box, ArrowRight } from "lucide-react"

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

  const getModuleColor = (module) => {
    switch (module) {
      case "Invoices": return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
      case "Clients": return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
      case "Payments": return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
      case "Team": return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
      default: return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Activity History</h1>
        <p className="text-muted-foreground mt-1">Track all actions performed across your organization</p>
      </div>

      <Card className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">No activities recorded yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border">
                <tr>
                  <th className="text-left py-3 text-muted-foreground font-semibold">User</th>
                  <th className="text-left py-3 text-muted-foreground font-semibold">Action</th>
                  <th className="text-left py-3 text-muted-foreground font-semibold">Module</th>
                  <th className="text-right py-3 text-muted-foreground font-semibold">Date</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log._id} className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center">
                          <User size={14} className="text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{log.userId?.name || "System"}</p>
                          <p className="text-xs text-muted-foreground">{log.userId?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="flex flex-col">
                        <span className="text-foreground font-medium">{log.action}</span>
                        {log.details && <span className="text-xs text-muted-foreground">{log.details}</span>}
                      </div>
                    </td>
                    <td className="py-4">
                      <Badge className={`${getModuleColor(log.module)} border-none`}>
                        {log.module}
                      </Badge>
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex flex-col items-end">
                        <div className="flex items-center gap-1 text-foreground">
                          <Clock size={12} className="text-muted-foreground" />
                          <span>{new Date(log.createdAt).toLocaleDateString()}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
