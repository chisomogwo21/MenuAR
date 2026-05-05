import type { Restaurant, Category, MenuItem, Table, Order } from '../types';

export const mockRestaurant: Restaurant = {
  id: 'rest-1',
  name: 'The Savanna Grill',
  slug: 'savanna-grill',
  description: 'Authentic African flavors with a modern twist.',
  primary_color: '#1A5C3A',
  secondary_color: '#D4A843',
  logo_url: 'https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?w=128&h=128&fit=crop',
};

export const mockCategories: Category[] = [
  { id: 'cat-all', restaurant_id: 'rest-1', name: 'All', sort_order: 0 },
  { id: 'cat-1', restaurant_id: 'rest-1', name: 'Starters', sort_order: 1 },
  { id: 'cat-2', restaurant_id: 'rest-1', name: 'Mains', sort_order: 2 },
  { id: 'cat-3', restaurant_id: 'rest-1', name: 'Grills', sort_order: 3 },
  { id: 'cat-4', restaurant_id: 'rest-1', name: 'Desserts', sort_order: 4 },
  { id: 'cat-5', restaurant_id: 'rest-1', name: 'Drinks', sort_order: 5 },
];

export const mockMenuItems: MenuItem[] = [
  {
    id: 'item-1',
    restaurant_id: 'rest-1',
    category_id: 'cat-1',
    name: 'Peri-Peri Chicken Wings',
    description: 'Spicy flame-grilled wings with a citrus-herb kick.',
    price: 12.00,
    image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAhuBCQBgJZ7bPta_267htvU_YVTx1eZBpnVPvGaTKqFUsxBTQnjhmEvE_DZiOD27wUWI1ypKBfeJlmdmdDZV51IRaMkUQUhIFbTsiTe2ZSCmYIQgLSQ8sinM70JnWwEL_p18iMug8Ep780OLpaQgI01lH4LSd_XmRNxSWUw8PK2E14lKfsIdF5ApvEKCLK7BOO-51IoNwIIE1O8rCbSquIuX5rdT1PCzS4H9glt-r60_2s9llqj_sfUbMG1dqe2OboFLJfaGcEyOy2',
    is_available: true,
    calories: 450,
    preparation_time: 15,
    model_url: 'https://example.com/models/wings.glb',
    allergens: ['Dairy']
  },
  {
    id: 'item-2',
    restaurant_id: 'rest-1',
    category_id: 'cat-3',
    name: 'Grilled Ribeye Steak',
    description: '300g grass-fed beef with peppercorn reduction.',
    price: 34.00,
    image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB8ymWSmjSAjg1y0_DldOEjIqQSp6-5iRYa74LuaR5h19eSBqQXrDbvBe1JMPDJ8B84ObUkvO0lIo0uBp4bLzsJywuZfg-x9vBqejfRf02DBbDyaZ7SR4vFWOLy0uV0s9_Bm9w3Db0AVWaAu7jj6W8p-IJvkdfAiU3hqrLboFAEsH5N5P3UbsIfn5EzjPXZHZ8KjG0uMO6SM35xFWv2AyfPoXPLyKCnWvIIgOKaSK1Rpvv6PY-yB24uPQEGkxV7T3i6DcyElPsgf-Mt',
    is_available: true,
    calories: 850,
    preparation_time: 25,
    model_url: 'https://example.com/models/ribeye.glb',
    allergens: ['Gluten-free', 'Dairy-free']
  },
  {
    id: 'item-3',
    restaurant_id: 'rest-1',
    category_id: 'cat-3',
    name: 'Roasted Lamb Chops',
    description: 'Tender Karoo lamb with mint infused jus.',
    price: 38.00,
    image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB_mumwvOvbM0XXZDX0WMVZjP_ShFSYfOsK81wdiZenwBGwAd_HAKN5Ao9Hld-ua4YgTcvKyLcHy01_KM459j1WVGlUO8zHhTHMb60j31D5FPZLx2qa8hBecTWYQYgS3KewbyBCAcMdXb6N2JK5mNe4mVPY_PZSRlM-WC7BkQW657Xgr4of0v5yG3DoDLOO2OjSoPov54C7mia_RhG2E80477hvgE4XYrUcoJYF12Ft9FtQB8LM7lIrGRkURHfr61ekKt9kLiwcW6tH',
    is_available: true,
    calories: 720,
    preparation_time: 20,
    model_url: 'https://example.com/models/lamb.glb',
    allergens: ['Nuts']
  },
  {
    id: 'item-4',
    restaurant_id: 'rest-1',
    category_id: 'cat-4',
    name: 'Mango Cheesecake',
    description: 'Tropical Alfonso mango on a buttery crust.',
    price: 9.00,
    image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBAxeSWH8Vpd6jGYTzSjh60LZylE61591Pvpu-jfdFufLLNPdZeXlzpatWLEl-3tb49f6w0obXdhEDXp0csUuGmSv_6-WcL0l-GHBOR2bVwnScUyWSwRNNW8IZWL7XoYHuMuT2C1fHh1idAA4O8mD09b4Unnst48MTiJo8DAkm9UxsdzuIkteAMiPPF9lvcniCdKDb2EkFkljq3KZxGl_-YSlvrEtDiwCH8w31q5_iYtacJ2FwdpXj6DBhz1Z4QDOIl82Bfpjr_c0jb',
    is_available: true,
    calories: 420,
    preparation_time: 10,
    model_url: 'https://example.com/models/cheesecake.glb'
  },
  {
    id: 'item-5',
    restaurant_id: 'rest-1',
    category_id: 'cat-2',
    name: 'Zanzibar Spiced Ribeye',
    description: '300g premium ribeye rubbed with secret blend of Zanzibar spices.',
    price: 32.50,
    image_url: 'https://images.unsplash.com/photo-1546241072-48010ad28c2c?w=400&h=400&fit=crop',
    is_available: true,
    calories: 850,
    preparation_time: 25
  },
  {
    id: 'item-6',
    restaurant_id: 'rest-1',
    category_id: 'cat-5',
    name: 'Baobab & Berry Fizz',
    description: 'Refreshing mocktail with baobab powder and fresh berries.',
    price: 8.50,
    image_url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400&h=400&fit=crop',
    is_available: true,
    calories: 120,
    preparation_time: 5
  }
];

