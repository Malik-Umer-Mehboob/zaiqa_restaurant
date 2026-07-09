'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { TrendingUp, ShoppingBag, Utensils, DollarSign } from 'lucide-react';

const COLORS = ['#D9A441', '#A83B2C', '#24402F', '#211D18'];

export default function AdminDashboard() {
  const [salesData, setSalesData] = useState([]);
  const [topItems, setTopItems] = useState<any[]>([]);
  const [orderDistribution, setOrderDistribution] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [salesRes, itemsRes, distRes] = await Promise.all([
          api.get('/admin/analytics/sales?range=weekly'),
          api.get('/admin/analytics/top-items'),
          api.get('/admin/analytics/order-distribution')
        ]);
        
        if (salesRes.data.success) setSalesData(salesRes.data.data);
        if (itemsRes.data.success) setTopItems(itemsRes.data.data);
        if (distRes.data.success) setOrderDistribution(distRes.data.data);
      } catch (err) {
        console.error('Failed to load analytics', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-turmeric"></div>
      </div>
    );
  }

  const totalSales = salesData.reduce((acc, curr: any) => acc + Number(curr.total), 0);

  return (
    <div className="p-4 sm:p-8 md:p-12 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-bottle">Dashboard Overview</h1>
        <p className="text-ink/60 mt-2 font-medium">Welcome back to the Zaiqa Admin Panel. Here's what's happening today.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <div className="bg-basmati p-6 rounded-2xl shadow-sm border border-bottle/10 flex items-center gap-5 hover:shadow-md transition-shadow">
          <div className="p-4 bg-turmeric/10 text-turmeric rounded-xl border border-turmeric/20"><DollarSign size={32} /></div>
          <div>
            <p className="text-xs font-bold text-ink/50 uppercase tracking-widest mb-1">Weekly Revenue</p>
            <h3 className="text-3xl font-bold text-ink">${totalSales.toFixed(2)}</h3>
          </div>
        </div>
        
        <div className="bg-basmati p-6 rounded-2xl shadow-sm border border-bottle/10 flex items-center gap-5 hover:shadow-md transition-shadow">
          <div className="p-4 bg-bottle/10 text-bottle rounded-xl border border-bottle/20"><ShoppingBag size={32} /></div>
          <div>
            <p className="text-xs font-bold text-ink/50 uppercase tracking-widest mb-1">Top Selling Item</p>
            <h3 className="text-xl font-bold text-ink truncate w-48 leading-tight">{topItems[0]?.menuItem?.name || 'No data'}</h3>
            <p className="text-sm text-turmeric font-bold">{topItems[0]?._count?.id || 0} Orders</p>
          </div>
        </div>
        
        <div className="bg-basmati p-6 rounded-2xl shadow-sm border border-bottle/10 flex items-center gap-5 hover:shadow-md transition-shadow">
          <div className="p-4 bg-chili/10 text-chili rounded-xl border border-chili/20"><Utensils size={32} /></div>
          <div>
            <p className="text-xs font-bold text-ink/50 uppercase tracking-widest mb-1">System Status</p>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <h3 className="text-2xl font-bold text-ink">Online</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Sales Chart */}
        <div className="bg-basmati p-8 rounded-2xl shadow-sm border border-bottle/10 flex flex-col">
          <div className="flex items-center gap-3 mb-8">
            <TrendingUp className="text-turmeric" />
            <h2 className="text-xl font-bold text-ink">Sales Trend (Last 7 Days)</h2>
          </div>
          <div className="h-80 w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12, fontWeight: 500}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12, fontWeight: 500}} tickFormatter={(val) => `$${val}`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} 
                  itemStyle={{ fontWeight: 'bold' }}
                />
                <Line type="monotone" dataKey="total" name="Revenue" stroke="#D9A441" strokeWidth={4} dot={{r: 5, strokeWidth: 2, fill: '#fff'}} activeDot={{r: 8, stroke: '#D9A441', strokeWidth: 2}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Order Distribution Pie Chart */}
        <div className="bg-basmati p-8 rounded-2xl shadow-sm border border-bottle/10 flex flex-col">
          <h2 className="text-xl font-bold text-ink mb-8">Order Distribution by Type</h2>
          <div className="h-80 flex-1 flex items-center justify-center">
            {orderDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={orderDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={90}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="_count.id"
                    nameKey="orderType"
                    stroke="none"
                  >
                    {orderDistribution.map((entry: any, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [`${value} Orders`, 'Count']} 
                    contentStyle={{ borderRadius: '8px', border: 'none', fontWeight: 'bold' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontWeight: 600, fontSize: '14px', color: '#211D18' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-ink/50 font-medium">No order data available yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Top Items Bar Chart */}
      <div className="bg-basmati p-8 rounded-2xl shadow-sm border border-bottle/10 mb-10">
        <h2 className="text-xl font-bold text-ink mb-8">Top 5 Performing Items</h2>
        <div className="h-96">
          {topItems.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topItems} layout="vertical" margin={{ left: 100, right: 30, top: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e5e7eb" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontWeight: 500}} />
                <YAxis dataKey="menuItem.name" type="category" axisLine={false} tickLine={false} tick={{fill: '#211D18', fontWeight: 600, fontSize: 13}} width={140} />
                <Tooltip cursor={{fill: '#f3f4f6'}} contentStyle={{ borderRadius: '8px', border: 'none', fontWeight: 'bold' }} />
                <Bar dataKey="_count.id" name="Total Orders" fill="#24402F" radius={[0, 6, 6, 0]} barSize={35}>
                  {topItems.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#D9A441' : '#24402F'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center"><p className="text-ink/50 font-medium">No item data available yet.</p></div>
          )}
        </div>
      </div>
    </div>
  );
}
