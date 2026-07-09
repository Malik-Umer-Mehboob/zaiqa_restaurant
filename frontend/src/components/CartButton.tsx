'use client';

import { useEffect, useState } from 'react';
import { useCartStore } from '@/store/cartStore';

export default function CartButton() {
  const { items, toggleCart } = useCartStore();
  
  // Handle hydration mismatch - Zustand state from local storage may differ from server render
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const itemCount = items.reduce((total, item) => total + item.quantity, 0);

  return (
    <button 
      onClick={() => toggleCart(true)}
      className="relative hover:text-turmeric transition-colors duration-200 font-bold"
    >
      Cart
      {mounted && itemCount > 0 && (
        <span className="absolute -top-3 -right-4 bg-chili text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-sm animate-in zoom-in">
          {itemCount}
        </span>
      )}
    </button>
  );
}
