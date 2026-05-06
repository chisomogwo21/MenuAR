import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { CartItem, Order, Restaurant, OrderStatus } from '../types';
import { supabase } from '../lib/supabase';


interface AppContextType {
  // Cart
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  updateQuantity: (id: string, quantity: number) => void;
  // Orders (local cache for realtime)
  orders: Order[];
  setOrders: (orders: Order[]) => void;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  // Restaurant
  restaurant: Restaurant | null;
  setRestaurant: (r: Restaurant | null) => void;
  // Navigation state
  lastViewedDishId: string | null;
  setLastViewedDishId: (id: string | null) => void;
  // Auth
  isAuthenticated: boolean;
  setIsAuthenticated: (val: boolean) => void;
  authLoading: boolean;
  userRole: string | null;
  // AI Assistant
  isAIAssistantOpen: boolean;
  setIsAIAssistantOpen: (isOpen: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [lastViewedDishId, setLastViewedDishId] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);

  const [userRole, setUserRole] = useState<string | null>(null);

  // Check session on mount
  useEffect(() => {
    const initializeApp = async (session: any) => {
      try {
        const authUser = session.user;
        if (!authUser) return;
        
        const { data: userRow } = await supabase
          .from('users')
          .select('*, restaurants(*)')
          .eq('email', authUser.email)
          .single();
        
        if (!userRow) {
          console.error('No user row found for', authUser.email);
          setAuthLoading(false);
          return;
        }

        setUserRole(userRow.role);

        if (userRow.restaurant_id && userRow.restaurants) {
          const rest = Array.isArray(userRow.restaurants) ? userRow.restaurants[0] : userRow.restaurants;
          setRestaurant(rest);
          
          document.documentElement.style.setProperty('--color-primary', rest.primary_color || '#1A5C3A');
        }

        setIsAuthenticated(true);
      } catch (err) {
        console.error('App init error:', err);
      } finally {
        setAuthLoading(false);
      }
    };

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        initializeApp(data.session);
      } else {
        setIsAuthenticated(false);
        setAuthLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        initializeApp(session);
      } else {
        setIsAuthenticated(false);
        setRestaurant(null);
        setUserRole(null);
        document.documentElement.style.setProperty('--color-primary', '#1A5C3A');
        setAuthLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Update theme color when restaurant changes
  useEffect(() => {
    if (restaurant?.primary_color) {
      document.documentElement.style.setProperty('--color-primary', restaurant.primary_color);
      // Generate a darker version for primary-dark (simple darken)
      const darken = (hex: string) => {
        const amount = 20;
        const color = hex.replace('#', '');
        const r = Math.max(0, parseInt(color.substring(0, 2), 16) - amount);
        const g = Math.max(0, parseInt(color.substring(2, 4), 16) - amount);
        const b = Math.max(0, parseInt(color.substring(4, 6), 16) - amount);
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
      };
      document.documentElement.style.setProperty('--color-primary-dark', darken(restaurant.primary_color));
    } else {
      document.documentElement.style.setProperty('--color-primary', '#1A5C3A');
      document.documentElement.style.setProperty('--color-primary-dark', '#004326');
    }
  }, [restaurant]);

  const addToCart = (item: CartItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i);
      }
      return [...prev, item];
    });
  };

  const removeFromCart = (id: string) => setCart(prev => prev.filter(i => i.id !== id));
  const clearCart = () => setCart([]);

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
    } else {
      setCart(prev => prev.map(i => i.id === id ? { ...i, quantity } : i));
    }
  };

  const updateOrderStatus = (id: string, status: OrderStatus) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
  };

  return (
    <AppContext.Provider value={{
      cart,
      addToCart,
      removeFromCart,
      clearCart,
      updateQuantity,
      orders,
      setOrders,
      updateOrderStatus,
      restaurant,
      setRestaurant,
      lastViewedDishId,
      setLastViewedDishId,
      isAuthenticated,
      setIsAuthenticated,
      authLoading,
      userRole,
      isAIAssistantOpen,
      setIsAIAssistantOpen,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within an AppProvider');
  return context;
};
