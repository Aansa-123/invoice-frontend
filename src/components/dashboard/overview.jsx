
import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell as BarCell } from 'recharts';
import { TrendingUp, TrendingDown, User } from 'lucide-react';

export default function Overview({ stats }) {
  const [selectedDay, setSelectedDay] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const data = [
    { name: 'Paid', value: stats.paidInvoices || 0, color: '#6366f1' },
    { name: 'Pending', value: stats.pendingInvoices || 0, color: '#f97316' },
    { name: 'Overdue', value: stats.overdueInvoices || 0, color: '#94a3b8' },
  ];

  const totalInvoices = stats.totalInvoices || 0;

  const barData1 = stats.dailyRevenue || [];
  
  // Default to today (last item in the array) if nothing selected
  const activeDay = selectedDay || (barData1.length > 0 ? barData1[barData1.length - 1] : null);
  const barData2 = activeDay?.clients || [];

  const handleBarClick = (data) => {
    if (data && data.activePayload && data.activePayload.length > 0) {
      setSelectedDay(data.activePayload[0].payload);
    }
  };

  return (
    <Card className="bg-white dark:bg-card border border-gray-200 dark:border-gray-800 shadow-sm rounded-2xl overflow-hidden">
      <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Donut Chart Section */}
        <div className="flex flex-col items-center justify-center space-y-8">
          <div className="relative w-48 h-48">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={85}
                  paddingAngle={8}
                  dataKey="value"
                  animationDuration={1500}
                  stroke="none"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
              <span className="text-4xl font-extrabold text-gray-900 dark:text-gray-100">{totalInvoices}</span>
              <p className="text-xs text-gray-500 font-medium mt-1">Invoices</p>
            </div>
          </div>
          
          <div className="w-full max-w-[200px] space-y-4">
            {data.map((item) => (
              <div key={item.name} className="flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: item.color }} />
                  <span className="text-sm font-semibold text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors">
                    {item.name} :
                  </span>
                </div>
                <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bar Charts Section */}
        <div className="lg:col-span-2 space-y-8 lg:border-l lg:border-gray-100 dark:lg:border-gray-800 lg:pl-12">
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">Total Revenue (Last 10 Days)</p>
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-extrabold text-gray-900 dark:text-gray-100">
                    ${activeDay ? activeDay.value.toLocaleString() : (stats.totalRevenue || 0).toLocaleString()}
                  </span>
                  {activeDay && (
                    <span className="text-xs text-indigo-600 font-bold bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-full border border-indigo-100 dark:border-indigo-800">
                      {activeDay.date}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <BarChart data={barData1} onClick={handleBarClick}>
                  <XAxis dataKey="name" hide />
                  <YAxis hide />
                  <Tooltip 
                    cursor={{fill: 'rgba(79, 70, 229, 0.05)'}} 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white dark:bg-gray-800 p-3 border border-gray-100 dark:border-gray-700 rounded-xl shadow-2xl text-xs">
                            <p className="font-bold text-gray-900 dark:text-gray-100 mb-1">{payload[0].payload.date}</p>
                            <p className="text-indigo-600 font-extrabold text-sm">${payload[0].value.toLocaleString()}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar 
                    dataKey="value" 
                    radius={[6, 6, 0, 0]} 
                    barSize={24}
                    isAnimationActive={isLoaded}
                    animationDuration={1000}
                  >
                    {barData1.map((entry, index) => (
                      <BarCell 
                        key={`cell-${index}`} 
                        fill={activeDay?.date === entry.date ? '#4f46e5' : '#c7d2fe'} 
                        className="cursor-pointer transition-all duration-300"
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-100 dark:border-gray-800">
            <div className="flex justify-between items-center mb-6">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">Client Distribution ({activeDay?.date || 'Today'})</p>
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-extrabold text-gray-900 dark:text-gray-100">
                    {barData2.reduce((sum, d) => sum + d.invoiceCount, 0)}
                  </span>
                  <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Total Invoices</span>
                </div>
              </div>
            </div>
            
            <div className="h-32 overflow-y-auto custom-scrollbar pr-2">
              {barData2.length > 0 ? (
                <div className="space-y-3">
                  {barData2.map((client, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-gray-50/50 dark:bg-gray-900/50 border border-transparent hover:border-indigo-500/20 transition-all duration-300">
                      <div className="flex items-center gap-4 w-1/3">
                        <div className="p-2 bg-white dark:bg-gray-800 shadow-sm rounded-lg text-indigo-600">
                          <User size={16} />
                        </div>
                        <span className="text-sm font-bold text-gray-800 dark:text-gray-200 truncate">{client.name}</span>
                      </div>
                      <div className="flex items-center gap-6 flex-1 ml-4">
                        <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full flex-1 overflow-hidden shadow-inner">
                          <div 
                            className="h-full bg-indigo-500 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(79,70,229,0.3)]"
                            style={{ 
                              width: `${(client.invoiceCount / Math.max(...barData2.map(c => c.invoiceCount))) * 100}%`,
                              transitionDelay: `${idx * 100}ms`
                            }}
                          />
                        </div>
                        <span className="text-sm font-extrabold text-indigo-600 w-6 text-right">{client.invoiceCount}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground bg-gray-50/30 dark:bg-gray-900/20 rounded-2xl border-2 border-dashed border-gray-100 dark:border-gray-800">
                   <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">No Activity</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
