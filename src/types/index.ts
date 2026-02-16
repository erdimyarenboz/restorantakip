// Core type definitions for the restaurant order system

export type MenuCategory = 'İçecek' | 'Ana Yemek' | 'Tatlı' | 'Aperatif' | 'Salata';

export type OrderStatus = 'Mutfakta' | 'Hazır' | 'Teslim Edildi' | 'Kuryeye Teslim Edildi' | 'Ödendi' | 'İptal';

export type OrderSource = 'restaurant' | 'yemeksepeti' | 'trendyol' | 'getir';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: MenuCategory;
  image: string; // SVG data URI
  portion?: string; // e.g., "1 Porsiyon", "1 Bardak"
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface TableOrder {
  tableNumber: number;
  waiterName: string;
  note?: string;
}

export interface OrderTotals {
  subtotal: number;
  total: number; // No shipping in restaurant
}

export interface Order {
  orderId: string;
  createdAt: string; // ISO string
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  table: TableOrder;
  totals: OrderTotals;
  status: OrderStatus;
  source: OrderSource;
}

export interface CartState {
  items: CartItem[];
}

export type CartAction =
  | { type: 'ADD_ITEM'; product: Product }
  | { type: 'REMOVE_ITEM'; productId: string }
  | { type: 'UPDATE_QUANTITY'; productId: string; quantity: number }
  | { type: 'CLEAR_CART' };
