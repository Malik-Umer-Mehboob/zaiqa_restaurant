'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import socket from '@/lib/socket';
import OrderStatusTimeline from '@/components/OrderStatusTimeline';

export default function TrackOrderPage({ params }: { params: Promise<{ orderId: string }> }) {
  const unwrappedParams = use(params);
  const orderId = unwrappedParams.orderId;
  
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    const fetchOrder = async () => {
      try {
        const res = await api.get(`/orders/${orderId}`);
        if (res.data.success && mounted) {
          setOrder(res.data.data);
        }
      } catch (err: any) {
        if (mounted) {
          console.error(err);
          setError(err.response?.data?.message || 'Failed to load order. Are you logged in?');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchOrder();

    return () => {
      mounted = false;
    };
  }, [orderId]);

  useEffect(() => {
    // Socket.io connection and event listening
    if (!orderId) return;

    if (!socket.connected) {
      socket.connect();
    }

    // Join the specific room for this order
    socket.emit('join_order_room', orderId);

    const handleStatusUpdate = (data: { status: string }) => {
      setOrder((prev: any) => {
        if (!prev) return prev;
        return { ...prev, status: data.status };
      });
    };

    socket.on('order_status_updated', handleStatusUpdate);

    return () => {
      socket.off('order_status_updated', handleStatusUpdate);
    };
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-96 gap-4">
        <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-b-4 border-turmeric"></div>
        <p className="text-ink/60 font-medium animate-pulse">Fetching your order...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center">
        <div className="p-8 bg-chili/10 border-2 border-chili text-chili rounded-2xl shadow-sm">
          <h2 className="text-3xl font-serif font-bold mb-3">Oops!</h2>
          <p className="font-medium text-lg">{error || 'Order not found'}</p>
        </div>
        <button 
          onClick={() => router.push('/menu')}
          className="mt-8 px-8 py-3 bg-turmeric text-ink rounded-xl font-bold shadow hover:bg-turmeric/90 transition-transform hover:-translate-y-1"
        >
          Back to Menu
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <div className="bg-basmati p-6 md:p-10 rounded-3xl shadow-sm border border-bottle/10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 border-b-2 border-bottle/5 pb-8 gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-bottle mb-2">Track Order</h1>
            <p className="text-ink/60 text-lg">
              Order ID: <span className="font-mono text-sm bg-basmati px-3 py-1.5 rounded-md text-ink ml-2 font-bold">{order.id}</span>
            </p>
          </div>
          <div className="text-left md:text-right">
            <span className="px-5 py-2 bg-turmeric/10 text-turmeric font-bold rounded-full border border-turmeric/20 text-sm tracking-wider uppercase shadow-sm">
              {order.orderType.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Real-time Timeline */}
        <div className="mb-14">
          <OrderStatusTimeline currentStatus={order.status} orderType={order.orderType} />
        </div>

        {/* Order Details */}
        <div className="bg-basmati/40 rounded-2xl p-6 md:p-8 border border-bottle/5 shadow-inner">
          <h3 className="text-2xl font-bold font-serif text-ink mb-6 flex items-center gap-3">
            <svg className="w-6 h-6 text-turmeric" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            Order Summary
          </h3>
          
          <div className="space-y-5 mb-8">
            {order.items.map((item: any) => (
              <div key={item.id} className="flex justify-between items-start p-4 bg-basmati rounded-xl shadow-sm border border-bottle/5 hover:border-turmeric/30 transition-colors">
                <div className="flex gap-4">
                  <span className="font-bold text-bottle bg-turmeric/20 px-3 py-1 rounded-md h-fit text-sm">{item.quantity}x</span>
                  <div>
                    <p className="font-bold text-ink text-lg">{item.menuItem.name}</p>
                    {item.customizations && <p className="text-sm text-ink/60 mt-1">{item.customizations}</p>}
                  </div>
                </div>
                <span className="font-bold text-bottle text-lg">${Number(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          
          <div className="pt-6 border-t-2 border-bottle/5 space-y-3 pl-2 pr-2">
            <div className="flex justify-between text-ink/70 font-medium text-lg">
              <span>Subtotal</span>
              <span>${Number(order.subtotal).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-ink/70 font-medium text-lg">
              <span>Tax (5%)</span>
              <span>${Number(order.tax).toFixed(2)}</span>
            </div>
            {Number(order.deliveryFee) > 0 && (
              <div className="flex justify-between text-ink/70 font-medium text-lg">
                <span>Delivery Fee</span>
                <span>${Number(order.deliveryFee).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between items-center pt-6 mt-4 border-t-2 border-bottle/10 font-bold text-3xl">
              <span className="text-bottle font-serif">Total</span>
              <span className="text-chili">${Number(order.total).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
