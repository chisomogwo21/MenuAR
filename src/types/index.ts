export type OrderStatus = 'received' | 'preparing' | 'ready' | 'served' | 'cancelled';

export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  banner_url?: string;
  primary_color?: string;
  secondary_color?: string;
  description?: string;
  created_at?: string;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'superadmin' | 'customer';
}

export interface Category {
  id: string;
  restaurant_id: string;
  name: string;
  image_url?: string;
  sort_order: number;
}

export interface MenuItem {
  id: string;
  restaurant_id: string;
  category_id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  model_url?: string;
  is_available: boolean;
  calories?: number;
  preparation_time?: number;
  allergens?: string[];
}

export interface Table {
  id: string;
  restaurant_id: string;
  table_number: string;
  qr_code_url: string;
  status: 'active' | 'inactive';
  capacity?: number;
}

export interface Order {
  id: string;
  restaurant_id: string;
  table_id: string;
  status: OrderStatus;
  total_amount: number;
  created_at: string;
  notes?: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: string;
  quantity: number;
  unit_price: number;
  notes?: string;
}

export interface CartItem extends MenuItem {
  quantity: number;
}
