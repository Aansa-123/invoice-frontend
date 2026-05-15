import { useState, useEffect } from "react"
import { Card } from "../ui/card"
import { Users, Building2, CreditCard, Banknote, ArrowUpRight, Activity } from "lucide-react"
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
} from "recharts"

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrgs: 0,
    activeSubscriptions: 0,
    totalRevenue: 0
  })
  const [growthData, setGrowthData] = useState([])
  const [loading, setLoading] = useState(true)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    fetchStats()
    fetchGrowthData()
    setIsLoaded(true)
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

  const fetchGrowthData = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/growth`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      })
      const data = await res.json()
      if (data.success) {
        setGrowthData(data.data)
      }
    } catch (error) {
      console.error("Failed to fetch growth data", error)
    }
  }

  const statCards = [
    { label: "Total Users", value: stats.totalUsers, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/10" },
    { label: "Organizations", value: stats.totalOrgs, icon: Building2, color: "text-purple-500", bg: "bg-purple-500/10", border: "border-purple-500/10" },
    { label: "Active Subscriptions", value: stats.activeSubscriptions, icon: CreditCard, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/10" },
    { label: "Total Revenue", value: `$${stats.totalRevenue.toLocaleString()}`, icon: Banknote, color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/10" },
  ]

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#14142B] border border-white/10 p-3 rounded-2xl shadow-2xl backdrop-blur-xl">
          <div className="flex flex-col mb-2">
            <p className="text-[10px] font-black text-white tracking-tight">{payload[0].payload.day.toUpperCase()}</p>
            <p className="text-[8px] font-bold text-[#71717A]">{label}</p>
          </div>
          <div className="space-y-1.5">
            {payload.map((entry, index) => (
              <div key={index} className="flex items-center justify-between gap-4">
                <span className="text-[9px] font-bold text-white/60">{entry.name}:</span>
                <span className="text-[11px] font-black" style={{ color: entry.color }}>
                  {entry.name === "Revenue" ? `$${entry.value.toLocaleString()}` : entry.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )
    }
    return null
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  )

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-black text-white tracking-tight">Admin Overview</h2>
        <p className="text-xs text-[#71717A] font-bold uppercase tracking-wider">Welcome back, manage your platform activity</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index} className="p-5 bg-[#1A1635] border border-white/[0.03] rounded-2xl shadow-xl relative overflow-hidden group transition-all duration-300 hover:border-white/[0.08]">
              <div className="flex items-center gap-4 relative z-10">
                <div className={`p-3 rounded-xl ${stat.bg} ${stat.border} border backdrop-blur-md`}>
                  <Icon className={stat.color} size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#71717A] uppercase tracking-wider">{stat.label}</p>
                  <h3 className="text-lg font-black text-white tracking-tight">{stat.value}</h3>
                </div>
              </div>
              <div className={`absolute -right-4 -bottom-4 w-12 h-12 ${stat.color.replace('text-', 'bg-')}/5 rounded-full blur-2xl pointer-events-none group-hover:scale-150 transition-transform duration-500`} />
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card className="p-6 bg-[#1A1635] border border-white/[0.03] rounded-2xl shadow-xl relative overflow-hidden">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-base font-black text-white tracking-tight">Platform Growth</h3>
              <p className="text-[10px] text-[#71717A] font-bold uppercase tracking-wider">Historical growth and adoption metrics</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-purple-500" />
                <span className="text-[9px] font-bold text-[#71717A] uppercase tracking-widest">Revenue</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-[9px] font-bold text-[#71717A] uppercase tracking-widest">Growth</span>
              </div>
            </div>
          </div>
          
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={growthData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: "#71717A", fontSize: 9, fontWeight: 800 }} 
                  dy={10}
                  tickFormatter={(val, idx) => growthData[idx]?.day}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: "#71717A", fontSize: 9, fontWeight: 800 }} 
                />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(255,255,255,0.05)", strokeWidth: 1 }} />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  name="Revenue"
                  stroke="#7B5BE4" 
                  strokeWidth={3} 
                  dot={false}
                  activeDot={{ r: 4, fill: "#7B5BE4", stroke: "#fff", strokeWidth: 2 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="growth" 
                  name="Growth"
                  stroke="#10B981" 
                  strokeWidth={3} 
                  dot={false}
                  activeDot={{ r: 4, fill: "#10B981", stroke: "#fff", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          {/* Ambient glow */}
          <div className="absolute -left-20 -bottom-20 w-40 h-40 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
        </Card>
      </div>
    </div>
  )
}

