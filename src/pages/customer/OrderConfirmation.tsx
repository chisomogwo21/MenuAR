import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { fetchOrderById, fetchOrderItems } from '../../services/db';
import { supabase } from '../../lib/supabase';
import type { Order, OrderItem, MenuItem } from '../../types';
import { CheckCircle2, ChevronRight, Loader2 } from 'lucide-react';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
import { formatPrice } from '../../utils/formatters';

const OrderConfirmation: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const navigate = useNavigate();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<(OrderItem & { menu_items: MenuItem })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) {
      navigate(`/${slug}/menu`);
      return;
    }

    let cancelled = false;
    const loadOrder = async () => {
      setLoading(true);
      const [orderData, itemsData] = await Promise.all([
        fetchOrderById(orderId),
        fetchOrderItems(orderId)
      ]);

      if (!cancelled) {
        setOrder(orderData);
        setItems(itemsData);
        setLoading(false);
      }
    };
    
    loadOrder();

    // Subscribe to realtime updates
    const channel = supabase
      .channel(`order_${orderId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${orderId}` },
        (payload) => {
          setOrder(payload.new as Order);
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [orderId, slug, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="animate-spin text-primary w-8 h-8" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-5 text-center">
        <p className="font-bold text-red-500 mb-4">Order not found</p>
        <Button onClick={() => navigate(`/${slug}/menu`)}>Back to Menu</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-5">
      <div className="w-full max-w-sm bg-white rounded-[32px] shadow-xl border border-surface-container overflow-hidden animate-in zoom-in-95 duration-500">
        <div className="p-8 flex flex-col items-center text-center">
          {/* Success Icon */}
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
            <CheckCircle2 size={48} />
          </div>

          <h1 className="text-2xl font-headline font-bold text-primary mb-2">Order Placed!</h1>
          
          <div className="flex items-center gap-2 mb-6">
            <div className="bg-secondary/10 px-3 py-1 rounded-full border border-secondary/20">
              <span className="text-[10px] font-bold text-secondary uppercase tracking-widest">
                #{order.id.slice(0, 8)}
              </span>
            </div>
            <StatusBadge status={order.status} />
          </div>

          {/* Progress Tracker */}
          <div className="w-full space-y-4 mb-8">
            <div className="flex items-center justify-between px-2">
              <div className="flex flex-col items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${['received', 'preparing', 'ready'].includes(order.status) ? 'bg-primary text-white ring-4 ring-primary/10' : 'bg-surface-container text-[#707971]'}`}>
                  <span className="text-xs font-bold">1</span>
                </div>
                <span className={`text-[10px] font-bold uppercase ${['received', 'preparing', 'ready'].includes(order.status) ? 'text-primary' : 'text-[#707971]'}`}>Received</span>
              </div>
              <div className="h-0.5 flex-1 bg-surface-container mx-2 -mt-6" />
              <div className="flex flex-col items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${['preparing', 'ready'].includes(order.status) ? 'bg-primary text-white ring-4 ring-primary/10' : 'bg-surface-container text-[#707971]'}`}>
                  <span className="text-xs font-bold">2</span>
                </div>
                <span className={`text-[10px] font-bold uppercase ${['preparing', 'ready'].includes(order.status) ? 'text-primary' : 'text-[#707971]'}`}>Preparing</span>
              </div>
              <div className="h-0.5 flex-1 bg-surface-container mx-2 -mt-6" />
              <div className="flex flex-col items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${['ready'].includes(order.status) ? 'bg-primary text-white ring-4 ring-primary/10' : 'bg-surface-container text-[#707971]'}`}>
                  <span className="text-xs font-bold">3</span>
                </div>
                <span className={`text-[10px] font-bold uppercase ${['ready'].includes(order.status) ? 'text-primary' : 'text-[#707971]'}`}>Ready</span>
              </div>
            </div>
          </div>

          {/* Dish Summary */}
          <div className="w-full bg-background rounded-2xl p-4 border border-surface-container mb-8">
            <div className="space-y-2 mb-4">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-xs font-medium">
                  <span className="text-[#707971]">{item.quantity}x {item.menu_items?.name || 'Unknown Item'}</span>
                  <span className="text-[#191C19] font-bold">{formatPrice(item.unit_price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="pt-3 border-t border-surface-container flex justify-between items-center">
              <span className="text-xs font-bold text-[#191C19]">Total</span>
              <span className="text-sm font-bold text-primary">{formatPrice(order.total_amount)}</span>
            </div>
          </div>

          <Button 
            onClick={() => navigate(`/${slug}/menu`)}
            className="w-full h-14 font-bold gap-2"
          >
            Back to Menu
            <ChevronRight size={18} />
          </Button>
        </div>
      </div>

      {/* Background Decoration */}
      <div className="fixed inset-0 pointer-events-none -z-10 opacity-30 overflow-hidden">
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-primary/10 rounded-full blur-[100px]" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-secondary/10 rounded-full blur-[100px]" />
      </div>
    </div>
  );
};

export default OrderConfirmation;
