import { useState, useEffect } from "react"
import { Card } from "../ui/card"
import { Users, Building2, CreditCard, Banknote, ArrowUpRight, ArrowDownRight } from "lucide-react"

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrgs: 0,
    activeSubscriptions: 0,
    totalRevenue: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/stats`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      })
      const data = await res.json()
      if (data.success) {
        setStats(data.data)
      }
    } catch (error) {
      console.error("Failed to fetch stats", error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    { label: "Total Users", value: stats.totalUsers, icon: Users, color: "text-blue-600", bg: "bg-blue-100" },
    { label: "Organizations", value: stats.totalOrgs, icon: Building2, color: "text-purple-600", bg: "bg-purple-100" },
    { label: "Active Subscriptions", value: stats.activeSubscriptions, icon: CreditCard, color: "text-green-600", bg: "bg-green-100" },
    { label: "Total Revenue", value: `$${stats.totalRevenue.toLocaleString()}`, icon: Banknote, color: "text-orange-600", bg: "bg-orange-100" },
  ]

  if (loading) return <div className="p-6 text-center">Loading...</div>

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground">Admin Overview</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index} className="p-6 border-0 shadow-sm">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${stat.bg}`}>
                  <Icon className={stat.color} size={24} />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <h3 className="text-2xl font-bold text-foreground">{stat.value}</h3>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 border-0 shadow-sm min-h-[300px]">
          <h3 className="text-lg font-semibold mb-4">Platform Growth</h3>
          <div className="flex items-center justify-center h-48 border-2 border-dashed border-muted rounded-lg">
             <div className="text-center text-muted-foreground">
               <ArrowUpRight className="mx-auto mb-2 text-green-500" />
               Chart integration coming soon
             </div>
          </div>
        </Card>
        <Card className="p-6 border-0 shadow-sm min-h-[300px]">
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-4">
             {[1, 2, 3, 4].map(i => (
               <div key={i} className="flex items-center justify-between py-2 border-b last:border-0 border-border">
                 <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span className="text-sm">New organization registered</span>
                 </div>
                 <span className="text-xs text-muted-foreground">{i}h ago</span>
               </div>
             ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
