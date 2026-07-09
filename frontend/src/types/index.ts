// ─── Shared TypeScript Types ───────────────────────────────────────────────────
// Single source of truth for all shared interfaces used across the frontend.

export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  available: boolean;
  tags?: string[];
  categoryId: string;
}

export interface MenuCategory {
  id: string;
  name: string;
  items: MenuItem[];
}

export interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  customizations?: string;
  menuItem: {
    name: string;
  };
}

export interface Order {
  id: string;
  orderType: 'DINE_IN' | 'TAKEAWAY' | 'DELIVERY';
  status: string;
  subtotal: number;
  tax: number;
  deliveryFee: number;
  total: number;
  createdAt: string;
  items: OrderItem[];
  deliveryAddress?: string;
  user?: {
    name: string;
    email?: string;
  };
}

export interface AdminOrder {
  id: string;
  orderType: 'DINE_IN' | 'TAKEAWAY' | 'DELIVERY';
  status: string;
  total: number;
  createdAt: string;
  items: Array<{
    id: string;
    quantity: number;
    menuItem: { name: string };
  }>;
}

export interface SalesDataPoint {
  date: string;
  total: number;
}

export interface TopItem {
  _count: { id: number };
  menuItem: { name: string };
}

export interface OrderDistributionItem {
  orderType: string;
  _count: { id: number };
}

export interface AdminMenuCategory {
  id: string;
  name: string;
  items: AdminMenuItem[];
}

export interface AdminMenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  available: boolean;
  categoryId: string;
}
