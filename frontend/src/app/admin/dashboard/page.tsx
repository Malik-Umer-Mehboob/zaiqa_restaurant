'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import type { SalesDataPoint, TopItem, OrderDistributionItem } from '@/types';
import {
  AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { TrendingUp, ShoppingBag, Utensils, DollarSign, UtensilsCrossed, Award } from 'lucide-react';
import { motion } from 'framer-motion';

// Per-segment colors: DINE_IN=bottle, TAKEAWAY=turmeric, DELIVERY=chili, fallback=ink
const PIE_COLORS: Record<string, string> = {
  DINE_IN:  '#24402F',
  TAKEAWAY: '#D9A441',
  DELIVERY: '#A83B2C',
};
const PIE_FALLBACK = ['#D9A441', '#A83B2C', '#24402F', '#211D18'];

const TYPE_LABEL: Record<string, string> = {
  DINE_IN:  'Dine-in',
  TAKEAWAY: 'Takeaway',
  DELIVERY: 'Delivery',
};

// Format "2026-07-13" → "Jul 13"
function fmtDate(raw: string) {
  const d = new Date(raw + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Custom tooltip for sales area chart
function SalesTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-bottle/10 rounded-xl px-4 py-3 shadow-lg">
      <p className="text-xs font-bold text-bottle/50 mb-1">{label}</p>
      <p className="text-lg font-bold text-ink">Rs. {Number(payload[0].value).toFixed(0)}</p>
    </div>
  );
}

// Custom tooltip for pie chart
function PieTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const entry = payload[0];
  return (
    <div className="bg-white border border-bottle/10 rounded-xl px-4 py-3 shadow-lg">
      <p className="text-sm font-bold text-ink">{TYPE_LABEL[entry.name] ?? entry.name}</p>
      <p className="text-base font-bold text-turmeric">{entry.value} Orders</p>
    </div>
  );
}

