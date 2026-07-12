'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';
import { AxiosError } from 'axios';
import type { Order, OrderItem } from '@/types';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(!!orderId);
  const [error, setError] = useState(orderId ? '' : 'Order information missing.');

  useEffect(() => {
    if (!orderId) return;

    const fetchOrder = async () => {
      try {
        const res = await api.get(`/orders/${orderId}`);
        if (res.data.success) {
          setOrder(res.data.data);
          toast.success("Order placed successfully!");
        } else {
          setError(res.data.message || 'Could not fetch order details.');
        }
      } catch (err: unknown) {
        let message = 'Could not fetch order details.';
        if (err instanceof AxiosError) {
          message = err.response?.data?.message || message;
        }
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-80 gap-4">
        <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-b-4 border-turmeric"></div>
        <p className="text-ink/60 font-medium animate-pulse">Loading your order confirmation...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-16 px-4 text-center animate-in fade-in zoom-in duration-500">
      <div className="bg-basmati p-12 rounded-3xl shadow-lg border border-bottle/10">
        {/* Animated Success Icon */}
        <div className="relative w-28 h-28 mx-auto mb-10">
          <div className="absolute inset-0 rounded-full bg-bottle/10 animate-ping opacity-40"></div>
          <div className="relative w-28 h-28 bg-bottle rounded-full flex items-center justify-center shadow-xl">
            <svg className="w-14 h-14 text-turmeric" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        <h1 className="text-4xl md:text-5xl font-serif font-bold text-bottle mb-4">Payment Successful!</h1>
        <p className="text-ink/70 text-lg mb-10 leading-relaxed">
          Thank you for your order! Your payment has been confirmed and our kitchen has been notified. Sit back and relax.
        </p>

        {error ? (
          <div className="p-4 bg-chili/10 text-chili border border-chili/20 rounded-xl mb-8 font-medium">{error}</div>
        ) : order ? (
          <div className="bg-basmati/50 rounded-2xl p-6 mb-10 text-left border border-bottle/5">
            <div className="flex justify-between items-center mb-5 pb-4 border-b border-bottle/10">
              <div>
                <p className="text-xs uppercase tracking-widest text-ink/50 font-bold">Order ID</p>
                <p className="font-mono font-bold text-ink">{order.id.slice(0,12)}...</p>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase tracking-widest text-ink/50 font-bold">Order Type</p>
                <span className="px-3 py-1 bg-turmeric/10 text-turmeric border border-turmeric/20 rounded-full font-bold text-sm">
                  {order.orderType.replace('_', ' ')}
                </span>
              </div>
            </div>
            <div className="space-y-3 mb-5">
              {order.items?.map((item: OrderItem) => (
                <div key={item.id} className="flex justify-between items-center">
                  <span className="font-medium text-ink">
                    <span className="font-bold text-turmeric">{item.quantity}x</span> {item.menuItem.name}
                  </span>
                  <span className="font-bold text-bottle">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="pt-4 border-t border-bottle/10 flex justify-between text-xl font-bold">
              <span className="text-bottle font-serif">Total Paid</span>
              <span className="text-chili">${Number(order.total).toFixed(2)}</span>
            </div>
          </div>
        ) : null}

        <Link
          href={`/track/${orderId}`}
          className="block w-full py-4 bg-turmeric text-ink font-bold text-xl rounded-xl hover:bg-turmeric/90 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 mb-4"
        >
          Track Your Order Live →
        </Link>
        <Link href="/menu" className="block text-ink/50 hover:text-bottle font-medium transition-colors">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center h-80">
        <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-b-4 border-turmeric"></div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}
