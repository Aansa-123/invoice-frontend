
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Card } from "../ui/card"
import { Button } from "../ui/button"
import { FileText, DollarSign, Clock, CheckCircle } from "lucide-react"
import Overview from "./overview"
import RecentInvoices from "./recent-invoices"

export default function DashboardContent() {
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    totalInvoices: 0,
    paidInvoices: 0,
    pendingInvoices: 0,
    overdueInvoices: 0,
    totalRevenue: 0,
    dailyRevenue: [],
    dailyInvoices: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token")
      
      // Fetch invoices
      const invResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/invoices`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      // Fetch team to get names for "per person" stats if needed
      const teamResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/users/team`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (invResponse.ok) {
        const invData = await invResponse.json()
        const invoices = invData.data
        
        let team = []
        if (teamResponse.ok) {
          const teamData = await teamResponse.json()
          team = teamData.data
        }

        const paid = invoices.filter((i) => i.status === "Paid").length
        const pending = invoices.filter((i) => i.status === "Pending").length
        const overdue = invoices.filter((i) => i.status === "Overdue").length
        const revenue = invoices.filter((i) => i.status === "Paid").reduce((sum, i) => sum + (i.total || 0), 0)

        // Calculate last 10 days stats
        const dailyRevenue = []
        
        const now = new Date()
        for (let i = 9; i >= 0; i--) {
          const date = new Date(now)
          date.setDate(date.getDate() - i)
          const dateStr = date.toISOString().split('T')[0]
          const dayName = date.toLocaleDateString('en-US', { weekday: 'short' })

          const dayInvoices = invoices.filter(inv => {
            const invDate = new Date(inv.invoiceDate || inv.createdAt).toISOString().split('T')[0]
            return invDate === dateStr
          })

          const dayAmount = dayInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0)
          
          // Group day invoices by client
          const clientGroups = {}
          dayInvoices.forEach(inv => {
            const clientName = inv.clientId?.name || "Unknown Client"
            if (!clientGroups[clientName]) clientGroups[clientName] = 0
            clientGroups[clientName]++
          })

          const clients = Object.entries(clientGroups).map(([name, count]) => ({
            name,
            invoiceCount: count
          }))
          
          dailyRevenue.push({ 
            name: dayName, 
            value: dayAmount, 
            date: dateStr,
            clients: clients
          })
        }

        setStats({
          totalInvoices: invoices.length,
          paidInvoices: paid,
          pendingInvoices: pending,
          overdueInvoices: overdue,
          totalRevenue: revenue,
          dailyRevenue: dailyRevenue,
        })
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Overview Charts Section */}
      <Overview stats={stats} />

      {/* Invoices List Section */}
      <RecentInvoices />
    </div>
  )
}