export default function AdminDashboard() {
  const [salesData, setSalesData] = useState<SalesDataPoint[]>([]);
  const [topItems, setTopItems] = useState<TopItem[]>([]);
  const [orderDistribution, setOrderDistribution] = useState<OrderDistributionItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [salesRes, itemsRes, distRes] = await Promise.all([
          api.get('/admin/analytics/sales?range=weekly'),
          api.get('/admin/analytics/top-items'),
          api.get('/admin/analytics/order-distribution'),
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
      <div className="flex h-full items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-turmeric" />
      </div>
    );
  }

  const totalSales = salesData.reduce((acc, curr) => acc + Number(curr.total), 0);
  const totalOrders = orderDistribution.reduce((acc, curr) => acc + (curr.value ?? 0), 0);

  // Format sales data for chart — make sure dates are short
  const chartSalesData = salesData.map(d => ({
    ...d,
    total: Number(d.total),
    label: fmtDate(d.date),
  }));

  return (
    <div className="p-4 sm:p-8 md:p-12 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-bottle">Dashboard Overview</h1>
        <p className="text-ink/60 mt-2 font-medium">Welcome back to the Zaiqa Admin Panel. Here&apos;s what&apos;s happening today.</p>
      </div>

      {/* ── Stat Cards ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <div className="bg-basmati p-6 rounded-2xl shadow-sm border border-bottle/10 flex items-center gap-5 hover:shadow-md transition-shadow">
          <div className="p-4 bg-turmeric/10 text-turmeric rounded-xl border border-turmeric/20"><DollarSign size={32} /></div>
          <div>
            <p className="text-xs font-bold text-ink/50 uppercase tracking-widest mb-1">Weekly Revenue</p>
            <h3 className="text-3xl font-bold text-ink">Rs. {totalSales.toFixed(0)}</h3>
          </div>
        </div>

        <div className="bg-basmati p-6 rounded-2xl shadow-sm border border-bottle/10 flex items-center gap-5 hover:shadow-md transition-shadow">
          <div className="p-4 bg-bottle/10 text-bottle rounded-xl border border-bottle/20"><ShoppingBag size={32} /></div>
          <div>
            <p className="text-xs font-bold text-ink/50 uppercase tracking-widest mb-1">Top Selling Item</p>
            <h3 className="text-xl font-bold text-ink truncate w-48 leading-tight">{topItems[0]?.name || 'No data'}</h3>
            <p className="text-sm text-turmeric font-bold">{topItems[0]?.totalSold || 0} Orders</p>
          </div>
        </div>

        <div className="bg-basmati p-6 rounded-2xl shadow-sm border border-bottle/10 flex items-center gap-5 hover:shadow-md transition-shadow">
          <div className="p-4 bg-chili/10 text-chili rounded-xl border border-chili/20"><Utensils size={32} /></div>
          <div>
            <p className="text-xs font-bold text-ink/50 uppercase tracking-widest mb-1">System Status</p>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              <h3 className="text-2xl font-bold text-ink">Online</h3>
            </div>
          </div>
        </div>
      </div>

      {/* ── Charts Row ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">

        {/* Sales Area Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-bottle/10 p-6 md:p-8 flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="text-turmeric" size={20} />
            <h2 className="text-lg font-bold text-ink">Sales Trend (Last 7 Days)</h2>
          </div>

          {chartSalesData.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 py-10">
              <TrendingUp size={36} className="text-bottle/20" />
              <p className="text-bottle/40 font-medium text-sm text-center">No sales data yet.<br />Complete some orders to see the trend.</p>
            </div>
          ) : (
            <div className="h-[200px] md:h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartSalesData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="turmericGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#D9A441" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#D9A441" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0ece4" />
                  <XAxis
                    dataKey="label"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6b7280', fontSize: 11, fontWeight: 500 }}
                    dy={8}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6b7280', fontSize: 11, fontWeight: 500 }}
                    tickFormatter={(v) => `Rs.${v}`}
                    width={56}
                  />
                  <Tooltip content={<SalesTooltip />} cursor={{ stroke: '#D9A441', strokeWidth: 1.5, strokeDasharray: '4 4' }} />
                  <Area
                    type="monotone"
                    dataKey="total"
                    name="Revenue"
                    stroke="#D9A441"
                    strokeWidth={3}
                    fill="url(#turmericGrad)"
                    dot={{ r: 4, fill: '#D9A441', stroke: '#fff', strokeWidth: 2 }}
                    activeDot={{ r: 7, stroke: '#D9A441', strokeWidth: 2, fill: '#fff' }}
                    connectNulls
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Order Distribution Donut Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-bottle/10 p-6 md:p-8 flex flex-col">
          <h2 className="text-lg font-bold text-ink mb-6">Order Distribution by Type</h2>

          {orderDistribution.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 py-10">
              <ShoppingBag size={36} className="text-bottle/20" />
              <p className="text-bottle/40 font-medium text-sm text-center">No orders yet.<br />Order data will appear here once customers start ordering.</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-6">
              {/* Donut */}
              <div className="relative h-[200px] md:h-[240px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={orderDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={100}
                      paddingAngle={3}
                      dataKey="value"
                      nameKey="name"
                      stroke="none"
                    >
                      {orderDistribution.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={PIE_COLORS[entry.name] ?? PIE_FALLBACK[index % PIE_FALLBACK.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<PieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>

                {/* Center total */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-3xl font-black text-ink leading-none">{totalOrders}</span>
                  <span className="text-xs font-semibold text-bottle/50 uppercase tracking-widest mt-1">Total</span>
                </div>
              </div>

              {/* Custom legend */}
              <div className="flex flex-wrap justify-center gap-3">
                {orderDistribution.map((entry, index) => {
                  const color = PIE_COLORS[entry.name] ?? PIE_FALLBACK[index % PIE_FALLBACK.length];
                  const pct = totalOrders > 0 ? Math.round((entry.value / totalOrders) * 100) : 0;
                  return (
                    <div key={entry.name} className="flex items-center gap-2 bg-basmati rounded-lg px-3 py-2">
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: color }} />
                      <span className="text-xs font-semibold text-ink">{TYPE_LABEL[entry.name] ?? entry.name}</span>
                      <span className="text-xs font-bold text-bottle/60">{entry.value} <span className="text-bottle/40">({pct}%)</span></span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Top 5 Performing Items ───────────────────────────────── */}
      <div className="bg-basmati p-8 rounded-2xl shadow-sm border border-bottle/10 mb-10">
        <div className="flex items-center gap-3 mb-8">
          <Award className="text-turmeric" size={22} />
          <h2 className="text-xl font-bold text-ink">Top 5 Performing Items</h2>
        </div>

        {topItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 gap-4">
            <div className="w-16 h-16 rounded-2xl bg-turmeric/10 flex items-center justify-center">
              <TrendingUp size={30} className="text-turmeric/60" />
            </div>
            <p className="text-ink/50 font-medium text-center max-w-xs">
              No sales data yet. Once customers start ordering, your top items will show up here.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {topItems.map((item, index) => {
              const maxSold = topItems[0]?.totalSold ?? 1;
              const barPct = Math.round(((item.totalSold ?? 0) / maxSold) * 100);
              const rankColors = ['text-turmeric', 'text-bottle', 'text-ink/50', 'text-ink/40', 'text-ink/30'];

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.08, duration: 0.4, ease: 'easeOut' }}
                  className="flex items-center gap-5 bg-white rounded-2xl px-5 py-4 border border-bottle/10 hover:shadow-md transition-shadow group"
                >
                  {/* Rank */}
                  <span className={`text-2xl font-black font-serif w-8 shrink-0 ${rankColors[index] ?? 'text-ink/30'}`}>
                    #{index + 1}
                  </span>

                  {/* Thumbnail */}
                  <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-bottle/10 bg-basmati flex items-center justify-center">
                    {item.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <UtensilsCrossed size={20} className="text-bottle/30" />
                    )}
                  </div>

                  {/* Name + orders + bar */}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-ink text-sm truncate">{item.name}</p>
                    <p className="text-xs text-bottle/60 font-medium mb-2">{item.totalSold} orders</p>
                    <div className="w-full h-1.5 bg-basmati rounded-full overflow-hidden border border-bottle/10">
                      <motion.div
                        className="h-full bg-turmeric rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${barPct}%` }}
                        transition={{ delay: index * 0.08 + 0.2, duration: 0.6, ease: 'easeOut' }}
                      />
                    </div>
                  </div>

                  {/* Revenue */}
                  <div className="shrink-0 text-right">
                    <p className="text-xs text-bottle/50 font-medium">Revenue</p>
                    <p className="font-bold text-ink text-sm">Rs. {item.revenue.toFixed(0)}</p>
                  </div>
                </motion.div>
              );
            })}

            {topItems.length === 1 && (
              <p className="text-center text-xs text-bottle/40 font-medium pt-2">
                More items will appear here as orders come in
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
