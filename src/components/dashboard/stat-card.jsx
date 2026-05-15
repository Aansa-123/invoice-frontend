import { Card } from "../ui/card"
import { ArrowUpRight, TrendingUp } from "lucide-react"

export default function StatCard({ title, value, icon: Icon, trend, trendColor = "text-emerald-400", iconColor = "text-primary", iconBg = "bg-primary/10" }) {
  return (
    <Card className="p-3 bg-[#1A1635] border border-white/[0.03] rounded-2xl relative group hover:border-[#7B5BE4]/20 transition-all duration-300">
      <div className="flex flex-col gap-1.5 relative z-10">
        <div className="flex items-center justify-between">
          <div className={`p-1.5 rounded-xl ${iconBg} ${iconColor} border border-white/[0.05]`}>
            <Icon size={14} strokeWidth={2.5} />
          </div>
          {trend && (
            <div className={`flex items-center gap-1 px-1.5 py-0.5 bg-white/[0.02] rounded-full border border-white/[0.05]`}>
              <ArrowUpRight size={8} className={trendColor} />
              <span className={`text-[8px] font-bold ${trendColor}`}>{trend.split(' ')[0]}</span>
            </div>
          )}
        </div>
        
        <div className="space-y-0 mt-0.5">
          <p className="text-[8px] font-bold text-[#71717A] uppercase tracking-wider">{title}</p>
          <h3 className="text-base font-black text-white tracking-tight leading-none">{value}</h3>
        </div>
      </div>
    </Card>
  )
}
