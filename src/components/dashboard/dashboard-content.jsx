
import { useEffect, useState } from "react"
import { useNavigate, useOutletContext } from "react-router-dom"
import { Card } from "../ui/card"
import { Button } from "../ui/button"
import { FileText, DollarSign, Clock, CheckCircle, ShieldAlert, Building2, RefreshCw, Users, BarChart3, TrendingUp, Plus } from "lucide-react"
import Overview from "./overview"
import RecentInvoices from "./recent-invoices"
import StatCard from "./stat-card"
import { toast } from "sonner"

export default function DashboardContent() {
  const navigate = useNavigate()
  const { orgId } = useOutletContext()
  const [stats, setStats] = useState({
    totalInvoices: 0,
    paidInvoices: 0,
    pendingInvoices: 0,
    overdueInvoices: 0,
    totalRevenue: 0,
    activeClients: 0,
    growth: 0,
    dailyRevenue: [],
  })
  const [loading, setLoading] = useState(true)
  const [pendingOrg, setPendingOrg] = useState(null)
  const [currency, setCurrency] = useState("USD")

  useEffect(() => {
    fetchStats()
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/company`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        if (data.data?.currency) {
          setCurrency(data.data.currency)
        }
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error)
    }
  }

  const getCurrencySymbol = (code) => {
    const symbols = { USD: "$", EUR: "€", GBP: "£", PKR: "Rs", INR: "₹" }
    return symbols[code] || "$"
  }

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token")
      
      const [invResponse, clientsResponse, paymentsResponse] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/api/invoices`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${import.meta.env.VITE_API_URL}/api/clients`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${import.meta.env.VITE_API_URL}/api/payments`, {
          headers: { Authorization: `Bearer ${token}` },
        })
      ])

      if (invResponse.status === 403) {
        const data = await invResponse.json()
        if (data.error === "Organization pending approval") {
          setPendingOrg({ name: data.orgName })
          setLoading(false)
          return
        }
      }

      if (invResponse.ok && clientsResponse.ok && paymentsResponse.ok) {
        const invData = await invResponse.json()
        const clientsData = await clientsResponse.json()
        const paymentsData = await paymentsResponse.json()
        const invoices = invData.data
        const clients = clientsData.data
        const payments = paymentsData.data
        
        const paid = invoices.filter((i) => i.status === "Paid").length
        const pending = invoices.filter((i) => i.status === "Pending").length
        const overdue = invoices.filter((i) => i.status === "Overdue").length
        
        // Revenue should be total of completed payments for real-time accuracy
        const totalCollectedRevenue = payments
          .filter(pay => pay.status === "Completed")
          .reduce((sum, pay) => sum + (pay.amount || 0), 0)

        const dailyRevenue = []
        const now = new Date()
        // Last 10 days including today
        for (let i = 9; i >= 0; i--) {
          const date = new Date(now)
          date.setDate(date.getDate() - i)
          
          const year = date.getFullYear()
          const month = String(date.getMonth() + 1).padStart(2, '0')
          const day = String(date.getDate()).padStart(2, '0')
          const dateStr = `${year}-${month}-${day}`
          
          const dayName = date.toLocaleDateString('en-US', { weekday: 'short' })
          const dayAmount = payments
            .filter(pay => {
              const payDate = new Date(pay.paymentDate)
              const payYear = payDate.getFullYear()
              const payMonth = String(payDate.getMonth() + 1).padStart(2, '0')
              const payDay = String(payDate.getDate()).padStart(2, '0')
              const payDateStr = `${payYear}-${payMonth}-${payDay}`
              return pay.status === "Completed" && payDateStr === dateStr
            })
            .reduce((sum, pay) => sum + (pay.amount || 0), 0)
          
          dailyRevenue.push({ 
            name: dayName, 
            value: dayAmount, 
            date: dateStr,
            // Unique key for Recharts to avoid jumping when day names repeat
            key: `${dateStr}-${dayName}` 
          })
        }

        setStats({
          totalInvoices: invoices.length,
          paidInvoices: paid,
          pendingInvoices: pending,
          overdueInvoices: overdue,
          totalRevenue: totalCollectedRevenue,
          activeClients: clients.length,
          growth: 23.8, // Placeholder for now
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

  if (pendingOrg) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)] p-6 text-center">
        <div className="w-20 h-20 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mb-6">
          <Clock className="text-orange-600 dark:text-orange-400" size={32} />
        </div>
        <h2 className="text-lg font-bold mb-2 text-foreground">Pending Approval</h2>
        <p className="text-base font-medium text-foreground mb-1">{pendingOrg.name}</p>
        <p className="text-sm text-muted-foreground max-w-md mb-8">
          This organization is currently waiting for administrator approval. 
          You will be notified once it has been approved.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button onClick={() => window.location.reload()} variant="outline" className="gap-2">
            <RefreshCw size={18} />
            Check Status
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 p-4 lg:p-6 bg-transparent">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-0.5">
          <h1 className="text-lg font-black text-white tracking-tight">Welcome back 👋</h1>
          <p className="text-[9px] text-[#94A3B8] font-medium uppercase tracking-wider">Here's what's happening with your business today.</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            onClick={() => navigate("/invoices")} 
            className="h-9 px-5 rounded-full bg-gradient-to-r from-[#A855F7] to-[#06B6D4] hover:opacity-90 text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-[#A855F7]/20 border-none transition-all active:scale-95 flex items-center gap-2"
          >
            <Plus size={14} />
            New Invoice
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        <StatCard 
          title="Total Revenue" 
          value={`${getCurrencySymbol(currency)}${stats.totalRevenue.toLocaleString()}`} 
          icon={DollarSign} 
          trend="+12.5% vs last week" 
          trendColor="text-emerald-500"
          iconColor="text-[#7B5BE4]"
          iconBg="bg-[#7B5BE4]/10"
        />
        <StatCard 
          title="Issued Invoices" 
          value={stats.totalInvoices.toString()} 
          icon={FileText} 
          trend="+8 active this week" 
          trendColor="text-emerald-500"
          iconColor="text-[#00C4B4]"
          iconBg="bg-[#00C4B4]/10"
        />
        <StatCard 
          title="Client Base" 
          value={stats.activeClients.toString()} 
          icon={Users} 
          trend="+3 registered recently" 
          trendColor="text-emerald-500"
          iconColor="text-[#27AE60]"
          iconBg="bg-[#27AE60]/10"
        />
        <StatCard 
          title="Platform Growth" 
          value={`${stats.growth}%`} 
          icon={TrendingUp} 
          trend="Calculated vs last month" 
          trendColor="text-emerald-500"
          iconColor="text-[#F39C12]"
          iconBg="bg-[#F39C12]/10"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <div className="md:col-span-2 lg:col-span-2 xl:col-span-3 space-y-4">
          <Overview stats={stats} currencySymbol={getCurrencySymbol(currency)} />
          <RecentInvoices />
        </div>
        <div className="space-y-4">
          <Card className="p-3 bg-[#1A1635] border border-white/[0.03] rounded-2xl">
            <div className="flex justify-between items-center mb-2.5">
              <h3 className="text-[10px] font-black text-white uppercase tracking-tight">Invoice Status</h3>
              <div className="bg-[#7B5BE4]/10 text-[#7B5BE4] px-1.5 py-0.5 rounded text-[6px] font-black uppercase tracking-widest">
                {Math.round((stats.paidInvoices / (stats.totalInvoices || 1)) * 100)}% paid
              </div>
            </div>
            
            <div className="flex flex-col items-center justify-center py-1.5">
              <div className="relative w-20 h-20 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="40"
                    cy="40"
                    r="34"
                    stroke="currentColor"
                    strokeWidth="5"
                    fill="transparent"
                    className="text-white/5"
                  />
                  {/* Paid Segment */}
                  <circle
                    cx="40"
                    cy="40"
                    r="34"
                    stroke="#10b981" // emerald-500
                    strokeWidth="5"
                    fill="transparent"
                    strokeDasharray={213.6}
                    strokeDashoffset={213.6 - (213.6 * (stats.paidInvoices / (stats.totalInvoices || 1)))}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                  {/* Pending Segment */}
                  <circle
                    cx="40"
                    cy="40"
                    r="34"
                    stroke="#f59e0b" // amber-500
                    strokeWidth="5"
                    fill="transparent"
                    strokeDasharray={213.6}
                    strokeDashoffset={213.6 - (213.6 * (stats.pendingInvoices / (stats.totalInvoices || 1)))}
                    strokeLinecap="round"
                    style={{
                      transform: `rotate(${(stats.paidInvoices / (stats.totalInvoices || 1)) * 360}deg)`,
                      transformOrigin: 'center'
                    }}
                    className="transition-all duration-1000"
                  />
                  {/* Overdue Segment */}
                  <circle
                    cx="40"
                    cy="40"
                    r="34"
                    stroke="#f43f5e" // rose-500
                    strokeWidth="5"
                    fill="transparent"
                    strokeDasharray={213.6}
                    strokeDashoffset={213.6 - (213.6 * (stats.overdueInvoices / (stats.totalInvoices || 1)))}
                    strokeLinecap="round"
                    style={{
                      transform: `rotate(${((stats.paidInvoices + stats.pendingInvoices) / (stats.totalInvoices || 1)) * 360}deg)`,
                      transformOrigin: 'center'
                    }}
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-base font-black text-white">{stats.totalInvoices}</span>
                  <span className="text-[6px] font-bold text-[#71717A] uppercase">Total</span>
                </div>
              </div>
            </div>

            <div className="space-y-1 mt-2.5">
              {[
                { label: "Paid", count: stats.paidInvoices, color: "bg-emerald-500" },
                { label: "Pending", count: stats.pendingInvoices, color: "bg-amber-500" },
                { label: "Overdue", count: stats.overdueInvoices, color: "bg-rose-500" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between border-t border-white/5 pt-1.5 first:border-0 first:pt-0">
                  <div className="flex items-center gap-2">
                    <div className={`w-1 h-1 rounded-full ${item.color}`} />
                    <span className="text-[8px] font-bold text-[#71717A]">{item.label}</span>
                  </div>
                  <span className="text-[9px] font-black text-white">{item.count}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-3 bg-[#1A1635] border border-white/[0.03] rounded-2xl">
            <h3 className="text-[10px] font-black text-white uppercase tracking-tight mb-2.5">Quick Actions</h3>
            <div className="space-y-1.5">
              {[
                { label: "Create invoice", sub: "Bill a client now", icon: FileText },
                { label: "Add client", sub: "Save a new contact", icon: Users },
                { label: "Record payment", sub: "Mark invoice paid", icon: DollarSign },
                { label: "View reports", sub: "Pro feature", icon: BarChart3 },
              ].map((action) => (
                <button key={action.label} className="w-full flex items-center justify-between p-2 rounded-xl bg-white/[0.02] border border-white/[0.03] hover:bg-white/[0.05] transition-all group">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-[#7B5BE4]/10 text-[#7B5BE4]">
                      <action.icon size={10} />
                    </div>
                    <div className="text-left">
                      <p className="text-[9px] font-bold text-white leading-none">{action.label}</p>
                      <p className="text-[7px] text-[#71717A] mt-1">{action.sub}</p>
                    </div>
                  </div>
                  <TrendingUp size={7} className="text-[#71717A] group-hover:text-white transition-colors" />
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
