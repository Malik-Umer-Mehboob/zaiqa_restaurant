'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Package, ArrowRight, ShoppingBag } from 'lucide-react';

interface Order {
  id: string;
  createdAt: string;
  orderType: 'DINE_IN' | 'TAKEAWAY' | 'DELIVERY';
  total: number;
  status: 'PLACED' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'COMPLETED' | 'CANCELLED';
}

const STATUS_CONFIG: Record<Order['status'], { label: string; classes: string }> = {
  PLACED:            { label: 'Order Placed',      classes: 'bg-blue-100 text-blue-700' },
  CONFIRMED:         { label: 'Confirmed',          classes: 'bg-indigo-100 text-indigo-700' },
  PREPARING:         { label: 'Preparing',          classes: 'bg-turmeric/20 text-amber-700' },
  READY:             { label: 'Ready',              classes: 'bg-cyan-100 text-cyan-700' },
  OUT_FOR_DELIVERY:  { label: 'Out for Delivery',   classes: 'bg-orange-100 text-orange-700' },
  DELIVERED:         { label: 'Delivered',          classes: 'bg-bottle/20 text-bottle' },
  COMPLETED:         { label: 'Completed',          classes: 'bg-bottle/20 text-bottle' },
  CANCELLED:         { label: 'Cancelled',          classes: 'bg-red-100 text-red-600' },
};

const ORDER_TYPE_LABEL: Record<Order['orderType'], string> = {
  DINE_IN:  'Dine-in',
  TAKEAWAY: 'Takeaway',
  DELIVERY: 'Delivery',
};

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchOrders = async () => {
      try {
        const res = await api.get('/orders/my-orders');
        if (res.data.success) {
          // Sort newest first
          const sorted = [...res.data.data].sort(
            (a: Order, b: Order) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          setOrders(sorted);
        }
      } catch (err) {
        console.error(err);
        toast.error('Failed to load orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [router]);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-PK', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

  const shortId = (id: string) => id.slice(0, 8).toUpperCase();

  if (loading) {
    return (
      <div className="min-h-screen bg-basmati flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-turmeric border-t-transparent rounded-full animate-spin" />
          <p className="text-bottle/60 font-medium">Loading your orders…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-basmati text-ink">
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-12">

        {/* Header */}
        <div className="mb-10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-turmeric/20 flex items-center justify-center">
            <Package size={24} className="text-turmeric" />
          </div>
          <div>
            <h1 className="text-3xl font-serif font-bold">My Orders</h1>
            <p className="text-bottle/60 text-sm mt-0.5">Track and view all your past orders</p>
          </div>
        </div>

        {/* Empty State */}
        {orders.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-bottle/10">
            <div className="w-20 h-20 bg-turmeric/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag size={36} className="text-turmeric" />
            </div>
            <h2 className="text-2xl font-serif font-bold mb-2">No orders yet</h2>
            <p className="text-bottle/60 mb-8 max-w-sm mx-auto">
              Start exploring our menu and place your first order!
            </p>
            <Link
              href="/menu"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-turmeric text-ink font-bold text-sm uppercase tracking-wider rounded-xl shadow-md hover:bg-turmeric/90 hover:shadow-lg transition-all hover:-translate-y-0.5"
            >
              Explore Menu
              <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {orders.map((order) => {
              const statusCfg = STATUS_CONFIG[order.status] ?? { label: order.status, classes: 'bg-gray-100 text-gray-600' };
              return (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-bottle/10 hover:shadow-md hover:border-turmeric/30 transition-all group"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="font-mono font-bold text-bottle/60 text-sm tracking-widest">
                          #{shortId(order.id)}
                        </span>
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${statusCfg.classes}`}>
                          {statusCfg.label}
                        </span>
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-basmati text-bottle/70 border border-bottle/10">
                          {ORDER_TYPE_LABEL[order.orderType]}
                        </span>
                      </div>
                      <p className="text-bottle/50 text-xs mt-1">{formatDate(order.createdAt)}</p>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <span className="text-xl font-bold font-serif text-ink">
                        Rs. {Number(order.total).toFixed(0)}
                      </span>
                      <Link
                        href={`/track/${order.id}`}
                        className="flex items-center gap-1.5 text-sm font-bold text-turmeric hover:text-turmeric/80 transition-colors group-hover:gap-2.5"
                      >
                        View Details
                        <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
