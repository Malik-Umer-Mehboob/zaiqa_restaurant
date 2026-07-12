'use client';

import React from 'react';
import { useCartStore } from '@/store/cartStore';
import { toast } from 'react-hot-toast';
import type { MenuItem } from '@/types';

export default function MenuCard({ item }: { item: MenuItem }) {
  const { addItem, toggleCart } = useCartStore();

  const handleAddToCart = () => {
    addItem({
      menuItemId: item.id,
      name: item.name,
      price: Number(item.price),
      quantity: 1,
      imageUrl: item.imageUrl,
    });
    toast.success("Added to cart");
    toggleCart(true); // Open the drawer immediately to show success
  };

  return (
    <div className="bg-basmati rounded-xl shadow-sm hover:shadow-xl overflow-hidden flex flex-col border border-bottle/10 transition-all duration-200 hover:-translate-y-1">
      <div className="relative h-56 w-full bg-basmati/50">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.name} className="object-cover w-full h-full" />
        ) : (
          <div className="flex items-center justify-center h-full text-bottle/40 font-serif text-xl tracking-wider">
            Zaiqa Signature
          </div>
        )}
      </div>
      
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-3 gap-4">
          <h3 className="text-xl font-bold font-serif text-ink leading-tight">{item.name}</h3>
          <span className="font-bold text-chili text-lg">${Number(item.price).toFixed(2)}</span>
        </div>
        
        <p className="text-sm text-ink/70 mb-5 line-clamp-2 flex-grow leading-relaxed">{item.description}</p>
        
        {item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {item.tags.map((tag) => (
              <span key={tag} className="px-3 py-1 text-xs font-semibold bg-turmeric/10 text-turmeric border border-turmeric/20 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        )}
        
        <button 
          onClick={handleAddToCart}
          className="w-full py-3 px-4 bg-turmeric hover:bg-turmeric/90 text-ink font-bold text-[15px] rounded-lg transition-all duration-150 shadow-sm hover:shadow hover:scale-105 active:scale-[0.98]"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}
