import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string; 
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  customizations?: string;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getSubtotal: () => number;
  toggleCart: (open?: boolean) => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      
      toggleCart: (open) => set((state) => ({ isOpen: open !== undefined ? open : !state.isOpen })),
      
      addItem: (item) => set((state) => {
        const existingItem = state.items.find(
          i => i.menuItemId === item.menuItemId && i.customizations === item.customizations
        );
        
        if (existingItem) {
          return {
            items: state.items.map(i => 
              i.id === existingItem.id 
                ? { ...i, quantity: i.quantity + item.quantity }
                : i
            )
          };
        }
        
        const newItem = {
          ...item,
          id: `${item.menuItemId}-${Date.now()}`
        };
        
        return { items: [...state.items, newItem] };
      }),
      
      removeItem: (id) => set((state) => ({
        items: state.items.filter(i => i.id !== id)
      })),
      
      updateQuantity: (id, quantity) => set((state) => {
        if (quantity <= 0) {
          return { items: state.items.filter(i => i.id !== id) };
        }
        return {
          items: state.items.map(i => i.id === id ? { ...i, quantity } : i)
        };
      }),
      
      clearCart: () => set({ items: [] }),
      
      getSubtotal: () => {
        return get().items.reduce((total, item) => total + (item.price * item.quantity), 0);
      }
    }),
    {
      name: 'zaiqa-cart',
    }
  )
);
