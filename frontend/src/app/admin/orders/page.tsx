'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import socket from '@/lib/socket';
import { toast } from 'react-hot-toast';

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchOrders = async () => {
    try {
      const url = statusFilter ? `/orders?status=${statusFilter}` : '/orders';
      const res = await api.get(url);
      if (res.data.success) {
        setOrders(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    // Setup polling as a robust fallback for new orders coming in
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, [statusFilter]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      // Optimistic UI update
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      
      // Send the update to backend. 
      // The backend will emit to the customer's socket room automatically.
      await api.patch(`/orders/${orderId}/status`, { status: newStatus });
      toast.success("Order status updated successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update order status");
      fetchOrders(); // Revert on failure
    }
  };

  const statusOptions = ['PLACED', 'CONFIRMED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY', 'COMPLETED', 'CANCELLED'];

  return (
    <div className="p-4 sm:p-8 md:p-12 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-serif font-bold text-bottle">Live Orders</h1>
          <p className="text-ink/60 mt-1 font-medium">Manage and track incoming orders in real-time.</p>
        </div>
        
        <div className="relative">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="appearance-none bg-basmati py-3 pl-5 pr-12 border-2 border-bottle/10 rounded-xl focus:outline-none focus:border-turmeric focus:ring-4 focus:ring-turmeric/10 font-bold text-ink shadow-sm cursor-pointer"
          >
            <option value="">All Statuses</option>
            {statusOptions.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
          </select>
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none text-bottle/50">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      <div className="bg-basmati rounded-2xl shadow-sm border border-bottle/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap min-w-[900px]">
            <thead>
              <tr className="bg-basmati/40 text-ink/70 uppercase text-xs tracking-widest border-b-2 border-bottle/10">
                <th className="p-5 font-bold">Order ID</th>
                <th className="p-5 font-bold">Type</th>
                <th className="p-5 font-bold min-w-[250px]">Items</th>
                <th className="p-5 font-bold">Total</th>
                <th className="p-5 font-bold">Time</th>
                <th className="p-5 font-bold text-right pr-8">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bottle/5">
              {loading && orders.length === 0 ? (
                <tr><td colSpan={6} className="p-16 text-center text-ink/60 font-medium text-lg">Loading orders...</td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={6} className="p-16 text-center text-ink/60 font-medium text-lg">No orders found.</td></tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-basmati/30 transition-colors">
                    <td className="p-5 font-mono text-sm font-semibold bg-basmati/10">#{order.id.slice(0,8)}</td>
                    <td className="p-5">
                      <span className={`px-3 py-1.5 text-xs font-bold rounded-lg border ${
                        order.orderType === 'DELIVERY' ? 'bg-turmeric/10 text-turmeric border-turmeric/20' : 
                        'bg-bottle/10 text-bottle border-bottle/20'
                      }`}>
                        {order.orderType.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-5 text-sm text-ink/80 max-w-[300px] truncate whitespace-normal">
                      <div className="font-semibold line-clamp-2">
                        {order.items.map((i:any) => `${i.quantity}x ${i.menuItem.name}`).join(', ')}
                      </div>
                    </td>
                    <td className="p-5 font-bold text-chili text-lg">${Number(order.total).toFixed(2)}</td>
                    <td className="p-5 text-sm font-medium text-ink/70">
                      {new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </td>
                    <td className="p-5 text-right">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className={`p-2.5 rounded-xl text-sm font-bold border-2 cursor-pointer outline-none transition-all focus:ring-4
                          ${order.status === 'COMPLETED' ? 'bg-bottle text-basmati border-bottle focus:ring-bottle/20' : ''}
                          ${order.status === 'CANCELLED' ? 'bg-chili text-white border-chili focus:ring-chili/20' : ''}
                          ${order.status === 'PLACED' ? 'bg-basmati text-ink border-bottle/20 hover:border-bottle/40 focus:ring-bottle/10' : ''}
                          ${!['COMPLETED', 'CANCELLED', 'PLACED'].includes(order.status) ? 'bg-turmeric/10 border-turmeric/50 text-bottle hover:bg-turmeric/20 focus:ring-turmeric/20' : ''}
                        `}
                      >
                        {statusOptions.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
