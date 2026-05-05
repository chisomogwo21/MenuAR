import { supabase } from '../lib/supabase';
import type { Restaurant, Category, MenuItem, Order, OrderItem, OrderStatus } from '../types';

// ─── RESTAURANTS ────────────────────────────────────────────────────────────

export async function fetchRestaurantBySlug(slug: string): Promise<Restaurant | null> {
  const { data, error } = await supabase
    .from('restaurants')
    .select('*')
    .eq('slug', slug)
    .single();
  if (error) { console.error('fetchRestaurantBySlug:', error); return null; }
  return data as Restaurant;
}

export async function fetchRestaurantById(id: string): Promise<Restaurant | null> {
  const { data, error } = await supabase
    .from('restaurants')
    .select('*')
    .eq('id', id)
    .single();
  if (error) { console.error('fetchRestaurantById:', error); return null; }
  return data as Restaurant;
}

export async function fetchAllRestaurants(): Promise<Restaurant[]> {
  const { data, error } = await supabase.from('restaurants').select('*').order('name');
  if (error) { console.error('fetchAllRestaurants:', error); return []; }
  return data as Restaurant[];
}

export async function updateRestaurant(id: string, updates: Partial<Restaurant>): Promise<boolean> {
  const { error } = await supabase.from('restaurants').update(updates).eq('id', id);
  if (error) { console.error('updateRestaurant:', error); return false; }
  return true;
}

export async function insertRestaurant(restaurant: Omit<Restaurant, 'id'>): Promise<Restaurant | null> {
  const { data, error } = await supabase.from('restaurants').insert(restaurant).select().single();
  if (error) { console.error('insertRestaurant:', error); return null; }
  return data as Restaurant;
}

// ─── CATEGORIES ─────────────────────────────────────────────────────────────

export async function fetchCategories(restaurantId: string): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .order('sort_order');
  if (error) { console.error('fetchCategories:', error); return []; }
  return data as Category[];
}

export async function insertCategory(category: Omit<Category, 'id'>): Promise<Category | null> {
  const { data, error } = await supabase.from('categories').insert(category).select().single();
  if (error) { console.error('insertCategory:', error); return null; }
  return data as Category;
}

// ─── MENU ITEMS ──────────────────────────────────────────────────────────────

export async function fetchMenuItems(restaurantId: string, availableOnly = true): Promise<MenuItem[]> {
  let query = supabase
    .from('menu_items')
    .select('*')
    .eq('restaurant_id', restaurantId);
  if (availableOnly) query = query.eq('is_available', true);
  const { data, error } = await query.order('name');
  if (error) { 
    console.error('fetchMenuItems:', error); 
    throw error;
  }
  return data as MenuItem[];
}

export async function fetchMenuItemById(id: string): Promise<MenuItem | null> {
  const { data, error } = await supabase
    .from('menu_items')
    .select('*')
    .eq('id', id)
    .single();
  if (error) { console.error('fetchMenuItemById:', error); return null; }
  return data as MenuItem;
}

export async function insertMenuItem(item: Omit<MenuItem, 'id' | 'created_at'>): Promise<MenuItem | null> {
  const { data, error } = await supabase.from('menu_items').insert(item).select().single();
  if (error) { console.error('insertMenuItem:', error); return null; }
  return data as MenuItem;
}

export async function updateMenuItem(id: string, updates: Partial<MenuItem>): Promise<boolean> {
  const { error } = await supabase.from('menu_items').update(updates).eq('id', id);
  if (error) { console.error('updateMenuItem:', error); return false; }
  return true;
}

export async function deleteMenuItem(id: string): Promise<boolean> {
  const { error } = await supabase.from('menu_items').delete().eq('id', id);
  if (error) { console.error('deleteMenuItem:', error); return false; }
  return true;
}

// ─── TABLES ──────────────────────────────────────────────────────────────────

export async function fetchTables(restaurantId: string) {
  const { data, error } = await supabase
    .from('tables')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .order('table_number');
  if (error) { 
    console.error('fetchTables:', error); 
    throw error;
  }
  return data;
}

export async function insertTable(table: { restaurant_id: string; table_number: string; qr_code_url: string }) {
  const { data, error } = await supabase.from('tables').insert(table).select().single();
  if (error) { console.error('insertTable:', error); return null; }
  return data;
}

export async function insertTables(tables: { restaurant_id: string; table_number: number; is_active: boolean }[]) {
  const { error } = await supabase.from('tables').insert(tables);
  if (error) { console.error('insertTables:', error); return false; }
  return true;
}

export async function updateTable(id: string, updates: Record<string, unknown>): Promise<boolean> {
  const { error } = await supabase.from('tables').update(updates).eq('id', id);
  if (error) { console.error('updateTable:', error); return false; }
  return true;
}

// ─── ORDERS ──────────────────────────────────────────────────────────────────

export async function fetchOrdersForRestaurant(restaurantId: string, todayOnly = false): Promise<Order[]> {
  let query = supabase
    .from('orders')
    .select('*, order_items(*), tables(*)')
    .eq('restaurant_id', restaurantId)
    .order('created_at', { ascending: false });

  if (todayOnly) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    query = query.gte('created_at', today.toISOString());
  }

  const { data, error } = await query;
  if (error) { 
    console.error('fetchOrdersForRestaurant:', error); 
    throw error; // Throw error so it's caught in the caller's try/catch
  }
  return data as Order[];
}

export async function fetchOrderById(orderId: string): Promise<Order | null> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single();
  if (error) { console.error('fetchOrderById:', error); return null; }
  return data as Order;
}

export async function fetchOrderItems(orderId: string): Promise<(OrderItem & { menu_items: MenuItem })[]> {
  const { data, error } = await supabase
    .from('order_items')
    .select('*, menu_items(*)')
    .eq('order_id', orderId);
  if (error) { console.error('fetchOrderItems:', error); return []; }
  return data as (OrderItem & { menu_items: MenuItem })[];
}

export interface CreateOrderPayload {
  restaurant_id: string;
  table_id: string;
  total_amount: number;
  service_charge?: number;
  notes?: string;
  status: OrderStatus;
}

export async function createOrder(payload: CreateOrderPayload): Promise<Order | null> {
  const { data, error } = await supabase.from('orders').insert(payload).select().single();
  if (error) { console.error('createOrder:', error); return null; }
  return data as Order;
}

export async function createOrderItems(items: Omit<OrderItem, 'id'>[]): Promise<boolean> {
  const { error } = await supabase.from('order_items').insert(items);
  if (error) { console.error('createOrderItems:', error); return false; }
  return true;
}

export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<boolean> {
  const { error } = await supabase.from('orders').update({ status }).eq('id', orderId);
  if (error) { console.error('updateOrderStatus:', error); return false; }
  return true;
}

// ─── STORAGE ─────────────────────────────────────────────────────────────────

export async function uploadFile(bucket: string, path: string, file: File): Promise<string | null> {
  const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
  if (error) { console.error('uploadFile:', error); return null; }
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}
