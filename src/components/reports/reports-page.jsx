
import { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "../ui/card"
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from "recharts"
import { 
  TrendingUp, CheckCircle, Clock, AlertTriangle, 
  Wallet, ArrowUpRight, ArrowRight, User
} from "lucide-react"
import { Progress } from "../ui/progress"
import { Avatar, AvatarFallback } from "../ui/avatar"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  }
}

export default function ReportsPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/reports`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const result = await response.json()
        setData(result.data)
      }
    } catch (error) {
      console.error("Failed to fetch reports:", error)
    } finally {
      setLoading(false)
    }
  }

  const chartColors = {
    billed: "#8b5cf6", // Purple/Blue
    collected: "#10b981", // Green
    pending: "#f59e0b", // Orange
    overdue: "#ef4444", // Red
    primary: "hsl(var(--primary))"
  }

  const statusData = useMemo(() => {
    if (!data) return []
    const total = data.stats.totalRevenue || 1
    return [
      { name: "Paid", value: data.stats.totalPaid, color: chartColors.collected, percent: Math.round((data.stats.totalPaid / total) * 100) },
      { name: "Pending", value: data.stats.totalPending, color: chartColors.pending, percent: Math.round((data.stats.totalPending / total) * 100) },
      { name: "Overdue", value: (data.stats.totalRevenue - data.stats.totalPaid - data.stats.totalPending) || 0, color: chartColors.overdue, percent: Math.round(((data.stats.totalRevenue - data.stats.totalPaid - data.stats.totalPending) / total) * 100) }
    ]
  }, [data])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-100px)]">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-4 border-primary/20 animate-pulse"></div>
          <div className="absolute top-0 left-0 h-16 w-16 rounded-full border-t-4 border-primary animate-spin"></div>
        </div>
      </div>
    )
  }

  if (!data) return <div className="p-6 text-center text-muted-foreground">No data available</div>

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="p-3 h-[calc(100vh-64px)] flex flex-col gap-2 overflow-hidden bg-slate-50/50 dark:bg-slate-950/50"
    >
      {/* Header Info */}
      <div className="flex justify-between items-end shrink-0">
        <div>
          <p className="text-[9px] font-medium text-slate-400 uppercase tracking-widest">
            {new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(new Date())} • {data.stats.totalInvoices} invoices total
          </p>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 shrink-0">
        <StatCard 
          icon={<Wallet className="w-3.5 h-3.5" />}
          label="TOTAL BILLED"
          value={data.stats.totalRevenue}
          subtext="+12% this month"
          subIcon={<ArrowUpRight className="w-2.5 h-2.5" />}
          theme="blue"
        />
        <StatCard 
          icon={<CheckCircle className="w-3.5 h-3.5" />}
          label="TOTAL PAID"
          value={data.stats.totalPaid}
          subtext={`${Math.round((data.stats.totalPaid / data.stats.totalRevenue) * 100)}% collected`}
          theme="green"
        />
        <StatCard 
          icon={<Clock className="w-3.5 h-3.5" />}
          label="PENDING"
          value={data.stats.totalPending}
          subtext="Awaiting payment"
          subIcon={<ArrowRight className="w-2.5 h-2.5" />}
          theme="orange"
        />
        <StatCard 
          icon={<AlertTriangle className="w-3.5 h-3.5" />}
          label="OVERDUE"
          value={(data.stats.totalRevenue - data.stats.totalPaid - data.stats.totalPending) || 0}
          subtext="Needs follow-up"
          theme="red"
        />
      </div>

      {/* Middle Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 flex-1 min-h-0">
        {/* Revenue Overview */}
        <motion.div variants={itemVariants} className="lg:col-span-7 flex flex-col h-full">
          <Card className="p-3 flex flex-col h-full border-none shadow-sm rounded-xl">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-none">Revenue Overview</h3>
                <p className="text-[9px] text-slate-400 mt-1">Billed vs Collected</p>
              </div>
              <div className="bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded-full text-[9px] font-bold">
                {new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' }).format(new Date())}
              </div>
            </div>
            
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.monthlyRevenue} margin={{ top: 5, right: 5, left: -30, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke="#f1f5f9" strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="month" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 8 }}
                    dy={5}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 8 }}
                    tickFormatter={(v) => `$${v}`}
                  />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    content={<CustomTooltip />}
                  />
                  <Bar 
                    dataKey="revenue" 
                    fill="#818cf8" 
                    radius={[3, 3, 0, 0]} 
                    barSize={10}
                    name="Total Billed"
                    isAnimationActive={true}
                    animationDuration={1500}
                    animationBegin={300}
                    animationEasing="ease-out"
                  />
                  <Bar 
                    dataKey="paid" 
                    fill="#34d399" 
                    radius={[3, 3, 0, 0]} 
                    barSize={10}
                    name="Collected"
                    isAnimationActive={true}
                    animationDuration={1500}
                    animationBegin={500}
                    animationEasing="ease-out"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="flex gap-3 mt-1 justify-center">
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div>
                <span className="text-[8px] font-bold text-slate-400 uppercase">Total Billed</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                <span className="text-[8px] font-bold text-slate-400 uppercase">Collected</span>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Invoice Status Distribution */}
        <motion.div variants={itemVariants} className="lg:col-span-5 flex flex-col h-full">
          <Card className="p-3 flex flex-col h-full border-none shadow-sm rounded-xl">
            <div>
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-none">Invoice Status</h3>
              <p className="text-[9px] text-slate-400 mt-1 mb-2">Distribution by amount</p>
            </div>
            
            <div className="flex-1 min-h-0 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius="70%"
                    outerRadius="100%"
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                    isAnimationActive={true}
                    animationDuration={1500}
                    animationBegin={600}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<div className="hidden" />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-lg font-black text-slate-800 dark:text-slate-100 leading-none">${data.stats.totalRevenue?.toLocaleString()}</span>
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Total</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-1 mt-2">
              {statusData.map((s) => (
                <div key={s.name} className="flex flex-col items-center">
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.color }}></div>
                    <span className="text-[8px] font-bold text-slate-400">{s.name} {s.percent}%</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 flex-1 min-h-0">
        {/* Top Clients */}
        <motion.div variants={itemVariants} className="lg:col-span-7 flex flex-col h-full">
          <Card className="p-3 flex flex-col h-full border-none shadow-sm rounded-xl overflow-hidden">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-none">Top Clients</h3>
            <p className="text-[9px] text-slate-400 mt-1 mb-2">Ranked by invoiced amount</p>
            
            <div className="flex-1 overflow-auto custom-scrollbar">
              <table className="w-full">
                <thead>
                  <tr className="text-[8px] font-bold text-slate-400 uppercase tracking-wider text-left border-b border-slate-50">
                    <th className="pb-1.5">Client</th>
                    <th className="pb-1.5 text-center">Invoices</th>
                    <th className="pb-1.5 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {data.topClients.slice(0, 3).map((client, idx) => (
                    <tr key={client._id} className="group">
                      <td className="py-1.5">
                        <div className="flex items-center gap-2">
                          <Avatar className="w-5 h-5 rounded-lg bg-indigo-50 text-indigo-600 font-bold border-none text-[8px]">
                            <AvatarFallback>{client.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col flex-1">
                            <span className="text-[10px] font-bold text-slate-700 dark:text-slate-200 leading-none">{client.name}</span>
                            <Progress 
                              value={(client.totalBilled / data.stats.totalRevenue) * 100} 
                              className={`h-0.5 mt-1 w-12 ${idx % 2 === 0 ? "bg-emerald-100" : "bg-indigo-100"}`} 
                              indicatorClassName={idx % 2 === 0 ? "bg-emerald-500" : "bg-indigo-500"}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-1.5 text-center">
                        <span className="inline-block px-1 py-0.5 rounded-full bg-slate-50 text-[8px] font-bold text-slate-400">
                          {client.invoiceCount} inv
                        </span>
                      </td>
                      <td className="py-1.5 text-right">
                        <span className="text-[10px] font-black text-emerald-500">${client.totalBilled?.toLocaleString()}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>

        {/* Monthly Paid Trend */}
        <motion.div variants={itemVariants} className="lg:col-span-5 flex flex-col h-full">
          <Card className="p-3 flex flex-col h-full border-none shadow-sm rounded-xl">
            <div className="flex justify-between items-start mb-1">
              <div>
                <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-none">Monthly Paid Trend</h3>
                <p className="text-[9px] text-slate-400 mt-1">Collection over time</p>
              </div>
              <div className="bg-emerald-50 text-emerald-600 px-1 py-0.5 rounded-lg text-[8px] font-bold flex items-center gap-0.5">
                <ArrowUpRight className="w-2 h-2" />
                ${data.monthlyRevenue[data.monthlyRevenue.length - 1]?.paid?.toLocaleString()}
              </div>
            </div>
            
            <div className="flex-1 min-h-0 mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.monthlyRevenue} margin={{ top: 5, right: 0, left: -35, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorPaid" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="#f1f5f9" strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="month" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 8 }}
                    dy={5}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 8 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area 
                    type="monotone" 
                    dataKey="paid" 
                    stroke="#10b981" 
                    strokeWidth={1.5} 
                    fillOpacity={1} 
                    fill="url(#colorPaid)" 
                    dot={{ fill: '#10b981', strokeWidth: 1, r: 2, stroke: '#fff' }}
                    activeDot={{ r: 3, strokeWidth: 0 }}
                    isAnimationActive={true}
                    animationDuration={2000}
                    animationBegin={800}
                    animationEasing="ease-in-out"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  )
}

function StatCard({ icon, label, value, subtext, subIcon, theme }) {
  const themes = {
    blue: "bg-indigo-50 text-indigo-600 ring-indigo-100",
    green: "bg-emerald-50 text-emerald-600 ring-emerald-100",
    orange: "bg-amber-50 text-amber-600 ring-amber-100",
    red: "bg-rose-50 text-rose-600 ring-rose-100"
  }

  const valueColors = {
    blue: "text-slate-800 dark:text-slate-100",
    green: "text-emerald-500",
    orange: "text-amber-500",
    red: "text-rose-500"
  }

  const subtextColors = {
    blue: "bg-blue-50 text-blue-500",
    green: "bg-emerald-50 text-emerald-600",
    orange: "bg-amber-50 text-amber-600",
    red: "bg-rose-50 text-rose-600"
  }

  return (
    <motion.div variants={itemVariants}>
      <Card className="p-3 border-none shadow-sm rounded-2xl flex flex-col gap-1 relative overflow-hidden group">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${themes[theme]} ring-1`}>
          {icon}
        </div>
        <div>
          <p className="text-[7px] font-black text-slate-400 tracking-widest uppercase mb-0.5">{label}</p>
          <p className={`text-lg font-black ${valueColors[theme]}`}>${value?.toLocaleString()}</p>
        </div>
        <div className={`inline-flex items-center gap-0.5 self-start px-1 py-0.5 rounded text-[7px] font-bold ${subtextColors[theme]}`}>
          {subIcon}
          {subtext}
        </div>
      </Card>
    </motion.div>
  )
}

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 text-white p-3 rounded-2xl shadow-xl border-none text-xs">
        <p className="font-bold mb-2 border-b border-slate-700 pb-1">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 py-0.5">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></div>
            <span className="text-slate-400 capitalize">{entry.name}:</span>
            <span className="font-black">${entry.value.toLocaleString()}</span>
          </div>
        ))}
      </div>
    )
  }
  return null
}
