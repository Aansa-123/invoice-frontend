
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Card } from "../ui/card"
import { Button } from "../ui/button"
import { FileText, DollarSign, Clock, CheckCircle } from "lucide-react"
import StatCard from "./stat-card"
import RecentInvoices from "./recent-invoices"

export default function DashboardContent() {
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    totalInvoices: 0,
    paidInvoices: 0,
    pendingInvoices: 0,
    overdueInvoices: 0,
    totalRevenue: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/invoices`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const response_data = await response.json()
        const invoices = response_data.data
        const paid = invoices.filter((i) => i.status === "Paid").length
        const pending = invoices.filter((i) => i.status === "Pending").length
        const overdue = invoices.filter((i) => i.status === "Overdue").length
        const revenue = invoices.filter((i) => i.status === "Paid").reduce((sum, i) => sum + (i.total || 0), 0)

        setStats({
          totalInvoices: invoices.length,
          paidInvoices: paid,
          pendingInvoices: pending,
          overdueInvoices: overdue,
          totalRevenue: revenue,
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
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Welcome back</h1>
        <p className="text-muted-foreground">Here's your invoice overview</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Invoices" value={stats.totalInvoices} icon={FileText} color="primary" />
        <StatCard title="Paid Invoices" value={stats.paidInvoices} icon={CheckCircle} color="accent" />
        <StatCard title="Pending" value={stats.pendingInvoices} icon={Clock} color="accent" />
        <StatCard
          title="Total Revenue"
          value={`$${stats.totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          color="primary"
        />
      </div>

      {/* Recent Invoices */}
      <RecentInvoices />

      {/* Quick Actions */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
        These are two functions you can do quickly:
        <br />
        1. Create a new invoice to bill your clients.
        <br />
        2. Add a new client to your client list.
        <div className="mt-4" />
        <div className="flex flex-wrap gap-3">
          <Button
            className="bg-primary hover:bg-primary/90"
            onClick={() => navigate("/invoices")}
          >
            Create New Invoice
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate("/clients")}
          >
            Add Client
          </Button>
        </div>
      </Card>
    </div>
  )
}
