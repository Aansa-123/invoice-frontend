
import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { TrendingUp, TrendingDown, User, Activity } from 'lucide-react';

export default function Overview({ stats, currencySymbol = "$" }) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const revenueData = stats.dailyRevenue || [];
  
  const statusData = [
    { name: 'Paid', count: stats.paidInvoices || 0, color: 'text-emerald-500', bg: 'bg-emerald-500' },
    { name: 'Pending', count: stats.pendingInvoices || 0, color: 'text-amber-500', bg: 'bg-amber-500' },
    { name: 'Overdue', count: stats.overdueInvoices || 0, color: 'text-rose-500', bg: 'bg-rose-500' },
  ];

  const totalInvoices = stats.totalInvoices || 0;
  const collectionRate = totalInvoices > 0 ? Math.round((stats.paidInvoices / totalInvoices) * 100) : 0;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-3">
      {/* Revenue Chart */}
      <Card className="xl:col-span-2 p-3 bg-[#1A1635] border border-white/[0.03] rounded-2xl shadow-xl relative overflow-hidden group">
        <div className="flex justify-between items-center mb-3 relative z-10">
          <div>
            <h2 className="text-xs font-black text-white tracking-tight">Revenue Dynamics</h2>
            <p className="text-[7px] text-[#71717A] font-bold uppercase tracking-wider mt-0.5">Daily collected payments activity</p>
          </div>
          <div className="bg-white/[0.02] text-[#71717A] px-2 py-0.5 rounded-xl text-[7px] font-bold tracking-wider uppercase border border-white/[0.05] backdrop-blur-md">
            {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
        </div>

        <div className="h-[160px] w-full relative z-10">
          {isLoaded && (
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7B5BE4" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#7B5BE4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.02)" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: 'rgba(255,255,255,0.1)', fontSize: 7, fontWeight: 700}}
                  dy={6}
                  tickFormatter={(value) => {
                    const dayObj = revenueData.find(d => d.date === value);
                    return dayObj ? dayObj.name : "";
                  }}
                />
                <YAxis hide />
                <Tooltip 
                  cursor={{ stroke: 'rgba(123,91,228,0.2)', strokeWidth: 1 }}
                  content={({ active, payload, label, ...props }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-[#1A1635] backdrop-blur-xl border border-white/[0.08] p-2 rounded-xl shadow-xl">
                          <p className="text-[6px] font-bold text-[#71717A] uppercase tracking-wider mb-1">
                            {payload[0].payload.date}
                          </p>
                          <div className="flex items-baseline gap-1">
                            <span className="text-[#7B5BE4] font-bold text-[8px]">{currencySymbol}</span>
                            <p className="text-sm font-black text-white tracking-tight">
                              {payload[0].value.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#7B5BE4" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                  animationDuration={2000}
                  strokeLinecap="round"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
        
        {/* Ambient glow */}
        <div className="absolute -left-10 -bottom-10 w-20 h-20 bg-[#7B5BE4]/5 rounded-full blur-3xl pointer-events-none" />
      </Card>

      {/* Invoice Status Distribution */}
      <Card className="p-3 bg-[#1A1635] border border-white/[0.03] rounded-2xl shadow-xl flex flex-col relative overflow-hidden group">
        <div className="mb-4 relative z-10">
          <h2 className="text-xs font-black text-white tracking-tight">Distribution</h2>
          <p className="text-[7px] text-[#71717A] font-bold uppercase tracking-wider mt-0.5">Invoice status matrix</p>
        </div>

        <div className="space-y-3 flex-1 relative z-10">
          {statusData.map((item) => (
            <div key={item.name} className="space-y-1 group/item">
              <div className="flex justify-between items-end">
                <div className="flex items-center gap-2">
                  <div className={`w-1 h-1 rounded-full ${item.bg} border border-white/10`} />
                  <span className="font-bold text-[#71717A] tracking-wider text-[7px] uppercase group-hover/item:text-white/60 transition-colors">{item.name}</span>
                </div>
                <span className="font-black text-xs text-white tracking-tight">{item.count}</span>
              </div>
              <div className="h-0.5 w-full bg-white/[0.02] rounded-full overflow-hidden border border-white/[0.02]">
                <div 
                  className={`h-full ${item.bg} rounded-full transition-all duration-1000 ease-out`}
                  style={{ width: `${totalInvoices > 0 ? (item.count / totalInvoices) * 100 : 0}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-3 border-t border-white/[0.03] relative z-10">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-xl bg-[#7B5BE4]/10 text-[#7B5BE4] border border-[#7B5BE4]/10">
                <Activity size={12} strokeWidth={2.5} />
              </div>
              <div className="flex flex-col">
                <span className="text-[6px] font-bold text-[#71717A] uppercase tracking-wider">Health Score</span>
                <span className="text-[8px] font-bold text-white/60 uppercase tracking-tight">Collection Rate</span>
              </div>
            </div>
            <span className="text-base font-black text-white tracking-tight">{collectionRate}%</span>
          </div>
        </div>
        
        {/* Ambient glow */}
        <div className="absolute -right-10 -top-10 w-20 h-20 bg-[#7B5BE4]/5 rounded-full blur-3xl pointer-events-none" />
      </Card>
    </div>
  );
}
