import { useState, useEffect } from "react"
import { Card } from "../ui/card"
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "../ui/table"
import { Badge } from "../ui/badge"
import { Input } from "../ui/input"
import { Search, Activity } from "lucide-react"

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

  if (loading) return <div className="p-6 text-center">Loading...</div>

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Activity className="text-primary" /> System Logs
        </h2>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <Input 
            className="pl-10" 
            placeholder="Search logs..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card className="border-0 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>Level</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLogs.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="text-xs whitespace-nowrap">
                  {new Date(log.timestamp).toLocaleString()}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={
                    log.level === "ERROR" ? "border-red-200 text-red-600" :
                    log.level === "SUCCESS" ? "border-green-200 text-green-600" :
                    "border-blue-200 text-blue-600"
                  }>
                    {log.level}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium text-xs">{log.action}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{log.details}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