export const mockTables: Table[] = [
  { id: 'tab-1', restaurant_id: 'rest-1', table_number: '1', qr_code_url: '', status: 'active', capacity: 4 },
  { id: 'tab-2', restaurant_id: 'rest-1', table_number: '2', qr_code_url: '', status: 'active', capacity: 2 },
  { id: 'tab-3', restaurant_id: 'rest-1', table_number: '3', qr_code_url: '', status: 'active', capacity: 6 },
  { id: 'tab-4', restaurant_id: 'rest-1', table_number: '4', qr_code_url: '', status: 'inactive', capacity: 2 },
  { id: 'tab-5', restaurant_id: 'rest-1', table_number: '5', qr_code_url: '', status: 'active', capacity: 8 },
];

export const mockOrders: Order[] = [
  { id: 'ord-1', restaurant_id: 'rest-1', table_id: 'tab-1', status: 'preparing', total_amount: 85.50, created_at: new Date().toISOString() },
  { id: 'ord-2', restaurant_id: 'rest-1', table_id: 'tab-4', status: 'received', total_amount: 12.00, created_at: new Date().toISOString() },
  { id: 'ord-3', restaurant_id: 'rest-1', table_id: 'tab-2', status: 'ready', total_amount: 45.00, created_at: new Date().toISOString() },
  { id: 'ord-4', restaurant_id: 'rest-1', table_id: 'tab-3', status: 'served', total_amount: 32.50, created_at: new Date().toISOString() },
  { id: 'ord-5', restaurant_id: 'rest-1', table_id: 'tab-5', status: 'cancelled', total_amount: 0, created_at: new Date().toISOString() },
];
