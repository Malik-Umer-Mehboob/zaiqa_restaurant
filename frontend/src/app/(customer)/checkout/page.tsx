'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCartStore } from '@/store/cartStore';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';
import { AxiosError } from 'axios';

const checkoutSchema = z.object({
  orderType: z.enum(['DINE_IN', 'TAKEAWAY', 'DELIVERY']),
  deliveryAddress: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.orderType === 'DELIVERY' && (!data.deliveryAddress || data.deliveryAddress.trim() === '')) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Delivery address is required for delivery orders',
      path: ['deliveryAddress'],
    });
  }
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getSubtotal, clearCart } = useCartStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const subtotal = getSubtotal();
  const tax = subtotal * 0.05;

  const { register, handleSubmit, watch, formState: { errors } } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      orderType: 'TAKEAWAY',
    }
  });

  const orderType = watch('orderType');
  const deliveryFee = orderType === 'DELIVERY' ? 5.00 : 0.00;
  const total = subtotal + tax + deliveryFee;

  // Protect empty cart
  useEffect(() => {
    if (mounted && items.length === 0) {
      router.push('/menu');
    }
  }, [items, router, mounted]);

  if (!mounted || items.length === 0) return null; // Avoid rendering if empty and redirecting

  const onSubmit = async (data: CheckoutFormValues) => {
    setIsSubmitting(true);

    try {
      // Step 1: Create order record in our DB (status: PLACED)
      const formattedItems = items.map(item => ({
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        customizations: item.customizations || ''
      }));

      const orderRes = await api.post('/orders', {
        orderType: data.orderType,
        deliveryAddress: data.deliveryAddress,
        items: formattedItems,
      });

      if (!orderRes.data.success) {
        toast.error(orderRes.data.message || 'Failed to create order');
        return;
      }

      const orderId = orderRes.data.data.id;

      // Step 2: Create Stripe Checkout Session for this order
      const sessionRes = await api.post('/payments/create-checkout-session', { orderId });

      if (!sessionRes.data.success) {
        toast.error(sessionRes.data.message || 'Failed to initiate payment');
        return;
      }

      // Step 3: Clear cart and redirect to Stripe hosted checkout page
      clearCart();
      window.location.href = sessionRes.data.data.url;

    } catch (err: unknown) {
      console.error(err);
      let message = 'Failed to place order. Please ensure you are logged in.';
      if (err instanceof AxiosError) {
        message = err.response?.data?.message || message;
      }
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <h1 className="text-4xl md:text-5xl font-serif font-bold text-bottle mb-10">Secure Checkout</h1>

      <div className="flex flex-col lg:flex-row gap-10">
        <div className="flex-1">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 bg-basmati p-8 rounded-2xl shadow-sm border border-bottle/10">
            
            <div>
              <h2 className="text-2xl font-serif font-bold text-ink mb-5">How would you like to receive your food?</h2>
              <div className="flex flex-col sm:flex-row gap-4">
                {['DINE_IN', 'TAKEAWAY', 'DELIVERY'].map((type) => (
                  <label key={type} className={`flex-1 flex items-center p-5 border-2 rounded-xl cursor-pointer transition-all ${orderType === type ? 'border-turmeric bg-turmeric/5 shadow-sm' : 'border-bottle/10 hover:border-turmeric/30 hover:bg-bottle/5'}`}>
                    <input 
                      type="radio" 
                      value={type} 
                      {...register('orderType')}
                      className="hidden" 
                    />
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3 shrink-0 transition-colors ${orderType === type ? 'border-turmeric' : 'border-bottle/30'}`}>
                      {orderType === type && <div className="w-2.5 h-2.5 bg-turmeric rounded-full animate-in zoom-in"></div>}
                    </div>
                    <span className="font-bold text-ink tracking-wide">{type.replace('_', ' ')}</span>
                  </label>
                ))}
              </div>
              {errors.orderType && <p className="text-chili text-sm mt-2 font-medium">{errors.orderType.message}</p>}
            </div>

            {orderType === 'DELIVERY' && (
              <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                <h2 className="text-2xl font-serif font-bold text-ink mb-5">Delivery Details</h2>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-ink/80 tracking-wide uppercase">Full Address</label>
                  <textarea 
                    {...register('deliveryAddress')}
                    placeholder="Enter your complete delivery address (Building, Street, Area)..."
                    className="w-full p-4 border-2 border-bottle/10 rounded-xl focus:outline-none focus:border-turmeric focus:ring-4 focus:ring-turmeric/10 bg-basmati/30 text-ink transition-all resize-none"
                    rows={4}
                  />
                  {errors.deliveryAddress && <p className="text-chili text-sm font-medium">{errors.deliveryAddress.message}</p>}
                </div>
              </div>
            )}

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full py-5 mt-4 bg-turmeric text-ink font-bold text-xl rounded-xl hover:bg-turmeric/90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0 disabled:cursor-not-allowed flex justify-center items-center gap-3"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-6 w-6 text-ink" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                  </svg>
                  <span>Redirecting to Payment...</span>
                </>
              ) : (
                <>
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span>Place Order & Pay Securely</span>
                </>
              )}
            </button>
            <p className="text-center text-sm text-ink/50 mt-3 font-medium">You will be redirected to Stripe&apos;s secure checkout. Test card: <span className="font-mono font-bold text-bottle">4242 4242 4242 4242</span></p>
          </form>
        </div>

        {/* Order Summary Sidebar */}
        <div className="w-full lg:w-96 shrink-0">
          <div className="bg-basmati p-7 rounded-2xl shadow-sm border border-bottle/10 sticky top-8">
            <h2 className="text-2xl font-serif font-bold text-ink mb-6 pb-4 border-b border-bottle/10">Order Summary</h2>
            
            <div className="space-y-5 mb-8 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
              {items.map(item => (
                <div key={item.id} className="flex justify-between items-start">
                  <div className="flex gap-3">
                    <span className="font-bold text-turmeric bg-turmeric/10 px-2 py-0.5 rounded text-sm h-fit">{item.quantity}x</span>
                    <div>
                      <p className="font-bold text-ink">{item.name}</p>
                      {item.customizations && <p className="text-xs text-ink/60 mt-1">{item.customizations}</p>}
                    </div>
                  </div>
                  <span className="font-bold text-bottle">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="space-y-4 pt-6 border-t border-bottle/10 text-base">
              <div className="flex justify-between">
                <span className="text-ink/70 font-medium">Subtotal</span>
                <span className="font-bold text-ink">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink/70 font-medium">Tax (5%)</span>
                <span className="font-bold text-ink">${tax.toFixed(2)}</span>
              </div>
              {orderType === 'DELIVERY' && (
                <div className="flex justify-between animate-in fade-in">
                  <span className="text-ink/70 font-medium">Delivery Fee</span>
                  <span className="font-bold text-ink">${deliveryFee.toFixed(2)}</span>
                </div>
              )}
            </div>
            
            <div className="flex justify-between items-center mt-6 pt-6 border-t-2 border-bottle/10 text-2xl font-bold">
              <span className="text-bottle font-serif">Total</span>
              <span className="text-chili">${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
