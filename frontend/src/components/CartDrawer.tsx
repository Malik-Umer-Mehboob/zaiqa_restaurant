'use client';

import { useCartStore } from '@/store/cartStore';
import Link from 'next/link';
import Image from 'next/image';

export default function CartDrawer() {
  const { items, isOpen, toggleCart, updateQuantity, removeItem, getSubtotal } = useCartStore();
  const subtotal = getSubtotal();

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-ink/60 z-[60] backdrop-blur-sm transition-opacity"
        onClick={() => toggleCart(false)}
      />
      
      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 z-[70] w-full md:w-96 bg-basmati shadow-2xl flex flex-col transform transition-transform duration-300">
        <div className="flex items-center justify-between p-5 border-b border-bottle/10 bg-bottle text-basmati">
          <h2 className="text-2xl font-serif font-bold tracking-wide">Your Cart</h2>
          <button 
            onClick={() => toggleCart(false)}
            className="text-basmati/70 hover:text-turmeric text-3xl leading-none transition-colors"
          >
            &times;
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-basmati/50">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-ink/60">
              <p className="text-xl font-serif mb-2">Your cart is empty.</p>
              <button 
                onClick={() => toggleCart(false)}
                className="mt-2 text-turmeric font-bold hover:underline"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            items.map(item => (
              <div key={item.id} className="flex gap-4 p-4 bg-basmati rounded-xl shadow-sm border border-bottle/5">
                {item.imageUrl ? (
                  <Image src={item.imageUrl} alt={item.name} width={96} height={96} className="w-24 h-24 object-cover rounded-lg" />
                ) : (
                  <div className="w-24 h-24 bg-basmati/50 rounded-lg flex items-center justify-center text-xs text-bottle/50 text-center p-1">No Image</div>
                )}
                
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="font-bold text-ink leading-tight">{item.name}</h4>
                      <button 
                        onClick={() => removeItem(item.id)}
                        className="text-chili/80 hover:text-chili text-sm font-medium shrink-0"
                      >
                        Remove
                      </button>
                    </div>
                    {item.customizations && (
                      <p className="text-xs text-ink/60 mt-1.5">{item.customizations}</p>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center border border-bottle/20 rounded-lg overflow-hidden bg-basmati">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="px-3 py-1 text-ink hover:bg-turmeric/20 transition-colors"
                      >
                        -
                      </button>
                      <span className="px-3 py-1 font-semibold text-sm border-x border-bottle/10">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="px-3 py-1 text-ink hover:bg-turmeric/20 transition-colors"
                      >
                        +
                      </button>
                    </div>
                    <span className="font-bold text-chili">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="p-6 border-t border-bottle/10 bg-basmati shadow-[0_-4px_6px_-1px_rgb(0,0,0,0.05)]">
            <div className="flex justify-between items-center mb-6 text-xl font-bold">
              <span className="text-ink">Subtotal:</span>
              <span className="text-chili">${subtotal.toFixed(2)}</span>
            </div>
            <Link 
              href="/checkout" 
              onClick={() => toggleCart(false)}
              className="block w-full text-center py-4 bg-turmeric text-ink font-bold text-lg rounded-xl hover:bg-turmeric/90 transition-all shadow-md hover:-translate-y-0.5"
            >
              Proceed to Checkout
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
